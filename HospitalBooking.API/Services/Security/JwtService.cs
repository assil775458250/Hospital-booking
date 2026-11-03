using HospitalBooking.API.Models;

namespace HospitalBooking.API.Services.Security
{
    public class JwtService : IJwtService
    {
        public string GenerateToken(User user)
        {
            // تم تعطيل حزمة JWT مؤقتاً لحل مشاكل البناء.
            // يُرجع رمزاً بديلاً (Mock Token) لتشغيل النظام بدون أخطاء.
            return $"token_user_{user.UserId}_{Guid.NewGuid():N}";
        }
    }
}
