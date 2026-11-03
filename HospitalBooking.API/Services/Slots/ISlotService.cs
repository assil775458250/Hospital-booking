using HospitalBooking.API.Services.Common;
using HospitalBooking.API.DTOs;

namespace HospitalBooking.API.Services.Slots
{
    public interface ISlotService
    {
        Task<ServiceResponse<DoctorSlotDto>> UpdateSlotAsync(int id, UpdateSlotDto dto);
        Task<ServiceResponse<object>> DeleteSlotAsync(int id);
    }
}
