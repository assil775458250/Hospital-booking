using Hospital_booking_Project.DTOs;
using Hospital_booking_Project.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Hospital_booking_Project.Controllers
{
    [Authorize]
    [Route("api/appointments")]
    public class AppointmentsController : BaseApiController
    {
        private readonly IAppointmentService _appointmentService;

        public AppointmentsController(IAppointmentService appointmentService)
        {
            _appointmentService = appointmentService;
        }

        // 26. POST /api/appointments
        [HttpPost]
        public async Task<IActionResult> BookAppointment([FromBody] CreateAppointmentDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _appointmentService.BookAppointmentAsync(CurrentUserId, dto);
            return HandleResult(result);
        }

        // 27. GET /api/appointments/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetAppointmentById(int id)
        {
            var result = await _appointmentService.GetAppointmentByIdAsync(id, CurrentUserId, IsAdmin);
            return HandleResult(result);
        }

        // 28. GET /api/appointments/my
        [HttpGet("my")]
        public async Task<IActionResult> GetMyAppointments([FromQuery] string? status)
        {
            var result = await _appointmentService.GetMyAppointmentsAsync(CurrentUserId, CurrentUserRole, status);
            return HandleResult(result);
        }

        // 30. PUT /api/appointments/{id}/status
        [Authorize(Roles = "Doctor,Admin")]
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateAppointmentStatus(int id, [FromBody] UpdateAppointmentStatusDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _appointmentService.UpdateAppointmentStatusAsync(id, dto, CurrentUserId, CurrentUserRole);
            return HandleResult(result);
        }

        // 31. DELETE /api/appointments/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> CancelAppointment(int id)
        {
            var result = await _appointmentService.CancelAppointmentAsync(id, CurrentUserId, IsAdmin);
            return HandleResult(result);
        }
    }
}
