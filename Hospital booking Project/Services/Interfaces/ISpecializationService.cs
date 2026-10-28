using Hospital_booking_Project.DTOs;

namespace Hospital_booking_Project.Services.Interfaces
{
    public interface ISpecializationService
    {
        Task<ServiceResponse<List<SpecializationDto>>> GetSpecializationsAsync();
        Task<ServiceResponse<SpecializationDto>> GetSpecializationByIdAsync(int id);
        Task<ServiceResponse<object>> CreateSpecializationAsync(CreateSpecializationDto dto);
        Task<ServiceResponse<SpecializationDto>> UpdateSpecializationAsync(int id, UpdateSpecializationDto dto);
        Task<ServiceResponse<object>> DeleteSpecializationAsync(int id);
    }
}
