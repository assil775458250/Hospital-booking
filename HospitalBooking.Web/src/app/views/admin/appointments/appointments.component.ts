import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppointmentsViewModel } from '../../../viewmodels/admin/appointments/appointments.viewmodel';
import { AppointmentStatus } from '../../../models/admin/appointments/appointment.model';

@Component({
  selector: 'app-admin-appointments',
  standalone: true,
  imports: [FormsModule],
  providers: [AppointmentsViewModel],
  templateUrl: './appointments.component.html',
  styleUrl: './appointments.component.css',
})
export class AppointmentsComponent {
  readonly vm = inject(AppointmentsViewModel);

  // إحصائيات المواعيد
  get totalCount(): number {
    return this.vm.appointments.length;
  }

  get pendingCount(): number {
    return this.vm.appointments.filter((a) => a.status === 'Pending').length;
  }

  get approvedCount(): number {
    return this.vm.appointments.filter((a) => a.status === 'Approved').length;
  }

  get cancelledCount(): number {
    return this.vm.appointments.filter((a) => a.status === 'Cancelled').length;
  }

  // خيارات الأطباء المستخرجة ديناميكياً من المواعيد
  get doctorsList(): { id: number; name: string }[] {
    const map = new Map<number, string>();
    for (const a of this.vm.appointments) {
      if (!map.has(a.doctorId)) {
        map.set(a.doctorId, a.doctorName);
      }
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }

  onStatusChange(id: number, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value as AppointmentStatus;
    if (newStatus) {
      this.vm.updateAppointmentStatus(id, newStatus);
    }
  }
}
