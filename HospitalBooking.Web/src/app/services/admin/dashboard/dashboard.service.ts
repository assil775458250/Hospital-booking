import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardResponse } from '../../../models/admin/dashboard/dashboard.model';
import { IDashboardService } from './dashboard.service.interface';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../../core/config/api.config';

@Injectable({
  providedIn: 'root',
})
export class DashboardService implements IDashboardService {
  private readonly http = inject(HttpClient);

  getDashboardData(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${API_BASE_URL}/api/admin/dashboard`);
  }
}
