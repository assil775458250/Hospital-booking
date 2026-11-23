import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsersViewModel } from '../../../viewmodels/admin/users/users.viewmodel';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [FormsModule],
  providers: [UsersViewModel],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  readonly vm = inject(UsersViewModel);

  ngOnInit(): void {
    this.vm.onDataLoaded = () => {
      this.cdr.detectChanges();
    };
  }
}
