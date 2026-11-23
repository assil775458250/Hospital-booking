import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, of, switchMap, throwError } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';
import {
  CreateDoctorRequest,
  Doctor,
  DoctorDetails,
  DoctorScheduleSlot,
  DoctorStatus,
  UpdateDoctorRequest,
} from '../../../models/admin/doctors/doctor.model';
import { IDoctorsService } from './doctors.service.interface';

@Injectable({
  providedIn: 'root',
})
export class DoctorsService implements IDoctorsService {
  private readonly http = inject(HttpClient);


  getDoctors(specializationId?: number): Observable<Doctor[]> {
    const query = specializationId ? `?specializationId=${specializationId}` : '';
    return this.http.get<Doctor[]>(`${API_BASE_URL}/api/admin/doctors${query}`);
  }

  createDoctor(data: CreateDoctorRequest): Observable<void> {
    const payload = {
    fullName: data.fullName,
    email: data.email,
      phoneNumber: data.phoneNumber,
      specializationId: data.specializationId,
      password: data.password,
      status: data.accountStatus,
    };
    return this.http.post<void>(`${API_BASE_URL}/api/doctors`, payload);
  }

  updateDoctor(id: number, data: UpdateDoctorRequest): Observable<void> {
    const payload = {
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      specializationId: data.specializationId,
      status: data.accountStatus,
    };
    return this.http.put<void>(`${API_BASE_URL}/api/doctors/${id}`, payload); // 
  }

  updateDoctorStatus(id: number, status: DoctorStatus): Observable<void> {
    return this.http.put<void>(`${API_BASE_URL}/api/doctors/${id}`, { status }); // 
  }

  getDoctorById(id: number): Observable<DoctorDetails> {
    return this.http.get<Record<string, unknown>>(`${API_BASE_URL}/api/doctors/${id}`).pipe(
      switchMap((raw) => {
        const rawSlots = raw['scheduleSlots'] ?? raw['ScheduleSlots'];
        if (Array.isArray(rawSlots)) {
          return of(this.mapDoctorDetails(raw, rawSlots));
        }

        return this.getDoctorSlots(id).pipe(
          map((slots) => this.mapDoctorDetails(raw, slots))
        );
      })
    );
  }

  getDoctorSlots(doctorId: number): Observable<DoctorScheduleSlot[]> {
    return this.http
      .get<Record<string, unknown>[]>(`${API_BASE_URL}/api/doctors/${doctorId}/slots`)
      .pipe(
        map((rawSlots) =>
          Array.isArray(rawSlots)
            ? rawSlots.map((slot) => this.mapScheduleSlot(slot))
            : []
        )
      );
  }

  private mapDoctorDetails(
    raw: Record<string, unknown>,
    slotsInput: unknown[]
  ): DoctorDetails {
    const scheduleSlots = slotsInput.map((slot) =>
      this.mapScheduleSlot(slot as Record<string, unknown>)
    );

    const rawAppointmentsCount =
      raw['appointmentsCount'] ?? raw['AppointmentsCount'];
    const appointmentsCount =
      rawAppointmentsCount !== null && rawAppointmentsCount !== undefined
        ? Number(rawAppointmentsCount)
        : null;

    const rawExperience =
      raw['experience'] ??
      raw['Experience'] ??
      raw['yearsOfExperience'] ??
      raw['YearsOfExperience'] ??
      null;

    return {
      id: Number(raw['id'] ?? raw['Id'] ?? 0),
      userId:
        raw['userId'] !== undefined || raw['UserId'] !== undefined
          ? Number(raw['userId'] ?? raw['UserId'])
          : undefined,
      fullName: String(raw['fullName'] ?? raw['FullName'] ?? ''),
      email: (raw['email'] ?? raw['Email'] ?? null) as string | null,
      phoneNumber: (raw['phoneNumber'] ?? raw['PhoneNumber'] ?? null) as string | null,
      specializationId:
        raw['specializationId'] !== undefined || raw['SpecializationId'] !== undefined
          ? Number(raw['specializationId'] ?? raw['SpecializationId'])
          : undefined,
      specializationName: (raw['specializationName'] ??
        raw['SpecializationName'] ??
        null) as string | null,
      clinic: (raw['clinic'] ??
        raw['Clinic'] ??
        raw['clinicName'] ??
        raw['ClinicName'] ??
        null) as string | null,
      profileImageUrl: (raw['profileImageUrl'] ??
        raw['ProfileImageUrl'] ??
        null) as string | null,
      bio: (raw['bio'] ?? raw['Bio'] ?? null) as string | null,
      experience: rawExperience as string | number | null,
      appointmentsCount:
        appointmentsCount !== null && !Number.isNaN(appointmentsCount)
          ? appointmentsCount
          : null,
      scheduleSlots,
    };
  }

  private mapScheduleSlot(raw: Record<string, unknown>): DoctorScheduleSlot {
    return {
      id: Number(raw['id'] ?? raw['Id'] ?? raw['slotId'] ?? raw['SlotId'] ?? 0),
      doctorId:
        raw['doctorId'] !== undefined || raw['DoctorId'] !== undefined
          ? Number(raw['doctorId'] ?? raw['DoctorId'])
          : undefined,
      date: String(
        raw['date'] ??
          raw['Date'] ??
          raw['slotDate'] ??
          raw['SlotDate'] ??
          raw['scheduleDate'] ??
          raw['ScheduleDate'] ??
          ''
      ),
      startTime: String(raw['startTime'] ?? raw['StartTime'] ?? ''),
      endTime: String(raw['endTime'] ?? raw['EndTime'] ?? ''),
      status: String(raw['status'] ?? raw['Status'] ?? ''),
    };
  }
}
