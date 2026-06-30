// Export Service
// Servicios de exportación de datos (chats, contactos, usuarios, equipos)

import { createZip } from '../../utils/zip';
import { downloadCSV } from '../../utils/download';
import { createCSVWithBOM } from '../../utils/csv';
import { chatTranscript, timestamp } from '../../utils/formatters';

export async function exportChatsToZip(
  conversations: Array<{
    id?: string;
    clientName: string;
    topic: string;
    status?: string;
    startTime: string;
    messages: Array<{
      type: string;
      text: string;
      time: string;
      authorName?: string;
      attachment?: { name?: string };
    }>;
  }>,
  filename: string = `chats_${timestamp().replace(/\D/g, '_')}.zip`
): Promise<void> {
  const csvData = conversations.map((conv, index) => [
    String(index + 1),
    conv.clientName,
    conv.topic,
    conv.status || 'Completada',
    conv.startTime,
    String(conv.messages.length),
  ]);
  csvData.unshift(['ID', 'Cliente', 'Tema', 'Estado', 'Inicio', 'Mensajes']);
  const csvContent = createCSVWithBOM(csvData.map(r => r.map(c => c)));

  const transcripts = conversations.map((conv, index) => ({
    path: `conversation_${index + 1}.txt`,
    content: chatTranscript('Sistema', conv),
  }));

  const jsonFiles = [
    {
      path: 'chats_summary.json',
      content: JSON.stringify(conversations.map((c) => ({
        clientName: c.clientName,
        topic: c.topic,
        status: c.status || 'Completada',
        startTime: c.startTime,
        messageCount: c.messages.length,
      })), null, 2),
    },
    {
      path: 'chats_full.json',
      content: JSON.stringify(conversations, null, 2),
    },
  ];

  const files = [
    {
      path: 'resumen_chats.csv',
      content: csvContent,
    },
    ...transcripts,
    ...jsonFiles,
  ];

  await createZip(files, filename);
}

export function exportContactsToCSV(
  contacts: Array<{
    id?: string;
    name: string;
    phone?: string;
    email?: string;
    company?: string;
    lastMessage?: string;
    status?: string;
  }>,
  filename: string = `contacts_${timestamp().replace(/\D/g, '_')}.csv`
): void {
  const rows: Array<Array<string>> = contacts.map((contact) => [
    contact.name,
    contact.phone || '',
    contact.email || '',
    contact.company || '',
    contact.lastMessage || '',
    contact.status || 'Activo',
  ]);
  rows.unshift(['Nombre', 'Teléfono', 'Email', 'Empresa', 'Último Mensaje', 'Estado']);
  downloadCSV(rows, filename);
}

export function exportUsersToCSV(
  users: Array<{
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    role?: string;
    status?: string;
    createdAt?: string;
  }>,
  filename: string = `users_${timestamp().replace(/\D/g, '_')}.csv`
): void {
  const rows: Array<Array<string>> = users.map((user) => [
    user.firstName,
    user.lastName,
    user.email,
    user.role || 'Agente',
    user.status || 'Activo',
    user.createdAt || '',
  ]);
  rows.unshift(['Nombre', 'Apellido', 'Email', 'Rol', 'Estado', 'Fecha Creación']);
  downloadCSV(rows, filename);
}

export function exportTeamToCSV(
  team: Array<{
    id?: string;
    name: string;
    role: string;
    status: string;
    email?: string;
    joinDate?: string;
  }>,
  filename: string = `team_${timestamp().replace(/\D/g, '_')}.csv`
): void {
  const rows: Array<Array<string>> = team.map((member) => [
    member.name,
    member.role,
    member.status,
    member.email || '',
    member.joinDate || '',
  ]);
  rows.unshift(['Nombre', 'Rol', 'Estado', 'Email', 'Fecha de Ingreso']);
  downloadCSV(rows, filename);
}

export async function exportFullCRMBackup(
  data: {
    chats?: unknown[];
    contacts?: unknown[];
    users?: unknown[];
    team?: unknown[];
    settings?: Record<string, unknown>;
  },
  filename: string = `crm_backup_${timestamp().replace(/\D/g, '_')}.zip`
): Promise<void> {
  const files: Array<{
    path: string;
    content: string | Blob | ArrayBuffer | Uint8Array;
  }> = [];

  if (data.chats && data.chats.length > 0) {
    files.push({
      path: 'data/chats.json',
      content: JSON.stringify(data.chats, null, 2),
    });
  }
  if (data.contacts && data.contacts.length > 0) {
    files.push({
      path: 'data/contacts.json',
      content: JSON.stringify(data.contacts, null, 2),
    });
  }
  if (data.users && data.users.length > 0) {
    files.push({
      path: 'data/users.json',
      content: JSON.stringify(data.users, null, 2),
    });
  }
  if (data.team && data.team.length > 0) {
    files.push({
      path: 'data/team.json',
      content: JSON.stringify(data.team, null, 2),
    });
  }
  if (data.settings) {
    files.push({
      path: 'data/settings.json',
      content: JSON.stringify(data.settings, null, 2),
    });
  }
  files.push({
    path: 'README.md',
    content: `# CRM SIGN Medios - Backup\n\n**Fecha**: ${new Date().toLocaleString('es-VE')}\n\nEste archivo contiene un backup completo del CRM con los siguientes datos:\n- Conversaciones\n- Contactos\n- Usuarios\n- Equipo\n- Configuraciones\n\nPara restaurar, importar cada archivo JSON en su respectiva sección del CRM.`,
    });
  await createZip(files, filename);
}
