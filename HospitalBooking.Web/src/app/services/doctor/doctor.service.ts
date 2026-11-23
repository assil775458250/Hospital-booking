import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/config/api.config';
import { DoctorProfile, UpdateDoctorRequest } from '../../models/doctor/Doctor.Model';
import { DoctorServiceInterface } from './doctor-service.interface';

@Injectable({
  providedIn: 'root'
})
export class DoctorService implements DoctorServiceInterface {
  private readonly http = inject(HttpClient);

  getDoctor(id: number): Observable<DoctorProfile> {
    return this.http.get<DoctorProfile>(`${API_BASE_URL}/api/doctors/${id}`).pipe(
      map(profile => ({
        ...profile,
        
        name: profile.fullName || profile.name || '',
        phone: profile.phoneNumber || profile.phone || '',
        specialization: profile.specializationName || profile.clinic || profile.specialization || ''
      }))
    );
  }

  updateDoctor(id: number, data: UpdateDoctorRequest): Observable<DoctorProfile> {
    return this.http.put<DoctorProfile>(`${API_BASE_URL}/api/doctors/${id}`, data);
  }
}