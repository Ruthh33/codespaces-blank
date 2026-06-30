// Contacts Mock Data
// Datos ficticios para desarrollo de contactos (extraído de DirectorioPage)

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  agentAssigned?: string;
  createdAt: string;
}

export const mockContacts: Contact[] = [
  {
    id: '1',
    firstName: 'María',
    lastName: 'González',
    phoneNumber: '+58 412-555-0101',
    agentAssigned: 'Carlos Mendoza',
    createdAt: '2026-06-15',
  },
  {
    id: '2',
    firstName: 'Juan',
    lastName: 'Pérez',
    phoneNumber: '+58 424-555-0102',
    agentAssigned: 'María Torres',
    createdAt: '2026-06-14',
  },
  {
    id: '3',
    firstName: 'Ana',
    lastName: 'Martínez',
    phoneNumber: '+58 212-555-0103',
    agentAssigned: 'Carlos Mendoza',
    createdAt: '2026-06-13',
  },
  {
    id: '4',
    firstName: 'Carlos',
    lastName: 'López',
    phoneNumber: '+58 416-555-0104',
    agentAssigned: undefined,
    createdAt: '2026-06-12',
  },
  {
    id: '5',
    firstName: 'Laura',
    lastName: 'Fernández',
    phoneNumber: '+58 414-555-0105',
    agentAssigned: 'María Torres',
    createdAt: '2026-06-11',
  },
];
