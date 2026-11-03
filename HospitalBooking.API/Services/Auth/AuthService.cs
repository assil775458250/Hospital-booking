using HospitalBooking.API.Common.Enums;
using HospitalBooking.API.Data;
using HospitalBooking.API.DTOs;
using HospitalBooking.API.Models;
using HospitalBooking.API.Services.Common;
using HospitalBooking.API.Services.Security;
using Microsoft.EntityFrameworkCore;

namespace HospitalBooking.API.Services.Auth
{
    public class AuthService : IAuthService
    {
        private readonly YusrDbContext _context;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IJwtService _jwtService;

        public AuthService(YusrDbContext context, IPasswordHasher passwordHasher, IJwtService jwtService)
        {
            _context = context;
            _passwordHasher = passwordHasher;
            _jwtService = jwtService;
        }

        public async Task<ServiceResponse<AuthResponseDto>> RegisterAsync(RegisterRequestDto dto)
        {
            var emailNormalized = dto.Email.Trim().ToLower();
            if (await _context.Users.AnyAsync(u => u.Email != null && u.Email.ToLower() == emailNormalized))
            {
                return ServiceResponse<AuthResponseDto>.Fail("البريد الإلكتروني مسجل مسبقاً", 400);
            }

            if (await _context.Users.AnyAsync(u => u.PhoneNumber == dto.PhoneNumber.Trim()))
            {
                return ServiceResponse<AuthResponseDto>.Fail("رقم الهاتف مسجل مسبقاً", 400);
            }

            var user = new User
            {
                FullName = dto.FullName.Trim(),
                Email = emailNormalized,
                PhoneNumber = dto.PhoneNumber.Trim(),
                PasswordHash = _passwordHasher.HashPassword(dto.Password),
                Role = UserRole.Patient,
                IsActive = true,
                CreatedAt = DateTimeOffset.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var token = _jwtService.GenerateToken(user);

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

            return ServiceResponse<AuthResponseDto>.Ok(new AuthResponseDto
            {
                UserId = user.UserId,
                Token = token,
                Message = "تم إنشاء الحساب بنجاح",
                Role = user.Role.ToString(),
                User = userDto
            });
        }

        public async Task<ServiceResponse<object>> LoginAsync(LoginRequestDto dto)
        {
            var identifier = dto.EmailOrPhone.Trim().ToLower();
            var user = await _context.Users
                .FirstOrDefaultAsync(u => (u.Email != null && u.Email.ToLower() == identifier) || u.PhoneNumber == dto.EmailOrPhone.Trim());

            if (user == null || !_passwordHasher.VerifyPassword(dto.Password, user.PasswordHash))
            {
                return ServiceResponse<object>.Fail("البريد الإلكتروني/رقم الهاتف أو كلمة المرور غير صحيحة", 401);
            }

            if (!user.IsActive)
            {
                return ServiceResponse<object>.Fail("حسابك معطل حالياً، يرجى التواصل مع إدارة النظام", 401);
            }

            var token = _jwtService.GenerateToken(user);

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
                token = token,
                userId = user.UserId,
                role = user.Role.ToString(),
                user = userDto,
                accountData = new
                {
                    status = user.IsActive ? "Active" : "Inactive",
                    createdAt = user.CreatedAt
                }
            });
        }

        public async Task<ServiceResponse<object>> GetMeAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return ServiceResponse<object>.Fail("المستخدم غير موجود", 404);
            }

            return ServiceResponse<object>.Ok(new
            {
                id = user.UserId,
                name = user.FullName,
                email = user.Email,
                phone = user.PhoneNumber,
                role = user.Role.ToString(),
                accountStatus = user.IsActive ? "Active" : "Inactive"
            });
        }
    }
}
