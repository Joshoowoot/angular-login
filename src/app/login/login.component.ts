import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ViewService } from '../services/view.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private viewService: ViewService) {}

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  onSubmit() {
    console.log('[Login] Attempting login for email:', this.email);
    this.errorMessage = '';

    const normalizedEmail = this.email.trim().toLowerCase();

    if (!this.isValidEmail(normalizedEmail) || !this.password) {
      console.log('[Login] Validation failed');
      this.errorMessage = 'Please enter a valid email and password.';
      return;
    }

    const loginResult = this.viewService.validateLogin(normalizedEmail, this.password);

    if (!loginResult.success) {
      this.errorMessage = loginResult.message;
      return;
    }

    console.log('[Login] Validation successful, navigating to home');
    this.viewService.setView('home', {
      email: normalizedEmail,
      password: this.password,
    });
  }

  goToRegister() {
    console.log('[Login] Navigating to registration page');
    this.viewService.setView('register');
  }
}
