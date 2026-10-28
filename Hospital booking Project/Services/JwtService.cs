using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Hospital_booking_Project.Models;
using Hospital_booking_Project.Services.Interfaces;
using Microsoft.IdentityModel.Tokens;

namespace Hospital_booking_Project.Services
{
    public class JwtService : IJwtService
    {
        private readonly IConfiguration _configuration;

        public JwtService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string GenerateToken(User user)
        {
            var keyString = _configuration["Jwt:Key"] ?? "HospitalBookingSecretKeyMustBeAtLeast32CharsLong123!";
            var issuer = _configuration["Jwt:Issuer"] ?? "HospitalBookingApp";
            var audience = _configuration["Jwt:Audience"] ?? "HospitalBookingApp";
            var durationMinutes = int.TryParse(_configuration["Jwt:DurationInMinutes"], out var mins) ? mins : 1440; // 24 hours

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("AccountStatus", user.AccountStatus)
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(durationMinutes),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
