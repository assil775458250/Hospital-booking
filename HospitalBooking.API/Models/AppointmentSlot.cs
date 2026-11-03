namespace HospitalBooking.API.Models
{
    public class AppointmentSlot
    {
        public int SlotId { get; set; }
        public DateTimeOffset StartDateTime { get; set; }
        public DateTimeOffset EndDateTime { get; set; }
        public bool IsCancelled { get; set; } = false;
        public DateTimeOffset CreatedAt { get; set; }

        public int DoctorId { get; set; }

        public Doctor Doctor { get; set; } = null!;
        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}