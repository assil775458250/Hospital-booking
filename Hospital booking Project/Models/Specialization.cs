using System.Text.Json.Serialization;

namespace Hospital_booking_Project.Models
{
    public class Specialization
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Icon { get; set; }
        public string? Description { get; set; }
        public string Status { get; set; } = "Active"; // "Active", "Inactive"

        [JsonIgnore]
        public List<DoctorProfile> Doctors { get; set; } = new();
    }
}
