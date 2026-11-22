import { Injectable } from '@angular/core';
import { AuthUser, UserRole } from '../models/auth/auth-user.model';
import { LoginResponse } from '../models/auth/login-response.model';

interface StoredSessionData {
  token: string;
  role: UserRole;
  user: AuthUser;
}

@Injectable({
  providedIn: 'root',
})
export class AuthSessionService {
  private readonly storageKey = 'yusr_auth_session';

  saveSession(response: LoginResponse): void {
    if (!response || !response.token || !response.user) {
      return;
    }

    if (response.role !== response.user.role) {
      return;
    }

    const sessionData: StoredSessionData = {
      token: response.token,
      role: response.role,
      user: {
        id: response.user.id,
        fullName: response.user.fullName,
        email: response.user.email,
        phoneNumber: response.user.phoneNumber,
        role: response.user.role,
        accountStatus: response.user.accountStatus,
        createdAt: response.user.createdAt,
      },
    };

    try {
      sessionStorage.setItem(this.storageKey, JSON.stringify(sessionData));
    } catch {
      // التعامل مع أخطاء التخزين دون تعطيل التطبيق
    }
  }

  getToken(): string | null {
    const session = this.getSessionData();
    return session?.token ?? null;
  }

  getCurrentUser(): AuthUser | null {
    const session = this.getSessionData();
    return session?.user ?? null;
  }

  getCurrentRole(): UserRole | null {
    const session = this.getSessionData();
    return session?.role ?? null;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return Boolean(token && user);
  }

  clearSession(): void {
    try {
      sessionStorage.removeItem(this.storageKey);
    } catch {
      // التعامل مع أخطاء التخزين دون تعطيل التطبيق
    }
  }

  private getSessionData(): StoredSessionData | null {
    try {
      const rawData = sessionStorage.getItem(this.storageKey);
      if (!rawData) {
        return null;
      }

      const parsed = JSON.parse(rawData) as StoredSessionData;
      if (!parsed || !parsed.token || !parsed.user || !parsed.role) {
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  }
}
