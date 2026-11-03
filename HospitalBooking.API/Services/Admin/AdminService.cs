using HospitalBooking.API.Common.Enums;
using HospitalBooking.API.Data;
using HospitalBooking.API.DTOs;
using HospitalBooking.API.Services.Common;
using Microsoft.EntityFrameworkCore;

namespace HospitalBooking.API.Services.Admin
{
    public class AdminService : IAdminService
    {
        private readonly YusrDbContext _context;

        public AdminService(YusrDbContext context)
        {
            _context = context;
        }

        public async Task<ServiceResponse<AdminDashboardDto>> GetDashboardAsync()
        {
            var now = DateTimeOffset.UtcNow;

            var totalDoctors = await _context.Doctors.CountAsync();
            var totalPatients = await _context.Users.CountAsync(u => u.Role == UserRole.Patient);
            var totalSpecializations = await _context.Clinics.CountAsync();
            var totalAppointments = await _context.Bookings.CountAsync();

            var upcomingAppointments = await _context.Bookings
                .Include(b => b.AppointmentSlot)
                .CountAsync(b => b.AppointmentSlot != null && b.AppointmentSlot.StartDateTime >= now && b.Status != BookingStatus.Cancelled);

            var pendingAppointments = await _context.Bookings
                .CountAsync(b => b.Status == BookingStatus.Pending);

            var confirmedAppointments = await _context.Bookings
                .CountAsync(b => b.Status == BookingStatus.Approved);

            var completedAppointments = await _context.Bookings
                .Include(b => b.AppointmentSlot)
                .CountAsync(b => b.Status == BookingStatus.Approved && b.AppointmentSlot != null && b.AppointmentSlot.EndDateTime < now);

            var cancelledAppointments = await _context.Bookings
                .CountAsync(b => b.Status == BookingStatus.Cancelled);

            var recent = await _context.Bookings
                .Include(b => b.Patient)
                .Include(b => b.AppointmentSlot)
                    .ThenInclude(s => s.Doctor)
                        .ThenInclude(d => d.User)
                .Include(b => b.AppointmentSlot)
                    .ThenInclude(s => s.Doctor)
                        .ThenInclude(d => d.Clinic)
                .OrderByDescending(b => b.CreatedAt)
                .Take(10)
                .Select(b => new AppointmentDto
                {
                    Id = b.BookingId,
                    AppointmentNumber = $"APT-{b.BookingId}",
                    PatientId = b.PatientId,
                    PatientName = b.Patient != null ? b.Patient.FullName : string.Empty,
                    PatientPhone = b.Patient != null && b.Patient.PhoneNumber != null ? b.Patient.PhoneNumber : string.Empty,
                    DoctorId = b.AppointmentSlot != null ? b.AppointmentSlot.DoctorId : 0,
                    DoctorName = b.AppointmentSlot != null && b.AppointmentSlot.Doctor != null && b.AppointmentSlot.Doctor.User != null ? b.AppointmentSlot.Doctor.User.FullName : string.Empty,
                    SpecializationName = b.AppointmentSlot != null && b.AppointmentSlot.Doctor != null && b.AppointmentSlot.Doctor.Clinic != null ? b.AppointmentSlot.Doctor.Clinic.ClinicName : string.Empty,
                    Clinic = b.AppointmentSlot != null && b.AppointmentSlot.Doctor != null && b.AppointmentSlot.Doctor.Clinic != null ? b.AppointmentSlot.Doctor.Clinic.ClinicName : string.Empty,
                    SlotId = b.SlotId,
                    AppointmentDate = b.AppointmentSlot != null ? b.AppointmentSlot.StartDateTime : b.CreatedAt,
                    StartTime = b.AppointmentSlot != null ? b.AppointmentSlot.StartDateTime.ToString("HH:mm") : string.Empty,
                    EndTime = b.AppointmentSlot != null ? b.AppointmentSlot.EndDateTime.ToString("HH:mm") : string.Empty,
                    Status = b.Status.ToString(),
                    Notes = string.Empty,
                    ReasonForVisit = string.Empty,
                    CreatedAt = b.CreatedAt
                })
                .ToListAsync();

            var dashboard = new AdminDashboardDto
            {
                TotalDoctors = totalDoctors,
                TotalPatients = totalPatients,
                TotalSpecializations = totalSpecializations,
                TotalAppointments = totalAppointments,
                UpcomingAppointments = upcomingAppointments,
                PendingAppointments = pendingAppointments,
                ConfirmedAppointments = confirmedAppointments,
                CompletedAppointments = completedAppointments,
                CancelledAppointments = cancelledAppointments,
                RecentAppointments = recent
            };

            return ServiceResponse<AdminDashboardDto>.Ok(dashboard);
        }

