using System.Globalization;
using HospitalBooking.API.Common.Enums;
using HospitalBooking.API.Data;
using HospitalBooking.API.DTOs;
using HospitalBooking.API.Models;
using HospitalBooking.API.Services.Common;
using HospitalBooking.API.Services.Security;
using Microsoft.EntityFrameworkCore;

namespace HospitalBooking.API.Services.Doctors
{
    public class DoctorService : IDoctorService
    {
        private readonly YusrDbContext _context;
        private readonly IPasswordHasher _passwordHasher;

        public DoctorService(YusrDbContext context, IPasswordHasher passwordHasher)
        {
            _context = context;
            _passwordHasher = passwordHasher;
        }

        public async Task<ServiceResponse<List<DoctorDto>>> GetDoctorsAsync(int? specializationId, string? search)
        {
            var query = _context.Doctors
                .Include(d => d.User)
                .Include(d => d.Clinic)
                .Include(d => d.AppointmentSlots)
                    .ThenInclude(s => s.Bookings)
                .AsQueryable();

            if (specializationId.HasValue && specializationId.Value > 0)
            {
                query = query.Where(d => d.ClinicId == specializationId.Value);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim().ToLower();
                query = query.Where(d =>
                    (d.User != null && d.User.FullName.ToLower().Contains(term)) ||
                    (d.Clinic != null && d.Clinic.ClinicName.ToLower().Contains(term)) ||
                    (d.Clinic != null && d.Clinic.Specialty.ToLower().Contains(term)));
            }

            var doctors = await query.ToListAsync();

            var result = doctors.Select(d => new DoctorDto
            {
                Id = d.DoctorId,
                UserId = d.UserId,
                FullName = d.User?.FullName ?? string.Empty,
                Email = d.User?.Email ?? string.Empty,
                PhoneNumber = d.User?.PhoneNumber ?? string.Empty,
                SpecializationId = d.ClinicId,
                SpecializationName = d.Clinic?.ClinicName ?? string.Empty,
                Clinic = d.Clinic?.ClinicName ?? string.Empty,
                Bio = d.Bio ?? string.Empty,
                Experience = string.Empty,
                Rating = 5.0,
                AvailabilityStatus = "Available",
                ProfileImageUrl = d.ProfileImage,
                AccountStatus = d.User?.IsActive == true ? "Active" : "Inactive",
                AppointmentsCount = d.AppointmentSlots.SelectMany(s => s.Bookings).Count()
            }).ToList();

            return ServiceResponse<List<DoctorDto>>.Ok(result);
        }

        public async Task<ServiceResponse<DoctorDetailDto>> GetDoctorByIdAsync(int id)
        {
            var doctor = await _context.Doctors
                .Include(d => d.User)
                .Include(d => d.Clinic)
                .Include(d => d.AppointmentSlots)
                    .ThenInclude(s => s.Bookings)
                .FirstOrDefaultAsync(d => d.DoctorId == id || d.UserId == id);

            if (doctor == null)
            {
                return ServiceResponse<DoctorDetailDto>.Fail("الطبيب غير موجود", 404);
            }

            var detail = new DoctorDetailDto
            {
                Id = doctor.DoctorId,
                UserId = doctor.UserId,
                FullName = doctor.User?.FullName ?? string.Empty,
                Email = doctor.User?.Email ?? string.Empty,
                PhoneNumber = doctor.User?.PhoneNumber ?? string.Empty,
                SpecializationId = doctor.ClinicId,
                SpecializationName = doctor.Clinic?.ClinicName ?? string.Empty,
                Clinic = doctor.Clinic?.ClinicName ?? string.Empty,
                Bio = doctor.Bio ?? string.Empty,
                Experience = string.Empty,
                Rating = 5.0,
                AvailabilityStatus = "Available",
                ProfileImageUrl = doctor.ProfileImage,
                AccountStatus = doctor.User?.IsActive == true ? "Active" : "Inactive",
                AppointmentsCount = doctor.AppointmentSlots.SelectMany(s => s.Bookings).Count(),
                ScheduleSlots = doctor.AppointmentSlots
                    .OrderBy(s => s.StartDateTime)
                    .Select(s => new DoctorSlotDto
                    {
                        Id = s.SlotId,
                        DoctorId = s.DoctorId,
                        Date = s.StartDateTime.Date,
                        StartTime = s.StartDateTime.ToString("HH:mm"),
                        EndTime = s.EndDateTime.ToString("HH:mm"),
                        Status = s.IsCancelled ? "Unavailable" : (s.Bookings.Any(b => b.Status != BookingStatus.Cancelled) ? "Booked" : "Available")
                    }).ToList()
            };

            return ServiceResponse<DoctorDetailDto>.Ok(detail);
        }

