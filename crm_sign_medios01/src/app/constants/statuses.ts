// Status Constants
// Configuración de estados del sistema (extraído de SettingsPage)

export type MemberStatus = 'activo' | 'pendiente' | 'suspendido';

export const STATUSES = {
  ACTIVE: 'activo',
  PENDING: 'pendiente',
  SUSPENDED: 'suspendido',
} as const;

export const STATUS_CONFIG: Record<MemberStatus, { label: string; cls: string; dot: string }> = {
  activo: {
    label: 'Activo',
    cls: 'bg-emerald-100 text-emerald-700',
    dot: 'bg-emerald-500',
  },
  pendiente: {
    label: 'Pendiente',
    cls: 'bg-amber-100 text-amber-700',
    dot: 'bg-amber-400',
  },
  suspendido: {
    label: 'Suspendido',
    cls: 'bg-red-100 text-red-600',
    dot: 'bg-red-400',
  },
} as const;
