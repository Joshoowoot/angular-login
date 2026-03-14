import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RegisteredUser, ViewService } from '../services/view.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  registrationSuccess: boolean = false;
  errorMessage: string = '';
  users: RegisteredUser[] = [];

  constructor(private viewService: ViewService) {}

  ngOnInit(): void {
    this.users = this.viewService.getAllRegisteredUsers();
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private isValidPassword(password: string): boolean {
    return password.length >= 6;
  }

  onSubmit() {
    console.log('[Register] Attempting registration for:', this.email);
    this.errorMessage = '';
    this.registrationSuccess = false;

    if (!this.firstName.trim()) {
      console.log('[Register] Validation failed: First name required');
      this.errorMessage = 'First name is required';
      return;
    }

    if (!this.lastName.trim()) {
      this.errorMessage = 'Last name is required';
      return;
    }

    const normalizedEmail = this.email.trim().toLowerCase();

    if (!this.isValidEmail(normalizedEmail)) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }

    if (!this.isValidPassword(this.password)) {
      this.errorMessage = 'Password must be at least 6 characters long';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    if (this.viewService.isEmailRegistered(normalizedEmail)) {
      this.errorMessage = 'This email is already registered. Please login instead.';
      return;
    }

    // Registration successful
    this.registrationSuccess = true;
    console.log('[Register] Registration successful!');

    const userData = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: normalizedEmail,
      password: this.password,
    };

    console.log('[Register] Storing user data:', userData);
    this.viewService.registerUser(userData);
    this.users = this.viewService.getAllRegisteredUsers();

    // Redirect to login after 2 seconds
    setTimeout(() => {
      this.viewService.setView('login', { email: normalizedEmail });
      this.resetForm();
    }, 2000);
  }

  goToLogin() {
    console.log('[Register] Navigating back to login');
    this.viewService.setView('login');
    this.resetForm();
  }

  formatDate(dateValue: string): string {
    const parsedDate = new Date(dateValue);
    if (Number.isNaN(parsedDate.getTime())) {
      return 'N/A';
    }
    return parsedDate.toLocaleString();
  }

  private resetForm() {
    this.firstName = '';
    this.lastName = '';
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
    this.registrationSuccess = false;
    this.errorMessage = '';
  }
}
