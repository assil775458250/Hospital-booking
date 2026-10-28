using Hospital_booking_Project.DTOs;
using Hospital_booking_Project.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Hospital_booking_Project.Controllers
{
    [Authorize]
    [Route("api/patients")]
    public class PatientsController : BaseApiController
    {
        private readonly IPatientService _patientService;

        public PatientsController(IPatientService patientService)
        {
            _patientService = patientService;
        }

        // 8. GET /api/patients
        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetPatients()
        {
            var result = await _patientService.GetPatientsAsync();
            return HandleResult(result);
        }

        // 9. GET /api/patients/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetPatientById(int id)
        {
            var result = await _patientService.GetPatientByIdAsync(id, CurrentUserId, IsAdmin);
            return HandleResult(result);
        }

        // 10. PUT /api/patients/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePatient(int id, [FromBody] UpdatePatientDto dto)
        {
            var result = await _patientService.UpdatePatientAsync(id, dto, CurrentUserId, IsAdmin);
            return HandleResult(result);
        }

        // 11. DELETE /api/patients/{id}
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePatient(int id)
        {
            var result = await _patientService.DeletePatientAsync(id);
            return HandleResult(result);
        }
    }
}
