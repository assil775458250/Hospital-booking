import { inject, Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { AuthSessionService } from '../../../core/auth/auth-session.service';
import {
  UpdateUserRequest,
  UpdateUserRoleRequest,
  UpdateUserStatusRequest,
  User,
  UserFilters,
  UserRole,
  UserStatus,
} from '../../../models/admin/users/user.model';
import { IUsersService } from './users.service.interface';

@Injectable({
  providedIn: 'root',
})
export class UsersService implements IUsersService {
  private readonly authSessionService = inject(AuthSessionService);
  private users: User[] = [
    // 1. مسؤولو النظام (Admins)
    {
      id: 1,
      fullName: 'عبد الله عبد العزيز السالم',
      email: 'admin@yusr.med',
      phoneNumber: '0500000001',
      role: 'Admin',
      accountStatus: 'Active',
      createdAt: '2025-01-01',
    },
    {
      id: 2,
      fullName: 'سلطان فهد المهيدب',
      email: 'sultan.admin@yusr.med',
      phoneNumber: '0500000002',
      role: 'Admin',
      accountStatus: 'Active',
      createdAt: '2025-06-15',
    },

    // 2. الأطباء (Doctors) - متوافقون مع معرفات وبيانات DoctorsService
    {
      id: 101,
      fullName: 'د. أحمد محمد العلي',
      email: 'ahmad.ali@yusr.med',
      phoneNumber: '0501234567',
      role: 'Doctor',
      accountStatus: 'Active',
      createdAt: '2025-08-10',
    },
    {
      id: 102,
      fullName: 'د. سارة عبد الله العمري',
      email: 'sara.omari@yusr.med',
      phoneNumber: '0559876543',
      role: 'Doctor',
      accountStatus: 'Active',
      createdAt: '2025-09-01',
    },
    {
      id: 103,
      fullName: 'د. خالد إبراهيم المنصور',
      email: 'khaled.mansour@yusr.med',
      phoneNumber: '0541122334',
      role: 'Doctor',
      accountStatus: 'Active',
      createdAt: '2025-10-15',
    },
    {
      id: 104,
      fullName: 'د. فاطمة حسن الزهراني',
      email: 'fatima.zahrani@yusr.med',
      phoneNumber: '0563344556',
      role: 'Doctor',
      accountStatus: 'Inactive',
      createdAt: '2025-11-20',
    },
    {
      id: 105,
      fullName: 'د. محمد سعيد القحطاني',
      email: 'mohammed.qahtani@yusr.med',
      phoneNumber: '0535566778',
      role: 'Doctor',
      accountStatus: 'Active',
      createdAt: '2025-12-05',
    },
    {
      id: 106,
      fullName: 'د. ريم ناصر العتيبي',
      email: 'reem.otaibi@yusr.med',
      phoneNumber: '0597788990',
      role: 'Doctor',
      accountStatus: 'Active',
      createdAt: '2026-01-08',
    },
    {
      id: 107,
      fullName: 'د. يوسف طارق الحربي',
      email: 'yousef.harbi@yusr.med',
      phoneNumber: '0502233445',
      role: 'Doctor',
      accountStatus: 'Inactive',
      createdAt: '2026-01-18',
    },
    {
      id: 108,
      fullName: 'د. ليلى عبد العزيز الشمري',
      email: 'layla.shammari@yusr.med',
      phoneNumber: '0554433221',
      role: 'Doctor',
      accountStatus: 'Active',
      createdAt: '2026-02-01',
    },

    // 3. المرضى (Patients) - متوافقون مع معرفات وبيانات PatientsService
    {
      id: 201,
      fullName: 'خالد عبد الرحمن التميمي',
      email: 'khaled.tamimi@example.com',
      phoneNumber: '0501122334',
      role: 'Patient',
      accountStatus: 'Active',
      createdAt: '2026-01-12',
    },
    {
      id: 202,
      fullName: 'نورة فهد الدوسري',
      email: 'noura.dosari@example.com',
      phoneNumber: '0552233445',
      role: 'Patient',
      accountStatus: 'Active',
      createdAt: '2026-01-20',
    },
    {
      id: 203,
      fullName: 'عبد العزيز ناصر السبيعي',
      email: 'abdulaziz.subaie@example.com',
      phoneNumber: '0543344556',
      role: 'Patient',
      accountStatus: 'Active',
      createdAt: '2026-02-05',
    },
    {
      id: 204,
      fullName: 'سارة علي الشهري',
      email: 'sara.shehri@example.com',
      phoneNumber: '0564455667',
      role: 'Patient',
      accountStatus: 'Active',
      createdAt: '2025-11-15',
    },
    {
      id: 205,
      fullName: 'فيصل محمد الرشيدي',
      email: 'faisal.rashidi@example.com',
      phoneNumber: '0535566778',
      role: 'Patient',
      accountStatus: 'Active',
      createdAt: '2026-02-18',
    },
    {
      id: 206,
      fullName: 'مريم أحمد الغامدي',
      email: 'maryam.ghamdi@example.com',
      phoneNumber: '0596677889',
      role: 'Patient',
      accountStatus: 'Active',
      createdAt: '2025-12-04',
    },
    {
      id: 207,
      fullName: 'طارق سليمان العبدلي',
      email: 'tariq.abdali@example.com',
      phoneNumber: '0507788990',
      role: 'Patient',
      accountStatus: 'Inactive',
      createdAt: '2026-03-01',
    },
    {
      id: 208,
      fullName: 'هدى إبراهيم القاسم',
      email: 'huda.qasim@example.com',
      phoneNumber: '0558899001',
      role: 'Patient',
      accountStatus: 'Active',
      createdAt: '2026-02-22',
    },
  ];

  getUsers(filters?: UserFilters): Observable<User[]> {
    let result = this.users;

    if (filters) {
      if (filters.search) {
        const term = filters.search.trim().toLowerCase();
        if (term) {
          result = result.filter(
            (user) =>
              user.fullName.toLowerCase().includes(term) ||
              user.email.toLowerCase().includes(term) ||
              user.phoneNumber.includes(term)
          );
        }
      }

      if (filters.role) {
        result = result.filter((user) => user.role === filters.role);
      }

      if (filters.status) {
        result = result.filter((user) => user.accountStatus === filters.status);
      }
    }

    const clonedUsers = result.map((user) => ({ ...user }));
    return of(clonedUsers);
  }

  updateUser(id: number, data: UpdateUserRequest): Observable<void> {
    const user = this.users.find((u) => u.id === id);
    if (!user) {
      return throwError(() => new Error('المستخدم المطلوب غير موجود.'));
    }

    const trimmedName = data.fullName !== undefined ? data.fullName.trim() : null;
    const trimmedEmail = data.email !== undefined ? data.email.trim() : null;
    const trimmedPhone = data.phoneNumber !== undefined ? data.phoneNumber.trim() : null;

    // 1. التحقق من البريد الإلكتروني فقط في حال تغييره فعليًا عن البريد الحالي للمستخدم
    let newEmailLower: string | null = null;
    if (trimmedEmail) {
      newEmailLower = trimmedEmail.toLowerCase();
      const isEmailChanged = newEmailLower !== user.email.toLowerCase();

      if (isEmailChanged) {
        const isEmailTaken = this.users.some(
          (u) => u.id !== id && u.email.toLowerCase() === newEmailLower
        );
        if (isEmailTaken) {
          return throwError(
            () => new Error('البريد الإلكتروني مستخدم بالفعل من قبل مستخدم آخر.')
          );
        }
      }
    }

    // 2. التحقق من رقم الهاتف فقط في حال تغييره فعليًا عن الرقم الحالي للمستخدم
    if (trimmedPhone) {
      const isPhoneChanged = trimmedPhone !== user.phoneNumber;

      if (isPhoneChanged) {
        const isPhoneTaken = this.users.some(
          (u) => u.id !== id && u.phoneNumber === trimmedPhone
        );
        if (isPhoneTaken) {
          return throwError(
            () => new Error('رقم الهاتف مستخدم بالفعل من قبل مستخدم آخر.')
          );
        }
      }
    }

    // 3. تطبيق التعديلات بعد اجتياز جميع الفحوصات (تجاهل القيم الفارغة وتخزين البريد بأحرف صغيرة)
    if (trimmedName) {
      user.fullName = trimmedName;
    }
    if (newEmailLower) {
      user.email = newEmailLower;
    }
    if (trimmedPhone) {
      user.phoneNumber = trimmedPhone;
    }

    return of(void 0);
  }

  updateUserRole(id: number, data: UpdateUserRoleRequest): Observable<void> {
    const user = this.users.find((u) => u.id === id);
    if (!user) {
      return throwError(() => new Error('المستخدم المطلوب غير موجود.'));
    }

    const validRoles: UserRole[] = ['Patient', 'Doctor', 'Admin'];
    if (!validRoles.includes(data.role)) {
      return throwError(() => new Error('الدور المحدد غير صالح.'));
    }

    user.role = data.role;
    return of(void 0);
  }

  updateUserStatus(id: number, data: UpdateUserStatusRequest): Observable<void> {
    const user = this.users.find((u) => u.id === id);
    if (!user) {
      return throwError(() => new Error('المستخدم المطلوب غير موجود.'));
    }

    const validStatuses: UserStatus[] = ['Active', 'Inactive'];
    if (!validStatuses.includes(data.accountStatus)) {
      return throwError(() => new Error('حالة الحساب المحددة غير صالحة.'));
    }

    const currentUser = this.authSessionService.getCurrentUser();
    if (
      data.accountStatus === 'Inactive' &&
      currentUser &&
      currentUser.id === id
    ) {
      return throwError(() => new Error('لا يمكن للمدير تعطيل حسابه الشخصي.'));
    }

    // ملاحظة: في وضع الـ Backend الفعلي يتم تحديث حالة الحساب عبر API مخصص لتغيير حالة الحساب دون حذف السجل.
    user.accountStatus = data.accountStatus;
    return of(void 0);
  }
}
