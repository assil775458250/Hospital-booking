using System.Text.Json.Serialization;

namespace Hospital_booking_Project.Models
{
    public class DoctorSlot
    {
        public int Id { get; set; }
        public int DoctorId { get; set; }
        public DoctorProfile? Doctor { get; set; }

        public DateTime Date { get; set; }
        public string StartTime { get; set; } = string.Empty; // e.g. "09:00"
        public string EndTime { get; set; } = string.Empty;   // e.g. "09:30"
        public string Status { get; set; } = "Available";    // "Available", "Unavailable", "Booked"

        [JsonIgnore]
        public Appointment? Appointment { get; set; }
    }
}
