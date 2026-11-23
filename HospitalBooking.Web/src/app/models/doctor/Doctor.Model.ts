
export type AppointmentStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'Approved' | 'Rejected';
export type SlotStatus = 'Available' | 'Booked' | 'Unavailable' | 'Cancelled';


export interface DoctorProfile {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  specializationId: number;
  specializationName: string;
  clinic: string;
  bio?: string | null;
  experience?: string | null;
  rating: number;
  availabilityStatus: string;
  profileImageUrl?: string | null;
  accountStatus: string;
  appointmentsCount: number;
  scheduleSlots?: DoctorSlot[];

  
  name?: string;
  phone?: string;
  specialization?: string;
}

export interface UpdateDoctorRequest {
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  specializationId?: number;
  clinic?: string;
  bio?: string;
  profileImageUrl?: string;
}

export interface ChangeDoctorPasswordRequest {
  currentPassword: string;
  newPassword: string;
}


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
  notes?: string | null;
  reasonForVisit?: string | null;
  createdAt: string;

  
  date?: string;
  time?: string;
}

export interface UpdateAppointmentStatusRequest {
  status: AppointmentStatus;
}


export interface DoctorSlot {
  id: number;
  doctorId: number;
  date: string;
  startTime: string;
  endTime: string;
  status: SlotStatus | string;
  isActive?: boolean;
}

export interface CreateSlotRequest {
  date: string;
  startTime: string;
  endTime: string;
  status?: string;
}

export interface CreateSlotResponse {
  slotId: number;
  doctorId: number;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
}

export interface UpdateSlotRequest {
  status?: SlotStatus | string;
  date?: string;
  startTime?: string;
  endTime?: string;
}


export interface WorkDay {
  name: string;
  active: boolean;
  startTime: string;
  endTime: string;
}