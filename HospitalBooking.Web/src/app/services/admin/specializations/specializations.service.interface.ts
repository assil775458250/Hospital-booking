import { Observable } from 'rxjs';
import {
  CreateSpecializationRequest,
  Specialization,
  UpdateSpecializationRequest,
} from '../../../models/admin/specializations/specialization.model';

export interface ISpecializationsService {
  getSpecializations(): Observable<Specialization[]>;
  createSpecialization(data: CreateSpecializationRequest): Observable<Specialization>;
  updateSpecialization(id: number, data: UpdateSpecializationRequest): Observable<Specialization>;
  deleteSpecialization(id: number): Observable<void>;
}
