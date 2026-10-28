using Hospital_booking_Project.Data;
using Hospital_booking_Project.DTOs;
using Hospital_booking_Project.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Hospital_booking_Project.Services
{
    public class AdminService : IAdminService
    {
        private readonly AppDbContext _context;

        public AdminService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ServiceResponse<AdminDashboardDto>> GetDashboardAsync()
        {
            var now = DateTime.UtcNow.Date;

            var totalDoctors = await _context.Doctors.CountAsync();
            var totalPatients = await _context.Patients.CountAsync();
            var totalSpecializations = await _context.Specializations.CountAsync();
            var totalAppointments = await _context.Appointments.CountAsync();

            var upcomingAppointments = await _context.Appointments
                .CountAsync(a => a.AppointmentDate.Date >= now && a.Status != "Cancelled" && a.Status != "Completed");

            var pendingAppointments = await _context.Appointments
                .CountAsync(a => a.Status == "Pending");

            var confirmedAppointments = await _context.Appointments
                .CountAsync(a => a.Status == "Confirmed");

            var completedAppointments = await _context.Appointments
                .CountAsync(a => a.Status == "Completed");

            var cancelledAppointments = await _context.Appointments
                .CountAsync(a => a.Status == "Cancelled");

            var recent = await _context.Appointments
                .Include(a => a.Patient)
                    .ThenInclude(p => p!.User)
                .Include(a => a.Doctor)
                    .ThenInclude(d => d!.User)
                .Include(a => a.Doctor)
                    .ThenInclude(d => d!.Specialization)
                .OrderByDescending(a => a.CreatedAt)
                .Take(10)
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
                query = query.Where(u => u.Role.ToLower() == role.Trim().ToLower());
            }

            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(u => u.AccountStatus.ToLower() == status.Trim().ToLower());
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim().ToLower();
                query = query.Where(u => u.FullName.ToLower().Contains(term) ||
                                         u.Email.ToLower().Contains(term) ||
                                         u.PhoneNumber.Contains(term));
            }

            var users = await query
                .OrderByDescending(u => u.CreatedAt)
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Email = u.Email,
                    PhoneNumber = u.PhoneNumber,
                    Role = u.Role,
                    AccountStatus = u.AccountStatus,
                    CreatedAt = u.CreatedAt
                })
                .ToListAsync();

            return ServiceResponse<List<UserDto>>.Ok(users);
        }

        public async Task<ServiceResponse<UserDto>> UpdateUserRoleAsync(int id, UpdateUserRoleDto dto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return ServiceResponse<UserDto>.Fail("المستخدم غير موجود", 404);
            }

            var validRoles = new[] { "Patient", "Doctor", "Admin" };
            var targetRole = validRoles.FirstOrDefault(r => r.Equals(dto.Role.Trim(), StringComparison.OrdinalIgnoreCase));

            if (targetRole == null)
            {
                return ServiceResponse<UserDto>.Fail("الدور المحدد غير صالح. الأدوار المتاحة: Patient, Doctor, Admin", 400);
            }

            user.Role = targetRole;
            await _context.SaveChangesAsync();

            return ServiceResponse<UserDto>.Ok(new UserDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Role = user.Role,
                AccountStatus = user.AccountStatus,
                CreatedAt = user.CreatedAt
            });
        }

        public async Task<ServiceResponse<List<AppointmentDto>>> GetAppointmentsAsync(int? patientId, int? doctorId, string? status, DateTime? date)
        {
            var query = _context.Appointments
                .Include(a => a.Patient)
                    .ThenInclude(p => p!.User)
                .Include(a => a.Doctor)
                    .ThenInclude(d => d!.User)
                .Include(a => a.Doctor)
                    .ThenInclude(d => d!.Specialization)
                .AsQueryable();

            if (patientId.HasValue)
            {
                query = query.Where(a => a.PatientId == patientId.Value || (a.Patient != null && a.Patient.UserId == patientId.Value));
            }

            if (doctorId.HasValue)
            {
                query = query.Where(a => a.DoctorId == doctorId.Value || (a.Doctor != null && a.Doctor.UserId == doctorId.Value));
            }

            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(a => a.Status.ToLower() == status.Trim().ToLower());
            }

            if (date.HasValue)
            {
                var targetDate = date.Value.Date;
                query = query.Where(a => a.AppointmentDate.Date == targetDate);
            }

            var appointments = await query
                .OrderByDescending(a => a.AppointmentDate)
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

        public async Task<ServiceResponse<List<DoctorDto>>> GetDoctorsAsync(int? specializationId, string? status, string? search)
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

            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(d => d.User != null && d.User.AccountStatus.ToLower() == status.Trim().ToLower());
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

        public async Task<ServiceResponse<List<PatientDto>>> GetPatientsAsync(string? status, string? search)
        {
            var query = _context.Patients
                .Include(p => p.User)
                .Include(p => p.Appointments)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(p => p.User != null && p.User.AccountStatus.ToLower() == status.Trim().ToLower());
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim().ToLower();
                query = query.Where(p =>
                    p.User != null &&
                    (p.User.FullName.ToLower().Contains(term) ||
                     p.User.Email.ToLower().Contains(term) ||
                     p.User.PhoneNumber.Contains(term)));
            }

            var patients = await query.ToListAsync();
            var now = DateTime.UtcNow;

            var result = patients.Select(p => new PatientDto
            {
                Id = p.Id,
                UserId = p.UserId,
                FullName = p.User?.FullName ?? string.Empty,
                Email = p.User?.Email ?? string.Empty,
                PhoneNumber = p.User?.PhoneNumber ?? string.Empty,
                DateOfBirth = p.DateOfBirth,
                ProfileImageUrl = p.ProfileImageUrl,
                AccountStatus = p.User?.AccountStatus ?? "Active",
                CreatedAt = p.CreatedAt,
                Statistics = new PatientAppointmentStatsDto
                {
                    TotalAppointments = p.Appointments.Count,
                    UpcomingAppointments = p.Appointments.Count(a => a.AppointmentDate >= now.Date && a.Status != "Cancelled"),
                    CompletedAppointments = p.Appointments.Count(a => a.Status == "Completed"),
                    CancelledAppointments = p.Appointments.Count(a => a.Status == "Cancelled")
                }
            }).ToList();

            return ServiceResponse<List<PatientDto>>.Ok(result);
        }
    }
}
