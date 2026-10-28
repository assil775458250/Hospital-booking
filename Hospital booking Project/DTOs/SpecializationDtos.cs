using System.ComponentModel.DataAnnotations;

namespace Hospital_booking_Project.DTOs
{
    public class SpecializationDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Icon { get; set; }
        public string? Description { get; set; }
        public string Status { get; set; } = string.Empty;
        public int DoctorsCount { get; set; }
    }

    public class CreateSpecializationDto
    {
        [Required(ErrorMessage = "اسم التخصص مطلوب")]
        public string Name { get; set; } = string.Empty;

        public string? Icon { get; set; }
        public string? Description { get; set; }
        public string? Status { get; set; } = "Active";
    }

    public class UpdateSpecializationDto
    {
        public string? Name { get; set; }
        public string? Icon { get; set; }
        public string? Description { get; set; }
        public string? Status { get; set; }
    }
}
