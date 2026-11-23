import { inject, Injectable } from '@angular/core';
import { AuthSessionService } from '../../../core/auth/auth-session.service';
import {
  AdminProfile,
  ChangeAdminPasswordRequest,
  UpdateAdminProfileRequest,
} from '../../../models/admin/profile/admin-profile.model';
import { AdminProfileService } from '../../../services/admin/profile/admin-profile.service';

export interface AdminProfileFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
}

export interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

@Injectable()
export class AdminProfileViewModel {
  private readonly adminProfileService = inject(AdminProfileService);
  private readonly authSessionService = inject(AuthSessionService);

  // حالات التحميل والعمليات
  isLoading = false;
  isSavingProfile = false;
  isChangingPassword = false;

  // رسائل التنبيه والنجاح
  formError = '';
  successMessage = '';

  // بيانات الملف الشخصي
  profile: AdminProfile | null = null;

  // نماذج الإدخال
  profileForm: AdminProfileFormData = this.getEmptyProfileForm();
  passwordForm: PasswordFormData = this.getEmptyPasswordForm();

  constructor() {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.formError = '';

    const currentUser = this.authSessionService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      this.formError = 'لم يتم العثور على جلسة مستخدم نشطة أو لا يتوفر معرف المسؤول.';
      this.isLoading = false;
      return;
    }

    this.adminProfileService.getProfile(currentUser.id).subscribe({
      next: (profile) => {
        this.profile = profile;
        this.initializeProfileForm();
        this.isLoading = false;
      },
      error: (err) => {
        this.formError = this.extractErrorMessage(err, 'حدث خطأ أثناء تحميل بيانات الملف الشخصي.');
        this.isLoading = false;
      },
    });
  }

  initializeProfileForm(): void {
    if (this.profile) {
      this.profileForm = {
        fullName: this.profile.fullName,
        email: this.profile.email,
        phoneNumber: this.profile.phoneNumber,
      };
    } else {
      this.profileForm = this.getEmptyProfileForm();
    }
  }

  saveProfile(): void {
    this.formError = '';
    this.successMessage = '';

    if (!this.profile) {
      this.formError = 'بيانات الملف الشخصي غير متوفرة.';
      return;
    }

    const fullName = this.profileForm.fullName.trim();
    const email = this.profileForm.email.trim();
    const phoneNumber = this.profileForm.phoneNumber.trim();

    if (!fullName) {
      this.formError = 'يرجى إدخال الاسم الكامل.';
      return;
    }

    if (!email) {
      this.formError = 'يرجى إدخال البريد الإلكتروني.';
      return;
    }

    if (!phoneNumber) {
      this.formError = 'يرجى إدخال رقم الهاتف.';
      return;
    }

    const request: UpdateAdminProfileRequest = {
      fullName,
      email,
      phoneNumber,
    };

    this.isSavingProfile = true;

    this.adminProfileService.updateProfile(this.profile.id, request).subscribe({
      next: () => {
        this.loadProfile();
        this.isSavingProfile = false;
        this.triggerSuccess('تم تحديث البيانات الشخصية بنجاح.');
      },
      error: (err) => {
        this.formError = this.extractErrorMessage(err, 'حدث خطأ أثناء تحديث البيانات الشخصية.');
        this.isSavingProfile = false;
      },
    });
  }

  changePassword(): void {
    this.formError = '';
    this.successMessage = '';

    if (!this.profile) {
      this.formError = 'بيانات الملف الشخصي غير متوفرة.';
      return;
    }

    const currentPassword = this.passwordForm.currentPassword;
    const newPassword = this.passwordForm.newPassword;
    const confirmNewPassword = this.passwordForm.confirmNewPassword;

    if (!currentPassword || !currentPassword.trim()) {
      this.formError = 'يرجى إدخال كلمة المرور الحالية.';
      return;
    }

    if (!newPassword || !newPassword.trim()) {
      this.formError = 'يرجى إدخال كلمة المرور الجديدة.';
      return;
    }

    if (newPassword.length < 6) {
      this.formError = 'يجب ألا تقل كلمة المرور الجديدة عن 6 أحرف.';
      return;
    }

    if (newPassword !== confirmNewPassword) {
      this.formError = 'كلمة المرور الجديدة وتأكيدها غير متطابقين.';
      return;
    }

    const request: ChangeAdminPasswordRequest = {
      currentPassword,
      newPassword,
    };

    this.isChangingPassword = true;

    this.adminProfileService.changePassword(this.profile.id, request).subscribe({
      next: () => {
        this.isChangingPassword = false;
        this.resetPasswordForm();
        this.triggerSuccess('تم تغيير كلمة المرور بنجاح.');
      },
      error: (err) => {
        this.formError = this.extractErrorMessage(err, 'حدث خطأ أثناء تغيير كلمة المرور.');
        this.isChangingPassword = false;
      },
    });
  }

  resetPasswordForm(): void {
    this.passwordForm = this.getEmptyPasswordForm();
  }

  dismissSuccessMessage(): void {
    this.successMessage = '';
  }

  dismissFormError(): void {
    this.formError = '';
  }

  private triggerSuccess(msg: string): void {
    this.successMessage = msg;
  }

  private getEmptyProfileForm(): AdminProfileFormData {
    return {
      fullName: '',
      email: '',
      phoneNumber: '',
    };
  }

  private getEmptyPasswordForm(): PasswordFormData {
    return {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    };
  }
  private extractErrorMessage(err: any, fallback: string): string {
  if (typeof err?.error === 'string' && err.error.trim()) {
    return err.error.trim();
  }
  if (err?.error?.message && typeof err.error.message === 'string') {
    return err.error.message;
  }
  return err?.message || fallback;
}
}
