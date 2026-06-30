// Formatters Utilities
// Funciones de formateo reutilizables (extraído de SettingsPage)

/**
 * Retorna timestamp actual en formato localizado (es-VE)
 * Ej: "30/06/2026 14:30"
 */
export function timestamp(): string {
  return new Date().toLocaleString('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(
  date: Date,
  locale: string = 'es-VE',
  options?: Intl.DateTimeFormatOptions
): string {
  return new Date(date).toLocaleString(locale, options || { dateStyle: 'short' });
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned;
}

export function chatTranscript(
  agentName: string,
  conversation: {
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
  }
): string {
  const header = [
    `Agente: ${agentName}`,
    `Cliente: ${conversation.clientName}`,
    `Tema: ${conversation.topic}`,
    ...(conversation.status ? [`Estado: ${conversation.status}`] : []),
    `Inicio: ${conversation.startTime}`,
    '',
  ].join('\n');

  const body = conversation.messages
    .map((msg, index) => {
      const sender =
        msg.type === 'whatsapp_out'
          ? 'Agente'
          : msg.type === 'whatsapp_in'
            ? 'Cliente'
            : 'Nota interna';
      const author = msg.authorName ? ` (${msg.authorName})` : '';
      const attachmentNote = msg.attachment
        ? ` [Adjunto: ${msg.attachment.name || 'archivo'}]`
        : '';
      return `${index + 1}. [${msg.time}] ${sender}${author}: ${msg.text}${attachmentNote}`;
    })
    .join('\n');

  return `${header}\n${body}`;
}

export function formatCurrency(amount: number, currency: string = 'USD', locale: string = 'es-VE'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  return `${hours}:${minutes}`;
}