        public async Task<ServiceResponse<object>> CreateDoctorAsync(CreateDoctorDto dto)
        {
            var emailNormalized = dto.Email.Trim().ToLower();
            if (await _context.Users.AnyAsync(u => u.Email != null && u.Email.ToLower() == emailNormalized))
            {
                return ServiceResponse<object>.Fail("البريد الإلكتروني مسجل بالفعل لمستخدم آخر", 400);
            }

            if (await _context.Users.AnyAsync(u => u.PhoneNumber == dto.PhoneNumber.Trim()))
            {
                return ServiceResponse<object>.Fail("رقم الهاتف مسجل بالفعل لمستخدم آخر", 400);
            }

            var clinic = await _context.Clinics.FindAsync(dto.SpecializationId);
            if (clinic == null)
            {
                return ServiceResponse<object>.Fail("العيادة/التخصص المحدد غير موجود", 400);
            }

            var rawPassword = string.IsNullOrWhiteSpace(dto.Password) ? "Doctor@123" : dto.Password;

            var user = new User
            {
                FullName = dto.FullName.Trim(),
                Email = emailNormalized,
                PhoneNumber = dto.PhoneNumber.Trim(),
                PasswordHash = _passwordHasher.HashPassword(rawPassword),
                Role = UserRole.Doctor,
                IsActive = string.IsNullOrWhiteSpace(dto.Status) || dto.Status.Equals("Active", StringComparison.OrdinalIgnoreCase),
                CreatedAt = DateTimeOffset.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var doctor = new Doctor
            {
                UserId = user.UserId,
                ClinicId = dto.SpecializationId,
                Bio = dto.Bio,
                ProfileImage = dto.ProfileImageUrl
            };

            _context.Doctors.Add(doctor);
            await _context.SaveChangesAsync();

            var responseDto = new DoctorDto
            {
                Id = doctor.DoctorId,
                UserId = user.UserId,
                FullName = user.FullName,
                Email = user.Email ?? string.Empty,
                PhoneNumber = user.PhoneNumber ?? string.Empty,
                SpecializationId = doctor.ClinicId,
                SpecializationName = clinic.ClinicName,
                Clinic = clinic.ClinicName,
                Bio = doctor.Bio ?? string.Empty,
                Experience = string.Empty,
                Rating = 5.0,
                AvailabilityStatus = "Available",
                ProfileImageUrl = doctor.ProfileImage,
                AccountStatus = user.IsActive ? "Active" : "Inactive"
            };

            return ServiceResponse<object>.Created(new
            {
                message = "تم إضافة الطبيب بنجاح",
                doctorId = doctor.DoctorId,
                doctor = responseDto
            });
        }

        public async Task<ServiceResponse<DoctorDto>> UpdateDoctorAsync(int id, UpdateDoctorDto dto)
        {
            var doctor = await _context.Doctors
                .Include(d => d.User)
                .Include(d => d.Clinic)
                .FirstOrDefaultAsync(d => d.DoctorId == id || d.UserId == id);

            if (doctor == null)
            {
                return ServiceResponse<DoctorDto>.Fail("الطبيب غير موجود", 404);
            }

            if (dto.SpecializationId.HasValue && dto.SpecializationId.Value > 0)
            {
                var clinic = await _context.Clinics.FindAsync(dto.SpecializationId.Value);
                if (clinic == null)
                {
                    return ServiceResponse<DoctorDto>.Fail("العيادة/التخصص المحدد غير موجود", 400);
                }
                doctor.ClinicId = dto.SpecializationId.Value;
            }

            if (dto.Bio != null) doctor.Bio = dto.Bio;
            if (dto.ProfileImageUrl != null) doctor.ProfileImage = dto.ProfileImageUrl;

            if (doctor.User != null)
            {
                if (!string.IsNullOrWhiteSpace(dto.FullName)) doctor.User.FullName = dto.FullName.Trim();
                if (!string.IsNullOrWhiteSpace(dto.PhoneNumber)) doctor.User.PhoneNumber = dto.PhoneNumber.Trim();
                if (!string.IsNullOrWhiteSpace(dto.Email)) doctor.User.Email = dto.Email.Trim().ToLower();
                if (!string.IsNullOrWhiteSpace(dto.Status)) doctor.User.IsActive = dto.Status.Equals("Active", StringComparison.OrdinalIgnoreCase);
            }

            await _context.SaveChangesAsync();

            var clinicName = (await _context.Clinics.FindAsync(doctor.ClinicId))?.ClinicName ?? string.Empty;

            var updatedDto = new DoctorDto
            {
                Id = doctor.DoctorId,
                UserId = doctor.UserId,
                FullName = doctor.User?.FullName ?? string.Empty,
                Email = doctor.User?.Email ?? string.Empty,
                PhoneNumber = doctor.User?.PhoneNumber ?? string.Empty,
                SpecializationId = doctor.ClinicId,
                SpecializationName = clinicName,
                Clinic = clinicName,
                Bio = doctor.Bio ?? string.Empty,
                Experience = string.Empty,
                Rating = 5.0,
                AvailabilityStatus = "Available",
                ProfileImageUrl = doctor.ProfileImage,
                AccountStatus = doctor.User?.IsActive == true ? "Active" : "Inactive"
            };

            return ServiceResponse<DoctorDto>.Ok(updatedDto);
        }

        public async Task<ServiceResponse<object>> DeleteDoctorAsync(int id)
        {
            var doctor = await _context.Doctors
                .Include(d => d.User)
                .Include(d => d.AppointmentSlots)
                    .ThenInclude(s => s.Bookings)
                .FirstOrDefaultAsync(d => d.DoctorId == id || d.UserId == id);

            if (doctor == null)
            {
                return ServiceResponse<object>.Fail("الطبيب غير موجود", 404);
            }

            var bookings = doctor.AppointmentSlots.SelectMany(s => s.Bookings).ToList();
            _context.Bookings.RemoveRange(bookings);
            _context.AppointmentSlots.RemoveRange(doctor.AppointmentSlots);

            if (doctor.User != null)
            {
                _context.Users.Remove(doctor.User);
            }
            else
            {
                _context.Doctors.Remove(doctor);
            }

            await _context.SaveChangesAsync();

            return ServiceResponse<object>.Ok(new { message = "تم حذف الطبيب بنجاح" });
        }

        public async Task<ServiceResponse<List<DoctorSlotDto>>> GetDoctorSlotsAsync(int doctorId, DateTime? date)
        {
            var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.DoctorId == doctorId || d.UserId == doctorId);
            if (doctor == null)
            {
                return ServiceResponse<List<DoctorSlotDto>>.Fail("الطبيب غير موجود", 404);
            }

            var query = _context.AppointmentSlots
                .Include(s => s.Bookings)
                .Where(s => s.DoctorId == doctor.DoctorId);

            if (date.HasValue)
            {
                var targetDate = DateTime.SpecifyKind(date.Value.Date, DateTimeKind.Utc);
                var nextDate = targetDate.AddDays(1);
                query = query.Where(s => s.StartDateTime >= targetDate && s.StartDateTime < nextDate);
            }

            var slots = await query
                .OrderBy(s => s.StartDateTime)
                .Select(s => new DoctorSlotDto
                {
                    Id = s.SlotId,
                    DoctorId = s.DoctorId,
                    Date = s.StartDateTime.Date,
                    StartTime = s.StartDateTime.ToString("HH:mm"),
                    EndTime = s.EndDateTime.ToString("HH:mm"),
                    Status = s.IsCancelled ? "Unavailable" : (s.Bookings.Any(b => b.Status != BookingStatus.Cancelled) ? "Booked" : "Available")
                })
                .ToListAsync();

            return ServiceResponse<List<DoctorSlotDto>>.Ok(slots);
        }

