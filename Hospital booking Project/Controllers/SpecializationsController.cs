using Hospital_booking_Project.DTOs;
using Hospital_booking_Project.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Hospital_booking_Project.Controllers
{
    [Route("api/specializations")]
    public class SpecializationsController : BaseApiController
    {
        private readonly ISpecializationService _specializationService;

        public SpecializationsController(ISpecializationService specializationService)
        {
            _specializationService = specializationService;
        }

        // 17. GET /api/specializations
        [HttpGet]
        public async Task<IActionResult> GetSpecializations()
        {
            var result = await _specializationService.GetSpecializationsAsync();
            return HandleResult(result);
        }

        // 18. GET /api/specializations/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetSpecializationById(int id)
        {
            var result = await _specializationService.GetSpecializationByIdAsync(id);
            return HandleResult(result);
        }

        // 19. POST /api/specializations
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> CreateSpecialization([FromBody] CreateSpecializationDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _specializationService.CreateSpecializationAsync(dto);
            return HandleResult(result);
        }

        // 20. PUT /api/specializations/{id}
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSpecialization(int id, [FromBody] UpdateSpecializationDto dto)
        {
            var result = await _specializationService.UpdateSpecializationAsync(id, dto);
            return HandleResult(result);
        }

        // 21. DELETE /api/specializations/{id}
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSpecialization(int id)
        {
            var result = await _specializationService.DeleteSpecializationAsync(id);
            return HandleResult(result);
        }
    }
}
