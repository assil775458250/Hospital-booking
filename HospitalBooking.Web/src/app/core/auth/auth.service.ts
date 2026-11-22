import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { LoginRequest } from '../models/auth/login-request.model';
import { LoginResponse } from '../models/auth/login-response.model';
import { CurrentUserResponse } from '../models/auth/current-user-response.model';
import { IAuthService } from './auth.service.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService implements IAuthService {
  private readonly http = inject(HttpClient);


  // Observable = > تستخدم مع  async

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_BASE_URL}/api/auth/login`, credentials);
  }

  getCurrentUser(): Observable<CurrentUserResponse> {
    return this.http.get<CurrentUserResponse>(`${API_BASE_URL}/api/auth/me`);
  }
}
