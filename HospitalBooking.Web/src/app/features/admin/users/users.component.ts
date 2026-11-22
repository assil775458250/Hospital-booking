import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsersViewModel } from './users.viewmodel';

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
}
