import { inject, Injectable, signal } from '@angular/core';
import { extractApiErrorMessage as getApiErrorMessage } from '../../../core/utils/api-error.util';
import {
  CreateDoctorRequest,
  Doctor,
  DoctorDetails,
  DoctorStatus,
  UpdateDoctorRequest,
} from '../../../models/admin/doctors/doctor.model';
import { Specialization } from '../../../models/admin/specializations/specialization.model';
import { DoctorsService } from '../../../services/admin/doctors/doctors.service';
import { SpecializationsService } from '../../../services/admin/specializations/specializations.service';

export interface DoctorFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  specializationName: string;
  specializationId?: number;
  password?: string;
  accountStatus: DoctorStatus;
}

@Injectable()
export class DoctorsViewModel {
  private readonly doctorsService = inject(DoctorsService);
  private readonly specializationsService = inject(SpecializationsService);

  searchTerm = '';
  selectedSpecialization = '';
  selectedStatus: DoctorStatus | '' = '';

  readonly isLoading = signal(true);

  readonly doctors = signal<Doctor[]>([]);
  readonly filteredDoctors = signal<Doctor[]>([]);

  // قائمة التخصصات المحملة ديناميكيًا
  allSpecializations: Specialization[] = [];
  readonly specializations = signal<string[]>([]);

  // حالة النافذة المنبثقة ورسائل التنبيه
  readonly isModalOpen = signal(false);
  readonly isEditMode = signal(false);
  editingDoctorId: number | null = null;
  readonly formError = signal('');
  readonly successMessage = signal('');

  // حالة نافذة تفاصيل الطبيب
  readonly isDetailsModalOpen = signal(false);
  readonly isLoadingDetails = signal(false);
  readonly detailsError = signal('');
  selectedDoctorIdForDetails: number | null = null;
  readonly selectedDoctorDetails = signal<DoctorDetails | null>(null);

  // نموذج المدخلات
  doctorForm: DoctorFormData = this.getEmptyForm();

  constructor() {
    this.loadSpecializations();
    this.loadDoctors();
  }

  loadSpecializations(callback?: () => void): void {
    this.specializationsService.getSpecializations().subscribe({
      next: (specs) => {
        this.allSpecializations = specs;
        this.specializations.set(specs.map((s) => s.name));
        callback?.();
      },
      error: (err) => {
        this.formError.set(this.extractApiErrorMessage(err, 'حدث خطأ أثناء تحميل بيانات التخصصات.'));
      },
    });
  }

  loadDoctors(): void {
    this.isLoading.set(true);
    this.doctorsService.getDoctors().subscribe({
      next: (data) => {
        this.doctors.set(data);
        this.applyFilters();
        this.isLoading.set(false);
      },
      error: (err) => {
        this.formError.set(this.extractApiErrorMessage(err, 'حدث خطأ أثناء تحميل بيانات الأطباء.'));
        this.isLoading.set(false);
      },
    });
  }

  applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();

    const filtered = this.doctors().filter((doc) => {
      const matchesSearch =
        !term ||
        doc.fullName.toLowerCase().includes(term) ||
        doc.email.toLowerCase().includes(term) ||
        doc.phoneNumber.includes(term);

      const matchesSpec =
        !this.selectedSpecialization ||
        doc.specializationName === this.selectedSpecialization;

      const matchesStatus =
        !this.selectedStatus ||
        doc.accountStatus === this.selectedStatus;

      return matchesSearch && matchesSpec && matchesStatus;
    });

