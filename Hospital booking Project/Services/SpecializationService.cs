using Hospital_booking_Project.Data;
using Hospital_booking_Project.DTOs;
using Hospital_booking_Project.Models;
using Hospital_booking_Project.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Hospital_booking_Project.Services
{
    public class SpecializationService : ISpecializationService
    {
        private readonly AppDbContext _context;

        public SpecializationService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ServiceResponse<List<SpecializationDto>>> GetSpecializationsAsync()
        {
            var specs = await _context.Specializations
                .Include(s => s.Doctors)
                .Select(s => new SpecializationDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    Icon = s.Icon,
                    Description = s.Description,
                    Status = s.Status,
                    DoctorsCount = s.Doctors.Count
                })
                .ToListAsync();

            return ServiceResponse<List<SpecializationDto>>.Ok(specs);
        }

        public async Task<ServiceResponse<SpecializationDto>> GetSpecializationByIdAsync(int id)
        {
            var spec = await _context.Specializations
                .Include(s => s.Doctors)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (spec == null)
            {
                return ServiceResponse<SpecializationDto>.Fail("التخصص غير موجود", 404);
            }

            return ServiceResponse<SpecializationDto>.Ok(new SpecializationDto
            {
                Id = spec.Id,
                Name = spec.Name,
                Icon = spec.Icon,
                Description = spec.Description,
                Status = spec.Status,
                DoctorsCount = spec.Doctors.Count
            });
        }

        public async Task<ServiceResponse<object>> CreateSpecializationAsync(CreateSpecializationDto dto)
        {
            var exists = await _context.Specializations.AnyAsync(s => s.Name.ToLower() == dto.Name.Trim().ToLower());
            if (exists)
            {
                return ServiceResponse<object>.Fail("هذا التخصص مسجل مسبقاً", 400);
            }

            var spec = new Specialization
            {
                Name = dto.Name.Trim(),
                Icon = dto.Icon,
                Description = dto.Description,
                Status = string.IsNullOrWhiteSpace(dto.Status) ? "Active" : dto.Status
            };

            _context.Specializations.Add(spec);
            await _context.SaveChangesAsync();

            return ServiceResponse<object>.Created(new
            {
                specializationId = spec.Id,
                name = spec.Name,
                icon = spec.Icon,
                description = spec.Description,
                status = spec.Status,
                doctorsCount = 0
            });
        }

        public async Task<ServiceResponse<SpecializationDto>> UpdateSpecializationAsync(int id, UpdateSpecializationDto dto)
        {
            var spec = await _context.Specializations
                .Include(s => s.Doctors)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (spec == null)
            {
                return ServiceResponse<SpecializationDto>.Fail("التخصص غير موجود", 404);
            }

            if (!string.IsNullOrWhiteSpace(dto.Name))
            {
                var nameExists = await _context.Specializations
                    .AnyAsync(s => s.Id != id && s.Name.ToLower() == dto.Name.Trim().ToLower());
                if (nameExists)
                {
                    return ServiceResponse<SpecializationDto>.Fail("يوجد تخصص آخر بنفس الاسم", 400);
                }
                spec.Name = dto.Name.Trim();
            }

            if (dto.Icon != null) spec.Icon = dto.Icon;
            if (dto.Description != null) spec.Description = dto.Description;
            if (!string.IsNullOrWhiteSpace(dto.Status)) spec.Status = dto.Status;

            await _context.SaveChangesAsync();

            return ServiceResponse<SpecializationDto>.Ok(new SpecializationDto
            {
                Id = spec.Id,
                Name = spec.Name,
                Icon = spec.Icon,
                Description = spec.Description,
                Status = spec.Status,
                DoctorsCount = spec.Doctors.Count
            });
        }

        public async Task<ServiceResponse<object>> DeleteSpecializationAsync(int id)
        {
            var spec = await _context.Specializations
                .Include(s => s.Doctors)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (spec == null)
            {
                return ServiceResponse<object>.Fail("التخصص غير موجود", 404);
            }

            if (spec.Doctors.Any())
            {
                return ServiceResponse<object>.Fail("لا يمكن حذف التخصص لوجود أطباء مرتبطين به", 400);
            }

            _context.Specializations.Remove(spec);
            await _context.SaveChangesAsync();

            return ServiceResponse<object>.Ok(new { message = "تم حذف التخصص بنجاح" });
        }
    }
}
