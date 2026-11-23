import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';
import {
  AdminProfile,
  ChangeAdminPasswordRequest,
  UpdateAdminProfileRequest,
} from '../../../models/admin/profile/admin-profile.model';
import { IAdminProfileService } from './admin-profile.service.interface';

@Injectable({
  providedIn: 'root',
})
export class AdminProfileService implements IAdminProfileService {
  private readonly http = inject(HttpClient);

  getProfile(id: number): Observable<AdminProfile> {
    return this.http.get<AdminProfile>(`${API_BASE_URL}/api/users/${id}`);
  }

  updateProfile(id: number, data: UpdateAdminProfileRequest): Observable<void> {
    return this.http.put<void>(`${API_BASE_URL}/api/users/${id}`, data);
  }

  changePassword(id: number, data: ChangeAdminPasswordRequest): Observable<void> {
    return this.http.put<void>(`${API_BASE_URL}/api/users/${id}/password`, data);
  }
}