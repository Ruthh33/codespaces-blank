// Validation Rules Constants
// Reglas de validación del sistema

export const VALIDATION_RULES = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Ingresa un correo electrónico válido',
  },
  phone: {
    pattern: /^\+?[\d\s\-()]{10,}$/,
    message: 'Ingresa un número de teléfono válido (mínimo 10 dígitos)',
  },
  username: {
    pattern: /^[a-zA-Z0-9]+$/,
    message: 'El nombre de usuario solo puede contener caracteres alfanuméricos',
  },
  password: {
    minLength: 8,
    message: 'La contraseña debe tener al menos 8 caracteres',
  },
  name: {
    minLength: 2,
    message: 'Debe tener al menos 2 caracteres',
  },
  firstName: {
    minLength: 2,
    message: 'El nombre debe tener al menos 2 caracteres',
  },
  lastName: {
    minLength: 2,
    message: 'El apellido debe tener al menos 2 caracteres',
  },
} as const;
