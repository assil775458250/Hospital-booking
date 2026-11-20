import { UserRole } from './auth-user.model';

export interface CurrentUserResponse {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  accountStatus: string;
}
