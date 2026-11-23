import { Component, inject } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthSessionService } from '../../../core/auth/auth-session.service';
import { DashboardViewModel } from '../../../viewmodels/admin/dashboard/dashboard.viewmodel';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [SlicePipe, RouterLink],
  providers: [DashboardViewModel],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  private readonly sessionService = inject(AuthSessionService);
  readonly currentUser = this.sessionService.getCurrentUser();
  readonly vm = inject(DashboardViewModel);

  getStatusLabel(status: string): string {
    switch (status) {
      case 'Pending':
        return 'قيد الانتظار';
      case 'Approved':
        return 'تمت الموافقة';
      case 'Rejected':
        return 'مرفوض';
      case 'Cancelled':
        return 'ملغي';
      default:
        return status;
    }
  }
}
