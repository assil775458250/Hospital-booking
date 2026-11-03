using HospitalBooking.API.Data;
using HospitalBooking.API.DTOs;
using HospitalBooking.API.Services.Common;
using HospitalBooking.API.Services.Security;
using Microsoft.EntityFrameworkCore;

namespace HospitalBooking.API.Services.Users
{
    public class UserService : IUserService
    {
        private readonly YusrDbContext _context;
        private readonly IPasswordHasher _passwordHasher;

        public UserService(YusrDbContext context, IPasswordHasher passwordHasher)
        {
            _context = context;
            _passwordHasher = passwordHasher;
        }

        public async Task<ServiceResponse<UserDto>> GetUserByIdAsync(int id, int? currentUserId, bool isAdmin)
        {
            if (!isAdmin && currentUserId != id)
            {
                return ServiceResponse<UserDto>.Fail("غير مصرح لك بالوصول إلى هذا الحساب", 403);
            }

            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return ServiceResponse<UserDto>.Fail("المستخدم غير موجود", 404);
            }

            return ServiceResponse<UserDto>.Ok(new UserDto
            {
                Id = user.UserId,
                FullName = user.FullName,
                Email = user.Email ?? string.Empty,
                PhoneNumber = user.PhoneNumber ?? string.Empty,
                Role = user.Role.ToString(),
                AccountStatus = user.IsActive ? "Active" : "Inactive",
                CreatedAt = user.CreatedAt
            });
        }

        public async Task<ServiceResponse<object>> UpdateUserAsync(int id, UpdateUserDto dto, int? currentUserId, bool isAdmin)
        {
            if (!isAdmin && currentUserId != id)
            {
                return ServiceResponse<object>.Fail("غير مصرح لك بتعديل هذا الحساب", 403);
            }

            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return ServiceResponse<object>.Fail("المستخدم غير موجود", 404);
            }

            if (!string.IsNullOrWhiteSpace(dto.Email) && dto.Email.Trim().ToLower() != (user.Email ?? string.Empty).ToLower())
            {
                var emailExists = await _context.Users.AnyAsync(u => u.UserId != id && u.Email != null && u.Email.ToLower() == dto.Email.Trim().ToLower());
                if (emailExists)
                {
                    return ServiceResponse<object>.Fail("البريد الإلكتروني مسجل بالفعل لمستخدم آخر", 400);
                }
                user.Email = dto.Email.Trim().ToLower();
            }

            if (!string.IsNullOrWhiteSpace(dto.PhoneNumber) && dto.PhoneNumber.Trim() != user.PhoneNumber)
            {
                var phoneExists = await _context.Users.AnyAsync(u => u.UserId != id && u.PhoneNumber == dto.PhoneNumber.Trim());
                if (phoneExists)
                {
                    return ServiceResponse<object>.Fail("رقم الهاتف مسجل بالفعل لمستخدم آخر", 400);
                }
                user.PhoneNumber = dto.PhoneNumber.Trim();
            }

            if (!string.IsNullOrWhiteSpace(dto.FullName))
            {
                user.FullName = dto.FullName.Trim();
            }

            await _context.SaveChangesAsync();

            var userDto = new UserDto
            {
                Id = user.UserId,
                FullName = user.FullName,
                Email = user.Email ?? string.Empty,
                PhoneNumber = user.PhoneNumber ?? string.Empty,
                Role = user.Role.ToString(),
                AccountStatus = user.IsActive ? "Active" : "Inactive",
                CreatedAt = user.CreatedAt
            };

            return ServiceResponse<object>.Ok(new
            {
                message = "تم تعديل بيانات المستخدم بنجاح",
                user = userDto
            });
        }

        public async Task<ServiceResponse<object>> ChangePasswordAsync(int id, ChangePasswordDto dto, int? currentUserId, bool isAdmin)
        {
            if (!isAdmin && currentUserId != id)
            {
                return ServiceResponse<object>.Fail("غير مصرح لك بتغيير كلمة المرور لهذا الحساب", 403);
            }

            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return ServiceResponse<object>.Fail("المستخدم غير موجود", 404);
            }

            if (!isAdmin || currentUserId == id)
            {
                if (!_passwordHasher.VerifyPassword(dto.CurrentPassword, user.PasswordHash))
                {
                    return ServiceResponse<object>.Fail("كلمة المرور الحالية غير صحيحة", 400);
                }
            }

            user.PasswordHash = _passwordHasher.HashPassword(dto.NewPassword);
            await _context.SaveChangesAsync();

            return ServiceResponse<object>.Ok(new { message = "تم تغيير كلمة المرور بنجاح" });
        }

        public async Task<ServiceResponse<object>> DeleteUserAsync(int id, int? currentUserId)
        {
            var user = await _context.Users
                .Include(u => u.Doctor)
                .Include(u => u.Bookings)
                .FirstOrDefaultAsync(u => u.UserId == id);

            if (user == null)
            {
                return ServiceResponse<object>.Fail("المستخدم غير موجود", 404);
            }

            if (user.UserId == currentUserId)
            {
                return ServiceResponse<object>.Fail("لا يمكن للمدير حذف حسابه الخاص", 400);
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return ServiceResponse<object>.Ok(new { message = "تم حذف المستخدم بنجاح" });
        }
    }
}
