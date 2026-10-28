using Hospital_booking_Project.DTOs;
using Hospital_booking_Project.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Hospital_booking_Project.Controllers
{
    [Route("api/slots")]
    public class SlotsController : BaseApiController
    {
        private readonly ISlotService _slotService;

        public SlotsController(ISlotService slotService)
        {
            _slotService = slotService;
        }

        // 24. PUT /api/slots/{id}
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSlot(int id, [FromBody] UpdateSlotDto dto)
        {
            var result = await _slotService.UpdateSlotAsync(id, dto);
            return HandleResult(result);
        }

        // 25. DELETE /api/slots/{id}
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSlot(int id)
        {
            var result = await _slotService.DeleteSlotAsync(id);
            return HandleResult(result);
        }
    }
}
