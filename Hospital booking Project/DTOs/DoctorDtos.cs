using System.ComponentModel.DataAnnotations;

namespace Hospital_booking_Project.DTOs
{
    public class DoctorDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public int SpecializationId { get; set; }
        public string SpecializationName { get; set; } = string.Empty;
        public string Clinic { get; set; } = string.Empty;
        public string Bio { get; set; } = string.Empty;
        public string Experience { get; set; } = string.Empty;
        public double Rating { get; set; }
        public string AvailabilityStatus { get; set; } = string.Empty;
        public string? ProfileImageUrl { get; set; }
        public string AccountStatus { get; set; } = string.Empty;
        public int AppointmentsCount { get; set; }
    }

    public class DoctorDetailDto : DoctorDto
    {
        public List<DoctorSlotDto> ScheduleSlots { get; set; } = new();
    }

    public class CreateDoctorDto
    {
        [Required(ErrorMessage = "الاسم مطلوب")]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "الهاتف مطلوب")]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required(ErrorMessage = "البريد الإلكتروني مطلوب")]
        [EmailAddress(ErrorMessage = "صيغة البريد غير صحيحة")]
        public string Email { get; set; } = string.Empty;

        public string? Password { get; set; } = "Doctor@123";

        [Required(ErrorMessage = "التخصص مطلوب")]
        public int SpecializationId { get; set; }

        public string? Status { get; set; } = "Active";
        public string? Bio { get; set; }
        public string? Clinic { get; set; }
        public string? Experience { get; set; }
        public string? ProfileImageUrl { get; set; }
    }

    public class UpdateDoctorDto
    {
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
        [EmailAddress(ErrorMessage = "صيغة البريد غير صحيحة")]
        public string? Email { get; set; }
        public int? SpecializationId { get; set; }
        public string? Status { get; set; }
        public string? Bio { get; set; }
        public string? Clinic { get; set; }
        public string? Experience { get; set; }
        public string? AvailabilityStatus { get; set; }
        public string? ProfileImageUrl { get; set; }
    }
}
