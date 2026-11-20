export type UserRole = 'Patient' | 'Doctor' | 'Admin';

export type UserStatus = 'Active' | 'Inactive';

export interface User {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  accountStatus: UserStatus;
  createdAt: string;
}

export interface UserFilters {
  search?: string;
  role?: UserRole | '';
  status?: UserStatus | '';
}

export interface UpdateUserRequest {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
}

export interface UpdateUserRoleRequest {
  role: UserRole;
}

export interface UpdateUserStatusRequest {
  accountStatus: UserStatus;
}
