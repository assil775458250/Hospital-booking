using HospitalBooking.API.Common.Enums;
using HospitalBooking.API.Data;
using HospitalBooking.API.DTOs;
using HospitalBooking.API.Models;
using HospitalBooking.API.Services.Common;
using Microsoft.EntityFrameworkCore;

namespace HospitalBooking.API.Services.Appointments
{
    public class AppointmentService : IAppointmentService
    {
        private readonly YusrDbContext _context;

        public AppointmentService(YusrDbContext context)
        {
            _context = context;
        }

        public async Task<ServiceResponse<object>> BookAppointmentAsync(int? currentUserId, CreateAppointmentDto dto)
        {
            if (currentUserId == null)
            {
                return ServiceResponse<object>.Fail("المستخدم غير مسجل الدخول", 401);
            }

            var patient = await _context.Users.FirstOrDefaultAsync(u => u.UserId == currentUserId.Value);
            if (patient == null)
            {
                return ServiceResponse<object>.Fail("المستخدم غير موجود", 401);
            }

            if (patient.Role == UserRole.None)
            {
                patient.Role = UserRole.Patient;
                await _context.SaveChangesAsync();
            }

            var doctor = await _context.Doctors
                .Include(d => d.User)
                .Include(d => d.Clinic)
                .FirstOrDefaultAsync(d => d.DoctorId == dto.DoctorId || d.UserId == dto.DoctorId);

            if (doctor == null)
            {
                return ServiceResponse<object>.Fail("الطبيب المحدد غير موجود", 400);
            }

            var slot = await _context.AppointmentSlots
                .Include(s => s.Bookings)
                .FirstOrDefaultAsync(s => s.SlotId == dto.SlotId && s.DoctorId == doctor.DoctorId);

            if (slot == null)
            {
                return ServiceResponse<object>.Fail("الموعد غير موجود أو لا ينتمي لهذا الطبيب", 400);
            }

            if (slot.IsCancelled)
            {
                return ServiceResponse<object>.Fail("هذا الموعد ملغي", 400);
            }

            var isAlreadyBooked = slot.Bookings.Any(b => b.Status != BookingStatus.Cancelled && b.Status != BookingStatus.Rejected);
            if (isAlreadyBooked)
            {
                return ServiceResponse<object>.Fail("هذا الموعد غير متاح للحجز", 400);
            }

            var booking = new Booking
            {
                PatientId = patient.UserId,
                SlotId = slot.SlotId,
                Status = BookingStatus.Pending,
                CreatedAt = DateTimeOffset.UtcNow
            };

            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();

            return ServiceResponse<object>.Ok(new
            {
                message = "تم حجز الموعد بنجاح",
                appointmentId = booking.BookingId,
                appointmentNumber = $"APT-{booking.BookingId}",
                doctorName = doctor.User?.FullName ?? string.Empty,
                specialization = doctor.Clinic?.ClinicName ?? string.Empty,
                date = slot.StartDateTime,
                startTime = slot.StartDateTime.ToString("HH:mm"),
                endTime = slot.EndDateTime.ToString("HH:mm"),
                status = booking.Status.ToString()
            });
        }

