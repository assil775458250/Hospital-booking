import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { AuthSessionService } from '../../../core/auth/auth-session.service';
import { DashboardViewModel } from '../../../viewmodels/admin/dashboard/dashboard.viewmodel';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  providers: [DashboardViewModel],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private readonly sessionService = inject(AuthSessionService);
  private readonly cdr = inject(ChangeDetectorRef);
  readonly currentUser = this.sessionService.getCurrentUser();
  readonly vm = inject(DashboardViewModel);

  get stats() {
    return this.vm.stats;
  }

  ngOnInit(): void {
    this.vm.onDataLoaded = () => {
      this.cdr.detectChanges();
    };
  }
}
