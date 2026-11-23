import { Observable } from 'rxjs';
import { Appointment, AppointmentStatus } from '../../models/doctor/Doctor.Model';

export interface AppointmentServiceInterface {
  
  getAppointments(doctorId: number): Observable<Appointment[]>;

  
  updateStatus(appointmentId: number, status: AppointmentStatus | string): Observable<void>;
}