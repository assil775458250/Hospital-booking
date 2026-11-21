import { inject, Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { AuthSessionService } from '../../../core/auth/auth-session.service';
import {
  UpdateUserRequest,
  UpdateUserRoleRequest,
  UpdateUserStatusRequest,
  User,
  UserFilters,
  UserRole,
  UserStatus,
} from '../../../models/admin/users/user.model';
import { IUsersService } from './users.service.interface';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_BASE_URL } from '../../../core/config/api.config';

@Injectable({
  providedIn: 'root',
})
export class UsersService implements IUsersService {
  private readonly authSessionService = inject(AuthSessionService);
  private readonly http = inject(HttpClient);

  getUsers(filters?: UserFilters): Observable<User[]> {
    let params = new HttpParams();


    if (filters?.search) {
      params = params.set('search', filters.search.trim());
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
