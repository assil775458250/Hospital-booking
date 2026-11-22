import { inject, Injectable } from '@angular/core';
import { Observable, of, switchMap, throwError } from 'rxjs';
import {
  AdminProfile,
  ChangeAdminPasswordRequest,
  UpdateAdminProfileRequest,
} from '../../../models/admin/profile/admin-profile.model';
import { UsersService } from '../../../features/admin/users/users.service';
import { IAdminProfileService } from './admin-profile.service.interface';

@Injectable({
  providedIn: 'root',
})
export class AdminProfileService implements IAdminProfileService {
  private readonly usersService = inject(UsersService);

  getProfile(id: number): Observable<AdminProfile> {
    return this.usersService.getUsers().pipe(
      switchMap((users) => {
        const user = users.find((u) => u.id === id);
        if (!user) {
          return throwError(() => new Error('الملف الشخصي للمسؤول غير موجود.'));
        }

        if (user.role !== 'Admin') {
          return throwError(() => new Error('المستخدم المحدد ليس مسؤول نظام.'));
        }

        const profile: AdminProfile = {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          accountStatus: user.accountStatus,
          createdAt: user.createdAt,
        };

        return of(profile);
      })
    );
  }

  updateProfile(id: number, data: UpdateAdminProfileRequest): Observable<AdminProfile> {
    return this.getProfile(id).pipe(
      switchMap(() => this.usersService.updateUser(id, data)),
      switchMap(() => this.getProfile(id))
    );
  }

  changePassword(id: number, data: ChangeAdminPasswordRequest): Observable<void> {
    return this.getProfile(id).pipe(
      switchMap(() => {
        if (!data?.currentPassword || !data.currentPassword.trim()) {
          return throwError(() => new Error('يرجى إدخال كلمة المرور الحالية.'));
        }

        if (!data?.newPassword || !data.newPassword.trim() || data.newPassword.length < 6) {
          return throwError(
            () => new Error('يجب ألا تقل كلمة المرور الجديدة عن 6 أحرف.')
          );
        }

        // ملاحظة: التحقق الفعلي من صحة كلمة المرور الحالية وتشفير وتحديث كلمة المرور الجديدة
        // سيتم تنفيذه بالكامل عبر الـ Backend (PUT /api/users/{id}/password) عند الربط الفعلي؛
        // فالخدمة التجريبية الحالية (Demo Mode) لا تحتوي على مصدر موثوق لكلمة المرور ولا تخزنها لأسباب أمنية.
        return of(void 0);
      })
    );
  }
}
