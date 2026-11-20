import { Observable } from 'rxjs';
import { Patient, UpdatePatientRequest } from '../../../models/admin/patients/patient.model';

export interface IPatientsService {
  getPatients(): Observable<Patient[]>;
  updatePatient(id: number, data: UpdatePatientRequest): Observable<void>;
}
