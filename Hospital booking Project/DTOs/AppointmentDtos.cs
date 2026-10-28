using System.ComponentModel.DataAnnotations;

namespace Hospital_booking_Project.DTOs
{
    public class CreateAppointmentDto
    {
        [Required(ErrorMessage = "معرف الطبيب مطلوب")]
        public int DoctorId { get; set; }

        [Required(ErrorMessage = "معرف الموعد المتاح مطلوب")]
        public int SlotId { get; set; }

        public string? Notes { get; set; }
        public string? ReasonForVisit { get; set; }
    }

    public class AppointmentDto
    {
        public int Id { get; set; }
        public string AppointmentNumber { get; set; } = string.Empty;

        public int PatientId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public string PatientPhone { get; set; } = string.Empty;

        public int DoctorId { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public string SpecializationName { get; set; } = string.Empty;
        public string Clinic { get; set; } = string.Empty;

        public int SlotId { get; set; }
        public DateTime AppointmentDate { get; set; }
        public string StartTime { get; set; } = string.Empty;
        public string EndTime { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public string? ReasonForVisit { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class UpdateAppointmentStatusDto
    {
        [Required(ErrorMessage = "الحالة الجديدة مطلوبة")]
        public string Status { get; set; } = string.Empty; // "Confirmed", "Completed", "Cancelled", "Pending"
    }

    public class MyAppointmentsGroupedDto
    {
        public List<AppointmentDto> Upcoming { get; set; } = new();
        public List<AppointmentDto> Past { get; set; } = new();
        public List<AppointmentDto> Cancelled { get; set; } = new();
    }
}
