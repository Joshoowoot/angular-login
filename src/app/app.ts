import { Component, OnInit } from '@angular/core';
import { signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { ViewService, ViewType } from './services/view.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, LoginComponent, RegisterComponent, HomeComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('login-page');
  currentView: ViewType = 'login';

  constructor(private viewService: ViewService) {}

  ngOnInit(): void {
    console.log('[App] Application initialized');
    // Subscribe to view changes
    this.viewService.currentView$.subscribe(view => {
      console.log('[App] Current view changed to:', view);
      this.currentView = view;
    });
  }

  // Helper methods for template
  isLoginView(): boolean {
    return this.currentView === 'login';
  }

  isRegisterView(): boolean {
    return this.currentView === 'register';
  }

  isHomeView(): boolean {
    return this.currentView === 'home';
  }
}
