import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';

import {
  Appointment,
  DoctorSlot,
  WorkDay
} from '../../models/doctor/Doctor.Model';

import { AppointmentService } from '../../services/doctor/appointment.service';
import { DoctorService } from '../../services/doctor/doctor.service';
import { SlotService } from '../../services/doctor/slot.service';
import { AuthSessionService } from '../../core/auth/auth-session.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardViewModel {
  private readonly authSessionService = inject(AuthSessionService);

  page = 'dashboard';

  doctorName = '';
  email = '';
  phone = '';
  specialization = '';

  doctorId: number | null = null;
  role = 'طبيب';
  accountStatus = '';
  createdAt = '';

  formError = '';
  successMessage = '';

  currentPassword = '';
  newPassword = '';
  confirmNewPassword = '';

  appointments: Appointment[] = [];
  slots: DoctorSlot[] = [];

  newSlotDate = '';
  newSlotStartTime = '';
  newSlotEndTime = '';

  workDays: WorkDay[] = [
    {
      name: 'Saturday',
      active: true,
      startTime: '08:00',
      endTime: '14:00'
    },
    {
      name: 'Sunday',
      active: true,
      startTime: '08:00',
      endTime: '14:00'
    },
    {
      name: 'Monday',
      active: true,
      startTime: '09:00',
      endTime: '15:00'
    },
    {
      name: 'Tuesday',
      active: true,
      startTime: '08:00',
      endTime: '14:00'
    },
    {
      name: 'Wednesday',
      active: true,
      startTime: '09:00',
      endTime: '15:00'
    },
    {
      name: 'Thursday',
      active: false,
      startTime: '08:00',
      endTime: '14:00'
    },
    {
      name: 'Friday',
      active: false,
      startTime: '08:00',
      endTime: '14:00'
    }
  ];

  constructor(
    private router: Router,
    private appointmentService: AppointmentService,
    private doctorService: DoctorService,
    private slotService: SlotService
  ) {
    this.loadData();
  }

  // جلب البيانات
  loadData(): void {

    const doctor = this.doctorService.getDoctor();

    this.doctorName = doctor.name;
    this.email = doctor.email;
    this.phone = doctor.phone;
    this.specialization = doctor.specialization;

    const currentUser = this.authSessionService.getCurrentUser();
    if (currentUser) {
      this.doctorId = currentUser.id || null;
      this.accountStatus = currentUser.accountStatus || '';
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
    }

    this.appointments =
      this.appointmentService.getAppointments();

    this.slots = this.slotService.getSlots();

    this.loadSchedule();
  }

  // التنقل بين أقسام لوحة التحكم
  changePage(pageName: string): void {
    this.page = pageName;
  }

  // مواعيد اليوم
  get todayAppointments(): Appointment[] {

    const today = new Date();
    const year = today.getFullYear();

    const month = String(
      today.getMonth() + 1
    ).padStart(2, '0');

    const day = String(
      today.getDate()
    ).padStart(2, '0');

    const todayDate = `${year}-${month}-${day}`;

    return this.appointments.filter(
      appointment => appointment.date === todayDate
    );
  }

  // عدد المواعيد المكتملة
  get completedCount(): number {
    return this.appointments.filter(
      appointment => appointment.status === 'Completed'
    ).length;
  }

  // عدد الحجوزات المنتظرة
  get pendingCount(): number {
    return this.appointments.filter(
      appointment => appointment.status === 'Pending'
    ).length;
  }

  // تغيير حالة الحجز
  updateStatus(id: number, status: string): void {

    if (status !== 'Completed' &&
        status !== 'Cancelled') {
      return;
    }

    this.appointmentService.updateStatus(id, status);

    this.appointments =
      this.appointmentService.getAppointments();
  }

  // حفظ جدول العمل
  saveSchedule(): void {

    const invalidDay = this.workDays.find(day =>
      day.active &&
      (
        !day.startTime ||
        !day.endTime ||
        day.endTime <= day.startTime
      )
    );

    if (invalidDay) {
      alert('وقت نهاية الدوام يجب أن يكون بعد وقت البداية');
      return;
    }

    localStorage.setItem(
      'doctorWorkSchedule',
      JSON.stringify(this.workDays)
    );

    alert('تم حفظ جدول العمل بنجاح');
  }

  // استرجاع جدول العمل المحفوظ
  loadSchedule(): void {

    const savedSchedule =
      localStorage.getItem('doctorWorkSchedule');

    if (savedSchedule) {

      try {
        const days = JSON.parse(savedSchedule);

        if (
          Array.isArray(days) &&
          days.length === 7 &&
          days.every(day =>
            typeof day.name === 'string' &&
            typeof day.active === 'boolean' &&
            typeof day.startTime === 'string' &&
            typeof day.endTime === 'string'
          )
        ) {
          this.workDays = days;
        }
      } catch {
        // نستخدم الجدول الافتراضي إذا كانت البيانات غير صالحة
      }

    }
  }

  // إضافة وقت متاح جديد
  addSlot(): void {

    if (
      !this.newSlotDate ||
      !this.newSlotStartTime ||
      !this.newSlotEndTime
    ) {
      alert('يرجى إدخال التاريخ ووقت البداية والنهاية');
      return;
    }

    if (this.newSlotEndTime <= this.newSlotStartTime) {
      alert('وقت النهاية يجب أن يكون بعد وقت البداية');
      return;
    }

    // منع تداخل الأوقات في نفس التاريخ
    const hasConflict = this.slots.some(slot =>
      slot.isActive &&
      slot.date === this.newSlotDate &&
      this.newSlotStartTime < slot.endTime &&
      this.newSlotEndTime > slot.startTime
    );

    if (hasConflict) {
      alert('هذا الوقت يتداخل مع وقت متاح آخر');
      return;
    }

    const newSlot: DoctorSlot = {
      id: Date.now(),
      date: this.newSlotDate,
      startTime: this.newSlotStartTime,
      endTime: this.newSlotEndTime,
      isActive: true
    };

    this.slotService.addSlot(newSlot);

    this.slots = this.slotService.getSlots();

    this.newSlotDate = '';
    this.newSlotStartTime = '';
    this.newSlotEndTime = '';

    alert('تمت إضافة الوقت المتاح بنجاح');
  }

  // إيقاف وقت متاح
  stopSlot(id: number): void {

    this.slotService.stopSlot(id);

    this.slots = this.slotService.getSlots();
  }

  // إعادة تفعيل وقت متوقف
  activateSlot(id: number): void {

    const slot = this.slots.find(s => s.id === id);

    if (!slot) {
      return;
    }

    const hasConflict = this.slots.some(s =>
      s.id !== id &&
      s.isActive &&
      s.date === slot.date &&
      slot.startTime < s.endTime &&
      slot.endTime > s.startTime
    );

    if (hasConflict) {
      alert('لا يمكن التفعيل لوجود وقت آخر متداخل');
      return;
    }

    this.slotService.activateSlot(id);

    this.slots = this.slotService.getSlots();
  }

  // حفظ بيانات الطبيب
  saveProfile(): void {
    this.formError = '';
    this.successMessage = '';

    const name = this.doctorName.trim();
    const email = this.email.trim();
    const phone = this.phone.trim();
    const spec = this.specialization.trim();

    if (!name) {
      this.formError = 'يرجى إدخال الاسم الكامل.';
      return;
    }

    if (!email) {
      this.formError = 'يرجى إدخال البريد الإلكتروني.';
      return;
    }

    if (!phone) {
      this.formError = 'يرجى إدخال رقم الهاتف.';
      return;
    }

    if (!spec) {
      this.formError = 'يرجى إدخال التخصص الطبي.';
      return;
    }

    this.doctorService.updateDoctor({
      name,
      email,
      phone,
      specialization: spec
    });

    this.successMessage = 'تم حفظ بيانات الطبيب بنجاح.';
  }

  // تغيير كلمة المرور بنمط التحقق التجريبي
  changePassword(): void {
    this.formError = '';
    this.successMessage = '';

    const current = this.currentPassword.trim();
    const next = this.newPassword.trim();
    const confirm = this.confirmNewPassword.trim();

    if (!current) {
      this.formError = 'يرجى إدخال كلمة المرور الحالية.';
      return;
    }

    if (!next) {
      this.formError = 'يرجى إدخال كلمة المرور الجديدة.';
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

    this.successMessage =
      'تم التحقق من صحة المدخلات بنجاح. سيتم تطبيق تغيير كلمة المرور فعليًا عند ربط الـ Backend.';
  }

  dismissSuccessMessage(): void {
    this.successMessage = '';
  }

  dismissFormError(): void {
    this.formError = '';
  }

  // تسجيل الخروج
  logout(): void {
    this.router.navigate(['/login']);
  }

}
