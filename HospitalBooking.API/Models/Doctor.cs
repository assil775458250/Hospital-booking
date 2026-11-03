namespace HospitalBooking.API.Models
{
    public class Doctor
    {
        public int DoctorId { get; set; }
        public string? ProfileImage { get; set; }
        public string? Bio { get; set; }

        public int UserId { get; set; }
        public int ClinicId { get; set; }

        public User User { get; set; } = null!;
        public Clinic Clinic { get; set; } = null!;

        public ICollection<AppointmentSlot> AppointmentSlots { get; set; } = new List<AppointmentSlot>();
    }
}