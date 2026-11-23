import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-patient-app',
  standalone: true,
  templateUrl: './patient-app.component.html',
  styleUrl: './patient-app.component.css',
})
export class PatientAppComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  patientName: string | null = null;

  ngOnInit(): void {
    this.patientName = this.route.snapshot.queryParamMap.get('name');
  }

  backToLogin(): void {
    this.router.navigate(['/login']);
  }
}
