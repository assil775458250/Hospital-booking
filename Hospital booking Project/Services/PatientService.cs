using Hospital_booking_Project.Data;
using Hospital_booking_Project.DTOs;
using Hospital_booking_Project.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Hospital_booking_Project.Services
{
    public class PatientService : IPatientService
    {
        private readonly AppDbContext _context;

        public PatientService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ServiceResponse<List<PatientDto>>> GetPatientsAsync()
        {
            var patients = await _context.Patients
                .Include(p => p.User)
                .Include(p => p.Appointments)
                .ToListAsync();

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

        public async Task<ServiceResponse<PatientDetailDto>> GetPatientByIdAsync(int id, int? currentUserId, bool isAdmin)
        {
            var patient = await _context.Patients
                .Include(p => p.User)
                .Include(p => p.Appointments)
                    .ThenInclude(a => a.Doctor)
                        .ThenInclude(d => d!.User)
                .Include(p => p.Appointments)
                    .ThenInclude(a => a.Doctor)
                        .ThenInclude(d => d!.Specialization)
                .FirstOrDefaultAsync(p => p.Id == id || p.UserId == id);

            if (patient == null)
            {
                return ServiceResponse<PatientDetailDto>.Fail("المريض غير موجود", 404);
            }

            if (!isAdmin && currentUserId != patient.UserId)
            {
                return ServiceResponse<PatientDetailDto>.Fail("غير مصرح لك بالوصول لبيانات هذا المريض", 403);
            }

            var now = DateTime.UtcNow;

            var detail = new PatientDetailDto
            {
                Id = patient.Id,
                UserId = patient.UserId,
                FullName = patient.User?.FullName ?? string.Empty,
                Email = patient.User?.Email ?? string.Empty,
                PhoneNumber = patient.User?.PhoneNumber ?? string.Empty,
                DateOfBirth = patient.DateOfBirth,
                ProfileImageUrl = patient.ProfileImageUrl,
                AccountStatus = patient.User?.AccountStatus ?? "Active",
                CreatedAt = patient.CreatedAt,
                Statistics = new PatientAppointmentStatsDto
                {
                    TotalAppointments = patient.Appointments.Count,
                    UpcomingAppointments = patient.Appointments.Count(a => a.AppointmentDate >= now.Date && a.Status != "Cancelled"),
                    CompletedAppointments = patient.Appointments.Count(a => a.Status == "Completed"),
                    CancelledAppointments = patient.Appointments.Count(a => a.Status == "Cancelled")
                },
                Appointments = patient.Appointments.OrderByDescending(a => a.AppointmentDate).Select(a => new AppointmentDto
                {
                    Id = a.Id,
                    AppointmentNumber = a.AppointmentNumber,
                    PatientId = a.PatientId,
                    PatientName = patient.User?.FullName ?? string.Empty,
                    PatientPhone = patient.User?.PhoneNumber ?? string.Empty,
                    DoctorId = a.DoctorId,
                    DoctorName = a.Doctor?.User?.FullName ?? string.Empty,
                    SpecializationName = a.Doctor?.Specialization?.Name ?? string.Empty,
                    Clinic = a.Doctor?.Clinic ?? string.Empty,
                    SlotId = a.SlotId,
                    AppointmentDate = a.AppointmentDate,
                    StartTime = a.StartTime,
                    EndTime = a.EndTime,
                    Status = a.Status,
                    Notes = a.Notes,
                    ReasonForVisit = a.ReasonForVisit,
                    CreatedAt = a.CreatedAt
                }).ToList()
            };

            return ServiceResponse<PatientDetailDto>.Ok(detail);
        }

        public async Task<ServiceResponse<PatientDto>> UpdatePatientAsync(int id, UpdatePatientDto dto, int? currentUserId, bool isAdmin)
        {
            var patient = await _context.Patients
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.Id == id || p.UserId == id);

            if (patient == null)
            {
                return ServiceResponse<PatientDto>.Fail("المريض غير موجود", 404);
            }

            if (!isAdmin && currentUserId != patient.UserId)
            {
                return ServiceResponse<PatientDto>.Fail("غير مصرح لك بتعديل بيانات هذا المريض", 403);
            }

            if (dto.DateOfBirth.HasValue)
            {
                patient.DateOfBirth = dto.DateOfBirth.Value;
            }

            if (!string.IsNullOrWhiteSpace(dto.ProfileImageUrl))
            {
                patient.ProfileImageUrl = dto.ProfileImageUrl;
            }

            if (patient.User != null)
            {
                if (!string.IsNullOrWhiteSpace(dto.FullName))
                {
                    patient.User.FullName = dto.FullName.Trim();
                }

                if (!string.IsNullOrWhiteSpace(dto.PhoneNumber))
                {
                    var phoneExists = await _context.Users.AnyAsync(u => u.Id != patient.UserId && u.PhoneNumber == dto.PhoneNumber.Trim());
                    if (phoneExists)
                    {
                        return ServiceResponse<PatientDto>.Fail("رقم الهاتف مسجل بالفعل لمستخدم آخر", 400);
                    }
                    patient.User.PhoneNumber = dto.PhoneNumber.Trim();
                }

                if (!string.IsNullOrWhiteSpace(dto.Email))
                {
                    var emailExists = await _context.Users.AnyAsync(u => u.Id != patient.UserId && u.Email.ToLower() == dto.Email.Trim().ToLower());
                    if (emailExists)
                    {
                        return ServiceResponse<PatientDto>.Fail("البريد الإلكتروني مسجل بالفعل لمستخدم آخر", 400);
                    }
                    patient.User.Email = dto.Email.Trim().ToLower();
                }
            }

            await _context.SaveChangesAsync();

            return ServiceResponse<PatientDto>.Ok(new PatientDto
            {
                Id = patient.Id,
                UserId = patient.UserId,
                FullName = patient.User?.FullName ?? string.Empty,
                Email = patient.User?.Email ?? string.Empty,
                PhoneNumber = patient.User?.PhoneNumber ?? string.Empty,
                DateOfBirth = patient.DateOfBirth,
                ProfileImageUrl = patient.ProfileImageUrl,
                AccountStatus = patient.User?.AccountStatus ?? "Active",
                CreatedAt = patient.CreatedAt
            });
        }

        public async Task<ServiceResponse<object>> DeletePatientAsync(int id)
        {
            var patient = await _context.Patients
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.Id == id || p.UserId == id);

            if (patient == null)
            {
                return ServiceResponse<object>.Fail("المريض غير موجود", 404);
            }

            var appointments = await _context.Appointments.Where(a => a.PatientId == patient.Id).ToListAsync();
            _context.Appointments.RemoveRange(appointments);

            if (patient.User != null)
            {
                _context.Users.Remove(patient.User);
            }
            else
            {
                _context.Patients.Remove(patient);
            }

            await _context.SaveChangesAsync();

            return ServiceResponse<object>.Ok(new { message = "تم حذف المريض بنجاح" });
        }
    }
}
