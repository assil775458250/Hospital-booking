using Hospital_booking_Project.DTOs;

namespace Hospital_booking_Project.Services.Interfaces
{
    public interface IAuthService
    {
        Task<ServiceResponse<AuthResponseDto>> RegisterAsync(RegisterRequestDto dto);
        Task<ServiceResponse<object>> LoginAsync(LoginRequestDto dto);
        Task<ServiceResponse<object>> GetMeAsync(int userId);
    }
}
