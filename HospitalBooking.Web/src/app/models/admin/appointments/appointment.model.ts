export type AppointmentStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

export interface Appointment {
  id: number;
  appointmentNumber: string;
  patientId: number;
  patientName: string;
  patientPhone: string;
  doctorId: number;
  doctorName: string;
  specializationName: string;
  clinic: string;
  slotId: number;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes: string | null;
  reasonForVisit: string | null;
  createdAt: string;
}

export interface UpdateAppointmentStatusRequest {
  status: AppointmentStatus;
}

export interface AppointmentFilters {
  patientId?: number;
  doctorId?: number;
  status?: AppointmentStatus;
  date?: string;
}