        public async Task<ServiceResponse<List<UserDto>>> GetUsersAsync(string? role, string? status, string? search)
        {
            var query = _context.Users.AsQueryable();

            if (!string.IsNullOrWhiteSpace(role))
            {
                if (Enum.TryParse<UserRole>(role.Trim(), true, out var parsedRole))
                {
                    query = query.Where(u => u.Role == parsedRole);
                }
            }

            if (!string.IsNullOrWhiteSpace(status))
            {
                var isActive = status.Trim().Equals("Active", StringComparison.OrdinalIgnoreCase);
                query = query.Where(u => u.IsActive == isActive);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim().ToLower();
                query = query.Where(u => u.FullName.ToLower().Contains(term) ||
                                         (u.Email != null && u.Email.ToLower().Contains(term)) ||
                                         (u.PhoneNumber != null && u.PhoneNumber.Contains(term)));
            }

            var users = await query
                .OrderByDescending(u => u.CreatedAt)
                .Select(u => new UserDto
                {
                    Id = u.UserId,
                    FullName = u.FullName,
                    Email = u.Email ?? string.Empty,
                    PhoneNumber = u.PhoneNumber ?? string.Empty,
                    Role = u.Role.ToString(),
                    AccountStatus = u.IsActive ? "Active" : "Inactive",
                    CreatedAt = u.CreatedAt
                })
                .ToListAsync();

            return ServiceResponse<List<UserDto>>.Ok(users);
        }

        public async Task<ServiceResponse<UserDto>> UpdateUserRoleAsync(int id, UpdateUserRoleDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == id);
            if (user == null)
            {
                return ServiceResponse<UserDto>.Fail("المستخدم غير موجود", 404);
            }

            if (!Enum.TryParse<UserRole>(dto.Role.Trim(), true, out var parsedRole) || parsedRole == UserRole.None)
            {
                return ServiceResponse<UserDto>.Fail("الدور المحدد غير صالح. الأدوار المتاحة: Patient, Doctor, Admin", 400);
            }

            user.Role = parsedRole;
            await _context.SaveChangesAsync();

            return ServiceResponse<UserDto>.Ok(new UserDto
            {
                Id = user.UserId,
                FullName = user.FullName,
                Email = user.Email ?? string.Empty,
                PhoneNumber = user.PhoneNumber ?? string.Empty,
                Role = user.Role.ToString(),
                AccountStatus = user.IsActive ? "Active" : "Inactive",
                CreatedAt = user.CreatedAt
            });
        }

