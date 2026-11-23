import { Observable } from 'rxjs';
import { DoctorProfile, UpdateDoctorRequest } from '../../models/doctor/Doctor.Model';

export interface DoctorServiceInterface {
  
  getDoctor(id: number): Observable<DoctorProfile>;

  
  updateDoctor(id: number, data: UpdateDoctorRequest): Observable<DoctorProfile>;
}