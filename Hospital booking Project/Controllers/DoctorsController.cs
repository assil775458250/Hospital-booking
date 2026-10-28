using Hospital_booking_Project.DTOs;
using Hospital_booking_Project.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Hospital_booking_Project.Controllers
{
    [Route("api/doctors")]
    public class DoctorsController : BaseApiController
    {
        private readonly IDoctorService _doctorService;

        public DoctorsController(IDoctorService doctorService)
        {
            _doctorService = doctorService;
        }

        // 12. GET /api/doctors
        [HttpGet]
        public async Task<IActionResult> GetDoctors([FromQuery] int? specializationId, [FromQuery] string? search)
        {
            var result = await _doctorService.GetDoctorsAsync(specializationId, search);
            return HandleResult(result);
        }

        // 13. GET /api/doctors/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetDoctorById(int id)
        {
            var result = await _doctorService.GetDoctorByIdAsync(id);
            return HandleResult(result);
        }

        // 14. POST /api/doctors
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> CreateDoctor([FromBody] CreateDoctorDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _doctorService.CreateDoctorAsync(dto);
            return HandleResult(result);
        }

        // 15. PUT /api/doctors/{id}
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDoctor(int id, [FromBody] UpdateDoctorDto dto)
        {
            var result = await _doctorService.UpdateDoctorAsync(id, dto);
            return HandleResult(result);
        }

        // 16. DELETE /api/doctors/{id}
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDoctor(int id)
        {
            var result = await _doctorService.DeleteDoctorAsync(id);
            return HandleResult(result);
        }

        // 22. GET /api/doctors/{doctorId}/slots
        [HttpGet("{doctorId}/slots")]
        public async Task<IActionResult> GetDoctorSlots(int doctorId, [FromQuery] DateTime? date)
        {
            var result = await _doctorService.GetDoctorSlotsAsync(doctorId, date);
            return HandleResult(result);
        }

        // 23. POST /api/doctors/{doctorId}/slots
        [Authorize(Roles = "Admin")]
        [HttpPost("{doctorId}/slots")]
        public async Task<IActionResult> CreateDoctorSlot(int doctorId, [FromBody] CreateDoctorSlotDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _doctorService.CreateDoctorSlotAsync(doctorId, dto);
            return HandleResult(result);
        }

        // 29. GET /api/doctors/{doctorId}/appointments
        [Authorize(Roles = "Doctor,Admin")]
        [HttpGet("{doctorId}/appointments")]
        public async Task<IActionResult> GetDoctorAppointments(
            int doctorId,
            [FromQuery] string? period,
            [FromQuery] string? status)
        {
            var result = await _doctorService.GetDoctorAppointmentsAsync(doctorId, period, status, CurrentUserId, CurrentUserRole);
            return HandleResult(result);
        }
    }
}
