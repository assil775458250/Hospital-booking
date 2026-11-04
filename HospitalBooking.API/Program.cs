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
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
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

            // 2. Add Security & JWT Services
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


            // 4. Add Authentication & JWT Bearer


            // تسجيل خدمة المصادقة في التطبيق، وتحديد أن JWT Bearer هو النظام المستخدم للتحقق من هوية المستخدم.

            // تحديد الإعدادات الافتراضية للمصادقة
            builder.Services.AddAuthentication(options =>
            {
                // تحديد طريقة التحقق من هوية المستخدم عند وصول الطلب.
                // أي أن ASP.NET Core سيستخدم JWT Bearer لفحص الرمز المرسل.
                options.DefaultAuthenticateScheme =
                    JwtBearerDefaults.AuthenticationScheme;

                // تحديد طريقة التعامل مع الطلب عندما يحتاج المستخدم إلى المصادقة
                // ولا يقدم رمزاً صالحاً، مثل إرجاع HTTP 401 Unauthorized.
                options.DefaultChallengeScheme =
                    JwtBearerDefaults.AuthenticationScheme;
            })

            // إعداد آلية استقبال JWT والتحقق من صحته
            .AddJwtBearer(options =>
            {
                // عدم اشتراط HTTPS عند جلب بيانات Metadata الخاصة بمزود الهوية.
                // هذا لا يعني أن HTTPS غير مطلوب لحماية طلبات التطبيق في الإنتاج.
                options.RequireHttpsMetadata = false;

                // الاحتفاظ بالـ Token بعد نجاح المصادقة
                // ضمن خصائص المصادقة الخاصة بالطلب، وليس في قاعدة البيانات.
                options.SaveToken = true;

                // تحديد الشروط التي يجب التحقق منها لقبول JWT
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    // تفعيل التحقق من صحة التوقيع الرقمي للـ Token
                    // للتأكد من أنه لم يتم التلاعب بمحتواه.
                    ValidateIssuerSigningKey = true,

                    // تحديد المفتاح السري المستخدم للتحقق من توقيع JWT.
                    // نقرأ المفتاح من إعدادات التطبيق Jwt:Key.
                    // Encoding.UTF8.GetBytes يحول النص إلى مصفوفة Bytes.
                    // SymmetricSecurityKey ينشئ مفتاحاً متماثلاً للتحقق من التوقيع.
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)),

                    // تفعيل التحقق من الجهة التي أصدرت الـ Token.
                    ValidateIssuer = true,

                    // تحديد اسم الجهة المصدرة المتوقع وجوده داخل JWT (Issuer).
                    // تتم مقارنة هذه القيمة بقيمة Issuer الموجودة في الرمز.
                    ValidIssuer = builder.Configuration["Jwt:Issuer"],

                    // تفعيل التحقق من الجهة المستهدفة بالـ Token.
                    ValidateAudience = true,

                    // تحديد الجمهور المتوقع أن يكون الـ Token موجهاً إليه (Audience).
                    // تتم مقارنة هذه القيمة بقيمة Audience الموجودة في الرمز.
                    ValidAudience = builder.Configuration["Jwt:Audience"],

                    // تفعيل التحقق من تاريخ صلاحية الـ Token.
                    // إذا انتهت صلاحيته، يرفضه السيرفر.
                    ValidateLifetime = true,

                    // تحديد هامش السماح لاختلاف الوقت عند التحقق من انتهاء الصلاحية.
                    // TimeSpan.Zero يعني عدم السماح بأي وقت إضافي.
                    ClockSkew = TimeSpan.Zero
                };
            });


            // 5. Add CORS

            // تسجيل خدمة CORS داخل التطبيق
            // CORS تسمح بالتحكم في طلبات HTTP القادمة من مصادر مختلفة (Origins)
            // مثل السماح لتطبيق React بالتواصل مع ASP.NET Core API.
            builder.Services.AddCors(options =>
            {
                // إنشاء سياسة CORS باسم AllowAll
                // يمكن استخدام هذا الاسم لاحقاً لتفعيل السياسة داخل Middleware.
                options.AddPolicy("AllowAll", policy =>
                {
                    // السماح لجميع المواقع والمصادر (Origins) بإرسال الطلبات إلى API.
                    policy.AllowAnyOrigin()

                          // السماح بإرسال جميع أنواع HTTP Headers
                          // مثل Content-Type و Authorization المستخدم مع JWT.
                          .AllowAnyHeader()

                          // السماح باستخدام جميع أنواع HTTP Methods
                          // مثل GET و POST و PUT و PATCH و DELETE.
                          .AllowAnyMethod();
                });
            });

            // تفعيل سياسة CORS بعد إنشاء التطبيق:
            // app.UseCors("AllowAll");
            //
            // ملاحظة:
            // AllowAll سياسة واسعة، ومناسبة غالباً للتطوير.
            // في بيئة الإنتاج يُفضّل تحديد عناوين المواقع المسموح لها
            // باستخدام WithOrigins() بدلاً من السماح لجميع المصادر.
            //
            // CORS تتحكم في طلبات المتصفح بين المصادر المختلفة،
            // لكنها لا تتحقق من هوية المستخدم ولا تستبدل JWT.


            // 6. Add Controllers
            builder.Services.AddControllers();

            // 7. Swagger configuration with JWT support
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "Hospital Booking API",
                    Version = "v1",
                    Description = "نظام الحجز في المستشفى"
                });

                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    Scheme = "Bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "أدخل رمز JWT هنا بصيغة: Bearer {token}"
                });

                c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        Array.Empty<string>()
                    }
                });
            });

            var app = builder.Build();

            //// 8. Seed Database
            //using (var scope = app.Services.CreateScope())
            //{
            //    var services = scope.ServiceProvider;
            //    try
            //    {
            //        var context = services.GetRequiredService<YusrDbContext>();
            //        var hasher = services.GetRequiredService<IPasswordHasher>();
            //        DbInitializer.Initialize(context, hasher);
            //    }
            //    catch (Exception ex)
            //    {
            //        var logger = services.GetRequiredService<ILogger<Program>>();
            //        logger.LogError(ex, "حدث خطأ أثناء تهيئة قاعدة البيانات.");
            //    }
            //}

            // 9. Pipeline configuration
            app.UseCors("AllowAll");

            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "Hospital Booking API v1");
            });

            // Redirect root "/" to "/swagger" so both work smoothly
            app.MapGet("/", () => Results.Redirect("/swagger"));

            app.UseHttpsRedirection();

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}
