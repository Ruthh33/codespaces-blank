import { mockConversations, PanelConversation } from "../../mocks/chats";
import { chatTranscript } from "../../utils/formatters";

// Chat Service
// Gestión de conversaciones y mensajes (extraído de AgentChatTree y ChatView)

export const chatService = {
  /**
   * Obtiene todas las conversaciones
   */
  getConversations: (): PanelConversation[] => {
    return [...mockConversations];
  },

  /**
   * Obtiene una conversación por ID
   */
  getConversation: (id: string): PanelConversation | undefined => {
    return mockConversations.find((c) => c.id === id);
  },

  /**
   * Genera la transcripción formateada de una conversación
   */
  formatConversationTranscript: (conversation: PanelConversation, agentName: string = "Agente"): string => {
    return chatTranscript(agentName, {
      clientName: conversation.clientName,
      topic: conversation.topic,
      startTime: conversation.assignedSince,
      messages: conversation.messages.map(m => ({
        type: m.type,
        text: m.text,
        time: m.time,
        authorName: m.authorName,
        attachment: m.attachment
      }))
    });
  },

  /**
   * Filtra mensajes por agente (simulación)
   */
  getMessagesByAgent: (agentId: string) => {
    // Simulación: retornar mensajes donde el agente participó o está asignado
    return mockConversations.flatMap(c => c.messages);
  },

  /**
   * Agrega una etiqueta a una conversación
   */
  addLabel: (conversationId: string, label: string): boolean => {
    // Simulación
    return true;
  },

  /**
   * Envía un mensaje en una conversación
   */
  sendMessage: (conversationId: string, text: string, type: 'whatsapp_out' | 'internal_note' = 'whatsapp_out') => {
    return {
      id: String(Date.now()),
      type,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent' as const
    };
  }
};
