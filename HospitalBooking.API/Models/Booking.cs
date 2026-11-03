using HospitalBooking.API.Common.Enums;

namespace HospitalBooking.API.Models
{
    public class Booking
    {
        public int BookingId { get; set; }
        public BookingStatus Status { get; set; } = BookingStatus.Pending;
        public DateTimeOffset CreatedAt { get; set; }

        public int PatientId { get; set; }
        public int SlotId { get; set; }

        public User Patient { get; set; } = null!;
        public AppointmentSlot AppointmentSlot { get; set; } = null!;
    }
}