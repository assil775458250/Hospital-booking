using HospitalBooking.API.Common.Enums;
using HospitalBooking.API.Models;
using HospitalBooking.API.Services.Security;

namespace HospitalBooking.API.Data
{
    public static class DbInitializer
    {
        public static void Initialize(YusrDbContext context, IPasswordHasher passwordHasher)
        {
            context.Database.EnsureCreated();

            if (context.Users.Any())
            {
                return; // DB already seeded
            }

            // 1. Seed Admin
            var adminUser = new User
            {
                FullName = "مدير النظام",
                Email = "admin@hospital.com",
                PhoneNumber = "0500000000",
                PasswordHash = passwordHasher.HashPassword("Admin@123"),
                Role = UserRole.Admin,
                IsActive = true,
                CreatedAt = DateTimeOffset.UtcNow
            };
            context.Users.Add(adminUser);

            // 2. Seed Clinics
            var specCardio = new Clinic { ClinicName = "عيادة القلب", Specialty = "أمراض القلب والأوعية الدموية", Description = "تشخيص وعلاج أمراض القلب والأوعية الدموية", IsActive = true, CreatedAt = DateTimeOffset.UtcNow };
            var specPediatric = new Clinic { ClinicName = "عيادة الأطفال", Specialty = "طب الأطفال", Description = "رعاية صحية شاملة للأطفال وحديثي الولادة", IsActive = true, CreatedAt = DateTimeOffset.UtcNow };
            var specDerma = new Clinic { ClinicName = "عيادة الجلدية", Specialty = "طب الجلدية والتجميل", Description = "علاج الأمراض الجلدية والعناية بالبشرة", IsActive = true, CreatedAt = DateTimeOffset.UtcNow };
            var specOrtho = new Clinic { ClinicName = "عيادة العظام", Specialty = "طب وجراحة العظام", Description = "علاج إصابات العظام والمفاصل والعمود الفقري", IsActive = true, CreatedAt = DateTimeOffset.UtcNow };
            var specDental = new Clinic { ClinicName = "عيادة الأسنان", Specialty = "طب وجراحة الفم والأسنان", Description = "صحة الفم والأسنان وتقويم وزراعة الأسنان", IsActive = true, CreatedAt = DateTimeOffset.UtcNow };

            context.Clinics.AddRange(specCardio, specPediatric, specDerma, specOrtho, specDental);
            context.SaveChanges();

            // 3. Seed Doctor User
            var doctorUser = new User
            {
                FullName = "د. أحمد عبدالله",
                Email = "doctor@hospital.com",
                PhoneNumber = "0501111111",
                PasswordHash = passwordHasher.HashPassword("Doctor@123"),
                Role = UserRole.Doctor,
                IsActive = true,
                CreatedAt = DateTimeOffset.UtcNow
            };
            context.Users.Add(doctorUser);
            context.SaveChanges();

            var doctor = new Doctor
            {
                UserId = doctorUser.UserId,
                ClinicId = specCardio.ClinicId,
                Bio = "استشاري أمراض القلب والقسطرة التداخلية، حاصل على البورد الأمريكي وخبرة واسعة في تشخيص وعلاج أمراض القلب.",
                ProfileImage = "/images/doctors/dr-ahmed.png"
            };
            context.Doctors.Add(doctor);
            context.SaveChanges();

            // 4. Seed Appointment Slots (Tomorrow)
            var tomorrow = DateTimeOffset.UtcNow.Date.AddDays(1);
            var slot1 = new AppointmentSlot { DoctorId = doctor.DoctorId, StartDateTime = tomorrow.AddHours(9), EndDateTime = tomorrow.AddHours(9).AddMinutes(30), IsCancelled = false, CreatedAt = DateTimeOffset.UtcNow };
            var slot2 = new AppointmentSlot { DoctorId = doctor.DoctorId, StartDateTime = tomorrow.AddHours(9).AddMinutes(30), EndDateTime = tomorrow.AddHours(10), IsCancelled = false, CreatedAt = DateTimeOffset.UtcNow };
            var slot3 = new AppointmentSlot { DoctorId = doctor.DoctorId, StartDateTime = tomorrow.AddHours(10), EndDateTime = tomorrow.AddHours(10).AddMinutes(30), IsCancelled = false, CreatedAt = DateTimeOffset.UtcNow };
            var slot4 = new AppointmentSlot { DoctorId = doctor.DoctorId, StartDateTime = tomorrow.AddHours(10).AddMinutes(30), EndDateTime = tomorrow.AddHours(11), IsCancelled = false, CreatedAt = DateTimeOffset.UtcNow };
            var slot5 = new AppointmentSlot { DoctorId = doctor.DoctorId, StartDateTime = tomorrow.AddHours(11), EndDateTime = tomorrow.AddHours(11).AddMinutes(30), IsCancelled = false, CreatedAt = DateTimeOffset.UtcNow };

            context.AppointmentSlots.AddRange(slot1, slot2, slot3, slot4, slot5);
            context.SaveChanges();

            // 5. Seed Patient User
            var patientUser = new User
            {
                FullName = "محمد علي",
                Email = "patient@hospital.com",
                PhoneNumber = "0502222222",
                PasswordHash = passwordHasher.HashPassword("Patient@123"),
                Role = UserRole.Patient,
                IsActive = true,
                CreatedAt = DateTimeOffset.UtcNow
            };
            context.Users.Add(patientUser);
            context.SaveChanges();

            // 6. Seed a Booking for slot3
            var booking = new Booking
            {
                PatientId = patientUser.UserId,
                SlotId = slot3.SlotId,
                Status = BookingStatus.Approved,
                CreatedAt = DateTimeOffset.UtcNow
            };
            context.Bookings.Add(booking);
            context.SaveChanges();
        }
    }
}
