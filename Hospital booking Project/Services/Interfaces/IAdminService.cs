using Hospital_booking_Project.DTOs;

namespace Hospital_booking_Project.Services.Interfaces
{
    public interface IAdminService
    {
        Task<ServiceResponse<AdminDashboardDto>> GetDashboardAsync();
        Task<ServiceResponse<List<UserDto>>> GetUsersAsync(string? role, string? status, string? search);
        Task<ServiceResponse<UserDto>> UpdateUserRoleAsync(int id, UpdateUserRoleDto dto);
        Task<ServiceResponse<List<AppointmentDto>>> GetAppointmentsAsync(int? patientId, int? doctorId, string? status, DateTime? date);
        Task<ServiceResponse<List<DoctorDto>>> GetDoctorsAsync(int? specializationId, string? status, string? search);
        Task<ServiceResponse<List<PatientDto>>> GetPatientsAsync(string? status, string? search);
    }
}
