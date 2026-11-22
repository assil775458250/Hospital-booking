import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CreateSpecializationRequest,
  Specialization,
  UpdateSpecializationRequest,
} from '../../../models/admin/specializations/specialization.model';
import { ISpecializationsService } from './specializations.service.interface';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../../core/config/api.config';

@Injectable({
  providedIn: 'root',
})
export class SpecializationsService implements ISpecializationsService {
  private readonly http = inject(HttpClient);
  getSpecializations(): Observable<Specialization[]> {
    return this.http.get<Specialization[]>(`${API_BASE_URL}/api/specializations`);
  }

  createSpecialization(data: CreateSpecializationRequest): Observable<Specialization> {
    return this.http.post<Specialization>(`${API_BASE_URL}/api/specializations`, data);
  }

  updateSpecialization(
    id: number,
    data: UpdateSpecializationRequest
  ): Observable<Specialization> {
    return this.http.put<Specialization>(`${API_BASE_URL}/api/specializations/${id}`, data);
  }

  deleteSpecialization(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/api/specializations/${id}`);
  }
}
