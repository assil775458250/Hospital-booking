import { Observable } from 'rxjs';
import {
  AdminProfile,
  ChangeAdminPasswordRequest,
  UpdateAdminProfileRequest,
} from '../../../models/admin/profile/admin-profile.model';

export interface IAdminProfileService {
  getProfile(id: number): Observable<AdminProfile>;
  updateProfile(id: number, data: UpdateAdminProfileRequest): Observable<AdminProfile>;
  changePassword(id: number, data: ChangeAdminPasswordRequest): Observable<void>;
}
