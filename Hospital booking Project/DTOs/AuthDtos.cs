using System.ComponentModel.DataAnnotations;

namespace Hospital_booking_Project.DTOs
{
    public class RegisterRequestDto
    {
        [Required(ErrorMessage = "الاسم مطلوب")]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "رقم الهاتف مطلوب")]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required(ErrorMessage = "البريد الإلكتروني مطلوب")]
        [EmailAddress(ErrorMessage = "صيغة البريد الإلكتروني غير صحيحة")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "كلمة المرور مطلوبة")]
        public string Password { get; set; } = string.Empty;

        [Required(ErrorMessage = "تأكيد كلمة المرور مطلوب")]
        [Compare(nameof(Password), ErrorMessage = "كلمات المرور غير متطابقة")]
        public string ConfirmPassword { get; set; } = string.Empty;

        [Range(typeof(bool), "true", "true", ErrorMessage = "يجب الموافقة على الشروط")]
        public bool AgreeToTerms { get; set; }
    }

    public class LoginRequestDto
    {
        [Required(ErrorMessage = "البريد أو الهاتف مطلوب")]
        public string EmailOrPhone { get; set; } = string.Empty;

        [Required(ErrorMessage = "كلمة المرور مطلوبة")]
        public string Password { get; set; } = string.Empty;
    }

    public class AuthResponseDto
    {
        public int UserId { get; set; }
        public string Token { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public UserDto User { get; set; } = new();
    }
}
