import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/config/api.config';
import { Appointment, AppointmentStatus } from '../../models/doctor/Doctor.Model';
import { AppointmentServiceInterface } from './appointment-service.interface';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService implements AppointmentServiceInterface {
  private readonly http = inject(HttpClient);

  getAppointments(doctorId: number): Observable<Appointment[]> {
    return this.http.get<any[]>(`${API_BASE_URL}/api/doctors/${doctorId}/appointments`).pipe(
      map(items => (items || []).map(item => {
        const rawDate = item.appointmentDate ? item.appointmentDate.split('T')[0] : '';
        return {
          id: item.id,
          appointmentNumber: item.appointmentNumber || '',
          patientId: item.patientId,
          patientName: item.patientName || '',
          patientPhone: item.patientPhone || '',
          doctorId: item.doctorId,
          doctorName: item.doctorName || '',
          specializationName: item.specializationName || '',
          clinic: item.clinic || '',
          slotId: item.slotId,
          appointmentDate: item.appointmentDate || '',
          startTime: item.startTime || '',
          endTime: item.endTime || '',
          status: item.status || 'Pending',
          notes: item.notes || null,
          reasonForVisit: item.reasonForVisit || null,
          createdAt: item.createdAt || '',
          date: rawDate,
          time: item.startTime || ''
        } as Appointment;
      }))
    );
  }

  updateStatus(appointmentId: number, status: AppointmentStatus | string): Observable<void> {
    return this.http.put<void>(`${API_BASE_URL}/api/appointments/${appointmentId}/status`, { status });
  }
}