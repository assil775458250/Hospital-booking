import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { Dashboard } from './views/doctor/dashboard/Dashboard';
import { DoctorUnderDevelopmentComponent } from './views/doctor/under-development/under-development.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'admin',
    loadChildren: () =>
      import ('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
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
