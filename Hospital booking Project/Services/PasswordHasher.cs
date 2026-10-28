using System.Security.Cryptography;
using System.Text;
using Hospital_booking_Project.Services.Interfaces;

namespace Hospital_booking_Project.Services
{
    public class PasswordHasher : IPasswordHasher
    {
        public string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }

        public bool VerifyPassword(string password, string passwordHash)
        {
            var hashOfInput = HashPassword(password);
            return string.Equals(hashOfInput, passwordHash, StringComparison.Ordinal);
        }
    }
}
