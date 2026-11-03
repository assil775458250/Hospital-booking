using HospitalBooking.API.Services.Common;
using HospitalBooking.API.DTOs;

namespace HospitalBooking.API.Services.Users
{
    public interface IUserService
    {
        Task<ServiceResponse<UserDto>> GetUserByIdAsync(int id, int? currentUserId, bool isAdmin);
        Task<ServiceResponse<object>> UpdateUserAsync(int id, UpdateUserDto dto, int? currentUserId, bool isAdmin);
        Task<ServiceResponse<object>> ChangePasswordAsync(int id, ChangePasswordDto dto, int? currentUserId, bool isAdmin);
        Task<ServiceResponse<object>> DeleteUserAsync(int id, int? currentUserId);
    }
}
