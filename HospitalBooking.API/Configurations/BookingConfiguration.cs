using HospitalBooking.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HospitalBooking.API.Configurations
{
    public class BookingConfiguration : IEntityTypeConfiguration<Booking>
    {
        public void Configure(EntityTypeBuilder<Booking> builder)
        {
            builder.ToTable("Bookings");
            builder.HasKey(b => b.BookingId);
            builder.Property(b => b.BookingId).UseIdentityAlwaysColumn();
            builder.Property(b => b.SlotId).IsRequired();
            builder.Property(b => b.PatientId).IsRequired();
            builder.HasIndex(b => b.SlotId);
            builder.HasIndex(b => b.PatientId);
            builder.Property(b => b.Status).HasConversion<string>().HasMaxLength(20).IsRequired();
            builder.Property(b => b.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP").IsRequired();
            builder.HasOne(b => b.Patient).WithMany(p => p.Bookings).HasForeignKey(b => b.PatientId).OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(b => b.AppointmentSlot).WithMany(a => a.Bookings).HasForeignKey(b => b.SlotId).OnDelete(DeleteBehavior.Restrict);
        }
    }
}