import { inject, Injectable } from '@angular/core';
import { Observable,} from 'rxjs';
import { Patient, UpdatePatientRequest } from '../../../models/admin/patients/patient.model';
import { IPatientsService } from './patients.service.interface';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../../core/config/api.config';

@Injectable({
  providedIn: 'root',
})
export class PatientsService implements IPatientsService {
  private http = inject(HttpClient);

  getPatients(): Observable<Patient[]> {
    return this.http.get<Patient[]>(`${API_BASE_URL}/api/patients`);
  }

  updatePatient(id: number, data: UpdatePatientRequest): Observable<void> {
    return this.http.put<void>(`${API_BASE_URL}/api/patients/${id}`, data);
  }
}
