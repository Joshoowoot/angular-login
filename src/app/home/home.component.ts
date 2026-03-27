import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewService } from '../services/view.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  email: string = '';
  password: string = '';

  constructor(private viewService: ViewService) {}

  ngOnInit() {
    console.log('[Home] Component initialized');
    // Get data from ViewService
    const data = this.viewService.getViewData();
    console.log('[Home] Received data:', data);
    this.email = data.email || '';
    this.password = data.password || '';
  }

  logout() {
    console.log('[Home] User logging out');
    this.viewService.clearViewData();
    this.viewService.setView('login');
  }
}
