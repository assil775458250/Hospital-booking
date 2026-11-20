import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DoctorsViewModel } from '../../../viewmodels/admin/doctors/doctors.viewmodel';

@Component({
  selector: 'app-admin-doctors',
  standalone: true,
  imports: [FormsModule],
  providers: [DoctorsViewModel],
  templateUrl: './doctors.component.html',
  styleUrl: './doctors.component.css',
})
export class DoctorsComponent {
  readonly vm = inject(DoctorsViewModel);
}
