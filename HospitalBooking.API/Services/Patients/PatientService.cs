using HospitalBooking.API.Common.Enums;
using HospitalBooking.API.Data;
using HospitalBooking.API.DTOs;
using HospitalBooking.API.Models;
using HospitalBooking.API.Services.Common;
using Microsoft.EntityFrameworkCore;

namespace HospitalBooking.API.Services.Patients
{
    public class PatientService : IPatientService
    {
        private readonly YusrDbContext _context;

        public PatientService(YusrDbContext context)
        {
            _context = context;
        }

        public async Task<ServiceResponse<List<PatientDto>>> GetPatientsAsync()
        {
            var patients = await _context.Users
                .Where(u => u.Role == UserRole.Patient)
                .Include(u => u.Bookings)
                    .ThenInclude(b => b.AppointmentSlot)
                .ToListAsync();

            var now = DateTimeOffset.UtcNow;

            var result = patients.Select(p => new PatientDto
            {
                Id = p.UserId,
                UserId = p.UserId,
                FullName = p.FullName,
                Email = p.Email ?? string.Empty,
                PhoneNumber = p.PhoneNumber ?? string.Empty,
                AccountStatus = p.IsActive ? "Active" : "Inactive",
                CreatedAt = p.CreatedAt,
                Statistics = new PatientAppointmentStatsDto
                {
                    TotalAppointments = p.Bookings.Count,
                    UpcomingAppointments = p.Bookings.Count(b => b.AppointmentSlot != null && b.AppointmentSlot.StartDateTime >= now && b.Status != BookingStatus.Cancelled),
                    CompletedAppointments = p.Bookings.Count(b => b.Status == BookingStatus.Approved),
                    CancelledAppointments = p.Bookings.Count(b => b.Status == BookingStatus.Cancelled)
                }
            }).ToList();

            return ServiceResponse<List<PatientDto>>.Ok(result);
        }

        public async Task<ServiceResponse<PatientDetailDto>> GetPatientByIdAsync(int id, int? currentUserId, bool isAdmin)
        {
            var patient = await _context.Users
                .Where(u => u.Role == UserRole.Patient && u.UserId == id)
                .Include(u => u.Bookings)
                    .ThenInclude(b => b.AppointmentSlot)
                        .ThenInclude(s => s.Doctor)
                            .ThenInclude(d => d.User)
                .Include(u => u.Bookings)
                    .ThenInclude(b => b.AppointmentSlot)
                        .ThenInclude(s => s.Doctor)
                            .ThenInclude(d => d.Clinic)
                .FirstOrDefaultAsync();

            if (patient == null)
            {
                return ServiceResponse<PatientDetailDto>.Fail("المريض غير موجود", 404);
            }

            if (!isAdmin && currentUserId != patient.UserId)
            {
                return ServiceResponse<PatientDetailDto>.Fail("غير مصرح لك بالوصول لبيانات هذا المريض", 403);
            }

            var now = DateTimeOffset.UtcNow;

            var detail = new PatientDetailDto
            {
                Id = patient.UserId,
                UserId = patient.UserId,
                FullName = patient.FullName,
                Email = patient.Email ?? string.Empty,
                PhoneNumber = patient.PhoneNumber ?? string.Empty,
                AccountStatus = patient.IsActive ? "Active" : "Inactive",
                CreatedAt = patient.CreatedAt,
                Statistics = new PatientAppointmentStatsDto
                {
                    TotalAppointments = patient.Bookings.Count,
                    UpcomingAppointments = patient.Bookings.Count(b => b.AppointmentSlot != null && b.AppointmentSlot.StartDateTime >= now && b.Status != BookingStatus.Cancelled),
                    CompletedAppointments = patient.Bookings.Count(b => b.Status == BookingStatus.Approved),
                    CancelledAppointments = patient.Bookings.Count(b => b.Status == BookingStatus.Cancelled)
                },
                Appointments = patient.Bookings.OrderByDescending(b => b.CreatedAt).Select(b => new AppointmentDto
                {
                    Id = b.BookingId,
                    AppointmentNumber = $"APT-{b.BookingId}",
                    PatientId = b.PatientId,
                    PatientName = patient.FullName,
                    PatientPhone = patient.PhoneNumber ?? string.Empty,
                    DoctorId = b.AppointmentSlot != null ? b.AppointmentSlot.DoctorId : 0,
                    DoctorName = b.AppointmentSlot?.Doctor?.User?.FullName ?? string.Empty,
                    SpecializationName = b.AppointmentSlot?.Doctor?.Clinic?.ClinicName ?? string.Empty,
                    Clinic = b.AppointmentSlot?.Doctor?.Clinic?.ClinicName ?? string.Empty,
                    SlotId = b.SlotId,
                    AppointmentDate = b.AppointmentSlot?.StartDateTime ?? b.CreatedAt,
                    StartTime = b.AppointmentSlot?.StartDateTime.ToString("HH:mm") ?? string.Empty,
                    EndTime = b.AppointmentSlot?.EndDateTime.ToString("HH:mm") ?? string.Empty,
                    Status = b.Status.ToString(),
                    CreatedAt = b.CreatedAt
                }).ToList()
            };

            return ServiceResponse<PatientDetailDto>.Ok(detail);
        }

