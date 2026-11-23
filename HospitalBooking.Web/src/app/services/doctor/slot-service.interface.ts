import { Observable } from 'rxjs';
import { CreateSlotRequest, CreateSlotResponse, DoctorSlot } from '../../models/doctor/Doctor.Model';

export interface SlotServiceInterface {
  getSlots(doctorId: number): Observable<DoctorSlot[]>;
  addSlot(doctorId: number, slot: CreateSlotRequest): Observable<CreateSlotResponse>;
  stopSlot(slotId: number): Observable<void>;
  activateSlot(slotId: number): Observable<void>;
}