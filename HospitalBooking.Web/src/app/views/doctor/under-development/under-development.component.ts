import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-doctor-under-development',
  standalone: true,
  templateUrl: './under-development.component.html',
  styleUrl: './under-development.component.css',
})
export class DoctorUnderDevelopmentComponent {
  private readonly router = inject(Router);

  backToLogin(): void {
    this.router.navigate(['/login']);
  }
}
