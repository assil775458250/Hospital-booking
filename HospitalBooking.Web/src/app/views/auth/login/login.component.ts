import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoginViewModel } from '../../../viewmodels/auth/login.viewmodel';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  providers: [LoginViewModel],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  readonly vm = inject(LoginViewModel);
}
