using HospitalBooking.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HospitalBooking.API.Data
{
    public class YusrDbContext : DbContext
    {
        public YusrDbContext(DbContextOptions<YusrDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Doctor> Doctors { get; set; } = null!;
        public DbSet<Clinic> Clinics { get; set; } = null!;
        public DbSet<Booking> Bookings { get; set; } = null!;
        public DbSet<AppointmentSlot> AppointmentSlots { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.ApplyConfigurationsFromAssembly(typeof(YusrDbContext).Assembly);
        }
    }
}