import { inject, Injectable, signal } from '@angular/core';
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

  // حالات التحميل والعمليات كـ Signals لضمان الاستجابة الفورية في وضع Zoneless
  readonly isLoading = signal<boolean>(false);
  readonly isSavingProfile = signal<boolean>(false);
  readonly isChangingPassword = signal<boolean>(false);

  // رسائل التنبيه والنجاح
  readonly formError = signal<string>('');
  readonly successMessage = signal<string>('');

  // بيانات الملف الشخصي
  readonly profile = signal<AdminProfile | null>(null);

  // نماذج الإدخال المرتبطة بنموذج ثنائي الاتجاه
  profileForm: AdminProfileFormData = this.getEmptyProfileForm();
  passwordForm: PasswordFormData = this.getEmptyPasswordForm();

  constructor() {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading.set(true);
    this.formError.set('');

    const currentUser = this.authSessionService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      this.formError.set('لم يتم العثور على جلسة مستخدم نشطة أو لا يتوفر معرف المسؤول.');
      this.isLoading.set(false);
      return;
    }

    this.adminProfileService.getProfile(currentUser.id).subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.initializeProfileForm();
        this.isLoading.set(false);
      },
      error: (err) => {
        this.formError.set(this.extractErrorMessage(err, 'حدث خطأ أثناء تحميل بيانات الملف الشخصي.'));
        this.isLoading.set(false);
      },
    });
  }

  initializeProfileForm(): void {
    const currentProfile = this.profile();
    if (currentProfile) {
      this.profileForm = {
        fullName: currentProfile.fullName,
        email: currentProfile.email,
        phoneNumber: currentProfile.phoneNumber,
      };
    } else {
      this.profileForm = this.getEmptyProfileForm();
    }
  }

  saveProfile(): void {
    this.formError.set('');
    this.successMessage.set('');

    const currentProfile = this.profile();
    if (!currentProfile) {
      this.formError.set('بيانات الملف الشخصي غير متوفرة.');
      return;
    }

    const fullName = this.profileForm.fullName.trim();
    const email = this.profileForm.email.trim();
    const phoneNumber = this.profileForm.phoneNumber.trim();

    if (!fullName) {
      this.formError.set('يرجى إدخال الاسم الكامل.');
      return;
    }

    if (!email) {
      this.formError.set('يرجى إدخال البريد الإلكتروني.');
      return;
    }

    if (!phoneNumber) {
      this.formError.set('يرجى إدخال رقم الهاتف.');
      return;
    }

    const request: UpdateAdminProfileRequest = {
      fullName,
      email,
      phoneNumber,
    };

    this.isSavingProfile.set(true);

    this.adminProfileService.updateProfile(currentProfile.id, request).subscribe({
      next: () => {
        // تحديث كائن الملف الشخصي مباشرة
        const updated: AdminProfile = {
          ...currentProfile,
          fullName,
          email,
          phoneNumber,
        };
        this.profile.set(updated);

        // مزامنة جلسة المستخدم حتى يظهر الاسم الجديد فوراً في الشريط العلوي
        this.authSessionService.updateCurrentUser({
          fullName,
          email,
          phoneNumber,
        });

        this.isSavingProfile.set(false);
        this.triggerSuccess('تم تحديث البيانات الشخصية بنجاح.');
      },
      error: (err) => {
        this.formError.set(this.extractErrorMessage(err, 'حدث خطأ أثناء تحديث البيانات الشخصية.'));
        this.isSavingProfile.set(false);
      },
    });
  }

  changePassword(): void {
    this.formError.set('');
    this.successMessage.set('');

    const currentProfile = this.profile();
    if (!currentProfile) {
      this.formError.set('بيانات الملف الشخصي غير متوفرة.');
      return;
    }

    const currentPassword = this.passwordForm.currentPassword;
    const newPassword = this.passwordForm.newPassword;
    const confirmNewPassword = this.passwordForm.confirmNewPassword;

    if (!currentPassword || !currentPassword.trim()) {
      this.formError.set('يرجى إدخال كلمة المرور الحالية.');
      return;
    }

    if (!newPassword || !newPassword.trim()) {
      this.formError.set('يرجى إدخال كلمة المرور الجديدة.');
      return;
    }

    if (newPassword.length < 6) {
      this.formError.set('يجب ألا تقل كلمة المرور الجديدة عن 6 أحرف.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      this.formError.set('كلمة المرور الجديدة وتأكيدها غير متطابقين.');
      return;
    }

    const request: ChangeAdminPasswordRequest = {
      currentPassword,
      newPassword,
    };

    this.isChangingPassword.set(true);

    this.adminProfileService.changePassword(currentProfile.id, request).subscribe({
      next: () => {
        this.isChangingPassword.set(false);
        this.resetPasswordForm();
        this.triggerSuccess('تم تغيير كلمة المرور بنجاح.');
      },
      error: (err) => {
        this.formError.set(this.extractErrorMessage(err, 'حدث خطأ أثناء تغيير كلمة المرور.'));
        this.isChangingPassword.set(false);
      },
    });
  }

  resetPasswordForm(): void {
    this.passwordForm = this.getEmptyPasswordForm();
  }

  dismissSuccessMessage(): void {
    this.successMessage.set('');
  }

  dismissFormError(): void {
    this.formError.set('');
  }

  private triggerSuccess(msg: string): void {
    this.successMessage.set(msg);
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
