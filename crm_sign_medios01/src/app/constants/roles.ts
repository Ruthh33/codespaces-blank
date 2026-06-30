// Roles Constants
// Configuración de roles del sistema (extraído de SettingsPage)

import { Crown, UserCog, Shield } from 'lucide-react';

export type Role = 'Administrador' | 'Supervisor' | 'Agente';

export const ROLES = {
  ADMIN: 'Administrador',
  SUPERVISOR: 'Supervisor',
  AGENT: 'Agente',
} as const;

export const ROLE_CONFIG: Record<Role, { icon: React.ReactNode; color: string; bg: string; desc: string }> = {
  'Administrador': {
    icon: <Crown size={13} />,
    color: 'text-blue-700',
    bg: 'bg-blue-100',
    desc: 'Acceso total al sistema: usuarios, ajustes, respaldos y permisos.',
  },
  'Supervisor': {
    icon: <UserCog size={13} />,
    color: 'text-emerald-700',
    bg: 'bg-emerald-100',
    desc: 'Puede ver todos los agentes, chats y gestionar fichas.',
  },
  'Agente': {
    icon: <Shield size={13} />,
    color: 'text-amber-700',
    bg: 'bg-amber-100',
    desc: 'Accede solo a sus propias conversaciones y contactos asignados.',
  },
} as const;
