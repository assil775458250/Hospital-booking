using HospitalBooking.API.Common.Enums;
using HospitalBooking.API.Data;
using HospitalBooking.API.DTOs;
using HospitalBooking.API.Services.Common;
using Microsoft.EntityFrameworkCore;

namespace HospitalBooking.API.Services.Slots
{
    public class SlotService : ISlotService
    {
        private readonly YusrDbContext _context;

        public SlotService(YusrDbContext context)
        {
            _context = context;
        }

        public async Task<ServiceResponse<DoctorSlotDto>> UpdateSlotAsync(int id, UpdateSlotDto dto)
        {
            var slot = await _context.AppointmentSlots
                .Include(s => s.Bookings)
                .FirstOrDefaultAsync(s => s.SlotId == id);

            if (slot == null)
            {
                return ServiceResponse<DoctorSlotDto>.Fail("الموعد غير موجود", 404);
            }

            if (!string.IsNullOrWhiteSpace(dto.Status))
            {
                slot.IsCancelled = dto.Status.Equals("Unavailable", StringComparison.OrdinalIgnoreCase) ||
                                   dto.Status.Equals("Cancelled", StringComparison.OrdinalIgnoreCase);
            }

            await _context.SaveChangesAsync();

            var statusStr = slot.IsCancelled ? "Unavailable" : (slot.Bookings.Any(b => b.Status != BookingStatus.Cancelled) ? "Booked" : "Available");

            return ServiceResponse<DoctorSlotDto>.Ok(new DoctorSlotDto
            {
                Id = slot.SlotId,
                DoctorId = slot.DoctorId,
                Date = slot.StartDateTime.Date,
                StartTime = slot.StartDateTime.ToString("HH:mm"),
                EndTime = slot.EndDateTime.ToString("HH:mm"),
                Status = statusStr
            });
        }

        public async Task<ServiceResponse<object>> DeleteSlotAsync(int id)
        {
            var slot = await _context.AppointmentSlots
                .Include(s => s.Bookings)
                .FirstOrDefaultAsync(s => s.SlotId == id);

            if (slot == null)
            {
                return ServiceResponse<object>.Fail("الموعد غير موجود", 404);
            }

            if (slot.Bookings.Any(b => b.Status != BookingStatus.Cancelled))
            {
                return ServiceResponse<object>.Fail("لا يمكن حذف وقت مرتبط بحجز نشط", 400);
            }

            _context.AppointmentSlots.Remove(slot);
            await _context.SaveChangesAsync();

            return ServiceResponse<object>.Ok(new { message = "تم حذف الوقت المتاح بنجاح" });
        }
    }
}
