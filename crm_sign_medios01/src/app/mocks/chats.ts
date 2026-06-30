// Chats Mock Data
// Datos ficticios para desarrollo de conversaciones (extraído de agentPanelData.ts)

export type MessageType = 'whatsapp_in' | 'whatsapp_out' | 'internal_note';

export interface PanelAttachment {
  name: string;
  url: string;
  isImage: boolean;
  size?: string;
}

export interface PanelMessage {
  id: string;
  type: MessageType;
  text: string;
  time: string;
  authorName?: string;
  authorInitials?: string;
  status?: 'sent' | 'delivered' | 'read';
  attachment?: PanelAttachment;
}

export interface PanelConversation {
  id: string;
  clientName: string;
  clientPhone: string;
  clientInitials: string;
  avatarColor: string;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
  clientOnline: boolean;
  assignedSince: string;
  topic: string;
  messages: PanelMessage[];
}

export const mockConversations: PanelConversation[] = [
  {
    id: 'pc1',
    clientName: 'Pedro Ramírez',
    clientPhone: '+58 414-234-5678',
    clientInitials: 'PR',
    avatarColor: 'bg-violet-500',
    lastMessage: 'Perfecto, quedo pendiente de la propuesta.',
    lastTime: '09:42',
    unreadCount: 2,
    clientOnline: true,
    assignedSince: '07/06/2026',
    topic: 'Plan empresarial',
    messages: [
      { id: 'm1', type: 'whatsapp_in', text: 'Buenos días, me comunicaron que ustedes tienen planes para empresas.', time: '09:10' },
      { id: 'm2', type: 'whatsapp_out', text: '¡Hola Pedro! Claro que sí. ¿Para cuántos usuarios necesitas el plan?', time: '09:11', status: 'read' },
      { id: 'm3', type: 'internal_note', text: 'Cliente referido por el distribuidor zona este. Tiene presupuesto aprobado Q3. Buen candidato para plan corporativo.', time: '09:12', authorName: 'Carlos Mendoza', authorInitials: 'CM' },
      { id: 'm4', type: 'whatsapp_in', text: 'Somos 50 personas. Necesitamos internet + telefonía.', time: '09:14' },
      { id: 'm5', type: 'whatsapp_out', text: 'Perfecto. El Plan Corporativo Plus cubre ambos servicios con SLA garantizado. Te envío la propuesta ahora.', time: '09:15', status: 'read' },
      { id: 'm6', type: 'whatsapp_in', text: 'Perfecto, quedo pendiente de la propuesta.', time: '09:42' },
    ],
  },
  {
    id: 'pc2',
    clientName: 'Laura Gómez',
    clientPhone: '+58 412-876-5432',
    clientInitials: 'LG',
    avatarColor: 'bg-rose-500',
    lastMessage: 'Claro, espero tu respuesta.',
    lastTime: '10:32',
    unreadCount: 1,
    clientOnline: false,
    assignedSince: '06/06/2026',
    topic: 'Problema de facturación',
    messages: [
      { id: 'm1', type: 'whatsapp_in', text: 'Hola, tengo un cobro duplicado en mi factura de este mes.', time: '10:30' },
      { id: 'm2', type: 'whatsapp_out', text: 'Hola Laura, entiendo. Déjame revisar tu cuenta. Dame un momento por favor.', time: '10:31', status: 'read' },
      { id: 'm3', type: 'internal_note', text: 'Cobro duplicado confirmado en sistema. Escalar a facturación. Ref: FAC-2026-4421. Dar respuesta antes de las 12 PM.', time: '10:31', authorName: 'Carlos Mendoza', authorInitials: 'CM' },
      { id: 'm4', type: 'whatsapp_in', text: 'Claro, espero tu respuesta.', time: '10:32' },
    ],
  },
  {
    id: 'pc3',
    clientName: 'Roberto Silva',
    clientPhone: '+58 424-111-2233',
    clientInitials: 'RS',
    avatarColor: 'bg-emerald-600',
    lastMessage: '¡Listo, tu plan ha sido actualizado. Que lo disfrutes!',
    lastTime: '08:06',
    unreadCount: 0,
    clientOnline: false,
    assignedSince: '05/06/2026',
    topic: 'Upgrade plan Premium',
    messages: [
      { id: 'm1', type: 'whatsapp_in', text: 'Buenos días. Quiero pasar al plan premium, ¿cómo lo hago?', time: '08:00' },
      { id: 'm2', type: 'whatsapp_out', text: 'Buenos días Roberto. Con gusto lo procesamos. ¿Confirmas que los datos de tu cuenta son correctos?', time: '08:02', status: 'read' },
      { id: 'm3', type: 'whatsapp_in', text: 'Sí, todo correcto.', time: '08:04' },
      { id: 'm4', type: 'internal_note', text: 'Upgrade de Plan Básico a Premium completado. Efectivo desde hoy. Sin cargos adicionales este mes por ser cliente desde hace +1 año.', time: '08:05', authorName: 'Carlos Mendoza', authorInitials: 'CM' },
      { id: 'm5', type: 'whatsapp_out', text: '¡Listo, tu plan ha sido actualizado. Que lo disfrutes!', time: '08:06', status: 'read' },
    ],
  },
];
