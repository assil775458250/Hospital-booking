import { inject, Injectable } from '@angular/core';
import { Patient, UpdatePatientRequest } from '../../../models/admin/patients/patient.model';
import { PatientsService } from '../../../services/admin/patients/patients.service';

@Injectable()
export class PatientsViewModel {
  private readonly patientsService = inject(PatientsService);

  searchTerm = '';
  patients: Patient[] = [];
  filteredPatients: Patient[] = [];

  // حالة النوافذ المنبثقة والرسائل
  isDetailsModalOpen = false;
  selectedPatientForDetails: Patient | null = null;

  isEditModalOpen = false;
  editingPatientId: number | null = null;
  editForm: UpdatePatientRequest = {
    fullName: '',
    phoneNumber: '',
    email: '',
  };

  formError = '';
  successMessage = '';

  constructor() {
    this.loadPatients();
  }

  loadPatients(): void {
    this.patientsService.getPatients().subscribe({
      next: (patients: Patient[]) => {
        this.patients = patients.map((patient) => this.mapPatient(patient));
        this.applyFilters();
      },
      error: (err) => {
        this.formError = this.extractErrorMessage(err, 'حدث خطأ أثناء تحميل بيانات المرضى.');
      },
    });
  }

  applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();

    this.filteredPatients = this.patients.filter((patient) => {
      return (
        !term ||
        patient.fullName.toLowerCase().includes(term) ||
        patient.email.toLowerCase().includes(term) ||
        patient.phoneNumber.includes(term)
      );
    });
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  // نافذة عرض التفاصيل
  openDetailsModal(patient: Patient): void {
    this.selectedPatientForDetails = patient;
    this.isDetailsModalOpen = true;
  }

  closeDetailsModal(): void {
    this.selectedPatientForDetails = null;
    this.isDetailsModalOpen = false;
  }

  // نافذة تعديل البيانات
  openEditModal(patient: Patient): void {
    this.editingPatientId = patient.id;
    this.editForm = {
      fullName: patient.fullName,
      phoneNumber: patient.phoneNumber,
      email: patient.email,
    };
    this.formError = '';
    this.isEditModalOpen = true;
  }

  closeEditModal(): void {
    this.editingPatientId = null;
    this.formError = '';
    this.isEditModalOpen = false;
  }

  savePatient(): void {
    this.formError = '';

    const name = this.editForm.fullName.trim();
    const phone = this.editForm.phoneNumber.trim();
    const email = this.editForm.email.trim();

    if (!name || !phone || !email) {
      this.formError = 'يرجى ملء جميع الحقول المطلوبة (الاسم الكامل، رقم الهاتف، والبريد الإلكتروني).';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.formError = 'يرجى إدخال بريد إلكتروني صالح.';
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

    this.patientsService.updatePatient(this.editingPatientId, request).subscribe({
      next: () => {
        this.successMessage = `تم تحديث بيانات المريض (${name}) بنجاح.`;
        this.loadPatients();
        this.closeEditModal();
      },
      error: (err) => {
        this.formError = this.extractErrorMessage(err, 'حدث خطأ أثناء تحديث بيانات المريض.');
      },
    });
  }

  dismissSuccessMessage(): void {
    this.successMessage = '';
  }

  get totalCount(): number {
    return this.patients.length;
  }

  get filteredCount(): number {
    return this.filteredPatients.length;
  }

  getInitial(name: string): string {
    const clean = name.trim();
    return clean.charAt(0) || 'م';
  }

  private extractErrorMessage(err: any, fallback: string): string {
    if (typeof err?.error === 'string' && err.error.trim()) {
      return err.error.trim();
    }
    if (err?.error?.message && typeof err.error.message === 'string') {
      return err.error.message;
    }
    return err?.message || fallback;
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
