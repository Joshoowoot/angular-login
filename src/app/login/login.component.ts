import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ViewService } from '../services/view.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  readonly loginForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  submitAttempted: boolean = false;
  errorMessage: string = '';

  constructor(private viewService: ViewService) {}

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  onSubmit() {
    this.submitAttempted = true;
    const emailValue = this.loginForm.controls.email.value;
    const passwordValue = this.loginForm.controls.password.value;

    console.log('[Login] Attempting login for email:', emailValue);
    this.errorMessage = '';

    const normalizedEmail = emailValue.trim().toLowerCase();

    if (!this.isValidEmail(normalizedEmail) || !passwordValue) {
      console.log('[Login] Validation failed');
      this.errorMessage = 'Please enter a valid email and password.';
      return;
    }

    const loginResult = this.viewService.validateLogin(normalizedEmail, passwordValue);

    if (!loginResult.success) {
      this.errorMessage = loginResult.message;
      return;
    }

    console.log('[Login] Validation successful, navigating to home');
    this.viewService.setView('home', {
      email: normalizedEmail,
      password: passwordValue,
    });
  }

  goToRegister() {
    console.log('[Login] Navigating to registration page');
    this.submitAttempted = false;
    this.errorMessage = '';
    this.viewService.setView('register');
  }
}
