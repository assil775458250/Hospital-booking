import { Routes } from '@angular/router';
import { Dashboard } from './views/doctor/dashboard/Dashboard';
import { LoginComponent } from './views/auth/login/login.component';
import { AdminLayoutComponent } from './views/admin/layout/admin-layout.component';
import { DashboardComponent } from './views/admin/dashboard/dashboard.component';
import { DoctorsComponent } from './views/admin/doctors/doctors.component';
import { PatientsComponent } from './views/admin/patients/patients.component';
import { AppointmentsComponent } from './views/admin/appointments/appointments.component';
import { SpecializationsComponent } from './views/admin/specializations/specializations.component';
import { UsersComponent } from './views/admin/users/users.component';
import { AdminProfileComponent } from './views/admin/profile/admin-profile.component';
import { DoctorUnderDevelopmentComponent } from './views/doctor/under-development/under-development.component';
import { PatientAppComponent } from './views/patient/patient-app/patient-app.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'patient-app',
    component: PatientAppComponent,
  },
  {
    path: 'download-app',
    redirectTo: 'patient-app',
    pathMatch: 'full',
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    data: {
      roles: ['Admin'],
    },
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: 'doctors',
        component: DoctorsComponent,
      },
      {
        path: 'patients',
        component: PatientsComponent,
      },
      {
        path: 'appointments',
        component: AppointmentsComponent,
      },
      {
        path: 'specializations',
        component: SpecializationsComponent,
      },
      {
        path: 'users',
        component: UsersComponent,
      },
      {
        path: 'profile',
        component: AdminProfileComponent,
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'doctor/dashboard',
    component: Dashboard,
    canActivate: [authGuard],
    data: {
      roles: ['Doctor'],
    },
  },
  {
    path: 'doctor/under-development',
    component: DoctorUnderDevelopmentComponent,
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
