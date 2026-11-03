using HospitalBooking.API.Models;

namespace HospitalBooking.API.Services.Security
{
    public interface IJwtService
    {
        string GenerateToken(User user);
    }
}
