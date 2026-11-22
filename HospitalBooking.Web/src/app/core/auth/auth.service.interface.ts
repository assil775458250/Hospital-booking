import { Observable } from 'rxjs';
import { LoginRequest } from '../models/auth/login-request.model';
import { LoginResponse } from '../models/auth/login-response.model';
import { CurrentUserResponse } from '../models/auth/current-user-response.model';

export interface IAuthService {
  login(credentials: LoginRequest): Observable<LoginResponse>;
  getCurrentUser(): Observable<CurrentUserResponse>;
}
