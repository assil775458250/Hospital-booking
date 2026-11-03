using System.Text;
using HospitalBooking.API.Data;
using HospitalBooking.API.Services.Admin;
using HospitalBooking.API.Services.Appointments;
using HospitalBooking.API.Services.Auth;
using HospitalBooking.API.Services.Common;
using HospitalBooking.API.Services.Doctors;
using HospitalBooking.API.Services.Patients;
using HospitalBooking.API.Services.Security;
using HospitalBooking.API.Services.Slots;
using HospitalBooking.API.Services.Specializations;
using HospitalBooking.API.Services.Users;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

namespace HospitalBooking.API
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // 1. Add DbContext with PostgreSQL
            builder.Services.AddDbContext<YusrDbContext>(options =>
                options.UseNpgsql(builder.Configuration.GetConnectionString("YusrDatabase")));

            // 2. Add Security & Utility Services
            builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
            builder.Services.AddScoped<IJwtService, JwtService>();

            // 3. Add Business Logic Services (Services & Interfaces)
            builder.Services.AddScoped<IAuthService, AuthService>();
            builder.Services.AddScoped<IUserService, UserService>();
            builder.Services.AddScoped<IPatientService, PatientService>();
            builder.Services.AddScoped<IDoctorService, DoctorService>();
            builder.Services.AddScoped<ISpecializationService, SpecializationService>();
            builder.Services.AddScoped<ISlotService, SlotService>();
            builder.Services.AddScoped<IAppointmentService, AppointmentService>();
            builder.Services.AddScoped<IAdminService, AdminService>();

            // 4. Add CORS
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAll", policy =>
                {
                    policy.AllowAnyOrigin()
                          .AllowAnyHeader()
                          .AllowAnyMethod();
                });
            });

            // 5. Add Controllers
            builder.Services.AddControllers();

            // 6. Swagger configuration
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "Hospital Booking API",
                    Version = "v1",
                    Description = "نظام الحجز في المستشفى"
                });
            });

            var app = builder.Build();

            // 7. Seed Database
            using (var scope = app.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                try
                {
                    var context = services.GetRequiredService<YusrDbContext>();
                    var hasher = services.GetRequiredService<IPasswordHasher>();
                    DbInitializer.Initialize(context, hasher);
                }
                catch (Exception ex)
                {
                    var logger = services.GetRequiredService<ILogger<Program>>();
                    logger.LogError(ex, "حدث خطأ أثناء تهيئة قاعدة البيانات.");
                }
            }

            // 8. Pipeline configuration
            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "Hospital Booking API v1");
            });

            // Redirect root "/" to "/swagger" so both work smoothly
            app.MapGet("/", () => Results.Redirect("/swagger"));

            app.UseCors("AllowAll");

            app.UseHttpsRedirection();

            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}
