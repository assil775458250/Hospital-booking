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

        public async Task<ServiceResponse<DoctorSlotDto>> UpdateSlotAsync(int id, UpdateSlotDto dto, int? currentUserId = null, string? currentUserRole = null)
        {
            var slot = await _context.AppointmentSlots
                .Include(s => s.Doctor)
                .Include(s => s.Bookings)
                .FirstOrDefaultAsync(s => s.SlotId == id);

            if (slot == null)
            {
                return ServiceResponse<DoctorSlotDto>.Fail("الموعد غير موجود", 404);
            }

            if (currentUserRole == "Doctor" && slot.Doctor?.UserId != currentUserId && slot.DoctorId != currentUserId)
            {
                return ServiceResponse<DoctorSlotDto>.Fail("غير مصرح لك بتعديل فترة لطبيب آخر", 403);
            }

            bool isUpdatingTimeOrDate = dto.Date.HasValue || !string.IsNullOrWhiteSpace(dto.StartTime) || !string.IsNullOrWhiteSpace(dto.EndTime);

            if (isUpdatingTimeOrDate)
            {
                if (slot.Bookings.Any(b => b.Status != BookingStatus.Cancelled))
                {
                    return ServiceResponse<DoctorSlotDto>.Fail("لا يمكن تعديل وقت أو تاريخ فترة مرتبطة بحجز نشط", 400);
                }

                var targetDate = dto.Date ?? slot.StartDateTime.Date;
                var startTimeStr = !string.IsNullOrWhiteSpace(dto.StartTime) ? dto.StartTime : slot.StartDateTime.ToString("HH:mm");
                var endTimeStr = !string.IsNullOrWhiteSpace(dto.EndTime) ? dto.EndTime : slot.EndDateTime.ToString("HH:mm");

                if (!TimeSpan.TryParse(startTimeStr, out var startTime) || !TimeSpan.TryParse(endTimeStr, out var endTime))
                {
                    return ServiceResponse<DoctorSlotDto>.Fail("صيغة الوقت غير صحيحة، يرجى استخدام صيغة HH:mm", 400);
                }

                if (endTime <= startTime)
                {
                    return ServiceResponse<DoctorSlotDto>.Fail("وقت نهاية الفترة يجب أن يكون بعد وقت البداية", 400);
                }

                var newStartDateTime = new DateTimeOffset(targetDate.Date.Add(startTime), TimeSpan.Zero);
                var newEndDateTime = new DateTimeOffset(targetDate.Date.Add(endTime), TimeSpan.Zero);

                var hasOverlap = await _context.AppointmentSlots.AnyAsync(s =>
                    s.SlotId != id &&
                    s.DoctorId == slot.DoctorId &&
                    !s.IsCancelled &&
                    s.StartDateTime < newEndDateTime &&
                    s.EndDateTime > newStartDateTime);

                if (hasOverlap)
                {
                    return ServiceResponse<DoctorSlotDto>.Fail("هذا الوقت يتداخل مع فترة عمل أخرى مسجلة", 400);
                }

                slot.StartDateTime = newStartDateTime;
                slot.EndDateTime = newEndDateTime;
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

        public async Task<ServiceResponse<object>> DeleteSlotAsync(int id, int? currentUserId = null, string? currentUserRole = null)
        {
            var slot = await _context.AppointmentSlots
                .Include(s => s.Doctor)
                .Include(s => s.Bookings)
                .FirstOrDefaultAsync(s => s.SlotId == id);

            if (slot == null)
            {
                return ServiceResponse<object>.Fail("الموعد غير موجود", 404);
            }

            if (currentUserRole == "Doctor" && slot.Doctor?.UserId != currentUserId && slot.DoctorId != currentUserId)
            {
                return ServiceResponse<object>.Fail("غير مصرح لك بحذف فترة لطبيب آخر", 403);
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
