import { UserRole, UserStatus } from '../users/user.model';

export interface AdminProfile {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  accountStatus: UserStatus;
  createdAt: string;
}

export interface UpdateAdminProfileRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
}

export interface ChangeAdminPasswordRequest {
  currentPassword: string;
  newPassword: string;
}
