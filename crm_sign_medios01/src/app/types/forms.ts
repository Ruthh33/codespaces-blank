// Form Types
// Tipos relacionados con formularios

export interface FormField {
  name: string;
  type: 'text' | 'email' | 'tel' | 'password' | 'select' | 'textarea' | 'file';
  label: string;
  placeholder?: string;
  required?: boolean;
  validation?: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    custom?: (value: unknown) => boolean | string;
  };
}

export interface FormErrors {
  [key: string]: string | undefined;
}

export interface FormState<T extends Record<string, unknown>> {
  data: T;
  errors: FormErrors;
  isSubmitting: boolean;
  isDirty: boolean;
}

// Form específicos por dominio
export interface ContactFormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface UserRecordFormData extends Record<string, unknown> {
  username?: string;
  email?: string;
  role?: string;
  status?: string;
}

export type Tab = 'todos' | 'por-agentes';
