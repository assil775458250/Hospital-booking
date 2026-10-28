using Hospital_booking_Project.Data;
using Hospital_booking_Project.DTOs;
using Hospital_booking_Project.Models;
using Hospital_booking_Project.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Hospital_booking_Project.Services
{
    public class AppointmentService : IAppointmentService
    {
        private readonly AppDbContext _context;

        public AppointmentService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ServiceResponse<object>> BookAppointmentAsync(int? currentUserId, CreateAppointmentDto dto)
        {
            if (currentUserId == null)
            {
                return ServiceResponse<object>.Fail("المستخدم غير مسجل الدخول", 401);
            }

            var patient = await _context.Patients
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.UserId == currentUserId.Value);

            if (patient == null)
            {
                var currentUser = await _context.Users.FindAsync(currentUserId.Value);
                if (currentUser == null)
                {
                    return ServiceResponse<object>.Fail("المستخدم غير موجود", 401);
                }

                patient = new PatientProfile
                {
                    UserId = currentUser.Id,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Patients.Add(patient);
                await _context.SaveChangesAsync();
            }

            var doctor = await _context.Doctors
                .Include(d => d.User)
                .Include(d => d.Specialization)
                .FirstOrDefaultAsync(d => d.Id == dto.DoctorId || d.UserId == dto.DoctorId);

            if (doctor == null)
            {
                return ServiceResponse<object>.Fail("الطبيب المحدد غير موجود", 400);
            }

            var slot = await _context.Slots
                .FirstOrDefaultAsync(s => s.Id == dto.SlotId && s.DoctorId == doctor.Id);

            if (slot == null)
            {
                return ServiceResponse<object>.Fail("الموعد غير موجود أو لا ينتمي لهذا الطبيب", 400);
            }

            if (slot.Status != "Available")
            {
                return ServiceResponse<object>.Fail("هذا الموعد غير متاح للحجز", 400);
            }

            var aptNumber = $"APT-{DateTime.UtcNow:yyMMdd}-{new Random().Next(1000, 9999)}";

            var appointment = new Appointment
            {
                AppointmentNumber = aptNumber,
                PatientId = patient.Id,
                DoctorId = doctor.Id,
                SlotId = slot.Id,
                AppointmentDate = slot.Date,
                StartTime = slot.StartTime,
                EndTime = slot.EndTime,
                Status = "Pending",
                Notes = dto.Notes,
                ReasonForVisit = dto.ReasonForVisit,
                CreatedAt = DateTime.UtcNow
            };

            slot.Status = "Booked";

            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();

            return ServiceResponse<object>.Ok(new
            {
                message = "تم حجز الموعد بنجاح",
                appointmentId = appointment.Id,
                appointmentNumber = appointment.AppointmentNumber,
                doctorName = doctor.User?.FullName ?? string.Empty,
                specialization = doctor.Specialization?.Name ?? string.Empty,
                date = appointment.AppointmentDate,
                startTime = appointment.StartTime,
                endTime = appointment.EndTime,
                status = appointment.Status
            });
        }

        public async Task<ServiceResponse<AppointmentDto>> GetAppointmentByIdAsync(int id, int? currentUserId, bool isAdmin)
        {
            var appointment = await _context.Appointments
                .Include(a => a.Patient)
                    .ThenInclude(p => p!.User)
                .Include(a => a.Doctor)
                    .ThenInclude(d => d!.User)
                .Include(a => a.Doctor)
                    .ThenInclude(d => d!.Specialization)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (appointment == null)
            {
                return ServiceResponse<AppointmentDto>.Fail("الحجز غير موجود", 404);
            }

            if (!isAdmin &&
                appointment.Patient?.UserId != currentUserId &&
                appointment.Doctor?.UserId != currentUserId)
            {
                return ServiceResponse<AppointmentDto>.Fail("غير مصرح لك بالاطلاع على هذا الحجز", 403);
            }

            var result = new AppointmentDto
            {
                Id = appointment.Id,
                AppointmentNumber = appointment.AppointmentNumber,
                PatientId = appointment.PatientId,
                PatientName = appointment.Patient?.User?.FullName ?? string.Empty,
                PatientPhone = appointment.Patient?.User?.PhoneNumber ?? string.Empty,
                DoctorId = appointment.DoctorId,
                DoctorName = appointment.Doctor?.User?.FullName ?? string.Empty,
                SpecializationName = appointment.Doctor?.Specialization?.Name ?? string.Empty,
                Clinic = appointment.Doctor?.Clinic ?? string.Empty,
                SlotId = appointment.SlotId,
                AppointmentDate = appointment.AppointmentDate,
                StartTime = appointment.StartTime,
                EndTime = appointment.EndTime,
                Status = appointment.Status,
                Notes = appointment.Notes,
                ReasonForVisit = appointment.ReasonForVisit,
                CreatedAt = appointment.CreatedAt
            };

            return ServiceResponse<AppointmentDto>.Ok(result);
        }

        public async Task<ServiceResponse<object>> GetMyAppointmentsAsync(int? currentUserId, string? currentUserRole, string? status)
        {
            if (currentUserId == null)
            {
                return ServiceResponse<object>.Fail("المستخدم غير مسجل الدخول", 401);
            }

            var query = _context.Appointments
                .Include(a => a.Patient)
                    .ThenInclude(p => p!.User)
                .Include(a => a.Doctor)
                    .ThenInclude(d => d!.User)
                .Include(a => a.Doctor)
                    .ThenInclude(d => d!.Specialization)
                .AsQueryable();

            if (currentUserRole == "Doctor")
            {
                var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == currentUserId.Value);
                if (doctor == null)
                {
                    return ServiceResponse<object>.Ok(new MyAppointmentsGroupedDto());
                }
                query = query.Where(a => a.DoctorId == doctor.Id);
            }
            else
            {
                var patient = await _context.Patients.FirstOrDefaultAsync(p => p.UserId == currentUserId.Value);
                if (patient == null)
                {
                    return ServiceResponse<object>.Ok(new MyAppointmentsGroupedDto());
                }
                query = query.Where(a => a.PatientId == patient.Id);
            }

            var appointments = await query.ToListAsync();
            var now = DateTime.UtcNow.Date;

            var dtoList = appointments.Select(a => new AppointmentDto
            {
                Id = a.Id,
                AppointmentNumber = a.AppointmentNumber,
                PatientId = a.PatientId,
                PatientName = a.Patient?.User?.FullName ?? string.Empty,
                PatientPhone = a.Patient?.User?.PhoneNumber ?? string.Empty,
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
            }).ToList();

            if (!string.IsNullOrWhiteSpace(status))
            {
                var filtered = dtoList.Where(a => a.Status.Equals(status.Trim(), StringComparison.OrdinalIgnoreCase)).ToList();
                return ServiceResponse<object>.Ok(filtered);
            }

            var grouped = new MyAppointmentsGroupedDto
            {
                Upcoming = dtoList.Where(a => a.AppointmentDate.Date >= now && a.Status != "Cancelled" && a.Status != "Completed").ToList(),
                Past = dtoList.Where(a => a.AppointmentDate.Date < now || a.Status == "Completed").ToList(),
                Cancelled = dtoList.Where(a => a.Status == "Cancelled").ToList()
            };

            return ServiceResponse<object>.Ok(grouped);
        }

        public async Task<ServiceResponse<AppointmentDto>> UpdateAppointmentStatusAsync(int id, UpdateAppointmentStatusDto dto, int? currentUserId, string? currentUserRole)
        {
            var appointment = await _context.Appointments
                .Include(a => a.Patient)
                    .ThenInclude(p => p!.User)
                .Include(a => a.Doctor)
                    .ThenInclude(d => d!.User)
                .Include(a => a.Doctor)
                    .ThenInclude(d => d!.Specialization)
                .Include(a => a.Slot)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (appointment == null)
            {
                return ServiceResponse<AppointmentDto>.Fail("الحجز غير موجود", 404);
            }

            if (currentUserRole == "Doctor" && appointment.Doctor?.UserId != currentUserId)
            {
                return ServiceResponse<AppointmentDto>.Fail("غير مصرح لك بتغيير حالة هذا الحجز", 403);
            }

            appointment.Status = dto.Status.Trim();

            if (appointment.Status == "Cancelled" && appointment.Slot != null)
            {
                appointment.Slot.Status = "Available";
            }

            await _context.SaveChangesAsync();

            return ServiceResponse<AppointmentDto>.Ok(new AppointmentDto
            {
                Id = appointment.Id,
                AppointmentNumber = appointment.AppointmentNumber,
                PatientId = appointment.PatientId,
                PatientName = appointment.Patient?.User?.FullName ?? string.Empty,
                PatientPhone = appointment.Patient?.User?.PhoneNumber ?? string.Empty,
                DoctorId = appointment.DoctorId,
                DoctorName = appointment.Doctor?.User?.FullName ?? string.Empty,
                SpecializationName = appointment.Doctor?.Specialization?.Name ?? string.Empty,
                Clinic = appointment.Doctor?.Clinic ?? string.Empty,
                SlotId = appointment.SlotId,
                AppointmentDate = appointment.AppointmentDate,
                StartTime = appointment.StartTime,
                EndTime = appointment.EndTime,
                Status = appointment.Status,
                Notes = appointment.Notes,
                ReasonForVisit = appointment.ReasonForVisit,
                CreatedAt = appointment.CreatedAt
            });
        }

        public async Task<ServiceResponse<object>> CancelAppointmentAsync(int id, int? currentUserId, bool isAdmin)
        {
            var appointment = await _context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor)
                .Include(a => a.Slot)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (appointment == null)
            {
                return ServiceResponse<object>.Fail("الحجز غير موجود", 404);
            }

            if (!isAdmin &&
                appointment.Patient?.UserId != currentUserId &&
                appointment.Doctor?.UserId != currentUserId)
            {
                return ServiceResponse<object>.Fail("غير مصرح لك بإلغاء هذا الحجز", 403);
            }

            appointment.Status = "Cancelled";
            if (appointment.Slot != null)
            {
                appointment.Slot.Status = "Available";
            }

            await _context.SaveChangesAsync();

            return ServiceResponse<object>.Ok(new
            {
                message = "تم إلغاء الحجز بنجاح",
                appointmentId = appointment.Id,
                status = appointment.Status
            });
        }
    }
}
