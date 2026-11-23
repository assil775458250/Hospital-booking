import { AuthUser, UserRole } from './auth-user.model';

export interface AuthAccountData {
  status?: string;
  createdAt?: string;
}

export interface LoginResponse {
  token: string;
  userId: number;
  role: UserRole;
  user: AuthUser;
  accountData?: AuthAccountData;
}
