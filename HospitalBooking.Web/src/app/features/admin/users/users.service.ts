import { API_BASE_URL } from '../../../core/config/api.config';
import { inject, Injectable } from '@angular/core';
import { Observable} from 'rxjs';
import {
  UpdateUserRequest,
  UpdateUserRoleRequest,
  UpdateUserStatusRequest,
  User,
  UserFilters
} from './user.model';
import { IUsersService } from './users.service.interface';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class UsersService implements IUsersService {
  private readonly http = inject(HttpClient);

  getUsers(filters?: UserFilters): Observable<User[]> {
    let params = new HttpParams();


    const searchTerm = filters?.search?.trim();
    if (searchTerm) {
      params = params.set('search',searchTerm);
    }
    if (filters?.role) {
      params = params.set('role', filters.role);
    }
    if (filters?.status) {
      params = params.set('status', filters.status);
    }
    
    return this.http.get<User[]>(`${API_BASE_URL}/api/admin/users`, { params });
  }
  updateUser(id: number, data: UpdateUserRequest): Observable<void> {
    return this.http.put<void>(`${API_BASE_URL}/api/users/${id}`, data);
  }
  updateUserRole(id: number, data: UpdateUserRoleRequest): Observable<void> {
    return this.http.put<void>(`${API_BASE_URL}/api/admin/users/${id}/role`, data);
  }
  updateUserStatus(id: number, data: UpdateUserStatusRequest): Observable<void> {
    return this.http.put<void>(`${API_BASE_URL}/api/admin/users/${id}/status`, data);
  }
}
