using Hospital_booking_Project.Data;
using Hospital_booking_Project.DTOs;
using Hospital_booking_Project.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Hospital_booking_Project.Services
{
    public class SlotService : ISlotService
    {
        private readonly AppDbContext _context;

        public SlotService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ServiceResponse<DoctorSlotDto>> UpdateSlotAsync(int id, UpdateSlotDto dto)
        {
            var slot = await _context.Slots.FindAsync(id);
            if (slot == null)
            {
                return ServiceResponse<DoctorSlotDto>.Fail("الموعد غير موجود", 404);
            }

            if (dto.Date.HasValue) slot.Date = dto.Date.Value.Date;
            if (!string.IsNullOrWhiteSpace(dto.StartTime)) slot.StartTime = dto.StartTime.Trim();
            if (!string.IsNullOrWhiteSpace(dto.EndTime)) slot.EndTime = dto.EndTime.Trim();
            if (!string.IsNullOrWhiteSpace(dto.Status)) slot.Status = dto.Status.Trim();

            await _context.SaveChangesAsync();

            return ServiceResponse<DoctorSlotDto>.Ok(new DoctorSlotDto
            {
                Id = slot.Id,
                DoctorId = slot.DoctorId,
                Date = slot.Date,
                StartTime = slot.StartTime,
                EndTime = slot.EndTime,
                Status = slot.Status
            });
        }

        public async Task<ServiceResponse<object>> DeleteSlotAsync(int id)
        {
            var slot = await _context.Slots
                .Include(s => s.Appointment)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (slot == null)
            {
                return ServiceResponse<object>.Fail("الموعد غير موجود", 404);
            }

            if (slot.Appointment != null || slot.Status == "Booked")
            {
                return ServiceResponse<object>.Fail("لا يمكن حذف وقت مرتبط بحجز نشط", 400);
            }

            _context.Slots.Remove(slot);
            await _context.SaveChangesAsync();

            return ServiceResponse<object>.Ok(new { message = "تم حذف الموعد بنجاح" });
        }
    }
}
