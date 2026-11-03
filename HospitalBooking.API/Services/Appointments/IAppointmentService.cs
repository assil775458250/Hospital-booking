using HospitalBooking.API.Services.Common;
using HospitalBooking.API.DTOs;

namespace HospitalBooking.API.Services.Appointments
{
    public interface IAppointmentService
    {
        Task<ServiceResponse<object>> BookAppointmentAsync(int? currentUserId, CreateAppointmentDto dto);
        Task<ServiceResponse<AppointmentDto>> GetAppointmentByIdAsync(int id, int? currentUserId, bool isAdmin);
        Task<ServiceResponse<object>> GetMyAppointmentsAsync(int? currentUserId, string? currentUserRole, string? status);
        Task<ServiceResponse<AppointmentDto>> UpdateAppointmentStatusAsync(int id, UpdateAppointmentStatusDto dto, int? currentUserId, string? currentUserRole);
        Task<ServiceResponse<object>> CancelAppointmentAsync(int id, int? currentUserId, bool isAdmin);
    }
}
