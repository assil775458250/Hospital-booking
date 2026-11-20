import { Injectable } from '@angular/core';
import {
  DoctorProfile,
  DoctorServiceInterface
} from './doctor-service.interface';

@Injectable({
  providedIn: 'root'
})
export class DoctorService implements DoctorServiceInterface {

  private doctor: DoctorProfile = {
    name: 'Dr. Ahmed Ali',
    email: 'doctor@example.com',
    phone: '777123456',
    specialization: 'Cardiology'
  };

  getDoctor(): DoctorProfile {
    return { ...this.doctor };
  }

  updateDoctor(doctor: DoctorProfile): void {
    this.doctor = { ...doctor };
  }
}