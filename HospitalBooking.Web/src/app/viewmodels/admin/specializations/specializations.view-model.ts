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

  // مؤقت الإغلاق التلقائي لرسالة النجاح
  private successDismissTimer: ReturnType<typeof setTimeout> | null = null;

  // حالات التحميل والرسائل التفاعلية (Signals)
  readonly isLoading = signal<boolean>(true);
  readonly formError = signal<string>('');
  readonly successMessage = signal<string>('');

  // فلاتر البحث والتصفية التفاعلية
  readonly searchTerm = signal<string>('');
  readonly selectedStatus = signal<SpecializationStatus | ''>('');

  // بيانات التخصصات
  readonly specializations = signal<Specialization[]>([]);

  // الحسابات والإحصائيات التفاعلية (Computed Signals)
  readonly filteredSpecializations = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const status = this.selectedStatus();

    return this.specializations().filter((spec) => {
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

  readonly totalDoctorsCount = computed(
    () => this.specializations().reduce((sum, s) => sum + (s.doctorsCount || 0), 0)
  );

  // حالة نافذة إضافة / تعديل تخصص
  readonly isModalOpen = signal<boolean>(false);
  readonly isEditMode = signal<boolean>(false);
  editingSpecializationId: number | null = null;
  specializationForm: SpecializationFormData = this.getEmptyForm();

  // حالة نافذة عرض الأطباء المرتبطين بالتخصص
  readonly isDoctorsModalOpen = signal<boolean>(false);
  readonly isLoadingDoctors = signal<boolean>(false);
  readonly selectedSpecialization = signal<Specialization | null>(null);
  readonly associatedDoctors = signal<Doctor[]>([]);

  constructor() {
    this.loadSpecializations();
  }

  loadSpecializations(): void {
    this.isLoading.set(true);
    this.formError.set('');

    this.specializationsService.getSpecializations().subscribe({
      next: (data) => {
        this.specializations.set(Array.isArray(data) ? data : []);
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
        next: (newSpec) => {
          const specName = (newSpec as any)?.name || name;
          this.triggerSuccess(`تمت إضافة التخصص (${specName}) بنجاح.`);
          this.loadSpecializations();
          this.closeModal();
        },
        error: (err) => {
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

    this.doctorsService.getDoctors().subscribe({
      next: (docs) => {
        const filtered = (Array.isArray(docs) ? docs : []).filter(
          (doc) => doc.specializationId === specialization.id
        );
        if (this.selectedSpecialization()?.id === specialization.id) {
          this.associatedDoctors.set(filtered);
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
    if (this.successDismissTimer) {
      clearTimeout(this.successDismissTimer);
      this.successDismissTimer = null;
    }
    this.successMessage.set('');
  }

  dismissFormError(): void {
    this.formError.set('');
  }

  private triggerSuccess(msg: string): void {
    this.dismissSuccessMessage();
    this.successMessage.set(msg);
    this.successDismissTimer = setTimeout(() => {
      this.successMessage.set('');
    }, 4000);
  }

  private getEmptyForm(): SpecializationFormData {
    return {
      name: '',
      description: '',
      status: 'Active',
    };
  }

  getSpecializationInitial(name: string): string {
    const trimmed = (name || '').trim();
    const cleanName = trimmed.replace(/^ال/, '').trim();
    return (cleanName || trimmed).charAt(0);
  }

  getDoctorInitials(name: string): string {
    const cleanName = (name || '').replace(/^د\.\s*/, '').trim();
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