        public async Task<ServiceResponse<object>> CreateDoctorSlotAsync(int doctorId, CreateDoctorSlotDto dto)
        {
            var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.DoctorId == doctorId || d.UserId == doctorId);
            if (doctor == null)
            {
                return ServiceResponse<object>.Fail("الطبيب غير موجود", 404);
            }

            if (!TimeSpan.TryParse(dto.StartTime, out var startTime) || !TimeSpan.TryParse(dto.EndTime, out var endTime))
            {
                return ServiceResponse<object>.Fail("صيغة الوقت غير صحيحة، يرجى استخدام صيغة HH:mm", 400);
            }

            var startDateTime = new DateTimeOffset(dto.Date.Date.Add(startTime), TimeSpan.Zero);
            var endDateTime = new DateTimeOffset(dto.Date.Date.Add(endTime), TimeSpan.Zero);

            var slot = new AppointmentSlot
            {
                DoctorId = doctor.DoctorId,
                StartDateTime = startDateTime,
                EndDateTime = endDateTime,
                IsCancelled = dto.Status != null && (dto.Status.Equals("Unavailable", StringComparison.OrdinalIgnoreCase) || dto.Status.Equals("Cancelled", StringComparison.OrdinalIgnoreCase)),
                CreatedAt = DateTimeOffset.UtcNow
            };

