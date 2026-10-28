using Hospital_booking_Project.Data;
using Hospital_booking_Project.DTOs;
using Hospital_booking_Project.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Hospital_booking_Project.Services
{
    public class UserService : IUserService
    {
        private readonly AppDbContext _context;
        private readonly IPasswordHasher _passwordHasher;

        public UserService(AppDbContext context, IPasswordHasher passwordHasher)
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
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Role = user.Role,
                AccountStatus = user.AccountStatus,
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

            if (!string.IsNullOrWhiteSpace(dto.Email) && dto.Email.Trim().ToLower() != user.Email.ToLower())
            {
                var emailExists = await _context.Users.AnyAsync(u => u.Id != id && u.Email.ToLower() == dto.Email.Trim().ToLower());
                if (emailExists)
                {
                    return ServiceResponse<object>.Fail("البريد الإلكتروني مسجل بالفعل لمستخدم آخر", 400);
                }
                user.Email = dto.Email.Trim().ToLower();
            }

            if (!string.IsNullOrWhiteSpace(dto.PhoneNumber) && dto.PhoneNumber.Trim() != user.PhoneNumber)
            {
                var phoneExists = await _context.Users.AnyAsync(u => u.Id != id && u.PhoneNumber == dto.PhoneNumber.Trim());
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
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Role = user.Role,
                AccountStatus = user.AccountStatus,
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
                .Include(u => u.PatientProfile)
                .Include(u => u.DoctorProfile)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return ServiceResponse<object>.Fail("المستخدم غير موجود", 404);
            }

            if (user.Id == currentUserId)
            {
                return ServiceResponse<object>.Fail("لا يمكن للمدير حذف حسابه الخاص", 400);
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return ServiceResponse<object>.Ok(new { message = "تم حذف المستخدم بنجاح" });
        }
    }
}
