using Hospital_booking_Project.DTOs;
using Hospital_booking_Project.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Hospital_booking_Project.Controllers
{
    [Authorize(Roles = "Admin")]
    [Route("api/admin")]
    public class AdminController : BaseApiController
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        // 32. GET /api/admin/dashboard
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var result = await _adminService.GetDashboardAsync();
            return HandleResult(result);
        }

        // 33. GET /api/admin/users
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers(
            [FromQuery] string? role,
            [FromQuery] string? status,
            [FromQuery] string? search)
        {
            var result = await _adminService.GetUsersAsync(role, status, search);
            return HandleResult(result);
        }

        // 34. PUT /api/admin/users/{id}/role
        [HttpPut("users/{id}/role")]
        public async Task<IActionResult> UpdateUserRole(int id, [FromBody] UpdateUserRoleDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _adminService.UpdateUserRoleAsync(id, dto);
            return HandleResult(result);
        }

        // 35. GET /api/admin/appointments
        [HttpGet("appointments")]
        public async Task<IActionResult> GetAppointments(
            [FromQuery] int? patientId,
            [FromQuery] int? doctorId,
            [FromQuery] string? status,
            [FromQuery] DateTime? date)
        {
            var result = await _adminService.GetAppointmentsAsync(patientId, doctorId, status, date);
            return HandleResult(result);
        }

        // 36. GET /api/admin/doctors
        [HttpGet("doctors")]
        public async Task<IActionResult> GetDoctors(
            [FromQuery] int? specializationId,
            [FromQuery] string? status,
            [FromQuery] string? search)
        {
            var result = await _adminService.GetDoctorsAsync(specializationId, status, search);
            return HandleResult(result);
        }

        // 37. GET /api/admin/patients
        [HttpGet("patients")]
        public async Task<IActionResult> GetPatients(
            [FromQuery] string? status,
            [FromQuery] string? search)
        {
            var result = await _adminService.GetPatientsAsync(status, search);
            return HandleResult(result);
        }
    }
}
