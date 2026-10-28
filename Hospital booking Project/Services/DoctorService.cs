using Hospital_booking_Project.Data;
using Hospital_booking_Project.DTOs;
using Hospital_booking_Project.Models;
using Hospital_booking_Project.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Hospital_booking_Project.Services
{
    public class DoctorService : IDoctorService
    {
        private readonly AppDbContext _context;
        private readonly IPasswordHasher _passwordHasher;

        public DoctorService(AppDbContext context, IPasswordHasher passwordHasher)
        {
            _context = context;
            _passwordHasher = passwordHasher;
        }

        public async Task<ServiceResponse<List<DoctorDto>>> GetDoctorsAsync(int? specializationId, string? search)
        {
            var query = _context.Doctors
                .Include(d => d.User)
                .Include(d => d.Specialization)
                .Include(d => d.Appointments)
                .AsQueryable();

            if (specializationId.HasValue && specializationId.Value > 0)
            {
                query = query.Where(d => d.SpecializationId == specializationId.Value);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim().ToLower();
                query = query.Where(d =>
                    (d.User != null && d.User.FullName.ToLower().Contains(term)) ||
                    d.Clinic.ToLower().Contains(term) ||
                    (d.Specialization != null && d.Specialization.Name.ToLower().Contains(term)));
            }

            var doctors = await query.ToListAsync();

            var result = doctors.Select(d => new DoctorDto
            {
                Id = d.Id,
                UserId = d.UserId,
                FullName = d.User?.FullName ?? string.Empty,
                Email = d.User?.Email ?? string.Empty,
                PhoneNumber = d.User?.PhoneNumber ?? string.Empty,
                SpecializationId = d.SpecializationId,
                SpecializationName = d.Specialization?.Name ?? string.Empty,
                Clinic = d.Clinic,
                Bio = d.Bio,
                Experience = d.Experience,
                Rating = d.Rating,
                AvailabilityStatus = d.AvailabilityStatus,
                ProfileImageUrl = d.ProfileImageUrl,
                AccountStatus = d.User?.AccountStatus ?? "Active",
                AppointmentsCount = d.Appointments.Count
            }).ToList();

            return ServiceResponse<List<DoctorDto>>.Ok(result);
        }

        public async Task<ServiceResponse<DoctorDetailDto>> GetDoctorByIdAsync(int id)
        {
            var doctor = await _context.Doctors
                .Include(d => d.User)
                .Include(d => d.Specialization)
                .Include(d => d.Slots)
                .Include(d => d.Appointments)
                .FirstOrDefaultAsync(d => d.Id == id || d.UserId == id);

            if (doctor == null)
            {
                return ServiceResponse<DoctorDetailDto>.Fail("الطبيب غير موجود", 404);
            }

            var detail = new DoctorDetailDto
            {
                Id = doctor.Id,
                UserId = doctor.UserId,
                FullName = doctor.User?.FullName ?? string.Empty,
                Email = doctor.User?.Email ?? string.Empty,
                PhoneNumber = doctor.User?.PhoneNumber ?? string.Empty,
                SpecializationId = doctor.SpecializationId,
                SpecializationName = doctor.Specialization?.Name ?? string.Empty,
                Clinic = doctor.Clinic,
                Bio = doctor.Bio,
                Experience = doctor.Experience,
                Rating = doctor.Rating,
                AvailabilityStatus = doctor.AvailabilityStatus,
                ProfileImageUrl = doctor.ProfileImageUrl,
                AccountStatus = doctor.User?.AccountStatus ?? "Active",
                AppointmentsCount = doctor.Appointments.Count,
                ScheduleSlots = doctor.Slots
                    .OrderBy(s => s.Date)
                    .ThenBy(s => s.StartTime)
                    .Select(s => new DoctorSlotDto
                    {
                        Id = s.Id,
                        DoctorId = s.DoctorId,
                        Date = s.Date,
                        StartTime = s.StartTime,
                        EndTime = s.EndTime,
                        Status = s.Status
                    }).ToList()
            };

            return ServiceResponse<DoctorDetailDto>.Ok(detail);
        }

        public async Task<ServiceResponse<object>> CreateDoctorAsync(CreateDoctorDto dto)
        {
            var emailNormalized = dto.Email.Trim().ToLower();
            if (await _context.Users.AnyAsync(u => u.Email.ToLower() == emailNormalized))
            {
                return ServiceResponse<object>.Fail("البريد الإلكتروني مسجل بالفعل لمستخدم آخر", 400);
            }

            if (await _context.Users.AnyAsync(u => u.PhoneNumber == dto.PhoneNumber.Trim()))
            {
                return ServiceResponse<object>.Fail("رقم الهاتف مسجل بالفعل لمستخدم آخر", 400);
            }

            var spec = await _context.Specializations.FindAsync(dto.SpecializationId);
            if (spec == null)
            {
                return ServiceResponse<object>.Fail("التخصص المحدد غير موجود", 400);
            }

            var rawPassword = string.IsNullOrWhiteSpace(dto.Password) ? "Doctor@123" : dto.Password;

            var user = new User
            {
                FullName = dto.FullName.Trim(),
                Email = emailNormalized,
                PhoneNumber = dto.PhoneNumber.Trim(),
                PasswordHash = _passwordHasher.HashPassword(rawPassword),
                Role = "Doctor",
                AccountStatus = dto.Status ?? "Active",
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var doctor = new DoctorProfile
            {
                UserId = user.Id,
                SpecializationId = dto.SpecializationId,
                Clinic = dto.Clinic ?? string.Empty,
                Bio = dto.Bio ?? string.Empty,
                Experience = dto.Experience ?? string.Empty,
                ProfileImageUrl = dto.ProfileImageUrl,
                AvailabilityStatus = "Available",
                Rating = 5.0
            };

            _context.Doctors.Add(doctor);
            await _context.SaveChangesAsync();

            var responseDto = new DoctorDto
            {
                Id = doctor.Id,
                UserId = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                SpecializationId = doctor.SpecializationId,
                SpecializationName = spec.Name,
                Clinic = doctor.Clinic,
                Bio = doctor.Bio,
                Experience = doctor.Experience,
                Rating = doctor.Rating,
                AvailabilityStatus = doctor.AvailabilityStatus,
                ProfileImageUrl = doctor.ProfileImageUrl,
                AccountStatus = user.AccountStatus
            };

            return ServiceResponse<object>.Created(new
            {
                message = "تم إضافة الطبيب بنجاح",
                doctorId = doctor.Id,
                doctor = responseDto
            });
        }

        public async Task<ServiceResponse<DoctorDto>> UpdateDoctorAsync(int id, UpdateDoctorDto dto)
        {
            var doctor = await _context.Doctors
                .Include(d => d.User)
                .Include(d => d.Specialization)
                .FirstOrDefaultAsync(d => d.Id == id || d.UserId == id);

            if (doctor == null)
            {
                return ServiceResponse<DoctorDto>.Fail("الطبيب غير موجود", 404);
            }

            if (dto.SpecializationId.HasValue && dto.SpecializationId.Value > 0)
            {
                var spec = await _context.Specializations.FindAsync(dto.SpecializationId.Value);
                if (spec == null)
                {
                    return ServiceResponse<DoctorDto>.Fail("التخصص المحدد غير موجود", 400);
                }
                doctor.SpecializationId = dto.SpecializationId.Value;
            }

            if (dto.Clinic != null) doctor.Clinic = dto.Clinic;
            if (dto.Bio != null) doctor.Bio = dto.Bio;
            if (dto.Experience != null) doctor.Experience = dto.Experience;
            if (dto.ProfileImageUrl != null) doctor.ProfileImageUrl = dto.ProfileImageUrl;
            if (!string.IsNullOrWhiteSpace(dto.AvailabilityStatus)) doctor.AvailabilityStatus = dto.AvailabilityStatus;

            if (doctor.User != null)
            {
                if (!string.IsNullOrWhiteSpace(dto.FullName)) doctor.User.FullName = dto.FullName.Trim();
                if (!string.IsNullOrWhiteSpace(dto.PhoneNumber)) doctor.User.PhoneNumber = dto.PhoneNumber.Trim();
                if (!string.IsNullOrWhiteSpace(dto.Email)) doctor.User.Email = dto.Email.Trim().ToLower();
                if (!string.IsNullOrWhiteSpace(dto.Status)) doctor.User.AccountStatus = dto.Status;
            }

            await _context.SaveChangesAsync();

            var specName = (await _context.Specializations.FindAsync(doctor.SpecializationId))?.Name ?? string.Empty;

            var updatedDto = new DoctorDto
            {
                Id = doctor.Id,
                UserId = doctor.UserId,
                FullName = doctor.User?.FullName ?? string.Empty,
                Email = doctor.User?.Email ?? string.Empty,
                PhoneNumber = doctor.User?.PhoneNumber ?? string.Empty,
                SpecializationId = doctor.SpecializationId,
                SpecializationName = specName,
                Clinic = doctor.Clinic,
                Bio = doctor.Bio,
                Experience = doctor.Experience,
                Rating = doctor.Rating,
                AvailabilityStatus = doctor.AvailabilityStatus,
                ProfileImageUrl = doctor.ProfileImageUrl,
                AccountStatus = doctor.User?.AccountStatus ?? "Active"
            };

            return ServiceResponse<DoctorDto>.Ok(updatedDto);
        }

        public async Task<ServiceResponse<object>> DeleteDoctorAsync(int id)
        {
            var doctor = await _context.Doctors
                .Include(d => d.User)
                .Include(d => d.Slots)
                .Include(d => d.Appointments)
                .FirstOrDefaultAsync(d => d.Id == id || d.UserId == id);

            if (doctor == null)
            {
                return ServiceResponse<object>.Fail("الطبيب غير موجود", 404);
            }

            _context.Appointments.RemoveRange(doctor.Appointments);
            _context.Slots.RemoveRange(doctor.Slots);

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
            var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.Id == doctorId || d.UserId == doctorId);
            if (doctor == null)
            {
                return ServiceResponse<List<DoctorSlotDto>>.Fail("الطبيب غير موجود", 404);
            }

            var query = _context.Slots.Where(s => s.DoctorId == doctor.Id);

            if (date.HasValue)
            {
                var targetDate = date.Value.Date;
                query = query.Where(s => s.Date.Date == targetDate);
            }

            var slots = await query
                .OrderBy(s => s.Date)
                .ThenBy(s => s.StartTime)
                .Select(s => new DoctorSlotDto
                {
                    Id = s.Id,
                    DoctorId = s.DoctorId,
                    Date = s.Date,
                    StartTime = s.StartTime,
                    EndTime = s.EndTime,
                    Status = s.Status
                })
                .ToListAsync();

            return ServiceResponse<List<DoctorSlotDto>>.Ok(slots);
        }

        public async Task<ServiceResponse<object>> CreateDoctorSlotAsync(int doctorId, CreateDoctorSlotDto dto)
        {
            var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.Id == doctorId || d.UserId == doctorId);
            if (doctor == null)
            {
                return ServiceResponse<object>.Fail("الطبيب غير موجود", 404);
            }

            var slot = new DoctorSlot
            {
                DoctorId = doctor.Id,
                Date = dto.Date.Date,
                StartTime = dto.StartTime.Trim(),
                EndTime = dto.EndTime.Trim(),
                Status = string.IsNullOrWhiteSpace(dto.Status) ? "Available" : dto.Status
            };

            _context.Slots.Add(slot);
            await _context.SaveChangesAsync();

            return ServiceResponse<object>.Created(new
            {
                slotId = slot.Id,
                doctorId = slot.DoctorId,
                date = slot.Date,
                startTime = slot.StartTime,
                endTime = slot.EndTime,
                status = slot.Status
            });
        }

        public async Task<ServiceResponse<List<AppointmentDto>>> GetDoctorAppointmentsAsync(int doctorId, string? period, string? status, int? currentUserId, string? currentUserRole)
        {
            var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.Id == doctorId || d.UserId == doctorId);
            if (doctor == null)
            {
                return ServiceResponse<List<AppointmentDto>>.Fail("الطبيب غير موجود", 404);
            }

            if (currentUserRole == "Doctor" && doctor.UserId != currentUserId)
            {
                return ServiceResponse<List<AppointmentDto>>.Fail("غير مصرح لك باستعراض حجوزات طبيب آخر", 403);
            }

            var query = _context.Appointments
                .Include(a => a.Patient)
                    .ThenInclude(p => p!.User)
                .Include(a => a.Doctor)
                    .ThenInclude(d => d!.User)
                .Include(a => a.Doctor)
                    .ThenInclude(d => d!.Specialization)
                .Where(a => a.DoctorId == doctor.Id)
                .AsQueryable();

            var today = DateTime.UtcNow.Date;

            if (!string.IsNullOrWhiteSpace(period))
            {
                switch (period.ToLower())
                {
                    case "today":
                        query = query.Where(a => a.AppointmentDate.Date == today);
                        break;
                    case "week":
                        var weekEnd = today.AddDays(7);
                        query = query.Where(a => a.AppointmentDate.Date >= today && a.AppointmentDate.Date <= weekEnd);
                        break;
                    case "month":
                        var monthEnd = today.AddMonths(1);
                        query = query.Where(a => a.AppointmentDate.Date >= today && a.AppointmentDate.Date <= monthEnd);
                        break;
                }
            }

            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(a => a.Status.ToLower() == status.ToLower());
            }

            var appointments = await query
                .OrderBy(a => a.AppointmentDate)
                .ThenBy(a => a.StartTime)
                .Select(a => new AppointmentDto
                {
                    Id = a.Id,
                    AppointmentNumber = a.AppointmentNumber,
                    PatientId = a.PatientId,
                    PatientName = a.Patient != null && a.Patient.User != null ? a.Patient.User.FullName : string.Empty,
                    PatientPhone = a.Patient != null && a.Patient.User != null ? a.Patient.User.PhoneNumber : string.Empty,
                    DoctorId = a.DoctorId,
                    DoctorName = a.Doctor != null && a.Doctor.User != null ? a.Doctor.User.FullName : string.Empty,
                    SpecializationName = a.Doctor != null && a.Doctor.Specialization != null ? a.Doctor.Specialization.Name : string.Empty,
                    Clinic = a.Doctor != null ? a.Doctor.Clinic : string.Empty,
                    SlotId = a.SlotId,
                    AppointmentDate = a.AppointmentDate,
                    StartTime = a.StartTime,
                    EndTime = a.EndTime,
                    Status = a.Status,
                    Notes = a.Notes,
                    ReasonForVisit = a.ReasonForVisit,
                    CreatedAt = a.CreatedAt
                })
                .ToListAsync();

            return ServiceResponse<List<AppointmentDto>>.Ok(appointments);
        }
    }
}
