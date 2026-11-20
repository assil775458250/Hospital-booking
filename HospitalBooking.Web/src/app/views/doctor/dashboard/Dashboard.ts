import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardViewModel } from '../../../viewmodels/doctor/Dashboard.viewmodel';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './Dashboard.html',
  styleUrl: './Dashboard.css'
})
export class Dashboard {

  constructor(public vm: DashboardViewModel) {}

}