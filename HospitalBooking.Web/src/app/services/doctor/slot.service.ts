
import { Injectable } from '@angular/core';
import { DoctorSlot } from '../../models/doctor/Doctor.Model';
import { SlotServiceInterface } from './slot-service.interface';

@Injectable({
  providedIn: 'root'
})
export class SlotService implements SlotServiceInterface {

  private slots: DoctorSlot[] = [
    {
      id: 1,
      date: '2026-11-20',
      startTime: '08:00',
      endTime: '09:00',
      isActive: true
    },
    {
      id: 2,
      date: '2026-11-21',
      startTime: '10:00',
      endTime: '11:00',
      isActive: true
    }
  ];

  getSlots(): DoctorSlot[] {
    return this.slots;
  }

  addSlot(slot: DoctorSlot): void {
    this.slots.push(slot);
  }

  stopSlot(id: number): void {
    const slot = this.slots.find(s => s.id === id);

    if (slot) {
      slot.isActive = false;
    }
  }

  activateSlot(id: number): void {
    const slot = this.slots.find(s => s.id === id);

    if (slot) {
      slot.isActive = true;
    }
  }
}
