import { Observable } from 'rxjs';
import {
  UpdateUserRequest,
  UpdateUserRoleRequest,
  UpdateUserStatusRequest,
  User,
  UserFilters,
} from './user.model';

export interface IUsersService {
  getUsers(filters?: UserFilters): Observable<User[]>;
  updateUser(id: number, data: UpdateUserRequest): Observable<void>;
  updateUserRole(id: number, data: UpdateUserRoleRequest): Observable<void>;
  updateUserStatus(id: number, data: UpdateUserStatusRequest): Observable<void>;
}
