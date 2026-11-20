import { Appointment } from '../../models/doctor/Doctor.Model';

export interface AppointmentServiceInterface {

  getAppointments(): Appointment[];

  updateStatus(id: number, status: string): void;

}