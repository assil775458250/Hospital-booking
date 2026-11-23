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

  onStatusChange(id: number, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value as AppointmentStatus;
    if (newStatus) {
      this.vm.updateAppointmentStatus(id, newStatus);
    }
  }
}
