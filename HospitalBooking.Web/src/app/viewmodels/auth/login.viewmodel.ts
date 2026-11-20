import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth/auth.service';
import { AuthSessionService } from '../../core/auth/auth-session.service';
import { LoginRequest } from '../../models/auth/login-request.model';
import { LoginResponse } from '../../models/auth/login-response.model';
import { DEMO_MODE } from '../../core/config/api.config';

@Injectable()
export class LoginViewModel {
  private readonly authService = inject(AuthService);
  private readonly sessionService = inject(AuthSessionService);
  private readonly router = inject(Router);

  emailOrPhone = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  login(): void {
    this.errorMessage = '';

    const identifier = this.emailOrPhone.trim();
    const pwd = this.password;

    if (!identifier || !pwd) {
      this.errorMessage = 'يرجى إدخال البريد الإلكتروني أو رقم الهاتف وكلمة المرور.';
      return;
    }

    if (DEMO_MODE) {
      this.loginInDemoMode(identifier);
      return;
    }

    const credentials: LoginRequest = {
      emailOrPhone: identifier,
      password: pwd,
    };

    this.isLoading = true;

    this.authService.login(credentials).subscribe({
      next: (response: LoginResponse) => {
        this.isLoading = false;
        this.handleLoginSuccess(response);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.handleLoginError(err);
      },
    });
  }

  private loginInDemoMode(identifier: string): void {
  this.isLoading = false;

  const email = identifier.trim().toLowerCase();
  const isDoctor = email === 'doctor@demo.local';
  const isAdmin = email === 'admin@demo.local';

  if (!isDoctor && !isAdmin) {
    this.errorMessage = 'استخدم doctor@demo.local للطبيب أو admin@demo.local للمدير.';
    return;
  }

  const role = isDoctor ? 'Doctor' : 'Admin';
  const userId = isDoctor ? 101 : 1;

  const demoResponse: LoginResponse = {
    token: 'demo-token',
    userId,
    role,
    user: {
      id: userId,
      fullName: isDoctor ? 'طبيب تجريبي' : 'مدير تجريبي',
      email,
      phoneNumber: identifier,
      role,
      accountStatus: 'Active',
      createdAt: new Date().toISOString(),
    },
  };

  this.handleLoginSuccess(demoResponse);
}

  private handleLoginSuccess(response: LoginResponse): void {
    if (
      !response ||
      !response.token ||
      !response.user ||
      !response.role ||
      response.role !== response.user.role
    ) {
      this.errorMessage = 'استجابة تسجيل الدخول غير صالحة من الخادم.';
      return;
    }

    switch (response.role) {
      case 'Admin':
        this.sessionService.saveSession(response);
        if (!this.sessionService.isAuthenticated()) {
          this.errorMessage = 'فشل في حفظ بيانات الجلسة، يرجى المحاولة مرة أخرى.';
          return;
        }
        this.router.navigate(['/admin/dashboard']);
        break;

      case 'Doctor':
  this.sessionService.saveSession(response);

  if (!this.sessionService.isAuthenticated()) {
    this.errorMessage = 'فشل في حفظ بيانات الجلسة، يرجى المحاولة مرة أخرى.';
    return;
  }

  this.router.navigate(['/doctor/dashboard']);
  break;

      case 'Patient':
        // لا تحفظ الجلسة
        this.errorMessage = 'بوابة الويب مخصصة للمسؤول والطبيب فقط. يرجى استخدام تطبيق المريض على الهاتف.';
        break;

      default:
        this.errorMessage = 'نوع الحساب غير مصرح له بالدخول إلى هذه البوابة.';
        break;
    }
  }

  private handleLoginError(err: HttpErrorResponse): void {
    if (err.status === 400 || err.status === 401) {
      this.errorMessage =
        err.error?.message ||
        err.error?.title ||
        'بيانات تسجيل الدخول غير صحيحة، يرجى التأكد من صحة البريد/الهاتف وكلمة المرور.';
    } else if (err.status === 0) {
      this.errorMessage = 'تعذر الاتصال بالخادم، يرجى التحقق من اتصال الشبكة وتشغيل الـ Backend.';
    } else {
      this.errorMessage =
        err.error?.message ||
        'حدث خطأ غير متوقع أثناء تسجيل الدخول. يرجى المحاولة لاحقاً.';
    }
  }
}
