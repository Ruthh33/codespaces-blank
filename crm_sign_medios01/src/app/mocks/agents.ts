// Agents Mock Data
// Datos ficticios para desarrollo de agentes (extraído de agentsData.ts y agentPanelData.ts)

export interface Agent {
  id: string;
  name: string;
  role: string;
  phone: string;
  avatar: string;
  initials: string;
  online: boolean;
  conversations: unknown[];
}

export const mockAgents: Agent[] = [
  {
    id: '1',
    name: 'Carlos Mendoza',
    role: 'Agente Senior',
    phone: '+58 412-555-0101',
    avatar: '',
    initials: 'CM',
    online: true,
    conversations: [],
  },
  {
    id: '2',
    name: 'María Torres',
    role: 'Agente de Soporte',
    phone: '+58 424-555-0102',
    avatar: '',
    initials: 'MT',
    online: false,
    conversations: [],
  },
];

export interface CurrentAgent {
  name: string;
  initials: string;
  role: string;
  department: string;
  phone: string;
  email: string;
  assignedLine?: string;
  joinedSince?: string;
}

export const mockCurrentAgent: CurrentAgent = {
  name: 'Carlos Mendoza',
  initials: 'CM',
  role: 'Agente Senior',
  department: 'Ventas & Retención',
  phone: '+58 412-555-0101',
  email: 'cmendoza@signmedios.com',
  assignedLine: '+58 212-700-4000 ext. 203',
  joinedSince: '15/03/2024',
};