        public async Task<ServiceResponse<AppointmentDto>> GetAppointmentByIdAsync(int id, int? currentUserId, bool isAdmin)
        {
            var booking = await _context.Bookings
                .Include(b => b.Patient)
                .Include(b => b.AppointmentSlot)
                    .ThenInclude(s => s.Doctor)
                        .ThenInclude(d => d.User)
                .Include(b => b.AppointmentSlot)
                    .ThenInclude(s => s.Doctor)
                        .ThenInclude(d => d.Clinic)
                .FirstOrDefaultAsync(b => b.BookingId == id);

            if (booking == null)
            {
                return ServiceResponse<AppointmentDto>.Fail("الحجز غير موجود", 404);
            }

            if (!isAdmin &&
                booking.PatientId != currentUserId &&
                booking.AppointmentSlot?.Doctor?.UserId != currentUserId)
            {
                return ServiceResponse<AppointmentDto>.Fail("غير مصرح لك بالاطلاع على هذا الحجز", 403);
            }

            var result = new AppointmentDto
            {
                Id = booking.BookingId,
                AppointmentNumber = $"APT-{booking.BookingId}",
                PatientId = booking.PatientId,
                PatientName = booking.Patient?.FullName ?? string.Empty,
                PatientPhone = booking.Patient?.PhoneNumber ?? string.Empty,
                DoctorId = booking.AppointmentSlot?.DoctorId ?? 0,
                DoctorName = booking.AppointmentSlot?.Doctor?.User?.FullName ?? string.Empty,
                SpecializationName = booking.AppointmentSlot?.Doctor?.Clinic?.ClinicName ?? string.Empty,
                Clinic = booking.AppointmentSlot?.Doctor?.Clinic?.ClinicName ?? string.Empty,
                SlotId = booking.SlotId,
                AppointmentDate = booking.AppointmentSlot?.StartDateTime ?? booking.CreatedAt,
                StartTime = booking.AppointmentSlot?.StartDateTime.ToString("HH:mm") ?? string.Empty,
                EndTime = booking.AppointmentSlot?.EndDateTime.ToString("HH:mm") ?? string.Empty,
                Status = booking.Status.ToString(),
                Notes = string.Empty,
                ReasonForVisit = string.Empty,
                CreatedAt = booking.CreatedAt
            };

            return ServiceResponse<AppointmentDto>.Ok(result);
        }

        public async Task<ServiceResponse<object>> GetMyAppointmentsAsync(int? currentUserId, string? currentUserRole, string? status)
        {
            if (currentUserId == null)
            {
                return ServiceResponse<object>.Fail("المستخدم غير مسجل الدخول", 401);
            }

            var query = _context.Bookings
                .Include(b => b.Patient)
                .Include(b => b.AppointmentSlot)
                    .ThenInclude(s => s.Doctor)
                        .ThenInclude(d => d.User)
                .Include(b => b.AppointmentSlot)
                    .ThenInclude(s => s.Doctor)
                        .ThenInclude(d => d.Clinic)
                .AsQueryable();

            if (string.Equals(currentUserRole, "Doctor", StringComparison.OrdinalIgnoreCase))
            {
                var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == currentUserId.Value);
                if (doctor == null)
                {
                    return ServiceResponse<object>.Ok(new MyAppointmentsGroupedDto());
                }
                query = query.Where(b => b.AppointmentSlot.DoctorId == doctor.DoctorId);
            }
            else
            {
                query = query.Where(b => b.PatientId == currentUserId.Value);
            }

            var bookings = await query.ToListAsync();
            var now = DateTimeOffset.UtcNow;

            var dtoList = bookings.Select(b => new AppointmentDto
            {
                Id = b.BookingId,
                AppointmentNumber = $"APT-{b.BookingId}",
                PatientId = b.PatientId,
                PatientName = b.Patient?.FullName ?? string.Empty,
                PatientPhone = b.Patient?.PhoneNumber ?? string.Empty,
                DoctorId = b.AppointmentSlot?.DoctorId ?? 0,
                DoctorName = b.AppointmentSlot?.Doctor?.User?.FullName ?? string.Empty,
                SpecializationName = b.AppointmentSlot?.Doctor?.Clinic?.ClinicName ?? string.Empty,
                Clinic = b.AppointmentSlot?.Doctor?.Clinic?.ClinicName ?? string.Empty,
                SlotId = b.SlotId,
                AppointmentDate = b.AppointmentSlot?.StartDateTime ?? b.CreatedAt,
                StartTime = b.AppointmentSlot?.StartDateTime.ToString("HH:mm") ?? string.Empty,
                EndTime = b.AppointmentSlot?.EndDateTime.ToString("HH:mm") ?? string.Empty,
                Status = b.Status.ToString(),
                Notes = string.Empty,
                ReasonForVisit = string.Empty,
                CreatedAt = b.CreatedAt
            }).ToList();

            if (!string.IsNullOrWhiteSpace(status))
            {
                var filtered = dtoList.Where(a => a.Status.Equals(status.Trim(), StringComparison.OrdinalIgnoreCase)).ToList();
                return ServiceResponse<object>.Ok(filtered);
            }

