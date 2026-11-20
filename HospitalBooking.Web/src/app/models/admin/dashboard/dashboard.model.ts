export interface DashboardAppointment {
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
  status: string;
  reasonForVisit: string | null;
  notes: string | null;
  createdAt: string;
}

export interface DashboardResponse {
  totalDoctors: number;
  totalPatients: number;
  totalAppointments: number;
  totalSpecializations: number;
  recentAppointments: DashboardAppointment[];
}
