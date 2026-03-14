import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate email format', () => {
    const validEmail = component['isValidEmail']('test@example.com');
    const invalidEmail = component['isValidEmail']('invalid-email');
    
    expect(validEmail).toBe(true);
    expect(invalidEmail).toBe(false);
  });

  it('should validate password length', () => {
    const validPassword = component['isValidPassword']('password123');
    const invalidPassword = component['isValidPassword']('pass');
    
    expect(validPassword).toBe(true);
    expect(invalidPassword).toBe(false);
  });
});