            var grouped = new MyAppointmentsGroupedDto
            {
                Upcoming = dtoList.Where(a => a.AppointmentDate >= now && a.Status != nameof(BookingStatus.Cancelled) && a.Status != nameof(BookingStatus.Rejected)).ToList(),
                Past = dtoList.Where(a => a.AppointmentDate < now || a.Status == nameof(BookingStatus.Approved)).ToList(),
                Cancelled = dtoList.Where(a => a.Status == nameof(BookingStatus.Cancelled)).ToList()
            };

            return ServiceResponse<object>.Ok(grouped);
        }

        public async Task<ServiceResponse<AppointmentDto>> UpdateAppointmentStatusAsync(int id, UpdateAppointmentStatusDto dto, int? currentUserId, string? currentUserRole)
        {
            var booking = await _context.Bookings
                .Include(b => b.Patient)
                .Include(b => b.AppointmentSlot)
                    .ThenInclude(s => s.Doctor)
                        .ThenInclude(d => d.User)
                .Include(b => b.AppointmentSlot)
                    .ThenInclude(s => s.Doctor)
                        .ThenInclude(d => d.Clinic)
                .FirstOrDefaultAsync(b => b.BookingId == id);

            if (booking == null)
            {
                return ServiceResponse<AppointmentDto>.Fail("الحجز غير موجود", 404);
            }

            if (string.Equals(currentUserRole, "Doctor", StringComparison.OrdinalIgnoreCase) && booking.AppointmentSlot?.Doctor?.UserId != currentUserId)
            {
                return ServiceResponse<AppointmentDto>.Fail("غير مصرح لك بتغيير حالة هذا الحجز", 403);
            }

            if (!Enum.TryParse<BookingStatus>(dto.Status.Trim(), true, out var newStatus))
            {
                return ServiceResponse<AppointmentDto>.Fail("حالة الحجز غير صالحة. الحالات المتاحة: Pending, Approved, Rejected, Cancelled", 400);
            }

            booking.Status = newStatus;
            await _context.SaveChangesAsync();

            return ServiceResponse<AppointmentDto>.Ok(new AppointmentDto
            {
                Id = booking.BookingId,
                AppointmentNumber = $"APT-{booking.BookingId}",
                PatientId = booking.PatientId,
                PatientName = booking.Patient?.FullName ?? string.Empty,
                PatientPhone = booking.Patient?.PhoneNumber ?? string.Empty,
                DoctorId = booking.AppointmentSlot?.DoctorId ?? 0,
                DoctorName = booking.AppointmentSlot?.Doctor?.User?.FullName ?? string.Empty,
                SpecializationName = booking.AppointmentSlot?.Doctor?.Clinic?.ClinicName ?? string.Empty,
                Clinic = booking.AppointmentSlot?.Doctor?.Clinic?.ClinicName ?? string.Empty,
                SlotId = booking.SlotId,
                AppointmentDate = booking.AppointmentSlot?.StartDateTime ?? booking.CreatedAt,
                StartTime = booking.AppointmentSlot?.StartDateTime.ToString("HH:mm") ?? string.Empty,
                EndTime = booking.AppointmentSlot?.EndDateTime.ToString("HH:mm") ?? string.Empty,
                Status = booking.Status.ToString(),
                Notes = string.Empty,
                ReasonForVisit = string.Empty,
                CreatedAt = booking.CreatedAt
            });
        }

        public async Task<ServiceResponse<object>> CancelAppointmentAsync(int id, int? currentUserId, bool isAdmin)
        {
            var booking = await _context.Bookings
                .Include(b => b.AppointmentSlot)
                    .ThenInclude(s => s.Doctor)
                .FirstOrDefaultAsync(b => b.BookingId == id);

            if (booking == null)
            {
                return ServiceResponse<object>.Fail("الحجز غير موجود", 404);
            }

            if (!isAdmin &&
                booking.PatientId != currentUserId &&
                booking.AppointmentSlot?.Doctor?.UserId != currentUserId)
            {
                return ServiceResponse<object>.Fail("غير مصرح لك بإلغاء هذا الحجز", 403);
            }

            booking.Status = BookingStatus.Cancelled;
            await _context.SaveChangesAsync();

            return ServiceResponse<object>.Ok(new
            {
                message = "تم إلغاء الحجز بنجاح",
                appointmentId = booking.BookingId,
                status = booking.Status.ToString()
            });
        }
    }
}
