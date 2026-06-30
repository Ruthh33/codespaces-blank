// Users Mock Data
// Datos ficticios para desarrollo de usuarios

export interface UserRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  joinedAt: string;
}

export const mockUsers: UserRecord[] = [
  {
    id: 'u1',
    firstName: 'Carlos',
    lastName: 'Mendoza',
    email: 'cmendoza@signmedios.com',
    role: 'Agente',
    status: 'activo',
    joinedAt: '15/02/2025',
  },
  {
    id: 'u2',
    firstName: 'María',
    lastName: 'Torres',
    email: 'mtorres@signmedios.com',
    role: 'Agente',
    status: 'activo',
    joinedAt: '10/03/2025',
  },
];
