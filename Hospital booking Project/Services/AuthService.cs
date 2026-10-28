using Hospital_booking_Project.Data;
using Hospital_booking_Project.DTOs;
using Hospital_booking_Project.Models;
using Hospital_booking_Project.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Hospital_booking_Project.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IJwtService _jwtService;

        public AuthService(AppDbContext context, IPasswordHasher passwordHasher, IJwtService jwtService)
        {
            _context = context;
            _passwordHasher = passwordHasher;
            _jwtService = jwtService;
        }

        public async Task<ServiceResponse<AuthResponseDto>> RegisterAsync(RegisterRequestDto dto)
        {
            var emailNormalized = dto.Email.Trim().ToLower();
            if (await _context.Users.AnyAsync(u => u.Email.ToLower() == emailNormalized))
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
                Role = "Patient",
                AccountStatus = "Active",
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var patientProfile = new PatientProfile
            {
                UserId = user.Id,
                CreatedAt = DateTime.UtcNow
            };
            _context.Patients.Add(patientProfile);
            await _context.SaveChangesAsync();

            var token = _jwtService.GenerateToken(user);

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

            return ServiceResponse<AuthResponseDto>.Ok(new AuthResponseDto
            {
                UserId = user.Id,
                Token = token,
                Message = "تم إنشاء الحساب بنجاح",
                Role = user.Role,
                User = userDto
            });
        }

        public async Task<ServiceResponse<object>> LoginAsync(LoginRequestDto dto)
        {
            var identifier = dto.EmailOrPhone.Trim();
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email.ToLower() == identifier.ToLower() || u.PhoneNumber == identifier);

            if (user == null || !_passwordHasher.VerifyPassword(dto.Password, user.PasswordHash))
            {
                return ServiceResponse<object>.Fail("البريد الإلكتروني/رقم الهاتف أو كلمة المرور غير صحيحة", 401);
            }

            if (user.AccountStatus == "Suspended" || user.AccountStatus == "Inactive")
            {
                return ServiceResponse<object>.Fail("حسابك معطل حالياً، يرجى التواصل مع إدارة النظام", 401);
            }

            var token = _jwtService.GenerateToken(user);

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
                token = token,
                userId = user.Id,
                role = user.Role,
                user = userDto,
                accountData = new
                {
                    status = user.AccountStatus,
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
                id = user.Id,
                name = user.FullName,
                email = user.Email,
                phone = user.PhoneNumber,
                role = user.Role,
                accountStatus = user.AccountStatus
            });
        }
    }
}
