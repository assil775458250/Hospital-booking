import { Observable } from 'rxjs';
import { DashboardResponse } from '../../../models/admin/dashboard/dashboard.model';

export interface IDashboardService {
  getDashboardData(): Observable<DashboardResponse>;
}
