using HospitalBooking.API.DTOs;
using HospitalBooking.API.Services.Common;

namespace HospitalBooking.API.Services.Auth
{
    public interface IAuthService
    {
        Task<ServiceResponse<AuthResponseDto>> RegisterAsync(RegisterRequestDto dto);
        Task<ServiceResponse<object>> LoginAsync(LoginRequestDto dto);
        Task<ServiceResponse<object>> GetMeAsync(int userId);
    }
}
