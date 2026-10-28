using System.Text.Json.Serialization;

namespace Hospital_booking_Project.Models
{
    public class PatientProfile
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }

        public DateTime? DateOfBirth { get; set; }
        public string? ProfileImageUrl { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [JsonIgnore]
        public List<Appointment> Appointments { get; set; } = new();
    }
}
