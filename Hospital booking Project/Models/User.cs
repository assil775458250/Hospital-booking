namespace Hospital_booking_Project.Models
{
    public class User
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Role { get; set; } = "Patient"; // "Admin", "Doctor", "Patient"
        public string AccountStatus { get; set; } = "Active"; // "Active", "Inactive", "Suspended"
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public PatientProfile? PatientProfile { get; set; }
        public DoctorProfile? DoctorProfile { get; set; }
    }
}
