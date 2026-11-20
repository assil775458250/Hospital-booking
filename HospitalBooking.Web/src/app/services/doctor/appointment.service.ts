import { Injectable } from '@angular/core';
import { Appointment } from '../../models/doctor/Doctor.Model';
import { AppointmentServiceInterface } from './appointment-service.interface';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService implements AppointmentServiceInterface {

  today = new Date().toLocaleDateString('en-CA');

  appointments: Appointment[] = [
    {
      id: 1,
      patientName: 'Mohammed Ali',
      date: this.today,
      time: '09:00',
      status: 'Confirmed'
    },
    {
      id: 2,
      patientName: 'Ahmed Salem',
      date: this.today,
      time: '10:30',
      status: 'Pending'
    },
    {
      id: 3,
      patientName: 'Khaled Omar',
      date: this.today,
      time: '12:00',
      status: 'Completed'
    }
  ];

  getAppointments(): Appointment[] {
    return this.appointments;
  }

  updateStatus(id: number, status: string): void {
    const appointment = this.appointments.find(
      a => a.id === id
    );

    if (appointment) {
      appointment.status = status;
    }
  }
}