    this.filteredDoctors.set(filtered);
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedSpecialization = '';
    this.selectedStatus = '';
    this.applyFilters();
  }

  openAddModal(): void {
    this.formError.set('');
    this.specializationsService.getSpecializations().subscribe({
      next: (specs) => {
        this.allSpecializations = specs;
        const activeSpecs = specs.filter((s) => s.status === 'Active');

        if (activeSpecs.length === 0) {
          this.formError.set('لا توجد تخصصات نشطة متاحة حاليًا لإضافة طبيب جديد.');
          this.isModalOpen.set(false);
          return;
        }

        this.specializations.set(activeSpecs.map((s) => s.name));
        this.doctorForm = this.getEmptyForm();
        this.isEditMode.set(false);
        this.editingDoctorId = null;
        this.isModalOpen.set(true);
      },
      error: (err) => {
        this.formError.set(this.extractApiErrorMessage(err, 'تعذر تحميل خيارات التخصصات. يرجى المحاولة لاحقًا.'));
        this.isModalOpen.set(false);
      },
    });
  }

  openEditModal(doctor: Doctor): void {
    this.formError.set('');
    this.specializationsService.getSpecializations().subscribe({
      next: (specs) => {
        this.allSpecializations = specs;

        // اعرض التخصصات النشطة، مع الإبقاء على تخصص الطبيب الحالي ضمن الخيارات إن كان غير نشط
        const availableSpecs = specs.filter(
          (s) =>
            s.status === 'Active' ||
            s.id === doctor.specializationId ||
            s.name === doctor.specializationName
        );

        this.specializations.set(availableSpecs.map((s) => s.name));

        this.doctorForm = {
          fullName: doctor.fullName,
          email: doctor.email,
          phoneNumber: doctor.phoneNumber,
          specializationName: doctor.specializationName,
          specializationId: doctor.specializationId,
          password: '',
          accountStatus: doctor.accountStatus,
        };
        this.isEditMode.set(true);
        this.editingDoctorId = doctor.id;
        this.isModalOpen.set(true);
      },
      error: (err) => {
        this.formError.set(this.extractApiErrorMessage(err, 'تعذر تحميل بيانات التخصصات.'));
        this.isModalOpen.set(false);
      },
    });
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.formError.set('');
    this.loadSpecializations();
  }

  saveDoctor(): void {
    this.formError.set('');

    const name = this.doctorForm.fullName.trim();
    const email = this.doctorForm.email.trim();
    const phone = this.doctorForm.phoneNumber.trim();
    const spec = this.doctorForm.specializationName;
    const pwd = this.doctorForm.password?.trim() || '';

    if (!name || !email || !phone || !spec) {
      this.formError.set('يرجى ملء جميع الحقول المطلوبة (الاسم، البريد، الهاتف، والتخصص).');
      return;
    }

    if (!this.isEditMode() && !pwd) {
      this.formError.set('يرجى إدخال كلمة المرور الأولية للطبيب الجديد.');
      return;
    }

    const matchedSpec =
      this.allSpecializations.find((s) => s.name === spec) ||
      this.allSpecializations.find((s) => s.id === this.doctorForm.specializationId);

    if (!matchedSpec) {
      this.formError.set('يرجى اختيار تخصص صحيح من القائمة المتاحة.');
      return;
    }

    const specializationId = matchedSpec.id;
    this.doctorForm.specializationId = specializationId;

    if (this.isEditMode() && this.editingDoctorId !== null) {
      const request: UpdateDoctorRequest = {
        fullName: name,
        email: email,
        phoneNumber: phone,
        specializationId: specializationId,
        accountStatus: this.doctorForm.accountStatus,
      };

      this.doctorsService.updateDoctor(this.editingDoctorId, request).subscribe({
        next: () => {
          this.triggerSuccess(`تم تحديث بيانات الطبيب (${name}) بنجاح.`);
          this.loadDoctors();
          this.closeModal();
        },
        error: (err) => {
          this.formError.set(this.extractApiErrorMessage(err, 'حدث خطأ أثناء تحديث بيانات الطبيب.'));
        },
      });
    } else {
      const request: CreateDoctorRequest = {
        fullName: name,
        email: email,
        phoneNumber: phone,
        specializationId: specializationId,
        password: pwd,
        accountStatus: this.doctorForm.accountStatus,
      };

      this.doctorsService.createDoctor(request).subscribe({
        next: () => {
          this.triggerSuccess(`تمت إضافة الطبيب (${name}) بنجاح.`);
          this.loadDoctors();
          this.closeModal();
        },
        error: (err) => {
          this.formError.set(this.extractApiErrorMessage(err, 'حدث خطأ أثناء إضافة الطبيب.'));
        },
      });
    }
  }

  toggleDoctorStatus(doctor: Doctor): void {
    const newStatus: DoctorStatus = doctor.accountStatus === 'Active' ? 'Inactive' : 'Active';

    this.doctorsService.updateDoctorStatus(doctor.id, newStatus).subscribe({
      next: () => {
        const actionText = newStatus === 'Active' ? 'تفعيل' : 'تعطيل';
        this.triggerSuccess(`تم ${actionText} حساب الطبيب (${doctor.fullName}) بنجاح.`);
        this.loadDoctors();
      },
      error: (err) => {
        this.formError.set(this.extractApiErrorMessage(err, 'حدث خطأ أثناء تغيير حالة الحساب.'));
      },
    });
  }

  openDetailsModal(doctor: Doctor): void {
    this.isDetailsModalOpen.set(true);
    this.selectedDoctorIdForDetails = doctor.id;
    this.selectedDoctorDetails.set(null);
    this.detailsError.set('');
    this.fetchDoctorDetails(doctor.id);
  }

  retryLoadDoctorDetails(): void {
    if (this.selectedDoctorIdForDetails !== null) {
      this.fetchDoctorDetails(this.selectedDoctorIdForDetails);
    }
  }

  closeDetailsModal(): void {
    this.isDetailsModalOpen.set(false);
    this.isLoadingDetails.set(false);
    this.detailsError.set('');
    this.selectedDoctorIdForDetails = null;
    this.selectedDoctorDetails.set(null);
  }

  private fetchDoctorDetails(doctorId: number): void {
    this.isLoadingDetails.set(true);
    this.detailsError.set('');
    this.selectedDoctorDetails.set(null);

    this.doctorsService.getDoctorById(doctorId).subscribe({
      next: (details) => {
        if (!this.isDetailsModalOpen() || this.selectedDoctorIdForDetails !== doctorId) {
          return;
        }
        this.selectedDoctorDetails.set(details);
        this.isLoadingDetails.set(false);
      },
      error: (err) => {
        if (!this.isDetailsModalOpen() || this.selectedDoctorIdForDetails !== doctorId) {
          return;
        }
        this.detailsError.set(this.extractApiErrorMessage(
          err,
          'تعذر تحميل تفاصيل الطبيب ومواعيد العمل.'
        ));
        this.isLoadingDetails.set(false);
      },
    });
  }

  hasTextValue(value: string | null | undefined): boolean {
    return typeof value === 'string' && value.trim().length > 0;
  }

  hasExperienceValue(value: string | number | null | undefined): boolean {
    if (value === null || value === undefined) {
      return false;
    }
    if (typeof value === 'number') {
      return !Number.isNaN(value) && value > 0;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 && trimmed !== '0';
  }

  formatExperience(value: string | number | null | undefined): string {
    if (value === null || value === undefined) {
      return '';
    }
    if (typeof value === 'number') {
      if (value === 1) {
        return 'سنة واحدة';
      }
      if (value === 2) {
        return 'سنتان';
      }
      return value >= 3 && value <= 10 ? `${value} سنوات` : `${value} سنة`;
    }
    return value.trim();
  }

  hasProfessionalInfo(details: DoctorDetails): boolean {
    return (
      this.hasTextValue(details.bio) ||
      this.hasExperienceValue(details.experience) ||
      (details.appointmentsCount !== null && details.appointmentsCount !== undefined)
    );
  }

  formatSlotDate(dateValue: string): string {
    if (!dateValue) {
      return '—';
    }
    return dateValue.split('T')[0];
  }

  getDayNameFromDate(dateValue: string): string {
    if (!dateValue) {
      return '—';
    }
    const datePart = dateValue.split('T')[0];
    const parts = datePart.split('-').map(Number);
    let parsedDate: Date;

    if (parts.length === 3 && parts.every((n) => !Number.isNaN(n))) {
      parsedDate = new Date(parts[0], parts[1] - 1, parts[2]);
    } else {
      parsedDate = new Date(dateValue);
    }

    if (Number.isNaN(parsedDate.getTime())) {
      return '—';
    }

    const days = [
      'الأحد',
      'الاثنين',
      'الثلاثاء',
      'الأربعاء',
      'الخميس',
      'الجمعة',
      'السبت',
    ];
    return days[parsedDate.getDay()];
  }

  formatSlotTime(timeValue: string): string {
    if (!timeValue) {
      return '—';
    }
    const trimmed = timeValue.trim();
    if (/^\d{2}:\d{2}:\d{2}$/.test(trimmed)) {
      return trimmed.slice(0, 5);
    }
    return trimmed;
  }

  getSlotStatusLabel(status: string): string {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'متاح';
      case 'booked':
        return 'محجوز';
      case 'unavailable':
        return 'غير متاح';
      default:
        return status || '—';
    }
  }

  private extractApiErrorMessage(err: unknown, fallback: string): string {
    return getApiErrorMessage(err, fallback);
  }

  dismissSuccessMessage(): void {
    this.successMessage.set('');
  }

  private triggerSuccess(msg: string): void {
    this.successMessage.set(msg);
  }

  private getEmptyForm(): DoctorFormData {
    const defaultSpec = this.specializations()[0] || '';
    const defaultSpecObj = this.allSpecializations.find((s) => s.name === defaultSpec);

    return {
      fullName: '',
      email: '',
      phoneNumber: '',
      specializationName: defaultSpec,
      specializationId: defaultSpecObj?.id,
      password: '',
      accountStatus: 'Active',
    };
  }

  get totalCount(): number {
    return this.doctors().length;
  }

  get filteredCount(): number {
    return this.filteredDoctors().length;
  }

  getInitials(name: string): string {
    const cleanName = name.replace(/^د\.\s*/, '').trim();
    return cleanName.charAt(0) || 'ط';
  }
}
