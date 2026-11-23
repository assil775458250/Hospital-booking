import { Observable } from 'rxjs';
import { ChangeDoctorPasswordRequest, DoctorProfile, UpdateDoctorRequest } from '../../models/doctor/Doctor.Model';

export interface DoctorServiceInterface {
  getDoctor(id: number): Observable<DoctorProfile>;
  updateDoctor(id: number, data: UpdateDoctorRequest): Observable<DoctorProfile>;
  changePassword(userId: number, data: ChangeDoctorPasswordRequest): Observable<any>;
}