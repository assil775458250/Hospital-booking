using System.Text.Json.Serialization;

namespace Hospital_booking_Project.Models
{
    public class DoctorProfile
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }

        public int SpecializationId { get; set; }
        public Specialization? Specialization { get; set; }

        public string Clinic { get; set; } = string.Empty;
        public string Bio { get; set; } = string.Empty;
        public string Experience { get; set; } = string.Empty;
        public double Rating { get; set; } = 4.8;
        public string AvailabilityStatus { get; set; } = "Available"; // "Available", "Unavailable"
        public string? ProfileImageUrl { get; set; }

        [JsonIgnore]
        public List<DoctorSlot> Slots { get; set; } = new();

        [JsonIgnore]
        public List<Appointment> Appointments { get; set; } = new();
    }
}
