using Hospital_booking_Project.DTOs;

namespace Hospital_booking_Project.Services.Interfaces
{
    public interface IUserService
    {
        Task<ServiceResponse<UserDto>> GetUserByIdAsync(int id, int? currentUserId, bool isAdmin);
        Task<ServiceResponse<object>> UpdateUserAsync(int id, UpdateUserDto dto, int? currentUserId, bool isAdmin);
        Task<ServiceResponse<object>> ChangePasswordAsync(int id, ChangePasswordDto dto, int? currentUserId, bool isAdmin);
        Task<ServiceResponse<object>> DeleteUserAsync(int id, int? currentUserId);
    }
}
