import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RegistrationPayload } from '../models/registered-user.model';
import { RegisteredUser, ViewService } from '../services/view.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent implements OnInit {
  private readonly viewService = inject(ViewService);

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

  readonly registrationSuccess = signal(false);
  readonly submitAttempted = signal(false);
  readonly errorMessage = signal('');
  readonly users = signal<RegisteredUser[]>([]);
  readonly isEditMode = signal(false);
  readonly submitButtonLabel = computed(() => (this.isEditMode() ? 'Update User' : 'Register'));

  private editingEmail: string | null = null;

  ngOnInit(): void {
    this.loadUsers();
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
    this.submitAttempted.set(true);
    const { firstName, lastName, email, password, confirmPassword } = this.registrationForm.getRawValue();

    console.log('[Register] Attempting registration for:', email);
    this.errorMessage.set('');
    this.registrationSuccess.set(false);

    if (!firstName.trim()) {
      console.log('[Register] Validation failed: First name required');
      this.errorMessage.set('First name is required');
      return;
    }

    if (!lastName.trim()) {
      this.errorMessage.set('Last name is required');
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!this.isValidEmail(normalizedEmail)) {
      this.errorMessage.set('Please enter a valid email address');
      return;
    }

    if (!this.isValidPassword(password)) {
      this.errorMessage.set('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      this.errorMessage.set('Passwords do not match');
      return;
    }

    const userData: RegistrationPayload = {
      firstName,
      lastName,
      email: normalizedEmail,
      password,
    };

    if (this.isEditMode()) {
      if (!this.editingEmail) {
        this.errorMessage.set('Cannot update because no user is selected for editing.');
        return;
      }

      const updateResult = this.viewService.updateRegisteredUser(this.editingEmail, userData);
      if (!updateResult.success) {
        this.errorMessage.set(updateResult.message);
        return;
      }

      this.registrationSuccess.set(true);
      this.loadUsers();
      this.resetForm();
      return;
    }

    if (this.viewService.isEmailRegistered(normalizedEmail)) {
      this.errorMessage.set('This email is already registered. Please login instead.');
      return;
    }

    console.log('[Register] Storing user data:', userData);
    this.viewService.createRegisteredUser(userData);
    this.registrationSuccess.set(true);
    this.loadUsers();
    this.resetForm();
  }

  goToLogin() {
    console.log('[Register] Navigating back to login');
    this.viewService.setView('login');
    this.resetForm();
  }

  startEdit(user: RegisteredUser): void {
    this.isEditMode.set(true);
    this.editingEmail = user.email;
    this.submitAttempted.set(false);
    this.registrationSuccess.set(false);
    this.errorMessage.set('');

    this.registrationForm.setValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
      confirmPassword: user.password,
    });
  }

  cancelEdit(): void {
    this.resetForm();
  }

  deleteUser(user: RegisteredUser): void {
    const shouldDelete = window.confirm(`Delete user ${user.email}?`);
    if (!shouldDelete) {
      return;
    }

    const isDeleted = this.viewService.deleteRegisteredUser(user.email);
    if (!isDeleted) {
      this.errorMessage.set('Unable to delete user. Please refresh and try again.');
      return;
    }

    if (this.editingEmail === user.email) {
      this.resetForm();
    }

    this.registrationSuccess.set(false);
    this.errorMessage.set('');
    this.loadUsers();
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
    this.submitAttempted.set(false);
    this.registrationSuccess.set(false);
    this.errorMessage.set('');
    this.isEditMode.set(false);
    this.editingEmail = null;
  }

  private loadUsers(): void {
    this.users.set(this.viewService.getAllRegisteredUsers());
  }
}
