import { inject, Injectable } from '@angular/core';
import { AuthSessionService } from '../../../core/auth/auth-session.service';
import {
  UpdateUserRequest,
  UpdateUserRoleRequest,
  UpdateUserStatusRequest,
  User,
  UserRole,
  UserStatus,
} from '../../../models/admin/users/user.model';
import { UsersService } from '../../../services/admin/users/users.service';

export interface UserFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
}

@Injectable()
export class UsersViewModel {
  private readonly usersService = inject(UsersService);
  private readonly authSessionService = inject(AuthSessionService);

  // حالات التحميل والرسائل
  isLoading = false;
  formError = '';
  successMessage = '';

  // فلاتر البحث والتصفية
  searchTerm = '';
  selectedRole: UserRole | '' = '';
  selectedStatus: UserStatus | '' = '';

  // بيانات المستخدمين
  users: User[] = [];
  filteredUsers: User[] = [];

  // حالة نافذة تعديل بيانات المستخدم
  isModalOpen = false;
  isEditMode = false;
  editingUserId: number | null = null;
  userForm: UserFormData = this.getEmptyForm();

  constructor() {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.formError = '';

    this.usersService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        this.formError = err?.message || 'حدث خطأ أثناء تحميل بيانات المستخدمين.';
        this.isLoading = false;
      },
    });
  }

  applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();

    this.filteredUsers = this.users.filter((user) => {
      const matchesSearch =
        !term ||
        user.fullName.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.phoneNumber.includes(term);

      const matchesRole = !this.selectedRole || user.role === this.selectedRole;

      const matchesStatus =
        !this.selectedStatus || user.accountStatus === this.selectedStatus;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedRole = '';
    this.selectedStatus = '';
    this.applyFilters();
  }

  openEditModal(user: User): void {
    this.userForm = {
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
    };
    this.isEditMode = true;
    this.editingUserId = user.id;
    this.formError = '';
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.formError = '';
    this.editingUserId = null;
    this.userForm = this.getEmptyForm();
  }

  saveUser(): void {
    this.formError = '';

    if (this.editingUserId === null) {
      return;
    }

    const fullName = this.userForm.fullName.trim();
    const email = this.userForm.email.trim();
    const phoneNumber = this.userForm.phoneNumber.trim();

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

    const request: UpdateUserRequest = {
      fullName,
      email,
      phoneNumber,
    };

    this.usersService.updateUser(this.editingUserId, request).subscribe({
      next: () => {
        this.triggerSuccess(`تم تحديث بيانات المستخدم (${fullName}) بنجاح.`);
        this.loadUsers();
        this.closeModal();
      },
      error: (err) => {
        this.formError = err?.message || 'حدث خطأ أثناء تحديث بيانات المستخدم.';
      },
    });
  }

  updateUserRole(id: number, newRole: UserRole): void {
    this.formError = '';

    const user = this.users.find((u) => u.id === id);
    if (!user) {
      this.formError = 'المستخدم المطلوب غير موجود.';
      return;
    }

    if (user.role === newRole) {
      return;
    }

    const request: UpdateUserRoleRequest = { role: newRole };

    this.usersService.updateUserRole(id, request).subscribe({
      next: () => {
        const roleLabel = this.getRoleLabel(newRole);
        this.triggerSuccess(
          `تم تغيير دور المستخدم (${user.fullName}) إلى "${roleLabel}" بنجاح.`
        );
        this.loadUsers();
      },
      error: (err) => {
        this.formError = err?.message || 'حدث خطأ أثناء تغيير دور المستخدم.';
      },
    });
  }

  updateUserStatus(id: number, newStatus: UserStatus): void {
    this.formError = '';

    const user = this.users.find((u) => u.id === id);
    if (!user) {
      this.formError = 'المستخدم المطلوب غير موجود.';
      return;
    }

    if (user.accountStatus === newStatus) {
      return;
    }

    const currentUser = this.authSessionService.getCurrentUser();
    if (newStatus === 'Inactive' && currentUser && currentUser.id === id) {
      this.formError = 'لا يمكن للمدير تعطيل حسابه الشخصي.';
      return;
    }

    const request: UpdateUserStatusRequest = { accountStatus: newStatus };

    this.usersService.updateUserStatus(id, request).subscribe({
      next: () => {
        const actionLabel = newStatus === 'Active' ? 'تفعيل' : 'تعطيل';
        this.triggerSuccess(
          `تم ${actionLabel} حساب المستخدم (${user.fullName}) بنجاح.`
        );
        this.loadUsers();
      },
      error: (err) => {
        this.formError = err?.message || 'حدث خطأ أثناء تحديث حالة حساب المستخدم.';
      },
    });
  }

  isCurrentUser(id: number): boolean {
    const currentUser = this.authSessionService.getCurrentUser();
    return Boolean(currentUser && currentUser.id === id);
  }

  getRoleLabel(role: UserRole): string {
    switch (role) {
      case 'Admin':
        return 'مسؤول';
      case 'Doctor':
        return 'طبيب';
      case 'Patient':
        return 'مريض';
      default:
        return role;
    }
  }

  getStatusLabel(status: UserStatus): string {
    switch (status) {
      case 'Active':
        return 'نشط';
      case 'Inactive':
        return 'غير نشط';
      default:
        return status;
    }
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

  private getEmptyForm(): UserFormData {
    return {
      fullName: '',
      email: '',
      phoneNumber: '',
    };
  }

  get totalCount(): number {
    return this.users.length;
  }

  get filteredCount(): number {
    return this.filteredUsers.length;
  }
}
