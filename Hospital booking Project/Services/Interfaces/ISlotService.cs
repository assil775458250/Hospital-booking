using Hospital_booking_Project.DTOs;

namespace Hospital_booking_Project.Services.Interfaces
{
    public interface ISlotService
    {
        Task<ServiceResponse<DoctorSlotDto>> UpdateSlotAsync(int id, UpdateSlotDto dto);
        Task<ServiceResponse<object>> DeleteSlotAsync(int id);
    }
}
