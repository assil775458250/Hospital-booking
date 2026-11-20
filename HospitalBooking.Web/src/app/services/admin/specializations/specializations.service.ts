import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import {
  CreateSpecializationRequest,
  Specialization,
  UpdateSpecializationRequest,
} from '../../../models/admin/specializations/specialization.model';
import { ISpecializationsService } from './specializations.service.interface';

@Injectable({
  providedIn: 'root',
})
export class SpecializationsService implements ISpecializationsService {
  private specializations: Specialization[] = [
    {
      id: 1,
      name: 'القلب',
      description: 'تشخيص وعلاج أمراض القلب والشرايين والأوعية الدموية',
      status: 'Active',
      doctorsCount: 1,
    },
    {
      id: 2,
      name: 'الأطفال',
      description: 'متابعة صحة ونمو الأطفال وعلاج الأمراض الشائعة والمزمنة',
      status: 'Active',
      doctorsCount: 2,
    },
    {
      id: 3,
      name: 'الجلدية',
      description: 'علاج الأمراض الجلدية والعناية بصحة البشرة والشعر',
      status: 'Active',
      doctorsCount: 2,
    },
    {
      id: 4,
      name: 'العظام',
      description: 'علاج كسور وإصابات العظام والمفاصل والعمود الفقري',
      status: 'Active',
      doctorsCount: 2,
    },
    {
      id: 5,
      name: 'الأسنان',
      description: 'طب وجراحة وتجميل الأسنان وصحة الفم واللثة',
      status: 'Active',
      doctorsCount: 1,
    },
  ];

  getSpecializations(): Observable<Specialization[]> {
    return of(this.specializations.map((spec) => ({ ...spec })));
  }

  createSpecialization(data: CreateSpecializationRequest): Observable<Specialization> {
    const trimmedName = data.name ? data.name.trim() : '';

    if (!trimmedName) {
      return throwError(() => new Error('اسم التخصص مطلوب ولا يمكن أن يكون فارغًا.'));
    }

    const isDuplicate = this.specializations.some(
      (s) => s.name.trim().toLowerCase() === trimmedName.toLowerCase()
    );

    if (isDuplicate) {
      return throwError(() => new Error('اسم التخصص موجود مسبقًا.'));
    }

    const maxId = this.specializations.reduce((max, s) => Math.max(max, s.id), 0);
    const newId = maxId + 1;

    const newSpecialization: Specialization = {
      id: newId,
      name: trimmedName,
      description: data.description ? data.description.trim() || null : null,
      status: data.status,
      doctorsCount: 0,
    };

    this.specializations.push(newSpecialization);
    return of({ ...newSpecialization });
  }

  updateSpecialization(
    id: number,
    data: UpdateSpecializationRequest
  ): Observable<Specialization> {
    const spec = this.specializations.find((s) => s.id === id);
    if (!spec) {
      return throwError(() => new Error('لم يتم العثور على التخصص المطلوب.'));
    }

    if (data.name !== undefined) {
      const trimmedName = data.name.trim();
      if (!trimmedName) {
        return throwError(() => new Error('اسم التخصص لا يمكن أن يكون فارغًا.'));
      }

      const isDuplicate = this.specializations.some(
        (s) => s.id !== id && s.name.trim().toLowerCase() === trimmedName.toLowerCase()
      );

      if (isDuplicate) {
        return throwError(() => new Error('اسم التخصص مستخدم لتخصص آخر بالفعل.'));
      }

      spec.name = trimmedName;
    }

    if (data.description !== undefined) {
      spec.description = data.description ? data.description.trim() || null : null;
    }

    if (data.status !== undefined) {
      spec.status = data.status;
    }

    return of({ ...spec });
  }

  deleteSpecialization(id: number): Observable<void> {
    const spec = this.specializations.find((s) => s.id === id);
    if (!spec) {
      return throwError(() => new Error('لم يتم العثور على التخصص المطلوب.'));
    }

    if (spec.doctorsCount > 0) {
      return throwError(
        () =>
          new Error(
            'لا يمكن حذف التخصص لوجود أطباء مرتبطين به حاليًا. يرجى نقل أو حذف الأطباء التابعين له أولًا.'
          )
      );
    }

    this.specializations = this.specializations.filter((s) => s.id !== id);
    return of(void 0);
  }

  // --- دوال مساعدة عامة للتنسيق التجريبي الداخلي (Demo Mode) ---

  getSpecializationNameById(id: number): string | undefined {
    return this.specializations.find((s) => s.id === id)?.name;
  }

  adjustDoctorsCount(id: number, change: number): void {
    const spec = this.specializations.find((s) => s.id === id);
    if (spec) {
      spec.doctorsCount = Math.max(0, spec.doctorsCount + change);
    }
  }
}
