// Teams Mock Data
// Datos ficticios para desarrollo de equipos (extraído de SettingsPage)

import type { Role, MemberStatus } from '../constants';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: MemberStatus;
  joinedAt: string;
  initials: string;
  avatarColor: string;
}

export interface Invitation {
  id: string;
  email: string;
  role: Role;
  sentAt: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'declined';
}

export const mockTeamMembers: TeamMember[] = [
  {
    id: 'm1',
    name: 'Supervisor SIGN',
    email: 'supervisor@signmedios.com',
    role: 'Administrador',
    status: 'activo',
    joinedAt: '01/01/2025',
    initials: 'SS',
    avatarColor: 'bg-blue-600',
  },
  {
    id: 'm2',
    name: 'Carlos Mendoza',
    email: 'cmendoza@signmedios.com',
    role: 'Supervisor',
    status: 'activo',
    joinedAt: '15/02/2025',
    initials: 'CM',
    avatarColor: 'bg-emerald-600',
  },
  {
    id: 'm3',
    name: 'María Torres',
    email: 'mtorres@signmedios.com',
    role: 'Agente',
    status: 'activo',
    joinedAt: '10/03/2025',
    initials: 'MT',
    avatarColor: 'bg-purple-600',
  },
  {
    id: 'm4',
    name: 'Andrés Vargas',
    email: 'avargas@signmedios.com',
    role: 'Agente',
    status: 'activo',
    joinedAt: '22/03/2025',
    initials: 'AV',
    avatarColor: 'bg-amber-600',
  },
  {
    id: 'm5',
    name: 'Gabriela Ruiz',
    email: 'gruiz@signmedios.com',
    role: 'Supervisor',
    status: 'activo',
    joinedAt: '05/04/2025',
    initials: 'GR',
    avatarColor: 'bg-rose-600',
  },
];

export const mockInvitations: Invitation[] = [];
