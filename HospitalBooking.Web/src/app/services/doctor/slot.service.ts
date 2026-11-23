import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/config/api.config';
import { CreateSlotRequest, CreateSlotResponse, DoctorSlot, UpdateSlotRequest } from '../../models/doctor/Doctor.Model';
import { SlotServiceInterface } from './slot-service.interface';

@Injectable({
  providedIn: 'root'
})
export class SlotService implements SlotServiceInterface {
  private readonly http = inject(HttpClient);

  getSlots(doctorId: number): Observable<DoctorSlot[]> {
    return this.http.get<any[]>(`${API_BASE_URL}/api/doctors/${doctorId}/slots`).pipe(
      map(items => (items || []).map(s => {
        const rawDate = s.date ? (typeof s.date === 'string' ? s.date.split('T')[0] : '') : '';
        return {
          id: s.id,
          doctorId: s.doctorId,
          date: rawDate,
          startTime: s.startTime || '',
          endTime: s.endTime || '',
          status: s.status || 'Available',
          isActive: s.status !== 'Unavailable' && s.status !== 'Cancelled'
        } as DoctorSlot;
      }))
    );
  }

  addSlot(doctorId: number, slot: CreateSlotRequest): Observable<CreateSlotResponse> {
    return this.http.post<CreateSlotResponse>(`${API_BASE_URL}/api/doctors/${doctorId}/slots`, slot);
  }

  updateSlot(slotId: number, slot: UpdateSlotRequest): Observable<DoctorSlot> {
    return this.http.put<any>(`${API_BASE_URL}/api/slots/${slotId}`, slot).pipe(
      map(s => {
        const rawDate = s.date ? (typeof s.date === 'string' ? s.date.split('T')[0] : '') : '';
        return {
          id: s.id,
          doctorId: s.doctorId,
          date: rawDate,
          startTime: s.startTime || '',
          endTime: s.endTime || '',
          status: s.status || 'Available',
          isActive: s.status !== 'Unavailable' && s.status !== 'Cancelled'
        } as DoctorSlot;
      })
    );
  }

  stopSlot(slotId: number): Observable<void> {
    return this.http.put<void>(`${API_BASE_URL}/api/slots/${slotId}`, { status: 'Unavailable' });
  }

  activateSlot(slotId: number): Observable<void> {
    return this.http.put<void>(`${API_BASE_URL}/api/slots/${slotId}`, { status: 'Available' });
  }
}