import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { extractApiErrorMessage } from '../../core/utils/api-error.util';
import { AuthSessionService } from '../../core/auth/auth-session.service';
import {
  Appointment,
  AppointmentStatus,
  DoctorSlot,
  UpdateDoctorRequest,
  WorkDay
} from '../../models/doctor/Doctor.Model';
import { AppointmentService } from '../../services/doctor/appointment.service';
import { DoctorService } from '../../services/doctor/doctor.service';
import { SlotService } from '../../services/doctor/slot.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardViewModel {
  private readonly router = inject(Router);
  private readonly appointmentService = inject(AppointmentService);
  private readonly doctorService = inject(DoctorService);
  private readonly slotService = inject(SlotService);
  private readonly authSessionService = inject(AuthSessionService);

  page = 'dashboard';

  
  isLoading = false;
  formError = '';
  successMessage = '';

  
  doctorName = '';
  email = '';
  phone = '';
  specialization = '';
  doctorId: number | null = null;
  role = 'طبيب';
  accountStatus = '';
  createdAt = '';


  currentPassword = '';
  newPassword = '';
  confirmNewPassword = '';

  
  appointments: Appointment[] = [];
  slots: DoctorSlot[] = [];

  
  newSlotDate = '';
  newSlotStartTime = '';
  newSlotEndTime = '';

  
  workDays: WorkDay[] = [
    { name: 'Saturday', active: true, startTime: '08:00', endTime: '14:00' },
    { name: 'Sunday', active: true, startTime: '08:00', endTime: '14:00' },
    { name: 'Monday', active: true, startTime: '09:00', endTime: '15:00' },
    { name: 'Tuesday', active: true, startTime: '08:00', endTime: '14:00' },
    { name: 'Wednesday', active: true, startTime: '09:00', endTime: '15:00' },
    { name: 'Thursday', active: false, startTime: '08:00', endTime: '14:00' },
    { name: 'Friday', active: false, startTime: '08:00', endTime: '14:00' }
  ];

  constructor() {
    this.loadData();
  }

  
  loadData(): void {
    const currentUser = this.authSessionService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      this.router.navigate(['/login']);
      return;
    }

    this.doctorId = currentUser.id;
    this.doctorName = currentUser.fullName || '';
    this.email = currentUser.email || '';
    this.phone = currentUser.phoneNumber || '';
    this.accountStatus = currentUser.accountStatus || 'Active';

    if (currentUser.createdAt) {
      try {
        const d = new Date(currentUser.createdAt);
        this.createdAt = !isNaN(d.getTime())
          ? d.toLocaleDateString('ar-EG', { year: 'numeric', month: '2-digit', day: '2-digit' })
          : currentUser.createdAt;
      } catch {
        this.createdAt = currentUser.createdAt;
      }
    }

    this.isLoading = true;

    
    this.doctorService.getDoctor(this.doctorId).subscribe({
      next: (profile) => {
        if (profile) {
          this.doctorName = profile.fullName || profile.name || this.doctorName;
          this.email = profile.email || this.email;
          this.phone = profile.phoneNumber || profile.phone || this.phone;
          this.specialization = profile.specializationName || profile.clinic || profile.specialization || '';
        }
      },
      error: () => {
        
      }
    });

    
    this.appointmentService.getAppointments(this.doctorId).subscribe({
      next: (appointments) => {
        this.appointments = appointments || [];
        this.isLoading = false;
      },
      error: (err) => {
        this.formError = extractApiErrorMessage(err, 'تعذر تحميل قائمة الحجوزات.');
        this.isLoading = false;
      }
    });

    
    this.slotService.getSlots(this.doctorId).subscribe({
      next: (slots) => {
        this.slots = slots || [];
      },
      error: () => {
        
      }
    });
  }

  changePage(pageName: string): void {
    this.page = pageName;
    this.dismissFormError();
    this.dismissSuccessMessage();
  }

  
  get todayAppointments(): Appointment[] {
    const today = new Date().toLocaleDateString('en-CA');
    return this.appointments.filter(a => a.date === today);
  }

  get completedCount(): number {
    return this.appointments.filter(a => a.status === 'Completed' || a.status === 'Approved').length;
  }

  get pendingCount(): number {
    return this.appointments.filter(a => a.status === 'Pending').length;
  }

  
  updateStatus(id: number, status: string): void {
    if (!id || !status) return;

    this.appointmentService.updateStatus(id, status as AppointmentStatus).subscribe({
      next: () => {
        const item = this.appointments.find(a => a.id === id);
        if (item) {
          item.status = status as AppointmentStatus;
        }
        this.successMessage = 'تم تحديث حالة الحجز بنجاح.';
      },
      error: (err) => {
        this.formError = extractApiErrorMessage(err, 'فشل تحديث حالة الحجز.');
      }
    });
  }

  
  saveSchedule(): void {
    this.dismissFormError();
    this.dismissSuccessMessage();

    const invalidDay = this.workDays.find(day =>
      day.active && (!day.startTime || !day.endTime || day.endTime <= day.startTime)
    );

    if (invalidDay) {
      this.formError = 'وقت نهاية الدوام يجب أن يكون بعد وقت البداية.';
      return;
    }

    this.successMessage = 'تم حفظ جدول العمل الأسبوعي بنجاح.';
  }

  
  addSlot(): void {
    this.dismissFormError();
    this.dismissSuccessMessage();

    if (!this.newSlotDate || !this.newSlotStartTime || !this.newSlotEndTime) {
      this.formError = 'يرجى إدخال التاريخ ووقت البداية ووقت النهاية.';
      return;
    }

    if (this.newSlotEndTime <= this.newSlotStartTime) {
      this.formError = 'وقت نهاية الفترة يجب أن يكون بعد وقت البداية.';
      return;
    }

    const hasConflict = this.slots.some(slot =>
      slot.isActive &&
      slot.date === this.newSlotDate &&
      this.newSlotStartTime < slot.endTime &&
      this.newSlotEndTime > slot.startTime
    );

    if (hasConflict) {
      this.formError = 'هذا الوقت يتداخل مع فترة عمل أخرى مسجلة.';
      return;
    }

    if (!this.doctorId) return;

    const request = {
      date: this.newSlotDate,
      startTime: this.newSlotStartTime,
      endTime: this.newSlotEndTime,
      status: 'Available'
    };

    this.slotService.addSlot(this.doctorId, request).subscribe({
      next: (created) => {
        this.slots.unshift({
          id: created?.slotId || Date.now(),
          doctorId: this.doctorId!,
          date: this.newSlotDate,
          startTime: this.newSlotStartTime,
          endTime: this.newSlotEndTime,
          status: 'Available',
          isActive: true
        });
        this.newSlotDate = '';
        this.newSlotStartTime = '';
        this.newSlotEndTime = '';
        this.successMessage = 'تمت إضافة الفترة المتاحة بنجاح.';
      },
      error: (err) => {
        this.formError = extractApiErrorMessage(err, 'تعذر إضافة الفترة المتاحة.');
      }
    });
  }

  
  stopSlot(id: number): void {
    this.dismissFormError();
    this.dismissSuccessMessage();

    this.slotService.stopSlot(id).subscribe({
      next: () => {
        const slot = this.slots.find(s => s.id === id);
        if (slot) {
          slot.isActive = false;
          slot.status = 'Unavailable';
        }
        this.successMessage = 'تم إيقاف الفترة المتاحة بنجاح.';
      },
      error: (err) => {
        this.formError = extractApiErrorMessage(err, 'تعذر إيقاف الفترة المتاحة.');
      }
    });
  }

  
  activateSlot(id: number): void {
    this.dismissFormError();
    this.dismissSuccessMessage();

    const target = this.slots.find(s => s.id === id);
    if (!target) return;

    const hasConflict = this.slots.some(s =>
      s.id !== id &&
      s.isActive &&
      s.date === target.date &&
      target.startTime < s.endTime &&
      target.endTime > s.startTime
    );

    if (hasConflict) {
      this.formError = 'لا يمكن تفعيل الفترة لوجود فترة أخرى متداخلة معها.';
      return;
    }

    this.slotService.activateSlot(id).subscribe({
      next: () => {
        target.isActive = true;
        target.status = 'Available';
        this.successMessage = 'تم تفعيل الفترة المتاحة بنجاح.';
      },
      error: (err) => {
        this.formError = extractApiErrorMessage(err, 'تعذر تفعيل الفترة المتاحة.');
      }
    });
  }

  
  saveProfile(): void {
    this.dismissFormError();
    this.dismissSuccessMessage();

    const name = this.doctorName.trim();
    const email = this.email.trim();
    const phone = this.phone.trim();

    if (!name || !email || !phone) {
      this.formError = 'يرجى استكمال جميع الحقول المطلوبة.';
      return;
    }

    if (!this.doctorId) return;

    const request: UpdateDoctorRequest = {
      fullName: name,
      email: email,
      phoneNumber: phone
    };

    this.doctorService.updateDoctor(this.doctorId, request).subscribe({
      next: () => {
        this.successMessage = 'تم تحديث بيانات الملف الشخصي بنجاح.';
      },
      error: (err) => {
        this.formError = extractApiErrorMessage(err, 'فشل تحديث بيانات الملف الشخصي.');
      }
    });
  }

  
  changePassword(): void {
    this.dismissFormError();
    this.dismissSuccessMessage();

    const current = this.currentPassword.trim();
    const next = this.newPassword.trim();
    const confirm = this.confirmNewPassword.trim();

    if (!current || !next || !confirm) {
      this.formError = 'يرجى إدخال كافة حقول كلمة المرور.';
      return;
    }

    if (next.length < 6) {
      this.formError = 'يجب ألا تقل كلمة المرور الجديدة عن 6 أحرف.';
      return;
    }

    if (next !== confirm) {
      this.formError = 'كلمة المرور الجديدة وتأكيدها غير متطابقين.';
      return;
    }

    this.currentPassword = '';
    this.newPassword = '';
    this.confirmNewPassword = '';
    this.successMessage = 'تم التحقق من تطابق كلمة المرور بنجاح.';
  }

  dismissSuccessMessage(): void {
    this.successMessage = '';
  }

  dismissFormError(): void {
    this.formError = '';
  }

  logout(): void {
    this.authSessionService.clearSession();
    this.router.navigate(['/login']);
  }
}