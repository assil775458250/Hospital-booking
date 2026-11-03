using HospitalBooking.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HospitalBooking.API.Configurations
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.ToTable("Users");

            builder.HasKey(u => u.UserId);
            builder.Property(u => u.UserId).UseIdentityAlwaysColumn();
            builder.Property(u => u.FullName).HasMaxLength(150).IsRequired();
            builder.Property(u => u.PhoneNumber).HasMaxLength(20);
            builder.HasIndex(u => u.PhoneNumber).IsUnique();
            builder.Property(u => u.Email).HasMaxLength(255);
            builder.HasIndex(u => u.Email).IsUnique();
            builder.Property(u => u.PasswordHash).HasColumnType("TEXT").IsRequired();
            builder.Property(u => u.Role).HasConversion<string>().HasMaxLength(20).IsRequired();
            builder.Property(u => u.IsActive).HasDefaultValue(true).IsRequired();
            builder.Property(u => u.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP").IsRequired();
        }
    }
}