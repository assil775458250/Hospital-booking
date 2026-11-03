using HospitalBooking.API.Services.Common;
using HospitalBooking.API.DTOs;

namespace HospitalBooking.API.Services.Patients
{
    public interface IPatientService
    {
        Task<ServiceResponse<List<PatientDto>>> GetPatientsAsync();
        Task<ServiceResponse<PatientDetailDto>> GetPatientByIdAsync(int id, int? currentUserId, bool isAdmin);
        Task<ServiceResponse<PatientDto>> UpdatePatientAsync(int id, UpdatePatientDto dto, int? currentUserId, bool isAdmin);
        Task<ServiceResponse<object>> DeletePatientAsync(int id);
    }
}
