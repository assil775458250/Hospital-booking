import { Routes } from "@angular/router";
import { AdminLayoutComponent } from "./layout/admin-layout.component";
import { authGuard } from "../../core/guards/auth.guard";
import { DashboardComponent } from "../../views/admin/dashboard/dashboard.component";
import { DoctorsComponent } from "../../views/admin/doctors/doctors.component";
import { PatientsComponent } from "../../views/admin/patients/patients.component";
import { AppointmentsComponent } from "../../views/admin/appointments/appointments.component";
import { SpecializationsComponent } from "../../views/admin/specializations/specializations.component";
import { UsersComponent } from "./users/users.component";
import { AdminProfileComponent } from "../../views/admin/profile/admin-profile.component";

export const ADMIN_ROUTES: Routes = [
    {
        path: '',
        component: AdminLayoutComponent,
        canActivate: [authGuard],
        data: {
            roles: ['Admin'],
        },
        children: [
            {
                path: 'dashboard',
                component: DashboardComponent
            },
            {
                path: 'doctors',
                component: DoctorsComponent
            },
            {
                path: 'patients',
                component: PatientsComponent
            },
            {
                path: 'appointments',
                component: AppointmentsComponent
            },
            {
                path: 'specializations',
                component: SpecializationsComponent
            },
            {
                path: 'users',
                component: UsersComponent
            },
            {
                path: 'profile',
                component: AdminProfileComponent
            },
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            },
        ]
    }
]