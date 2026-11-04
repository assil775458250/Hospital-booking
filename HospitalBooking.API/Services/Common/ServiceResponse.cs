namespace HospitalBooking.API.Services.Common
{
    //Service Response Pattern

    // Generic Class
    public class ServiceResponse<T>
    {
        public bool Success { get; set; } = true;
        public string? Message { get; set; }
        public T? Data { get; set; }
        public int StatusCode { get; set; } = 200;

        //        ÇáÇÊ ÇáÇÓÊÌÇÈÉ(Response Status) İí ÇáÜ API¡ İåäÇß ËáÇË ÍÇáÇÊ ÑÆíÓíÉ ÊŞÕÏåÇ ÛÇáÈÇğ:
        //1. Success(äÌÇÍ) : ÇáÚãáíÉ ÊãÊ ÈäÌÇÍ.
        //2. Failure(İÔá) : ÇáÚãáíÉ áã ÊäÌÍ ÈÓÈÈ ÎØÃ.
        //3. Update(ÊÍÏíË) : Êã ÊÚÏíá ÈíÇäÇÊ ãæÌæÏÉ.

        public static ServiceResponse<T> Ok(T data, string? message = null) =>
            new() { Success = true, Data = data, Message = message, StatusCode = 200 };

        public static ServiceResponse<T> Created(T data, string? message = null) =>
            new() { Success = true, Data = data, Message = message, StatusCode = 201 };

        public static ServiceResponse<T> Fail(string message, int statusCode = 400) =>
            new() { Success = false, Message = message, StatusCode = statusCode };
    }
}
