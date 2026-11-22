import { inject, Injectable } from '@angular/core';
import { Observable} from 'rxjs';
import {
  Appointment,
  AppointmentFilters,
  UpdateAppointmentStatusRequest,
} from '../../../models/admin/appointments/appointment.model';
import { IAppointmentsService } from './appointments.service.interface';
import {HttpClient, HttpParams} from '@angular/common/http';
import { API_BASE_URL } from '../../../core/config/api.config';

@Injectable({
  providedIn: 'root',
})
export class AppointmentsService implements IAppointmentsService {
  private readonly http = inject(HttpClient);

  getAppointments(filters?: AppointmentFilters): Observable<Appointment[]> {
    let params = new HttpParams();

    if (filters?.patientId !== undefined && filters.patientId !== null) {
    params = params.set('patientId', filters.patientId.toString());
    }

    if (filters?.doctorId !== undefined && filters.doctorId !== null) {
      params = params.set('doctorId', filters.doctorId.toString());
    }

    if (filters?.status) {
      params = params.set('status', filters.status);
    }

    if (filters?.date) {
      params = params.set('date', filters.date);
    }

    return this.http.get<Appointment[]>(`${API_BASE_URL}/api/admin/appointments`, { params });
  }

  updateAppointmentStatus(
    id: number,
    data: UpdateAppointmentStatusRequest
  ): Observable<Appointment> {
    return this.http.put<Appointment>(`${API_BASE_URL}/api/appointments/${id}/status`, data);
  }
}
