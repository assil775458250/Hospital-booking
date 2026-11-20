import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import {
  Appointment,
  AppointmentFilters,
  UpdateAppointmentStatusRequest,
} from '../../../models/admin/appointments/appointment.model';
import { IAppointmentsService } from './appointments.service.interface';

@Injectable({
  providedIn: 'root',
})
export class AppointmentsService implements IAppointmentsService {
  private readonly appointments: Appointment[] = [
    {
      id: 1,
      appointmentNumber: 'APT-2026-0001',
      patientId: 1,
      patientName: 'خالد عبد الرحمن التميمي',
      patientPhone: '0501122334',
      doctorId: 1,
      doctorName: 'د. أحمد محمد العلي',
      specializationName: 'عيادة القلب',
      clinic: 'عيادة القلب - العيادة 1',
      slotId: 101,
      appointmentDate: '2026-03-15',
      startTime: '09:00',
      endTime: '09:30',
      status: 'Approved',
      notes: 'متابعة دورية لتخطيط القلب',
      reasonForVisit: 'فحص دوري لضغط الدم والقلب',
      createdAt: '2026-03-01T08:30:00Z',
    },
    {
      id: 2,
      appointmentNumber: 'APT-2026-0002',
      patientId: 2,
      patientName: 'نورة فهد الدوسري',
      patientPhone: '0552233445',
      doctorId: 2,
      doctorName: 'د. سارة عبد الله العمري',
      specializationName: 'عيادة الأطفال',
      clinic: 'عيادة الأطفال - العيادة 2',
      slotId: 102,
      appointmentDate: '2026-03-15',
      startTime: '10:00',
      endTime: '10:30',
      status: 'Pending',
      notes: null,
      reasonForVisit: 'تطعيم سنوي ومتابعة نمو الطفل',
      createdAt: '2026-03-02T09:15:00Z',
    },
    {
      id: 3,
      appointmentNumber: 'APT-2026-0003',
      patientId: 3,
      patientName: 'عبد العزيز ناصر السبيعي',
      patientPhone: '0543344556',
      doctorId: 3,
      doctorName: 'د. خالد إبراهيم المنصور',
      specializationName: 'عيادة العظام',
      clinic: 'عيادة العظام - العيادة 3',
      slotId: 103,
      appointmentDate: '2026-03-16',
      startTime: '11:00',
      endTime: '11:30',
      status: 'Rejected',
      notes: 'تعذر الحضور بسبب عدم توفر الأشعة اللازمة',
      reasonForVisit: 'ألم مستمر في مفصل الركبة',
      createdAt: '2026-03-03T11:00:00Z',
    },
    {
      id: 4,
      appointmentNumber: 'APT-2026-0004',
      patientId: 4,
      patientName: 'سارة علي الشهري',
      patientPhone: '0564455667',
      doctorId: 4,
      doctorName: 'د. فاطمة حسن الزهراني',
      specializationName: 'عيادة الجلدية',
      clinic: 'عيادة الجلدية - العيادة 4',
      slotId: 104,
      appointmentDate: '2026-03-16',
      startTime: '12:00',
      endTime: '12:30',
      status: 'Approved',
      notes: 'جلسة علاجية ثانية',
      reasonForVisit: 'علاج حساسية موسمية وطفح جلدي',
      createdAt: '2026-03-04T14:20:00Z',
    },
    {
      id: 5,
      appointmentNumber: 'APT-2026-0005',
      patientId: 5,
      patientName: 'فيصل محمد الرشيدي',
      patientPhone: '0535566778',
      doctorId: 5,
      doctorName: 'د. محمد سعيد القحطاني',
      specializationName: 'عيادة الأسنان',
      clinic: 'عيادة الأسنان - العيادة 5',
      slotId: 105,
      appointmentDate: '2026-03-17',
      startTime: '09:30',
      endTime: '10:00',
      status: 'Pending',
      notes: null,
      reasonForVisit: 'تنظيف أسنان وعلاج تسوس',
      createdAt: '2026-03-05T10:10:00Z',
    },
    {
      id: 6,
      appointmentNumber: 'APT-2026-0006',
      patientId: 6,
      patientName: 'مريم أحمد الغامدي',
      patientPhone: '0596677889',
      doctorId: 6,
      doctorName: 'د. ريم ناصر العتيبي',
      specializationName: 'عيادة الجلدية',
      clinic: 'عيادة الجلدية - العيادة 4',
      slotId: 106,
      appointmentDate: '2026-03-17',
      startTime: '10:30',
      endTime: '11:00',
      status: 'Cancelled',
      notes: 'تم إلغاء الموعد بناءً على طلب المريضة',
      reasonForVisit: 'استشارة جلدية تجميلية',
      createdAt: '2026-03-06T16:45:00Z',
    },
    {
      id: 7,
      appointmentNumber: 'APT-2026-0007',
      patientId: 7,
      patientName: 'طارق سليمان العبدلي',
      patientPhone: '0507788990',
      doctorId: 7,
      doctorName: 'د. يوسف طارق الحربي',
      specializationName: 'عيادة الأطفال',
      clinic: 'عيادة الأطفال - العيادة 2',
      slotId: 107,
      appointmentDate: '2026-03-18',
      startTime: '11:30',
      endTime: '12:00',
      status: 'Approved',
      notes: 'متابعة بعد انتهاء العلاج',
      reasonForVisit: 'مراجعة التهاب الحلق والحرارة',
      createdAt: '2026-03-07T12:00:00Z',
    },
    {
      id: 8,
      appointmentNumber: 'APT-2026-0008',
      patientId: 8,
      patientName: 'هدى إبراهيم القاسم',
      patientPhone: '0558899001',
      doctorId: 8,
      doctorName: 'د. ليلى عبد العزيز الشمري',
      specializationName: 'عيادة العظام',
      clinic: 'عيادة العظام - العيادة 3',
      slotId: 108,
      appointmentDate: '2026-03-18',
      startTime: '13:00',
      endTime: '13:30',
      status: 'Pending',
      notes: 'يرجى إحضار التقارير السابقة',
      reasonForVisit: 'استشارة آلام أسفل الظهر',
      createdAt: '2026-03-08T09:00:00Z',
    },
  ];

  getAppointments(filters?: AppointmentFilters): Observable<Appointment[]> {
    let result = [...this.appointments];

    if (filters) {
      if (filters.patientId !== undefined && filters.patientId !== null) {
        result = result.filter((a) => a.patientId === filters.patientId);
      }

      if (filters.doctorId !== undefined && filters.doctorId !== null) {
        result = result.filter((a) => a.doctorId === filters.doctorId);
      }

      if (filters.status) {
        result = result.filter((a) => a.status === filters.status);
      }

      if (filters.date) {
        const filterDate = filters.date.split('T')[0];
        result = result.filter(
          (a) => a.appointmentDate.split('T')[0] === filterDate
        );
      }
    }

    return of(result);
  }

  updateAppointmentStatus(
    id: number,
    data: UpdateAppointmentStatusRequest
  ): Observable<Appointment> {
    const appointment = this.appointments.find((a) => a.id === id);

    if (!appointment) {
      return throwError(() => new Error('لم يتم العثور على الموعد المطلوب.'));
    }

    appointment.status = data.status;
    return of({ ...appointment });
  }
}
