import { Component, inject } from '@angular/core';
import { AuthSessionService } from '../../../core/auth/auth-session.service';
import { DashboardViewModel } from '../../../viewmodels/admin/dashboard/dashboard.viewmodel';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  providers: [DashboardViewModel],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  private readonly sessionService = inject(AuthSessionService);
  readonly currentUser = this.sessionService.getCurrentUser();
  readonly vm = inject(DashboardViewModel);

  get stats() {
    return this.vm.stats;
  }
}
