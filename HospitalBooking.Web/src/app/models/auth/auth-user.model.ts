export type UserRole = 'Admin' | 'Doctor' | 'Patient' | 'None';

export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  accountStatus: string;
  createdAt: string;
}
