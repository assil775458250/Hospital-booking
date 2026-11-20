export interface PatientStatistics {
  totalAppointments: number;
  upcomingAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
}

export interface Patient {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
  statistics: PatientStatistics;
}

export interface UpdatePatientRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
}
