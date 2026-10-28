using System.Security.Claims;
using Hospital_booking_Project.Services;
using Microsoft.AspNetCore.Mvc;

namespace Hospital_booking_Project.Controllers
{
    [ApiController]
    public abstract class BaseApiController : ControllerBase
    {
        protected int? CurrentUserId
        {
            get
            {
                var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                return int.TryParse(idClaim, out var id) ? id : null;
            }
        }

        protected string? CurrentUserRole => User.FindFirst(ClaimTypes.Role)?.Value;

        protected bool IsAdmin => CurrentUserRole == "Admin";

        protected IActionResult HandleResult<T>(ServiceResponse<T> response)
        {
            if (!response.Success)
            {
                return StatusCode(response.StatusCode, new { message = response.Message });
            }

            if (response.StatusCode == 201)
            {
                return StatusCode(201, response.Data);
            }

            return Ok(response.Data);
        }
    }
}
