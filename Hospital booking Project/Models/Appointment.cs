namespace Hospital_booking_Project.Models
{
    public class Appointment
    {
        public int Id { get; set; }
        public string AppointmentNumber { get; set; } = string.Empty; // e.g. "APT-1001"

        public int PatientId { get; set; }
        public PatientProfile? Patient { get; set; }

        public int DoctorId { get; set; }
        public DoctorProfile? Doctor { get; set; }

        public int SlotId { get; set; }
        public DoctorSlot? Slot { get; set; }

        public DateTime AppointmentDate { get; set; }
        public string StartTime { get; set; } = string.Empty;
        public string EndTime { get; set; } = string.Empty;

        public string Status { get; set; } = "Pending"; // "Pending", "Confirmed", "Completed", "Cancelled"
        public string? Notes { get; set; }
        public string? ReasonForVisit { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
