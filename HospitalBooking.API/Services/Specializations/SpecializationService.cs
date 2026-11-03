using HospitalBooking.API.Data;
using HospitalBooking.API.DTOs;
using HospitalBooking.API.Models;
using HospitalBooking.API.Services.Common;
using Microsoft.EntityFrameworkCore;

namespace HospitalBooking.API.Services.Specializations
{
    public class SpecializationService : ISpecializationService
    {
        private readonly YusrDbContext _context;

        public SpecializationService(YusrDbContext context)
        {
            _context = context;
        }

        public async Task<ServiceResponse<List<SpecializationDto>>> GetSpecializationsAsync()
        {
            var clinics = await _context.Clinics
                .Include(s => s.Doctors)
                .Select(s => new SpecializationDto
                {
                    Id = s.ClinicId,
                    Name = s.ClinicName,
                    Description = s.Description,
                    Status = s.IsActive ? "Active" : "Inactive",
                    DoctorsCount = s.Doctors.Count
                })
                .ToListAsync();

            return ServiceResponse<List<SpecializationDto>>.Ok(clinics);
        }

        public async Task<ServiceResponse<SpecializationDto>> GetSpecializationByIdAsync(int id)
        {
            var clinic = await _context.Clinics
                .Include(s => s.Doctors)
                .FirstOrDefaultAsync(s => s.ClinicId == id);

            if (clinic == null)
            {
                return ServiceResponse<SpecializationDto>.Fail("التخصص/العيادة غير موجود", 404);
            }

            return ServiceResponse<SpecializationDto>.Ok(new SpecializationDto
            {
                Id = clinic.ClinicId,
                Name = clinic.ClinicName,
                Description = clinic.Description,
                Status = clinic.IsActive ? "Active" : "Inactive",
                DoctorsCount = clinic.Doctors.Count
            });
        }

        public async Task<ServiceResponse<object>> CreateSpecializationAsync(CreateSpecializationDto dto)
        {
            var name = dto.Name.Trim();
            var exists = await _context.Clinics.AnyAsync(s => s.ClinicName.ToLower() == name.ToLower());
            if (exists)
            {
                return ServiceResponse<object>.Fail("هذا التخصص مسجل مسبقاً", 400);
            }

            var clinic = new Clinic
            {
                ClinicName = name,
                Specialty = name,
                Description = dto.Description,
                IsActive = string.IsNullOrWhiteSpace(dto.Status) || dto.Status.Equals("Active", StringComparison.OrdinalIgnoreCase),
                CreatedAt = DateTimeOffset.UtcNow
            };

            _context.Clinics.Add(clinic);
            await _context.SaveChangesAsync();

            return ServiceResponse<object>.Created(new
            {
                specializationId = clinic.ClinicId,
                name = clinic.ClinicName,
                description = clinic.Description,
                status = clinic.IsActive ? "Active" : "Inactive",
                doctorsCount = 0
            });
        }

        public async Task<ServiceResponse<SpecializationDto>> UpdateSpecializationAsync(int id, UpdateSpecializationDto dto)
        {
            var clinic = await _context.Clinics
                .Include(s => s.Doctors)
                .FirstOrDefaultAsync(s => s.ClinicId == id);

            if (clinic == null)
            {
                return ServiceResponse<SpecializationDto>.Fail("التخصص/العيادة غير موجود", 404);
            }

            if (!string.IsNullOrWhiteSpace(dto.Name))
            {
                var nameExists = await _context.Clinics
                    .AnyAsync(s => s.ClinicId != id && s.ClinicName.ToLower() == dto.Name.Trim().ToLower());
                if (nameExists)
                {
                    return ServiceResponse<SpecializationDto>.Fail("يوجد تخصص آخر بنفس الاسم", 400);
                }
                clinic.ClinicName = dto.Name.Trim();
                clinic.Specialty = dto.Name.Trim();
            }

            if (dto.Description != null) clinic.Description = dto.Description;
            if (!string.IsNullOrWhiteSpace(dto.Status))
            {
                clinic.IsActive = dto.Status.Equals("Active", StringComparison.OrdinalIgnoreCase);
            }

            await _context.SaveChangesAsync();

            return ServiceResponse<SpecializationDto>.Ok(new SpecializationDto
            {
                Id = clinic.ClinicId,
                Name = clinic.ClinicName,
                Description = clinic.Description,
                Status = clinic.IsActive ? "Active" : "Inactive",
                DoctorsCount = clinic.Doctors.Count
            });
        }

        public async Task<ServiceResponse<object>> DeleteSpecializationAsync(int id)
        {
            var clinic = await _context.Clinics
                .Include(s => s.Doctors)
                .FirstOrDefaultAsync(s => s.ClinicId == id);

            if (clinic == null)
            {
                return ServiceResponse<object>.Fail("التخصص/العيادة غير موجود", 404);
            }

            if (clinic.Doctors.Any())
            {
                return ServiceResponse<object>.Fail("لا يمكن حذف التخصص لوجود أطباء مرتبطين به", 400);
            }

            _context.Clinics.Remove(clinic);
            await _context.SaveChangesAsync();

            return ServiceResponse<object>.Ok(new { message = "تم حذف التخصص بنجاح" });
        }
    }
}
