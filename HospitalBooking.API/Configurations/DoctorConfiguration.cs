using HospitalBooking.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HospitalBooking.API.Configurations
{
    public class DoctorConfiguration : IEntityTypeConfiguration<Doctor>
    {
        public void Configure(EntityTypeBuilder<Doctor> builder)
        {
            builder.ToTable("Doctors");

            builder.HasKey(d => d.DoctorId);
            builder.Property(d => d.DoctorId).UseIdentityAlwaysColumn();
            builder.HasIndex(d => d.UserId).IsUnique();
            builder.HasIndex(d => d.ClinicId);
            builder.Property(d => d.UserId).IsRequired();
            builder.Property(d => d.ClinicId).IsRequired();
            builder.Property(d => d.Bio).HasColumnType("TEXT");
            builder.Property(d => d.ProfileImage).HasColumnType("TEXT");
            builder.HasOne(d => d.User).WithOne(u => u.Doctor).HasForeignKey<Doctor>(d => d.UserId).OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(d => d.Clinic).WithMany(c => c.Doctors).HasForeignKey(d => d.ClinicId).OnDelete(DeleteBehavior.Restrict);
        }
    }
}