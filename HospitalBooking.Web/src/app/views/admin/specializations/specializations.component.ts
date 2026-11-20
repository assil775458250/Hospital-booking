import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SpecializationsViewModel } from '../../../viewmodels/admin/specializations/specializations.view-model';

@Component({
  selector: 'app-admin-specializations',
  standalone: true,
  imports: [FormsModule],
  providers: [SpecializationsViewModel],
  templateUrl: './specializations.component.html',
  styleUrl: './specializations.component.css',
})
export class SpecializationsComponent {
  readonly vm = inject(SpecializationsViewModel);

  // إحصائيات التخصصات
  get activeCount(): number {
    return this.vm.specializations.filter((s) => s.status === 'Active').length;
  }

  get inactiveCount(): number {
    return this.vm.specializations.filter((s) => s.status === 'Inactive').length;
  }

  get totalDoctorsCount(): number {
    return this.vm.specializations.reduce((sum, s) => sum + s.doctorsCount, 0);
  }
}
