using Hospital_booking_Project.Models;
using Hospital_booking_Project.Services.Interfaces;

namespace Hospital_booking_Project.Data
{
    public static class DbInitializer
    {
        public static void Initialize(AppDbContext context, IPasswordHasher passwordHasher)
        {
            context.Database.EnsureCreated();

            if (context.Users.Any())
            {
                return; // DB already seeded
            }

            // Seed Admin
            var adminUser = new User
            {
                FullName = "مدير النظام",
                Email = "admin@hospital.com",
                PhoneNumber = "0500000000",
                PasswordHash = passwordHasher.HashPassword("Admin@123"),
                Role = "Admin",
                AccountStatus = "Active",
                CreatedAt = DateTime.UtcNow
            };
            context.Users.Add(adminUser);

            // Seed Specializations
            var specCardio = new Specialization { Name = "طب القلب والأوعية الدموية", Icon = "heart", Description = "تشخيص وعلاج أمراض القلب والأوعية الدموية", Status = "Active" };
            var specPediatric = new Specialization { Name = "طب الأطفال", Icon = "baby", Description = "رعاية صحية شاملة للأطفال وحديثي الولادة", Status = "Active" };
            var specDerma = new Specialization { Name = "طب الجلدية والتجميل", Icon = "sparkles", Description = "علاج الأمراض الجلدية والعناية بالبشرة", Status = "Active" };
            var specOrtho = new Specialization { Name = "طب وجراحة العظام", Icon = "bone", Description = "علاج إصابات العظام والمفاصل والعمود الفقري", Status = "Active" };
            var specDental = new Specialization { Name = "طب الأسنان", Icon = "smile", Description = "صحة الفم والأسنان وتقويم وزراعة الأسنان", Status = "Active" };

            context.Specializations.AddRange(specCardio, specPediatric, specDerma, specOrtho, specDental);
            context.SaveChanges();

            // Seed Doctor
            var doctorUser = new User
            {
                FullName = "د. أحمد عبدالله",
                Email = "doctor@hospital.com",
                PhoneNumber = "0501111111",
                PasswordHash = passwordHasher.HashPassword("Doctor@123"),
                Role = "Doctor",
                AccountStatus = "Active",
                CreatedAt = DateTime.UtcNow
            };
            context.Users.Add(doctorUser);
            context.SaveChanges();

            var doctorProfile = new DoctorProfile
            {
                UserId = doctorUser.Id,
                SpecializationId = specCardio.Id,
                Clinic = "العيادة التخصصية - مبنى A، الدور الثاني",
                Bio = "استشاري أمراض القلب والقسطرة التداخلية، حاصل على البورد الأمريكي وخبرة واسعة في تشخيص وعلاج أمراض القلب.",
                Experience = "12 سنة",
                Rating = 4.9,
                AvailabilityStatus = "Available",
                ProfileImageUrl = "/images/doctors/dr-ahmed.png"
            };
            context.Doctors.Add(doctorProfile);
            context.SaveChanges();

            // Seed Doctor Slots (Tomorrow)
            var tomorrow = DateTime.UtcNow.Date.AddDays(1);
            var slot1 = new DoctorSlot { DoctorId = doctorProfile.Id, Date = tomorrow, StartTime = "09:00", EndTime = "09:30", Status = "Available" };
            var slot2 = new DoctorSlot { DoctorId = doctorProfile.Id, Date = tomorrow, StartTime = "09:30", EndTime = "10:00", Status = "Available" };
            var slot3 = new DoctorSlot { DoctorId = doctorProfile.Id, Date = tomorrow, StartTime = "10:00", EndTime = "10:30", Status = "Booked" };
            var slot4 = new DoctorSlot { DoctorId = doctorProfile.Id, Date = tomorrow, StartTime = "10:30", EndTime = "11:00", Status = "Available" };
            var slot5 = new DoctorSlot { DoctorId = doctorProfile.Id, Date = tomorrow, StartTime = "11:00", EndTime = "11:30", Status = "Available" };

            context.Slots.AddRange(slot1, slot2, slot3, slot4, slot5);
            context.SaveChanges();

            // Seed Patient
            var patientUser = new User
            {
                FullName = "محمد علي",
                Email = "patient@hospital.com",
                PhoneNumber = "0502222222",
                PasswordHash = passwordHasher.HashPassword("Patient@123"),
                Role = "Patient",
                AccountStatus = "Active",
                CreatedAt = DateTime.UtcNow
            };
            context.Users.Add(patientUser);
            context.SaveChanges();

            var patientProfile = new PatientProfile
            {
                UserId = patientUser.Id,
                DateOfBirth = new DateTime(1995, 5, 15),
                ProfileImageUrl = "/images/patients/patient-1.png",
                CreatedAt = DateTime.UtcNow
            };
            context.Patients.Add(patientProfile);
            context.SaveChanges();

            // Seed an Appointment for the booked slot
            var appointment = new Appointment
            {
                AppointmentNumber = "APT-1001",
                PatientId = patientProfile.Id,
                DoctorId = doctorProfile.Id,
                SlotId = slot3.Id,
                AppointmentDate = tomorrow,
                StartTime = "10:00",
                EndTime = "10:30",
                Status = "Confirmed",
                ReasonForVisit = "فحص دوري واستشارة لضغط الدم",
                Notes = "المريض يطلب قياس تخطيط القلب",
                CreatedAt = DateTime.UtcNow
            };
            context.Appointments.Add(appointment);
            context.SaveChanges();
        }
    }
}