        public async Task<ServiceResponse<PatientDto>> UpdatePatientAsync(int id, UpdatePatientDto dto, int? currentUserId, bool isAdmin)
        {
            var patient = await _context.Users
                .FirstOrDefaultAsync(u => u.Role == UserRole.Patient && u.UserId == id);

            if (patient == null)
            {
                return ServiceResponse<PatientDto>.Fail("المريض غير موجود", 404);
            }

            if (!isAdmin && currentUserId != patient.UserId)
            {
                return ServiceResponse<PatientDto>.Fail("غير مصرح لك بتعديل بيانات هذا المريض", 403);
            }

            if (!string.IsNullOrWhiteSpace(dto.FullName))
            {
                patient.FullName = dto.FullName.Trim();
            }

            if (!string.IsNullOrWhiteSpace(dto.PhoneNumber))
            {
                var phoneExists = await _context.Users.AnyAsync(u => u.UserId != patient.UserId && u.PhoneNumber == dto.PhoneNumber.Trim());
                if (phoneExists)
                {
                    return ServiceResponse<PatientDto>.Fail("رقم الهاتف مسجل بالفعل لمستخدم آخر", 400);
                }
                patient.PhoneNumber = dto.PhoneNumber.Trim();
            }

            if (!string.IsNullOrWhiteSpace(dto.Email))
            {
                var emailExists = await _context.Users.AnyAsync(u => u.UserId != patient.UserId && u.Email != null && u.Email.ToLower() == dto.Email.Trim().ToLower());
                if (emailExists)
                {
                    return ServiceResponse<PatientDto>.Fail("البريد الإلكتروني مسجل بالفعل لمستخدم آخر", 400);
                }
                patient.Email = dto.Email.Trim().ToLower();
            }

            await _context.SaveChangesAsync();

            return ServiceResponse<PatientDto>.Ok(new PatientDto
            {
                Id = patient.UserId,
                UserId = patient.UserId,
                FullName = patient.FullName,
                Email = patient.Email ?? string.Empty,
                PhoneNumber = patient.PhoneNumber ?? string.Empty,
                AccountStatus = patient.IsActive ? "Active" : "Inactive",
                CreatedAt = patient.CreatedAt
            });
        }

        public async Task<ServiceResponse<object>> DeletePatientAsync(int id)
        {
            var patient = await _context.Users
                .Include(u => u.Bookings)
                .FirstOrDefaultAsync(u => u.Role == UserRole.Patient && u.UserId == id);

            if (patient == null)
            {
                return ServiceResponse<object>.Fail("المريض غير موجود", 404);
            }

            _context.Bookings.RemoveRange(patient.Bookings);
            _context.Users.Remove(patient);
            await _context.SaveChangesAsync();

            return ServiceResponse<object>.Ok(new { message = "تم حذف المريض بنجاح" });
        }
    }
}
