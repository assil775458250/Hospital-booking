import { inject, Injectable } from '@angular/core';
import {
  Appointment,
  AppointmentStatus,
  UpdateAppointmentStatusRequest,
} from '../../../models/admin/appointments/appointment.model';
import { AppointmentsService } from '../../../services/admin/appointments/appointments.service';

@Injectable()
export class AppointmentsViewModel {
  private readonly appointmentsService = inject(AppointmentsService);

  // بيانات المواعيد
  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];

  // فلاتر البحث والتصفية
  searchTerm = '';
  selectedDoctorId: number | null = null;
  selectedStatus: AppointmentStatus | '' = '';
  selectedDate = '';

  // حالات التحميل والعمليات
  isLoading = false;
  isUpdatingStatus = false;
  errorMessage = '';
  successMessage = '';

  // حالة نافذة تفاصيل الموعد
  isDetailsModalOpen = false;
  selectedAppointment: Appointment | null = null;

  constructor() {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.appointmentsService.getAppointments().subscribe({
      next: (data) => {
        this.appointments = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = this.extractErrorMessage(err, 'حدث خطأ أثناء تحميل المواعيد.');
        this.isLoading = false;
      },
    });
  }

  applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();
    const filterDate = this.selectedDate ? this.selectedDate.split('T')[0] : '';

    this.filteredAppointments = this.appointments.filter((appointment) => {
      const matchesSearch =
        !term ||
        appointment.appointmentNumber.toLowerCase().includes(term) ||
        appointment.patientName.toLowerCase().includes(term) ||
        appointment.patientPhone.includes(term) ||
        appointment.doctorName.toLowerCase().includes(term);

      const matchesDoctor =
        this.selectedDoctorId === null ||
        this.selectedDoctorId === undefined ||
        appointment.doctorId === this.selectedDoctorId;

      const matchesStatus =
        !this.selectedStatus ||
        appointment.status === this.selectedStatus;

      const matchesDate =
        !filterDate ||
        appointment.appointmentDate.split('T')[0] === filterDate;

      return (
        matchesSearch &&
        matchesDoctor &&
        matchesStatus &&
        matchesDate
      );
    });
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedDoctorId = null;
    this.selectedStatus = '';
    this.selectedDate = '';
    this.applyFilters();
  }

  openDetailsModal(appointment: Appointment): void {
    this.selectedAppointment = appointment;
    this.isDetailsModalOpen = true;
  }

  closeDetailsModal(): void {
    this.selectedAppointment = null;
    this.isDetailsModalOpen = false;
  }

  updateAppointmentStatus(id: number, status: AppointmentStatus): void {
    this.isUpdatingStatus = true;
    this.errorMessage = '';

    const request: UpdateAppointmentStatusRequest = { status };

    this.appointmentsService.updateAppointmentStatus(id, request).subscribe({
      next: (updatedAppointment) => {
        const index = this.appointments.findIndex((a) => a.id === id);
        if (index !== -1) {
          this.appointments[index] = updatedAppointment;
        }

        this.applyFilters();

        if (this.selectedAppointment && this.selectedAppointment.id === id) {
          this.selectedAppointment = updatedAppointment;
        }

        const label = this.getStatusLabel(status);
        this.successMessage = `تم تحديث حالة الموعد رقم (${updatedAppointment.appointmentNumber}) إلى "${label}" بنجاح.`;
        this.isUpdatingStatus = false;
      },
      error: (err) => {
        this.errorMessage = this.extractErrorMessage(err, 'حدث خطأ أثناء تحديث حالة الموعد.');
        this.isUpdatingStatus = false;
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
    this.successMessage = '';
  }

  get totalCount(): number {
    return this.appointments.length;
  }

  get filteredCount(): number {
    return this.filteredAppointments.length;
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
