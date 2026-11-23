using HospitalBooking.API.Services.Common;
using HospitalBooking.API.DTOs;

namespace HospitalBooking.API.Services.Slots
{
    public interface ISlotService
    {
        Task<ServiceResponse<DoctorSlotDto>> UpdateSlotAsync(int id, UpdateSlotDto dto, int? currentUserId = null, string? currentUserRole = null);
        Task<ServiceResponse<object>> DeleteSlotAsync(int id, int? currentUserId = null, string? currentUserRole = null);
    }
}
