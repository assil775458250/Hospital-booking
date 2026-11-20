
import { DoctorSlot } from '../../models/doctor/Doctor.Model';
export interface SlotServiceInterface {
  getSlots(): DoctorSlot[];

  addSlot(slot: DoctorSlot): void;

  stopSlot(id: number): void;

  activateSlot(id: number): void;
}
