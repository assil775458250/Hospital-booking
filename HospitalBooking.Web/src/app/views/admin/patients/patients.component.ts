import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PatientsViewModel } from '../../../viewmodels/admin/patients/patients.viewmodel';

@Component({
  selector: 'app-admin-patients',
  standalone: true,
  imports: [FormsModule],
  providers: [PatientsViewModel],
  templateUrl: './patients.component.html',
  styleUrl: './patients.component.css',
})
export class PatientsComponent {
  readonly vm = inject(PatientsViewModel);
}
