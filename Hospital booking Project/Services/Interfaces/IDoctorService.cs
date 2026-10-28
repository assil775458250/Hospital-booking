using Hospital_booking_Project.DTOs;

namespace Hospital_booking_Project.Services.Interfaces
{
    public interface IDoctorService
    {
        Task<ServiceResponse<List<DoctorDto>>> GetDoctorsAsync(int? specializationId, string? search);
        Task<ServiceResponse<DoctorDetailDto>> GetDoctorByIdAsync(int id);
        Task<ServiceResponse<object>> CreateDoctorAsync(CreateDoctorDto dto);
        Task<ServiceResponse<DoctorDto>> UpdateDoctorAsync(int id, UpdateDoctorDto dto);
        Task<ServiceResponse<object>> DeleteDoctorAsync(int id);
        Task<ServiceResponse<List<DoctorSlotDto>>> GetDoctorSlotsAsync(int doctorId, DateTime? date);
        Task<ServiceResponse<object>> CreateDoctorSlotAsync(int doctorId, CreateDoctorSlotDto dto);
        Task<ServiceResponse<List<AppointmentDto>>> GetDoctorAppointmentsAsync(int doctorId, string? period, string? status, int? currentUserId, string? currentUserRole);
    }
}
