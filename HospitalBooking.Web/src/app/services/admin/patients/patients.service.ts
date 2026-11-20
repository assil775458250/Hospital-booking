import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { Patient, UpdatePatientRequest } from '../../../models/admin/patients/patient.model';
import { IPatientsService } from './patients.service.interface';

@Injectable({
  providedIn: 'root',
})
export class PatientsService implements IPatientsService {
  private readonly patients: Patient[] = [
    {
      id: 1,
      userId: 201,
      fullName: 'خالد عبد الرحمن التميمي',
      email: 'khaled.tamimi@example.com',
      phoneNumber: '0501122334',
      createdAt: '2026-01-12',
      statistics: {
        totalAppointments: 5,
        upcomingAppointments: 1,
        completedAppointments: 4,
        cancelledAppointments: 0,
      },
    },
    {
      id: 2,
      userId: 202,
      fullName: 'نورة فهد الدوسري',
      email: 'noura.dosari@example.com',
      phoneNumber: '0552233445',
      createdAt: '2026-01-20',
      statistics: {
        totalAppointments: 8,
        upcomingAppointments: 2,
        completedAppointments: 5,
        cancelledAppointments: 1,
      },
    },
    {
      id: 3,
      userId: 203,
      fullName: 'عبد العزيز ناصر السبيعي',
      email: 'abdulaziz.subaie@example.com',
      phoneNumber: '0543344556',
      createdAt: '2026-02-05',
      statistics: {
        totalAppointments: 1,
        upcomingAppointments: 0,
        completedAppointments: 0,
        cancelledAppointments: 1,
      },
    },
    {
      id: 4,
      userId: 204,
      fullName: 'سارة علي الشهري',
      email: 'sara.shehri@example.com',
      phoneNumber: '0564455667',
      createdAt: '2025-11-15',
      statistics: {
        totalAppointments: 12,
        upcomingAppointments: 3,
        completedAppointments: 8,
        cancelledAppointments: 1,
      },
    },
    {
      id: 5,
      userId: 205,
      fullName: 'فيصل محمد الرشيدي',
      email: 'faisal.rashidi@example.com',
      phoneNumber: '0535566778',
      createdAt: '2026-02-18',
      statistics: {
        totalAppointments: 3,
        upcomingAppointments: 1,
        completedAppointments: 2,
        cancelledAppointments: 0,
      },
    },
    {
      id: 6,
      userId: 206,
      fullName: 'مريم أحمد الغامدي',
      email: 'maryam.ghamdi@example.com',
      phoneNumber: '0596677889',
      createdAt: '2025-12-04',
      statistics: {
        totalAppointments: 6,
        upcomingAppointments: 0,
        completedAppointments: 6,
        cancelledAppointments: 0,
      },
    },
    {
      id: 7,
      userId: 207,
      fullName: 'طارق سليمان العبدلي',
      email: 'tariq.abdali@example.com',
      phoneNumber: '0507788990',
      createdAt: '2026-03-01',
      statistics: {
        totalAppointments: 0,
        upcomingAppointments: 0,
        completedAppointments: 0,
        cancelledAppointments: 0,
      },
    },
    {
      id: 8,
      userId: 208,
      fullName: 'هدى إبراهيم القاسم',
      email: 'huda.qasim@example.com',
      phoneNumber: '0558899001',
      createdAt: '2026-02-22',
      statistics: {
        totalAppointments: 4,
        upcomingAppointments: 1,
        completedAppointments: 3,
        cancelledAppointments: 0,
      },
    },
  ];

  getPatients(): Observable<Patient[]> {
    return of([...this.patients]);
  }

  updatePatient(id: number, data: UpdatePatientRequest): Observable<void> {
    const patient = this.patients.find((p) => p.id === id);
    if (!patient) {
      return throwError(() => new Error('لم يتم العثور على المريض المطلوب.'));
    }

    patient.fullName = data.fullName;
    patient.email = data.email;
    patient.phoneNumber = data.phoneNumber;

    return of(void 0);
  }
}
