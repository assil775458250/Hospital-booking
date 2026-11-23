import { inject, Injectable } from '@angular/core';
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

  doctors: Doctor[] = [];
  filteredDoctors: Doctor[] = [];

  // قائمة التخصصات المحملة ديناميكيًا
  allSpecializations: Specialization[] = [];
  specializations: string[] = [];

  // حالة النافذة المنبثقة ورسائل التنبيه
  isModalOpen = false;
  isEditMode = false;
  editingDoctorId: number | null = null;
  formError = '';
  successMessage = '';

  // حالة نافذة تفاصيل الطبيب
  isDetailsModalOpen = false;
  isLoadingDetails = false;
  detailsError = '';
  selectedDoctorIdForDetails: number | null = null;
  selectedDoctorDetails: DoctorDetails | null = null;

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
        this.specializations = specs.map((s) => s.name);
        callback?.();
      },
      error: (err) => {
        this.formError = this.extractApiErrorMessage(err, 'حدث خطأ أثناء تحميل بيانات التخصصات.');
      },
    });
  }

  loadDoctors(): void {
    this.doctorsService.getDoctors().subscribe({
      next: (data) => {
        this.doctors = data;
        this.applyFilters();
      },
      error: (err) => {
        this.formError = this.extractApiErrorMessage(err, 'حدث خطأ أثناء تحميل بيانات الأطباء.');
      },
    });
  }

  applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();

    this.filteredDoctors = this.doctors.filter((doc) => {
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
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedSpecialization = '';
    this.selectedStatus = '';
    this.applyFilters();
  }

  openAddModal(): void {
    this.formError = '';
    this.specializationsService.getSpecializations().subscribe({
      next: (specs) => {
        this.allSpecializations = specs;
        const activeSpecs = specs.filter((s) => s.status === 'Active');

        if (activeSpecs.length === 0) {
          this.formError = 'لا توجد تخصصات نشطة متاحة حاليًا لإضافة طبيب جديد.';
          this.isModalOpen = false;
          return;
        }

        this.specializations = activeSpecs.map((s) => s.name);
        this.doctorForm = this.getEmptyForm();
        this.isEditMode = false;
        this.editingDoctorId = null;
        this.isModalOpen = true;
      },
      error: (err) => {
        this.formError = this.extractApiErrorMessage(err, 'تعذر تحميل خيارات التخصصات. يرجى المحاولة لاحقًا.');
        this.isModalOpen = false;
      },
    });
  }

  openEditModal(doctor: Doctor): void {
    this.formError = '';
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

        this.specializations = availableSpecs.map((s) => s.name);

        this.doctorForm = {
          fullName: doctor.fullName,
          email: doctor.email,
          phoneNumber: doctor.phoneNumber,
          specializationName: doctor.specializationName,
          specializationId: doctor.specializationId,
          password: '',
          accountStatus: doctor.accountStatus,
        };
        this.isEditMode = true;
        this.editingDoctorId = doctor.id;
        this.isModalOpen = true;
      },
      error: (err) => {
        this.formError = this.extractApiErrorMessage(err, 'تعذر تحميل بيانات التخصصات.');
        this.isModalOpen = false;
      },
    });
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.formError = '';
    this.loadSpecializations();
  }

  saveDoctor(): void {
    this.formError = '';

    const name = this.doctorForm.fullName.trim();
    const email = this.doctorForm.email.trim();
    const phone = this.doctorForm.phoneNumber.trim();
    const spec = this.doctorForm.specializationName;
    const pwd = this.doctorForm.password?.trim() || '';

    if (!name || !email || !phone || !spec) {
      this.formError = 'يرجى ملء جميع الحقول المطلوبة (الاسم، البريد، الهاتف، والتخصص).';
      return;
    }

    if (!this.isEditMode && !pwd) {
      this.formError = 'يرجى إدخال كلمة المرور الأولية للطبيب الجديد.';
      return;
    }

    const matchedSpec =
      this.allSpecializations.find((s) => s.name === spec) ||
      this.allSpecializations.find((s) => s.id === this.doctorForm.specializationId);

    if (!matchedSpec) {
      this.formError = 'يرجى اختيار تخصص صحيح من القائمة المتاحة.';
      return;
    }

    const specializationId = matchedSpec.id;
    this.doctorForm.specializationId = specializationId;

    if (this.isEditMode && this.editingDoctorId !== null) {
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
          this.formError = this.extractApiErrorMessage(err, 'حدث خطأ أثناء تحديث بيانات الطبيب.');
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
          this.formError = this.extractApiErrorMessage(err, 'حدث خطأ أثناء إضافة الطبيب.');
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
        this.formError = this.extractApiErrorMessage(err, 'حدث خطأ أثناء تغيير حالة الحساب.');
      },
    });
  }

  openDetailsModal(doctor: Doctor): void {
    this.isDetailsModalOpen = true;
    this.selectedDoctorIdForDetails = doctor.id;
    this.selectedDoctorDetails = null;
    this.detailsError = '';
    this.fetchDoctorDetails(doctor.id);
  }

  retryLoadDoctorDetails(): void {
    if (this.selectedDoctorIdForDetails !== null) {
      this.fetchDoctorDetails(this.selectedDoctorIdForDetails);
    }
  }

  closeDetailsModal(): void {
    this.isDetailsModalOpen = false;
    this.isLoadingDetails = false;
    this.detailsError = '';
    this.selectedDoctorIdForDetails = null;
    this.selectedDoctorDetails = null;
  }

  private fetchDoctorDetails(doctorId: number): void {
    this.isLoadingDetails = true;
    this.detailsError = '';
    this.selectedDoctorDetails = null;

    this.doctorsService.getDoctorById(doctorId).subscribe({
      next: (details) => {
        if (!this.isDetailsModalOpen || this.selectedDoctorIdForDetails !== doctorId) {
          return;
        }
        this.selectedDoctorDetails = details;
        this.isLoadingDetails = false;
      },
      error: (err) => {
        if (!this.isDetailsModalOpen || this.selectedDoctorIdForDetails !== doctorId) {
          return;
        }
        this.detailsError = this.extractApiErrorMessage(
          err,
          'تعذر تحميل تفاصيل الطبيب ومواعيد العمل.'
        );
        this.isLoadingDetails = false;
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
    const httpErr = err as {
      status?: number;
      error?: { message?: string; title?: string } | string;
      message?: string;
    };

    if (typeof httpErr?.error === 'string' && httpErr.error.trim()) {
      return httpErr.error.trim();
    }
    if (httpErr?.error && typeof httpErr.error === 'object') {
      if (httpErr.error.message) {
        return httpErr.error.message;
      }
      if (httpErr.error.title) {
        return httpErr.error.title;
      }
    }
    if (httpErr?.status === 0) {
      return 'تعذر الاتصال بالخادم. يرجى التأكد من تشغيل الخادم والمحاولة مرة أخرى.';
    }
    if (httpErr?.status === 404) {
      return 'لم يتم العثور على بيانات الطبيب المطلوب.';
    }
    return httpErr?.message || fallback;
  }

  dismissSuccessMessage(): void {
    this.successMessage = '';
  }

  private triggerSuccess(msg: string): void {
    this.successMessage = msg;
  }

  private getEmptyForm(): DoctorFormData {
    const defaultSpec = this.specializations[0] || '';
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
    return this.doctors.length;
  }

  get filteredCount(): number {
    return this.filteredDoctors.length;
  }

  getInitials(name: string): string {
    const cleanName = name.replace(/^د\.\s*/, '').trim();
    return cleanName.charAt(0) || 'ط';
  }
}