        public async Task<ServiceResponse<List<AppointmentDto>>> GetAppointmentsAsync(int? patientId, int? doctorId, string? status, DateTime? date)
        {
            var query = _context.Bookings
                .Include(b => b.Patient)
                .Include(b => b.AppointmentSlot)
                    .ThenInclude(s => s.Doctor)
                        .ThenInclude(d => d.User)
                .Include(b => b.AppointmentSlot)
                    .ThenInclude(s => s.Doctor)
                        .ThenInclude(d => d.Clinic)
                .AsQueryable();

            if (patientId.HasValue)
            {
                query = query.Where(b => b.PatientId == patientId.Value);
            }

            if (doctorId.HasValue)
            {
                query = query.Where(b => b.AppointmentSlot.DoctorId == doctorId.Value || (b.AppointmentSlot.Doctor != null && b.AppointmentSlot.Doctor.UserId == doctorId.Value));
            }

            if (!string.IsNullOrWhiteSpace(status))
            {
                if (Enum.TryParse<BookingStatus>(status.Trim(), true, out var parsedStatus))
                {
                    query = query.Where(b => b.Status == parsedStatus);
                }
            }

            if (date.HasValue)
            {
                var startOfDay = new DateTimeOffset(date.Value.Date, TimeSpan.Zero);
                var endOfDay = startOfDay.AddDays(1);
                query = query.Where(b => b.AppointmentSlot != null && b.AppointmentSlot.StartDateTime >= startOfDay && b.AppointmentSlot.StartDateTime < endOfDay);
            }

            var appointments = await query
                .OrderByDescending(b => b.CreatedAt)
                .Select(b => new AppointmentDto
                {
                    Id = b.BookingId,
                    AppointmentNumber = $"APT-{b.BookingId}",
                    PatientId = b.PatientId,
                    PatientName = b.Patient != null ? b.Patient.FullName : string.Empty,
                    PatientPhone = b.Patient != null && b.Patient.PhoneNumber != null ? b.Patient.PhoneNumber : string.Empty,
                    DoctorId = b.AppointmentSlot != null ? b.AppointmentSlot.DoctorId : 0,
                    DoctorName = b.AppointmentSlot != null && b.AppointmentSlot.Doctor != null && b.AppointmentSlot.Doctor.User != null ? b.AppointmentSlot.Doctor.User.FullName : string.Empty,
                    SpecializationName = b.AppointmentSlot != null && b.AppointmentSlot.Doctor != null && b.AppointmentSlot.Doctor.Clinic != null ? b.AppointmentSlot.Doctor.Clinic.ClinicName : string.Empty,
                    Clinic = b.AppointmentSlot != null && b.AppointmentSlot.Doctor != null && b.AppointmentSlot.Doctor.Clinic != null ? b.AppointmentSlot.Doctor.Clinic.ClinicName : string.Empty,
                    SlotId = b.SlotId,
                    AppointmentDate = b.AppointmentSlot != null ? b.AppointmentSlot.StartDateTime : b.CreatedAt,
                    StartTime = b.AppointmentSlot != null ? b.AppointmentSlot.StartDateTime.ToString("HH:mm") : string.Empty,
                    EndTime = b.AppointmentSlot != null ? b.AppointmentSlot.EndDateTime.ToString("HH:mm") : string.Empty,
                    Status = b.Status.ToString(),
                    Notes = string.Empty,
                    ReasonForVisit = string.Empty,
                    CreatedAt = b.CreatedAt
                })
                .ToListAsync();

            return ServiceResponse<List<AppointmentDto>>.Ok(appointments);
        }

        public async Task<ServiceResponse<List<DoctorDto>>> GetDoctorsAsync(int? specializationId, string? status, string? search)
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

            if (!string.IsNullOrWhiteSpace(status))
            {
                var isActive = status.Trim().Equals("Active", StringComparison.OrdinalIgnoreCase);
                query = query.Where(d => d.User != null && d.User.IsActive == isActive);
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

        public async Task<ServiceResponse<List<PatientDto>>> GetPatientsAsync(string? status, string? search)
        {
            var query = _context.Users
                .Where(u => u.Role == UserRole.Patient)
                .Include(u => u.Bookings)
                    .ThenInclude(b => b.AppointmentSlot)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(status))
            {
                var isActive = status.Trim().Equals("Active", StringComparison.OrdinalIgnoreCase);
                query = query.Where(u => u.IsActive == isActive);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim().ToLower();
                query = query.Where(u =>
                    u.FullName.ToLower().Contains(term) ||
                    (u.Email != null && u.Email.ToLower().Contains(term)) ||
                    (u.PhoneNumber != null && u.PhoneNumber.Contains(term)));
            }

            var patients = await query.ToListAsync();
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
    }
}
