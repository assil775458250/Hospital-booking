using Hospital_booking_Project.Models;

namespace Hospital_booking_Project.Services.Interfaces
{
    public interface IJwtService
    {
        string GenerateToken(User user);
    }
}
