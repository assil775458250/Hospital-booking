export type DoctorStatus = 'Active' | 'Inactive';

export interface Doctor {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  specializationId: number;
  specializationName: string;
  accountStatus: DoctorStatus;
  profileImageUrl?: string | null;
  appointmentsCount: number;
}

export interface CreateDoctorRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  specializationId: number;
  password: string;
  accountStatus: DoctorStatus;
}

export interface UpdateDoctorRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  specializationId: number;
  accountStatus: DoctorStatus;
}

export type ScheduleSlotStatus = 'Available' | 'Booked' | 'Unavailable' | string;

export interface DoctorScheduleSlot {
  id: number;
  doctorId?: number;
  date: string;
  startTime: string;
  endTime: string;
  status: ScheduleSlotStatus;
}

export interface DoctorDetails {
  id: number;
  userId?: number;
  fullName: string;
  email?: string | null;
  phoneNumber?: string | null;
  specializationId?: number;
  specializationName?: string | null;
  clinic?: string | null;
  profileImageUrl?: string | null;
  bio?: string | null;
  experience?: string | number | null;
  appointmentsCount?: number | null;
  scheduleSlots: DoctorScheduleSlot[];
}
