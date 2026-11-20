import { Observable } from 'rxjs';
import {
  Appointment,
  AppointmentFilters,
  UpdateAppointmentStatusRequest,
} from '../../../models/admin/appointments/appointment.model';

export interface IAppointmentsService {
  getAppointments(filters?: AppointmentFilters): Observable<Appointment[]>;
  updateAppointmentStatus(
    id: number,
    data: UpdateAppointmentStatusRequest
  ): Observable<Appointment>;
}
