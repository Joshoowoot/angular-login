import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RegisteredUser, ViewService } from '../services/view.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent implements OnInit {
  readonly registrationForm = new FormGroup(
    {
      firstName: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      lastName: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(6)],
      }),
      confirmPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    { validators: [RegisterComponent.passwordsMatchValidator] }
  );

  registrationSuccess: boolean = false;
  submitAttempted: boolean = false;
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

  private static passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (!password || !confirmPassword) {
      return null;
    }

    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit() {
    this.submitAttempted = true;
    const { firstName, lastName, email, password, confirmPassword } = this.registrationForm.getRawValue();

    console.log('[Register] Attempting registration for:', email);
    this.errorMessage = '';
    this.registrationSuccess = false;

    if (!firstName.trim()) {
      console.log('[Register] Validation failed: First name required');
      this.errorMessage = 'First name is required';
      return;
    }

    if (!lastName.trim()) {
      this.errorMessage = 'Last name is required';
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!this.isValidEmail(normalizedEmail)) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }

    if (!this.isValidPassword(password)) {
      this.errorMessage = 'Password must be at least 6 characters long';
      return;
    }

    if (password !== confirmPassword) {
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
      firstName,
      lastName,
      email: normalizedEmail,
      password,
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
    this.registrationForm.reset({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    this.submitAttempted = false;
    this.registrationSuccess = false;
    this.errorMessage = '';
  }
}
