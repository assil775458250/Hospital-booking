
export interface Appointment {
  id: number;
  patientName: string;
  date: string;
  time: string;
  status: string;
}

export interface DoctorSlot {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface WorkDay {
  name: string;
  active: boolean;
  startTime: string;
  endTime: string;
}
