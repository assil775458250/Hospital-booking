using HospitalBooking.API.Common.Enums;
using System.ComponentModel.DataAnnotations;

namespace HospitalBooking.API.Models
{
    public class User
    {
        public int UserId { get; set; }
        public string FullName { get; set; } = null!;
        public string? PhoneNumber { get; set; }

        [EmailAddress]
        public string? Email { get; set; }

        public string PasswordHash { get; set; } = null!;
        public UserRole Role { get; set; } = UserRole.None;
        public bool IsActive { get; set; } = true;
        public DateTimeOffset CreatedAt { get; set; }

        public Doctor? Doctor { get; set; }
        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}