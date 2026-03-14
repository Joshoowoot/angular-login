import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegisteredUser, ViewService } from '../services/view.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  users: RegisteredUser[] = [];
  userName = 'John Doe';

  constructor(private viewService: ViewService) {
    console.log('[Dashboard] Component initialized');
  }

  ngOnInit(): void {
    this.refreshUsersTable();

    const viewData = this.viewService.getViewData();
    if (viewData.email) {
      const currentUser = this.viewService.getRegisteredUser(viewData.email);
      if (currentUser) {
        this.userName = `${currentUser.firstName} ${currentUser.lastName}`;
      }
    }
  }

  refreshUsersTable(): void {
    this.users = this.viewService.getAllRegisteredUsers();
  }

  goToHome() {
    console.log('[Dashboard] Navigating to home');
    this.viewService.setView('home');
  }

  logout() {
    console.log('[Dashboard] User logging out');
    this.viewService.clearViewData();
    this.viewService.setView('login');
  }

  formatDate(dateValue: string): string {
    const parsedDate = new Date(dateValue);
    if (Number.isNaN(parsedDate.getTime())) {
      return 'N/A';
    }

    return parsedDate.toLocaleString();
  }
}
