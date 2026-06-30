// Validators Utilities
// Funciones de validación reutilizables (extraído de DirectorioPage, SettingsPage)

import { VALIDATION_RULES } from '../constants';

export function isValidEmail(email: string): boolean {
  return VALIDATION_RULES.email.pattern.test(email);
}

export function isValidPhone(phone: string): boolean {
  return VALIDATION_RULES.phone.pattern.test(phone);
}

export function isValidUsername(username: string): boolean {
  return VALIDATION_RULES.username.pattern.test(username);
}

export function isValidPassword(password: string): boolean {
  return password.length >= VALIDATION_RULES.password.minLength;
}

export function isValidName(name: string): boolean {
  return name.trim().length >= VALIDATION_RULES.name.minLength;
}

export function isValidFirstName(firstName: string): boolean {
  return firstName.trim().length >= VALIDATION_RULES.firstName.minLength;
}

export function isValidLastName(lastName: string): boolean {
  return lastName.trim().length >= VALIDATION_RULES.lastName.minLength;
}

export function validateField(
  value: string,
  rules: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    custom?: (val: string) => boolean | string;
  }
): string | null {
  if (!value && rules.minLength === undefined) return null;

  if (rules.minLength && value.length < rules.minLength) {
    return `Mínimo ${rules.minLength} caracteres`;
  }

  if (rules.maxLength && value.length > rules.maxLength) {
    return `Máximo ${rules.maxLength} caracteres`;
  }

  if (rules.pattern && !rules.pattern.test(value)) {
    return 'Formato inválido';
  }

  if (rules.custom) {
    const customResult = rules.custom(value);
    if (typeof customResult === 'string') return customResult;
    if (!customResult) return 'Validación fallida';
  }

  return null;
}

export function validateForm<T extends Record<string, unknown>>(
  formData: T,
  schema: Record<keyof T, (value: unknown) => string | null>
): Record<keyof T, string | undefined> {
  const errors: Record<string, string | undefined> = {};

  for (const [key, validator] of Object.entries(schema)) {
    const value = formData[key as keyof T];
    const error = validator(value);
    if (error) {
      errors[key] = error;
    }
  }

  return errors as Record<keyof T, string | undefined>;
}
