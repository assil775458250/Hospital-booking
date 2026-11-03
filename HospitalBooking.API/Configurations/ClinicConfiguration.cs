using HospitalBooking.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HospitalBooking.API.Configurations
{
    public class ClinicConfiguration : IEntityTypeConfiguration<Clinic>
    {
        public void Configure(EntityTypeBuilder<Clinic> builder)
        {
            builder.ToTable("Clinics");
            builder.HasKey(c => c.ClinicId);
            builder.Property(c => c.ClinicId).UseIdentityAlwaysColumn();
            builder.Property(c => c.ClinicName).HasMaxLength(150).IsRequired();
            builder.Property(c => c.Specialty).HasMaxLength(100).IsRequired();
            builder.Property(c => c.Description).HasColumnType("TEXT");
            builder.Property(c => c.IsActive).HasDefaultValue(true).IsRequired();
            builder.Property(c => c.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP").IsRequired();
        }
    }
}