export interface RegistrationPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface RegisteredUserData extends RegistrationPayload {
  registeredAt: string;
}

function isRegisteredUserData(value: unknown): value is RegisteredUserData {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<RegisteredUserData>;

  return (
    typeof candidate.firstName === 'string' &&
    typeof candidate.lastName === 'string' &&
    typeof candidate.email === 'string' &&
    typeof candidate.password === 'string' &&
    typeof candidate.registeredAt === 'string'
  );
}

export class RegisteredUserModel {
  private constructor(private readonly data: RegisteredUserData) {}

  static fromData(data: RegisteredUserData): RegisteredUserModel {
    return new RegisteredUserModel({
      ...data,
      email: data.email.trim().toLowerCase(),
    });
  }

  static createNew(payload: RegistrationPayload): RegisteredUserModel {
    return new RegisteredUserModel({
      ...payload,
      email: payload.email.trim().toLowerCase(),
      registeredAt: new Date().toISOString(),
    });
  }

  static fromStorage(rawData: string): RegisteredUserModel | null {
    try {
      const parsed = JSON.parse(rawData) as unknown;

      if (!isRegisteredUserData(parsed)) {
        return null;
      }

      return new RegisteredUserModel({
        ...parsed,
        email: parsed.email.trim().toLowerCase(),
      });
    } catch {
      return null;
    }
  }

  update(payload: RegistrationPayload): RegisteredUserModel {
    return new RegisteredUserModel({
      ...this.data,
      ...payload,
      email: payload.email.trim().toLowerCase(),
    });
  }

  toData(): RegisteredUserData {
    return { ...this.data };
  }

  get storageKey(): string {
    return this.data.email;
  }
}
