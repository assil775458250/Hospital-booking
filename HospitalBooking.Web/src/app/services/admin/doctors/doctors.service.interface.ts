import { Observable } from 'rxjs';
import {
  CreateDoctorRequest,
  Doctor,
  DoctorDetails,
  DoctorScheduleSlot,
  DoctorStatus,
  UpdateDoctorRequest,
} from '../../../models/admin/doctors/doctor.model';

export interface IDoctorsService {
  getDoctors(): Observable<Doctor[]>;
  getDoctorById(id: number): Observable<DoctorDetails>;
  getDoctorSlots(doctorId: number): Observable<DoctorScheduleSlot[]>;
  createDoctor(data: CreateDoctorRequest): Observable<void>;
  updateDoctor(id: number, data: UpdateDoctorRequest): Observable<void>;
  updateDoctorStatus(id: number, status: DoctorStatus): Observable<void>;
}
