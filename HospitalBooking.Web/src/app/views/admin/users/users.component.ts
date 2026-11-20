import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsersViewModel } from '../../../viewmodels/admin/users/users.view-model';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [FormsModule],
  providers: [UsersViewModel],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent {
  readonly vm = inject(UsersViewModel);

  // إحصائيات المستخدمين
  get totalUsersCount(): number {
    return this.vm.users.length;
  }

  get adminCount(): number {
    return this.vm.users.filter((u) => u.role === 'Admin').length;
  }

  get doctorCount(): number {
    return this.vm.users.filter((u) => u.role === 'Doctor').length;
  }

  get patientCount(): number {
    return this.vm.users.filter((u) => u.role === 'Patient').length;
  }

  get activeCount(): number {
    return this.vm.users.filter((u) => u.accountStatus === 'Active').length;
  }

  get inactiveCount(): number {
    return this.vm.users.filter((u) => u.accountStatus === 'Inactive').length;
  }
}
