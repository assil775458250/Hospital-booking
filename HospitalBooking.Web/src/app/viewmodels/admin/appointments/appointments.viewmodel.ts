import { computed, inject, Injectable, signal } from '@angular/core';
import { extractApiErrorMessage } from '../../../core/utils/api-error.util';
import {
  Appointment,
  AppointmentStatus,
  UpdateAppointmentStatusRequest,
} from '../../../models/admin/appointments/appointment.model';
import { AppointmentsService } from '../../../services/admin/appointments/appointments.service';

@Injectable()
export class AppointmentsViewModel {
  private readonly appointmentsService = inject(AppointmentsService);

  // مؤقت الإغلاق التلقائي لرسائل النجاح
  private successDismissTimer: ReturnType<typeof setTimeout> | null = null;

  // بيانات المواعيد التفاعلية
  readonly appointments = signal<Appointment[]>([]);

  // فلاتر البحث والتصفية التفاعلية
  readonly searchTerm = signal<string>('');
  readonly selectedDoctorId = signal<number | null>(null);
  readonly selectedStatus = signal<AppointmentStatus | ''>('');
  readonly selectedDate = signal<string>('');

  // حالات التحميل والعمليات
  readonly isLoading = signal<boolean>(true);
  readonly isUpdatingStatus = signal<boolean>(false);
  readonly errorMessage = signal<string>('');
  readonly successMessage = signal<string>('');

  // حالة نافذة تفاصيل الموعد
  readonly isDetailsModalOpen = signal<boolean>(false);
  readonly selectedAppointment = signal<Appointment | null>(null);

  // الحسابات والإحصائيات التفاعلية (Computed Signals)
  readonly filteredAppointments = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const docId = this.selectedDoctorId();
    const status = this.selectedStatus();
    const filterDate = this.selectedDate() ? this.selectedDate().split('T')[0] : '';

    return this.appointments().filter((appointment) => {
      const matchesSearch =
        !term ||
        appointment.appointmentNumber.toLowerCase().includes(term) ||
        appointment.patientName.toLowerCase().includes(term) ||
        appointment.patientPhone.includes(term) ||
        appointment.doctorName.toLowerCase().includes(term);

      const matchesDoctor =
        docId === null ||
        docId === undefined ||
        appointment.doctorId === docId;

      const matchesStatus =
        !status ||
        appointment.status === status;

      const matchesDate =
        !filterDate ||
        (appointment.appointmentDate && appointment.appointmentDate.split('T')[0] === filterDate);

      return matchesSearch && matchesDoctor && matchesStatus && matchesDate;
    });
  });

  readonly totalCount = computed(() => this.appointments().length);
  readonly filteredCount = computed(() => this.filteredAppointments().length);

  readonly pendingCount = computed(
    () => this.appointments().filter((a) => a.status === 'Pending').length
  );

  readonly approvedCount = computed(
    () => this.appointments().filter((a) => a.status === 'Approved').length
  );

  readonly cancelledCount = computed(
    () => this.appointments().filter((a) => a.status === 'Cancelled').length
  );

  // استخراج قائمة الأطباء الفريدة بكفاءة تفاعلية
  readonly doctorsList = computed<{ id: number; name: string }[]>(() => {
    const map = new Map<number, string>();
    for (const a of this.appointments()) {
      if (!map.has(a.doctorId)) {
        map.set(a.doctorId, a.doctorName);
      }
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  });

  constructor() {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.appointmentsService.getAppointments().subscribe({
      next: (data) => {
        this.appointments.set(Array.isArray(data) ? data : []);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(this.extractErrorMessage(err, 'حدث خطأ أثناء تحميل المواعيد.'));
        this.isLoading.set(false);
      },
    });
  }

  resetFilters(): void {
    this.searchTerm.set('');
    this.selectedDoctorId.set(null);
    this.selectedStatus.set('');
    this.selectedDate.set('');
  }

  openDetailsModal(appointment: Appointment): void {
    this.selectedAppointment.set(appointment);
    this.isDetailsModalOpen.set(true);
  }

  closeDetailsModal(): void {
    this.selectedAppointment.set(null);
    this.isDetailsModalOpen.set(false);
  }

  updateAppointmentStatus(id: number, status: AppointmentStatus): void {
    this.isUpdatingStatus.set(true);
    this.errorMessage.set('');

    const request: UpdateAppointmentStatusRequest = { status };

    this.appointmentsService.updateAppointmentStatus(id, request).subscribe({
      next: (updatedAppointment) => {
        this.appointments.update((current) =>
          current.map((a) => (a.id === id ? { ...a, ...updatedAppointment, status } : a))
        );

        if (this.selectedAppointment()?.id === id) {
          this.selectedAppointment.set({
            ...this.selectedAppointment()!,
            ...updatedAppointment,
            status,
          });
        }

        const label = this.getStatusLabel(status);
        const aptNumber =
          updatedAppointment?.appointmentNumber ||
          this.appointments().find((a) => a.id === id)?.appointmentNumber ||
          id;
        this.triggerSuccess(`تم تحديث حالة الموعد رقم (${aptNumber}) إلى "${label}" بنجاح.`);
        this.isUpdatingStatus.set(false);
      },
      error: (err) => {
        this.errorMessage.set(this.extractErrorMessage(err, 'حدث خطأ أثناء تحديث حالة الموعد.'));
        this.isUpdatingStatus.set(false);
      },
    });
  }

  getStatusLabel(status: AppointmentStatus): string {
    switch (status) {
      case 'Pending':
        return 'قيد الانتظار';
      case 'Approved':
        return 'تمت الموافقة';
      case 'Rejected':
        return 'مرفوض';
      case 'Cancelled':
        return 'ملغي';
    }
  }

  dismissSuccessMessage(): void {
    if (this.successDismissTimer) {
      clearTimeout(this.successDismissTimer);
      this.successDismissTimer = null;
    }
    this.successMessage.set('');
  }

  private triggerSuccess(msg: string): void {
    this.dismissSuccessMessage();
    this.successMessage.set(msg);
    this.successDismissTimer = setTimeout(() => {
      this.successMessage.set('');
    }, 4000);
  }

  private extractErrorMessage(err: any, fallback: string): string {
    return extractApiErrorMessage(err, fallback);
  }
}
