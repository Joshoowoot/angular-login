import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  RegisteredUserData,
  RegisteredUserModel,
  RegistrationPayload,
} from '../models/registered-user.model';

export type ViewType = 'login' | 'register' | 'home' | 'dashboard';

export interface ViewData {
  email?: string;
  password?: string;
  [key: string]: any;
}

export type RegisteredUser = RegisteredUserData;

@Injectable({
  providedIn: 'root'
})
export class ViewService {
  private readonly userStoragePrefix = 'user_';

  private currentViewSubject = new BehaviorSubject<ViewType>('login');
  public currentView$: Observable<ViewType> = this.currentViewSubject.asObservable();

  private viewDataSubject = new BehaviorSubject<ViewData>({});
  public viewData$: Observable<ViewData> = this.viewDataSubject.asObservable();

  constructor() {}

  getCurrentView(): ViewType {
    return this.currentViewSubject.getValue();
  }

  setView(view: ViewType, data?: ViewData): void {
    console.log('[ViewService] Navigating to view:', view);
    if (data) {
      console.log('[ViewService] View data:', data);
    }
    this.currentViewSubject.next(view);
    if (data) {
      this.viewDataSubject.next(data);
    }
  }

  getViewData(): ViewData {
    return this.viewDataSubject.getValue();
  }

  setViewData(data: ViewData): void {
    this.viewDataSubject.next(data);
  }

  clearViewData(): void {
    console.log('[ViewService] Clearing view data');
    this.viewDataSubject.next({});
  }

  createRegisteredUser(payload: RegistrationPayload): RegisteredUser {
    const model = RegisteredUserModel.createNew(payload);
    this.saveUserModel(model);
    return model.toData();
  }

  registerUser(user: Omit<RegisteredUser, 'registeredAt'>): void {
    this.createRegisteredUser(user);
  }

  getRegisteredUser(email: string): RegisteredUser | null {
    const normalizedEmail = email.trim().toLowerCase();
    const rawData = localStorage.getItem(this.getUserStorageKey(normalizedEmail));

    if (!rawData) {
      return null;
    }

    const parsedModel = RegisteredUserModel.fromStorage(rawData);
    return parsedModel ? parsedModel.toData() : null;
  }

  isEmailRegistered(email: string): boolean {
    return this.getRegisteredUser(email) !== null;
  }

  updateRegisteredUser(originalEmail: string, payload: RegistrationPayload): { success: boolean; message: string } {
    const currentUser = this.getRegisteredUser(originalEmail);

    if (!currentUser) {
      return {
        success: false,
        message: 'Unable to update. User record was not found.',
      };
    }

    const nextEmail = payload.email.trim().toLowerCase();
    const normalizedOriginalEmail = originalEmail.trim().toLowerCase();

    if (nextEmail !== normalizedOriginalEmail && this.isEmailRegistered(nextEmail)) {
      return {
        success: false,
        message: 'Cannot update. The new email is already registered by another account.',
      };
    }

    const updatedModel = RegisteredUserModel.fromData(currentUser).update(payload);

    if (nextEmail !== normalizedOriginalEmail) {
      localStorage.removeItem(this.getUserStorageKey(normalizedOriginalEmail));
    }

    this.saveUserModel(updatedModel);

    return {
      success: true,
      message: 'User updated successfully.',
    };
  }

  deleteRegisteredUser(email: string): boolean {
    const normalizedEmail = email.trim().toLowerCase();
    const storageKey = this.getUserStorageKey(normalizedEmail);

    if (!localStorage.getItem(storageKey)) {
      return false;
    }

    localStorage.removeItem(storageKey);
    return true;
  }

  getAllRegisteredUsers(): RegisteredUser[] {
    const users: RegisteredUser[] = [];

    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);

      if (!key || !key.startsWith(this.userStoragePrefix)) {
        continue;
      }

      const rawData = localStorage.getItem(key);
      if (!rawData) {
        continue;
      }

      const userModel = RegisteredUserModel.fromStorage(rawData);
      if (userModel) {
        users.push(userModel.toData());
      } else {
        // Ignore malformed user records and continue loading valid accounts.
      }
    }

    return users.sort((a, b) => b.registeredAt.localeCompare(a.registeredAt));
  }

  validateLogin(email: string, password: string): { success: boolean; message: string } {
    const registeredUser = this.getRegisteredUser(email);

    if (!registeredUser) {
      return {
        success: false,
        message: 'No registered account found for this email. Please register first.',
      };
    }

    if (registeredUser.password !== password) {
      return {
        success: false,
        message: 'Invalid password. Please try again.',
      };
    }

    return {
      success: true,
      message: 'Login successful.',
    };
  }

  private getUserStorageKey(email: string): string {
    return `${this.userStoragePrefix}${email}`;
  }

  private saveUserModel(model: RegisteredUserModel): void {
    const user = model.toData();
    localStorage.setItem(this.getUserStorageKey(model.storageKey), JSON.stringify(user));
  }
}
