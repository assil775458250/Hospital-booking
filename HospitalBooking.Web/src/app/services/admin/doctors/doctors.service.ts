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
import { SpecializationsService } from '../specializations/specializations.service';
import { IDoctorsService } from './doctors.service.interface';

@Injectable({
  providedIn: 'root',
})
export class DoctorsService implements IDoctorsService {
  private readonly http = inject(HttpClient);
  private readonly specializationsService = inject(SpecializationsService);

  private readonly doctors: Doctor[] = [
    {
      id: 1,
      userId: 101,
      fullName: 'د. أحمد محمد العلي',
      email: 'ahmad.ali@yusr.med',
      phoneNumber: '0501234567',
      specializationId: 1,
      specializationName: 'القلب',
      accountStatus: 'Active',
      profileImageUrl: null,
      appointmentsCount: 24,
    },
    {
      id: 2,
      userId: 102,
      fullName: 'د. سارة عبد الله العمري',
      email: 'sara.omari@yusr.med',
      phoneNumber: '0559876543',
      specializationId: 2,
      specializationName: 'الأطفال',
      accountStatus: 'Active',
      profileImageUrl: null,
      appointmentsCount: 18,
    },
    {
      id: 3,
      userId: 103,
      fullName: 'د. خالد إبراهيم المنصور',
      email: 'khaled.mansour@yusr.med',
      phoneNumber: '0541122334',
      specializationId: 4,
      specializationName: 'العظام',
      accountStatus: 'Active',
      profileImageUrl: null,
      appointmentsCount: 31,
    },
    {
      id: 4,
      userId: 104,
      fullName: 'د. فاطمة حسن الزهراني',
      email: 'fatima.zahrani@yusr.med',
      phoneNumber: '0563344556',
      specializationId: 3,
      specializationName: 'الجلدية',
      accountStatus: 'Inactive',
      profileImageUrl: null,
      appointmentsCount: 0,
    },
    {
      id: 5,
      userId: 105,
      fullName: 'د. محمد سعيد القحطاني',
      email: 'mohammed.qahtani@yusr.med',
      phoneNumber: '0535566778',
      specializationId: 5,
      specializationName: 'الأسنان',
      accountStatus: 'Active',
      profileImageUrl: null,
      appointmentsCount: 15,
    },
    {
      id: 6,
      userId: 106,
      fullName: 'د. ريم ناصر العتيبي',
      email: 'reem.otaibi@yusr.med',
      phoneNumber: '0597788990',
      specializationId: 3,
      specializationName: 'الجلدية',
      accountStatus: 'Active',
      profileImageUrl: null,
      appointmentsCount: 9,
    },
    {
      id: 7,
      userId: 107,
      fullName: 'د. يوسف طارق الحربي',
      email: 'yousef.harbi@yusr.med',
      phoneNumber: '0502233445',
      specializationId: 2,
      specializationName: 'الأطفال',
      accountStatus: 'Inactive',
      profileImageUrl: null,
      appointmentsCount: 3,
    },
    {
      id: 8,
      userId: 108,
      fullName: 'د. ليلى عبد العزيز الشمري',
      email: 'layla.shammari@yusr.med',
      phoneNumber: '0554433221',
      specializationId: 4,
      specializationName: 'العظام',
      accountStatus: 'Active',
      profileImageUrl: null,
      appointmentsCount: 12,
    },
  ];

  getDoctors(): Observable<Doctor[]> {
    const doctors = this.doctors.map((doctor) => {
      const specName =
        this.specializationsService.getSpecializationNameById(doctor.specializationId) ||
        doctor.specializationName;

      return {
        ...doctor,
        specializationName: specName,
      };
    });

    return of(doctors);
  }

  createDoctor(data: CreateDoctorRequest): Observable<void> {
    const specName = this.specializationsService.getSpecializationNameById(data.specializationId);
    if (!specName) {
      return throwError(() => new Error('التخصص المحدد غير موجود.'));
    }

    const maxId = this.doctors.reduce((max, d) => Math.max(max, d.id), 0);
    const newId = maxId + 1;

    const newDoctor: Doctor = {
      id: newId,
      userId: 100 + newId,
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      specializationId: data.specializationId,
      specializationName: specName,
      accountStatus: data.accountStatus,
      profileImageUrl: null,
      appointmentsCount: 0,
    };

    this.doctors.unshift(newDoctor);
    this.specializationsService.adjustDoctorsCount(data.specializationId, 1);
    return of(void 0);
  }

  updateDoctor(id: number, data: UpdateDoctorRequest): Observable<void> {
    const doctor = this.doctors.find((d) => d.id === id);
    if (!doctor) {
      return throwError(() => new Error('لم يتم العثور على الطبيب المطلوب.'));
    }

    const newSpecName = this.specializationsService.getSpecializationNameById(data.specializationId);
    if (!newSpecName) {
      return throwError(() => new Error('التخصص المحدد غير موجود.'));
    }

    const oldSpecId = doctor.specializationId;
    const isSpecChanged = oldSpecId !== data.specializationId;

    doctor.fullName = data.fullName;
    doctor.email = data.email;
    doctor.phoneNumber = data.phoneNumber;
    doctor.specializationId = data.specializationId;
    doctor.specializationName = newSpecName;
    doctor.accountStatus = data.accountStatus;

    if (isSpecChanged) {
      this.specializationsService.adjustDoctorsCount(oldSpecId, -1);
      this.specializationsService.adjustDoctorsCount(data.specializationId, 1);
    }

    return of(void 0);
  }

  updateDoctorStatus(id: number, status: DoctorStatus): Observable<void> {
    const doctor = this.doctors.find((d) => d.id === id);
    if (!doctor) {
      return throwError(() => new Error('لم يتم العثور على الطبيب المطلوب.'));
    }

    doctor.accountStatus = status;
    return of(void 0);
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
