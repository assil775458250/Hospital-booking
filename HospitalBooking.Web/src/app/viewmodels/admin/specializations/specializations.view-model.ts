import { inject, Injectable } from '@angular/core';
import { Doctor } from '../../../models/admin/doctors/doctor.model';
import {
  CreateSpecializationRequest,
  Specialization,
  SpecializationStatus,
  UpdateSpecializationRequest,
} from '../../../models/admin/specializations/specialization.model';
import { DoctorsService } from '../../../services/admin/doctors/doctors.service';
import { SpecializationsService } from '../../../services/admin/specializations/specializations.service';

export interface SpecializationFormData {
  name: string;
  description: string;
  status: SpecializationStatus;
}

@Injectable()
export class SpecializationsViewModel {
  private readonly specializationsService = inject(SpecializationsService);
  private readonly doctorsService = inject(DoctorsService);

  // حالات التحميل والرسائل
  isLoading = false;
  formError = '';
  successMessage = '';

  // فلاتر البحث والتصفية
  searchTerm = '';
  selectedStatus: SpecializationStatus | '' = '';

  // بيانات التخصصات
  specializations: Specialization[] = [];
  filteredSpecializations: Specialization[] = [];

  // قائمة جميع الأطباء للربط والتصفية
  doctors: Doctor[] = [];

  // حالة نافذة إضافة / تعديل تخصص
  isModalOpen = false;
  isEditMode = false;
  editingSpecializationId: number | null = null;
  specializationForm: SpecializationFormData = this.getEmptyForm();

  // حالة نافذة عرض الأطباء المرتبطين بالتخصص
  isDoctorsModalOpen = false;
  selectedSpecialization: Specialization | null = null;
  associatedDoctors: Doctor[] = [];

  constructor() {
    this.loadSpecializations();
  }

  loadSpecializations(): void {
    this.isLoading = true;
    this.formError = '';

    this.specializationsService.getSpecializations().subscribe({
      next: (data) => {
        this.specializations = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        this.formError = this.extractErrorMessage(err, 'حدث خطأ أثناء تحميل بيانات التخصصات.');
        this.isLoading = false;
      },
    });
  }

  applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();

    this.filteredSpecializations = this.specializations.filter((spec) => {
      const matchesSearch =
        !term ||
        spec.name.toLowerCase().includes(term) ||
        (spec.description && spec.description.toLowerCase().includes(term));

      const matchesStatus =
        !this.selectedStatus || spec.status === this.selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.applyFilters();
  }

  openAddModal(): void {
    this.specializationForm = this.getEmptyForm();
    this.isEditMode = false;
    this.editingSpecializationId = null;
    this.formError = '';
    this.isModalOpen = true;
  }

  openEditModal(specialization: Specialization): void {
    this.specializationForm = {
      name: specialization.name,
      description: specialization.description || '',
      status: specialization.status,
    };
    this.isEditMode = true;
    this.editingSpecializationId = specialization.id;
    this.formError = '';
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.formError = '';
    this.editingSpecializationId = null;
  }

  saveSpecialization(): void {
    this.formError = '';

    const name = this.specializationForm.name.trim();
    const description = this.specializationForm.description.trim() || null;
    const status = this.specializationForm.status;

    if (!name) {
      this.formError = 'يرجى إدخال اسم التخصص.';
      return;
    }

    if (this.isEditMode && this.editingSpecializationId !== null) {
      const request: UpdateSpecializationRequest = {
        name: name,
        description: description,
        status: status,
      };

      this.specializationsService
        .updateSpecialization(this.editingSpecializationId, request)
        .subscribe({
          next: (updatedSpec) => {
            this.triggerSuccess(`تم تحديث التخصص (${updatedSpec.name}) بنجاح.`);
            this.loadSpecializations();
            this.closeModal();
          },
          error: (err) => {
            this.formError = this.extractErrorMessage(err, 'حدث خطأ أثناء تحديث بيانات التخصص.');
          },
        });
    } else {
      const request: CreateSpecializationRequest = {
        name: name,
        description: description,
        status: status,
      };

      this.specializationsService.createSpecialization(request).subscribe({
        next: (newSpec) => {
          this.triggerSuccess(`تمت إضافة التخصص (${newSpec.name}) بنجاح.`);
          this.loadSpecializations();
          this.closeModal();
        },
        error: (err) => {
          this.formError = this.extractErrorMessage(err, 'حدث خطأ أثناء إضافة التخصص.');
        },
      });
    }
  }

  deleteSpecialization(id: number): void {
    const specialization = this.specializations.find((s) => s.id === id);
    const specName = specialization?.name ? `(${specialization.name})` : '';
    const isConfirmed = window.confirm(
      `هل أنت متأكد من حذف التخصص ${specName}؟ لا يمكن التراجع عن هذا الإجراء.`
    );

    if (!isConfirmed) {
      return;
    }

    this.formError = '';

    this.specializationsService.deleteSpecialization(id).subscribe({
      next: () => {
        this.triggerSuccess('تم حذف التخصص بنجاح.');
        this.loadSpecializations();
        if (this.selectedSpecialization?.id === id) {
          this.closeDoctorsModal();
        }
      },
      error: (err) => {
        this.formError = this.extractErrorMessage(err, 'حدث خطأ أثناء محاولة حذف التخصص.');
      },
    });
  }

  openDoctorsModal(specialization: Specialization): void {
    this.selectedSpecialization = specialization;
    this.associatedDoctors = this.doctors.filter(
      (doc) => doc.specializationId === specialization.id
    );
    this.isDoctorsModalOpen = true;

    // تحديث قائمة الأطباء للحصول على أحدث البيانات
    this.doctorsService.getDoctors().subscribe({
      next: (docs) => { 
        this.doctors = docs;
        if (this.selectedSpecialization?.id === specialization.id) {
          this.associatedDoctors = this.doctors.filter(
            (doc) => doc.specializationId === specialization.id
          );
        }
      },
      error: (err) => {
        this.formError = this.extractErrorMessage(err, 'تعذر تحميل الأطباء المرتبطين بهذا التخصص.');
      },
    });
  }

  closeDoctorsModal(): void {
    this.isDoctorsModalOpen = false;
    this.selectedSpecialization = null;
    this.associatedDoctors = [];
  }

  dismissSuccessMessage(): void {
    this.successMessage = '';
  }

  dismissFormError(): void {
    this.formError = '';
  }

  private triggerSuccess(msg: string): void {
    this.successMessage = msg;
  }

  private getEmptyForm(): SpecializationFormData {
    return {
      name: '',
      description: '',
      status: 'Active',
    };
  }

  get totalCount(): number {
    return this.specializations.length;
  }

  get filteredCount(): number {
    return this.filteredSpecializations.length;
  }

  getSpecializationInitial(name: string): string {
    const trimmed = name.trim();
    const cleanName = trimmed.replace(/^ال/, '').trim();
    return (cleanName || trimmed).charAt(0);
  }

  getDoctorInitials(name: string): string {
    const cleanName = name.replace(/^د\.\s*/, '').trim();
    return cleanName.charAt(0) || 'ط';
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
}
