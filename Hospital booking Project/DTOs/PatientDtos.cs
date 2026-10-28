namespace Hospital_booking_Project.DTOs
{
    public class PatientAppointmentStatsDto
    {
        public int TotalAppointments { get; set; }
        public int UpcomingAppointments { get; set; }
        public int CompletedAppointments { get; set; }
        public int CancelledAppointments { get; set; }
    }

    public class PatientDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public DateTime? DateOfBirth { get; set; }
        public string? ProfileImageUrl { get; set; }
        public string AccountStatus { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public PatientAppointmentStatsDto? Statistics { get; set; }
    }

    public class PatientDetailDto : PatientDto
    {
        public List<AppointmentDto> Appointments { get; set; } = new();
    }

    public class UpdatePatientDto
    {
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Email { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? ProfileImageUrl { get; set; }
    }
}
