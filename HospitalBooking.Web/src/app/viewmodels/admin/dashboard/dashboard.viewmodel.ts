import { inject, Injectable, signal } from '@angular/core';
import { DashboardAppointment } from '../../../models/admin/dashboard/dashboard.model';
import { DashboardService } from '../../../services/admin/dashboard/dashboard.service';

export interface StatCard {
  title: string;
  value: string;
  icon: string;
  hint: string;
}

@Injectable()
export class DashboardViewModel {
  private readonly dashboardService = inject(DashboardService);

  readonly isLoading = signal(true);
  readonly errorMessage = signal('');

  readonly stats = signal<StatCard[]>([
    { title: 'إجمالي الأطباء', value: '—', icon: '👨‍⚕️', hint: 'عدد الأطباء المسجلين' },
    { title: 'إجمالي المرضى', value: '—', icon: '👥', hint: 'عدد المرضى النشطين' },
    { title: 'إجمالي المواعيد', value: '—', icon: '📅', hint: 'كافة المواعيد المحجوزة' },
    { title: 'إجمالي التخصصات', value: '—', icon: '🩺', hint: 'التخصصات الطبية المتوفرة' },
  ]);

  readonly recentAppointments = signal<DashboardAppointment[]>([]);

  constructor() {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        this.stats.set([
          {
            title: 'إجمالي الأطباء',
            value: data.totalDoctors.toString(),
            icon: '👨‍⚕️',
            hint: 'عدد الأطباء المسجلين',
          },
          {
            title: 'إجمالي المرضى',
            value: data.totalPatients.toString(),
            icon: '👥',
            hint: 'عدد المرضى النشطين',
          },
          {
            title: 'إجمالي المواعيد',
            value: data.totalAppointments.toString(),
            icon: '📅',
            hint: 'كافة المواعيد المحجوزة',
          },
          {
            title: 'إجمالي التخصصات',
            value: data.totalSpecializations.toString(),
            icon: '🩺',
            hint: 'التخصصات الطبية المتوفرة',
          },
        ]);
        this.recentAppointments.set(data.recentAppointments ?? []);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(this.extractErrorMessage(err, 'تعذر تحميل بيانات لوحة التحكم.'));
        this.isLoading.set(false);
      },
    });
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
