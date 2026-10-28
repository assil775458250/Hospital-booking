using System.ComponentModel.DataAnnotations;

namespace Hospital_booking_Project.DTOs
{
    public class DoctorSlotDto
    {
        public int Id { get; set; }
        public int DoctorId { get; set; }
        public DateTime Date { get; set; }
        public string StartTime { get; set; } = string.Empty;
        public string EndTime { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty; // "Available", "Booked", "Unavailable"
    }

    public class CreateDoctorSlotDto
    {
        [Required(ErrorMessage = "التاريخ مطلوب")]
        public DateTime Date { get; set; }

        [Required(ErrorMessage = "وقت البدء مطلوب")]
        public string StartTime { get; set; } = string.Empty;

        [Required(ErrorMessage = "وقت الانتهاء مطلوب")]
        public string EndTime { get; set; } = string.Empty;

        public string? Status { get; set; } = "Available";
    }

    public class UpdateSlotDto
    {
        public DateTime? Date { get; set; }
        public string? StartTime { get; set; }
        public string? EndTime { get; set; }
        public string? Status { get; set; }
    }
}
