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
}
