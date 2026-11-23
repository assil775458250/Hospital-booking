import { computed, inject, Injectable, signal } from '@angular/core';
import { extractApiErrorMessage } from '../../../core/utils/api-error.util';
import { Patient, UpdatePatientRequest } from '../../../models/admin/patients/patient.model';
import { PatientsService } from '../../../services/admin/patients/patients.service';

@Injectable()
export class PatientsViewModel {
  private readonly patientsService = inject(PatientsService);

  readonly isLoading = signal(true);
  readonly searchTerm = signal('');
  readonly patients = signal<Patient[]>([]);

  readonly filteredPatients = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const list = this.patients();
    if (!term) {
      return list;
    }
    return list.filter((patient) =>
      patient.fullName.toLowerCase().includes(term) ||
      patient.email.toLowerCase().includes(term) ||
      patient.phoneNumber.includes(term)
    );
  });

  readonly totalCount = computed(() => this.patients().length);
  readonly filteredCount = computed(() => this.filteredPatients().length);

  // حالة النوافذ المنبثقة والرسائل
  readonly isDetailsModalOpen = signal(false);
  readonly selectedPatientForDetails = signal<Patient | null>(null);

  readonly isEditModalOpen = signal(false);
  readonly isSaving = signal(false);
  editingPatientId: number | null = null;
  editForm: UpdatePatientRequest = {
    fullName: '',
    phoneNumber: '',
    email: '',
  };

  readonly formError = signal('');
  readonly successMessage = signal('');

  constructor() {
    this.loadPatients();
  }

  loadPatients(): void {
    this.isLoading.set(true);
    this.patientsService.getPatients().subscribe({
      next: (patients: Patient[]) => {
        this.patients.set(patients.map((patient) => this.mapPatient(patient)));
        this.isLoading.set(false);
      },
      error: (err) => {
        this.formError.set(this.extractErrorMessage(err, 'حدث خطأ أثناء تحميل بيانات المرضى.'));
        this.isLoading.set(false);
      },
    });
  }

  setSearchTerm(term: string): void {
    this.searchTerm.set(term);
  }

  resetFilters(): void {
    this.searchTerm.set('');
  }

  // نافذة عرض التفاصيل
  openDetailsModal(patient: Patient): void {
    this.selectedPatientForDetails.set(patient);
    this.isDetailsModalOpen.set(true);
  }

  closeDetailsModal(): void {
    this.selectedPatientForDetails.set(null);
    this.isDetailsModalOpen.set(false);
  }

  // نافذة تعديل البيانات
  openEditModal(patient: Patient): void {
    this.editingPatientId = patient.id;
    this.editForm = {
      fullName: patient.fullName,
      phoneNumber: patient.phoneNumber,
      email: patient.email,
    };
    this.formError.set('');
    this.isEditModalOpen.set(true);
  }

  closeEditModal(): void {
    this.editingPatientId = null;
    this.formError.set('');
    this.isEditModalOpen.set(false);
  }

  savePatient(): void {
    this.formError.set('');

    const name = this.editForm.fullName.trim();
    const phone = this.editForm.phoneNumber.trim();
    const email = this.editForm.email.trim();

    if (!name || !phone || !email) {
      this.formError.set('يرجى ملء جميع الحقول المطلوبة (الاسم الكامل، رقم الهاتف، والبريد الإلكتروني).');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.formError.set('يرجى إدخال بريد إلكتروني صالح.');
      return;
    }

    if (this.editingPatientId === null) {
      return;
    }

    const request: UpdatePatientRequest = {
      fullName: name,
      phoneNumber: phone,
      email: email,
    };

    this.isSaving.set(true);
    this.patientsService.updatePatient(this.editingPatientId, request).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.successMessage.set(`تم تحديث بيانات المريض (${name}) بنجاح.`);
        this.loadPatients();
        this.closeEditModal();
      },
      error: (err) => {
        this.isSaving.set(false);
        this.formError.set(this.extractErrorMessage(err, 'حدث خطأ أثناء تحديث بيانات المريض.'));
      },
    });
  }

  dismissSuccessMessage(): void {
    this.successMessage.set('');
  }

  getInitial(name: string): string {
    const clean = name.trim();
    return clean.charAt(0) || 'م';
  }

  private extractErrorMessage(err: any, fallback: string): string {
    return extractApiErrorMessage(err, fallback);
  }

  formatDate(dateValue: string | null | undefined): string {
    if (!dateValue) {
      return '-';
    }
    return dateValue.split('T')[0];
  }

  private mapPatient(patient: Patient): Patient {
    return {
      ...patient,
      createdAt: this.formatDate(patient.createdAt),
    };
  }
}