            _context.AppointmentSlots.Add(slot);
            await _context.SaveChangesAsync();

            return ServiceResponse<object>.Created(new
            {
                slotId = slot.SlotId,
                doctorId = slot.DoctorId,
                date = slot.StartDateTime.Date,
                startTime = slot.StartDateTime.ToString("HH:mm"),
                endTime = slot.EndDateTime.ToString("HH:mm"),
                status = slot.IsCancelled ? "Unavailable" : "Available"
            });
        }

        public async Task<ServiceResponse<List<AppointmentDto>>> GetDoctorAppointmentsAsync(int doctorId, string? period, string? status, int? currentUserId, string? currentUserRole)
        {
            var doctor = await _context.Doctors
                .Include(d => d.Clinic)
                .Include(d => d.User)
                .FirstOrDefaultAsync(d => d.DoctorId == doctorId || d.UserId == doctorId);

            if (doctor == null)
            {
                return ServiceResponse<List<AppointmentDto>>.Fail("الطبيب غير موجود", 404);
            }

            if (currentUserRole == "Doctor" && doctor.UserId != currentUserId)
            {
                return ServiceResponse<List<AppointmentDto>>.Fail("غير مصرح لك باستعراض حجوزات طبيب آخر", 403);
            }

            var query = _context.Bookings
                .Include(b => b.Patient)
                .Include(b => b.AppointmentSlot)
                .Where(b => b.AppointmentSlot.DoctorId == doctor.DoctorId)
                .AsQueryable();

            var today = DateTimeOffset.UtcNow.Date;

            if (!string.IsNullOrWhiteSpace(period))
            {
                switch (period.ToLower())
                {
                    case "today":
                        query = query.Where(b => b.AppointmentSlot.StartDateTime.Date == today);
                        break;
                    case "week":
                        var weekEnd = today.AddDays(7);
                        query = query.Where(b => b.AppointmentSlot.StartDateTime.Date >= today && b.AppointmentSlot.StartDateTime.Date <= weekEnd);
                        break;
                    case "month":
                        var monthEnd = today.AddMonths(1);
                        query = query.Where(b => b.AppointmentSlot.StartDateTime.Date >= today && b.AppointmentSlot.StartDateTime.Date <= monthEnd);
                        break;
                }
            }

            if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<BookingStatus>(status, true, out var bookingStatus))
            {
                query = query.Where(b => b.Status == bookingStatus);
            }

            var appointments = await query
                .OrderBy(b => b.AppointmentSlot.StartDateTime)
                .Select(b => new AppointmentDto
                {
                    Id = b.BookingId,
                    AppointmentNumber = $"APT-{b.BookingId}",
                    PatientId = b.PatientId,
                    PatientName = b.Patient.FullName,
                    PatientPhone = b.Patient.PhoneNumber ?? string.Empty,
                    DoctorId = doctor.DoctorId,
                    DoctorName = doctor.User.FullName,
                    SpecializationName = doctor.Clinic.ClinicName,
                    Clinic = doctor.Clinic.ClinicName,
                    SlotId = b.SlotId,
                    AppointmentDate = b.AppointmentSlot.StartDateTime,
                    StartTime = b.AppointmentSlot.StartDateTime.ToString("HH:mm"),
                    EndTime = b.AppointmentSlot.EndDateTime.ToString("HH:mm"),
                    Status = b.Status.ToString(),
                    CreatedAt = b.CreatedAt
                })
                .ToListAsync();

            return ServiceResponse<List<AppointmentDto>>.Ok(appointments);
        }
    }
}
