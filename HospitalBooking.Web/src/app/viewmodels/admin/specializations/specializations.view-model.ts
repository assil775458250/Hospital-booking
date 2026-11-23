import { computed, inject, Injectable, signal } from '@angular/core';
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

  // حالات التحميل والعمليات
  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly formError = signal('');
  readonly successMessage = signal('');

  // فلاتر البحث والتصفية
  readonly searchTerm = signal('');
  readonly selectedStatus = signal<SpecializationStatus | ''>('');

  // بيانات التخصصات
  readonly specializations = signal<Specialization[]>([]);

  // حالة نافذة إضافة / تعديل تخصص
  readonly isModalOpen = signal(false);
  readonly isEditMode = signal(false);
  editingSpecializationId: number | null = null;
  specializationForm: SpecializationFormData = this.getEmptyForm();

  // حالة نافذة عرض الأطباء المرتبطين بالتخصص
  readonly isDoctorsModalOpen = signal(false);
  readonly isLoadingDoctors = signal(false);
  readonly selectedSpecialization = signal<Specialization | null>(null);
  readonly associatedDoctors = signal<Doctor[]>([]);

  // الحسابات والإحصائيات التفاعلية (Computed Signals)
  readonly filteredSpecializations = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const status = this.selectedStatus();
    const list = this.specializations();

    return list.filter((spec) => {
      const matchesSearch =
        !term ||
        spec.name.toLowerCase().includes(term) ||
        (spec.description && spec.description.toLowerCase().includes(term));

      const matchesStatus = !status || spec.status === status;

      return matchesSearch && matchesStatus;
    });
  });

  readonly totalCount = computed(() => this.specializations().length);
  readonly filteredCount = computed(() => this.filteredSpecializations().length);
  readonly activeCount = computed(
    () => this.specializations().filter((s) => s.status === 'Active').length
  );
  readonly inactiveCount = computed(
    () => this.specializations().filter((s) => s.status === 'Inactive').length
  );
  readonly totalDoctorsCount = computed(() =>
    this.specializations().reduce((sum, s) => sum + (s.doctorsCount || 0), 0)
  );

  constructor() {
    this.loadSpecializations();
  }

  loadSpecializations(): void {
    this.isLoading.set(true);
    this.formError.set('');

    this.specializationsService.getSpecializations().subscribe({
      next: (data) => {
        this.specializations.set(data || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.formError.set(
          this.extractErrorMessage(err, 'حدث خطأ أثناء تحميل بيانات التخصصات.')
        );
        this.isLoading.set(false);
      },
    });
  }

  setSearchTerm(term: string): void {
    this.searchTerm.set(term);
  }

  setSelectedStatus(status: SpecializationStatus | ''): void {
    this.selectedStatus.set(status);
  }

  resetFilters(): void {
    this.searchTerm.set('');
    this.selectedStatus.set('');
  }

  openAddModal(): void {
    this.specializationForm = this.getEmptyForm();
    this.isEditMode.set(false);
    this.editingSpecializationId = null;
    this.formError.set('');
    this.isModalOpen.set(true);
  }

  openEditModal(specialization: Specialization): void {
    this.specializationForm = {
      name: specialization.name,
      description: specialization.description || '',
      status: specialization.status,
    };
    this.isEditMode.set(true);
    this.editingSpecializationId = specialization.id;
    this.formError.set('');
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.isSaving.set(false);
    this.formError.set('');
    this.editingSpecializationId = null;
  }

  saveSpecialization(): void {
    this.formError.set('');

    const name = this.specializationForm.name.trim();
    const description = this.specializationForm.description.trim() || null;
    const status = this.specializationForm.status;

    if (!name) {
      this.formError.set('يرجى إدخال اسم التخصص.');
      return;
    }

    this.isSaving.set(true);

    if (this.isEditMode() && this.editingSpecializationId !== null) {
      const request: UpdateSpecializationRequest = {
        name: name,
        description: description,
        status: status,
      };

      this.specializationsService
        .updateSpecialization(this.editingSpecializationId, request)
        .subscribe({
          next: (updatedSpec) => {
            const specName = updatedSpec?.name || name;
            this.triggerSuccess(`تم تحديث التخصص (${specName}) بنجاح.`);
            this.loadSpecializations();
            this.closeModal();
          },
          error: (err) => {
            this.isSaving.set(false);
            this.formError.set(
              this.extractErrorMessage(err, 'حدث خطأ أثناء تحديث بيانات التخصص.')
            );
          },
        });
    } else {
      const request: CreateSpecializationRequest = {
        name: name,
        description: description,
        status: status,
      };

      this.specializationsService.createSpecialization(request).subscribe({
        next: (newSpec: any) => {
          const specName = newSpec?.name || name;
          this.triggerSuccess(`تمت إضافة التخصص (${specName}) بنجاح.`);
          this.loadSpecializations();
          this.closeModal();
        },
        error: (err) => {
          this.isSaving.set(false);
          this.formError.set(
            this.extractErrorMessage(err, 'حدث خطأ أثناء إضافة التخصص.')
          );
        },
      });
    }
  }

  deleteSpecialization(id: number): void {
    const specialization = this.specializations().find((s) => s.id === id);
    const specName = specialization?.name ? `(${specialization.name})` : '';
    const isConfirmed = window.confirm(
      `هل أنت متأكد من حذف التخصص ${specName}؟ لا يمكن التراجع عن هذا الإجراء.`
    );

    if (!isConfirmed) {
      return;
    }

    this.formError.set('');

    this.specializationsService.deleteSpecialization(id).subscribe({
      next: () => {
        this.triggerSuccess('تم حذف التخصص بنجاح.');
        this.loadSpecializations();
        if (this.selectedSpecialization()?.id === id) {
          this.closeDoctorsModal();
        }
      },
      error: (err) => {
        this.formError.set(
          this.extractErrorMessage(err, 'حدث خطأ أثناء محاولة حذف التخصص.')
        );
      },
    });
  }

  openDoctorsModal(specialization: Specialization): void {
    this.selectedSpecialization.set(specialization);
    this.associatedDoctors.set([]);
    this.isLoadingDoctors.set(true);
    this.isDoctorsModalOpen.set(true);

    this.doctorsService.getDoctors(specialization.id).subscribe({
      next: (docs) => {
        if (this.selectedSpecialization()?.id === specialization.id) {
          this.associatedDoctors.set(docs || []);
        }
        this.isLoadingDoctors.set(false);
      },
      error: (err) => {
        this.isLoadingDoctors.set(false);
        this.formError.set(
          this.extractErrorMessage(err, 'تعذر تحميل الأطباء المرتبطين بهذا التخصص.')
        );
      },
    });
  }

  closeDoctorsModal(): void {
    this.isDoctorsModalOpen.set(false);
    this.isLoadingDoctors.set(false);
    this.selectedSpecialization.set(null);
    this.associatedDoctors.set([]);
  }

  dismissSuccessMessage(): void {
    this.successMessage.set('');
  }

  dismissFormError(): void {
    this.formError.set('');
  }

  private triggerSuccess(msg: string): void {
    this.successMessage.set(msg);
  }

  private getEmptyForm(): SpecializationFormData {
    return {
      name: '',
      description: '',
      status: 'Active',
    };
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
