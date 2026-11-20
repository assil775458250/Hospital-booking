import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DashboardResponse } from '../../../models/admin/dashboard/dashboard.model';
import { IDashboardService } from './dashboard.service.interface';

@Injectable({
  providedIn: 'root',
})
export class DashboardService implements IDashboardService {
  private readonly mockData: DashboardResponse = {
    totalDoctors: 8,
    totalPatients: 8,
    totalAppointments: 24,
    totalSpecializations: 5,
    recentAppointments: [],
  };

  getDashboardData(): Observable<DashboardResponse> {
    return of(this.mockData);
  }
}
