using System.Text.Json.Serialization;

namespace HospitalBooking.API.Models
{
    public class Clinic
    {
        public int ClinicId { get; set; }
        public string ClinicName { get; set; } = null!;
        public string Specialty { get; set; } = null!;
        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTimeOffset CreatedAt { get; set; }

        public ICollection<Doctor> Doctors { get; set; } = new List<Doctor>();
    }
}