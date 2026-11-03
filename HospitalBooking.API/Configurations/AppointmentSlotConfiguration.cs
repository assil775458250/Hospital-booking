using HospitalBooking.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HospitalBooking.API.Configurations
{
    public class AppointmentSlotConfiguration : IEntityTypeConfiguration<AppointmentSlot>
    {
        public void Configure(EntityTypeBuilder<AppointmentSlot> builder)
        {
            builder.ToTable("AppointmentSlots");
            builder.HasKey(a => a.SlotId);
            builder.Property(a => a.SlotId).UseIdentityAlwaysColumn();
            builder.HasIndex(a => a.DoctorId);
            builder.Property(a => a.DoctorId).IsRequired();
            builder.Property(a => a.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP").IsRequired();
            builder.Property(a => a.IsCancelled).HasDefaultValue(false).IsRequired();
            builder.Property(a => a.StartDateTime).HasColumnType("TIMESTAMPTZ").IsRequired();
            builder.Property(a => a.EndDateTime).HasColumnType("TIMESTAMPTZ").IsRequired();
            builder.HasOne(a => a.Doctor).WithMany(d => d.AppointmentSlots).HasForeignKey(a => a.DoctorId).OnDelete(DeleteBehavior.Restrict);
            builder.HasMany(a => a.Bookings).WithOne(b => b.AppointmentSlot).HasForeignKey(b => b.SlotId).OnDelete(DeleteBehavior.Restrict);
        }
    }
}