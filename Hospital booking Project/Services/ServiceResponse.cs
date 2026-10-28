namespace Hospital_booking_Project.Services
{
    public class ServiceResponse<T>
    {
        public bool Success { get; set; } = true;
        public string? Message { get; set; }
        public T? Data { get; set; }
        public int StatusCode { get; set; } = 200;

        public static ServiceResponse<T> Ok(T data, string? message = null) =>
            new() { Success = true, Data = data, Message = message, StatusCode = 200 };

        public static ServiceResponse<T> Created(T data, string? message = null) =>
            new() { Success = true, Data = data, Message = message, StatusCode = 201 };

        public static ServiceResponse<T> Fail(string message, int statusCode = 400) =>
            new() { Success = false, Message = message, StatusCode = statusCode };
    }
}
