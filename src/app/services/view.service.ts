import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type ViewType = 'login' | 'register' | 'home';

export interface ViewData {
  email?: string;
  password?: string;
  [key: string]: any;
}

export interface RegisteredUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  registeredAt: string;
}

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

  registerUser(user: Omit<RegisteredUser, 'registeredAt'>): void {
    const normalizedEmail = user.email.trim().toLowerCase();
    const dataToStore: RegisteredUser = {
      ...user,
      email: normalizedEmail,
      registeredAt: new Date().toISOString(),
    };

    localStorage.setItem(this.getUserStorageKey(normalizedEmail), JSON.stringify(dataToStore));
  }

  getRegisteredUser(email: string): RegisteredUser | null {
    const normalizedEmail = email.trim().toLowerCase();
    const rawData = localStorage.getItem(this.getUserStorageKey(normalizedEmail));

    if (!rawData) {
      return null;
    }

    try {
      return JSON.parse(rawData) as RegisteredUser;
    } catch {
      return null;
    }
  }

  isEmailRegistered(email: string): boolean {
    return this.getRegisteredUser(email) !== null;
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

      try {
        const parsedUser = JSON.parse(rawData) as RegisteredUser;
        if (parsedUser.email) {
          users.push(parsedUser);
        }
      } catch {
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
}
