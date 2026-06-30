import JSZip from "jszip";
import { mockConversations } from "../../mocks/chats";
import { mockContacts } from "../../mocks/contacts";
import { chatTranscript, timestamp } from "../../utils/formatters";
import { downloadBlob, downloadCSV } from "../../utils/download";

// Backup Service
// Lógica de generación de respaldos (extraído de SettingsPage)

export const backupService = {
  /**
   * Genera un archivo ZIP con el historial de chats filtrado por agente
   */
  generateChatsZip: async (selectedAgentId: string = "todos") => {
    const zip = new JSZip();

    // En un entorno real, filtraríamos mockConversations por agente.
    // Por ahora usamos todos o simulamos el filtro si tuviéramos agentId en la conversación.
    const filteredConversations = selectedAgentId === "todos"
      ? mockConversations
      : mockConversations; // Simulación

    for (const conv of filteredConversations) {
      const folderName = `${conv.clientName.replace(/[^a-z0-9]/gi, "_")}_${conv.id}`;
      const folder = zip.folder(folderName);

      if (!folder) continue;

      // messages.txt con transcripción formateada
      // Nota: En SettingsPage se usaba una lógica manual, aquí usamos chatTranscript de utils
      const transcript = chatTranscript("Agente", {
        clientName: conv.clientName,
        topic: conv.topic,
        startTime: conv.assignedSince,
        messages: conv.messages.map(m => ({
          type: m.type,
          text: m.text,
          time: m.time,
          authorName: m.authorName,
          attachment: m.attachment
        }))
      });

      folder.file("messages.txt", transcript);

      // Adjuntos
      for (const m of conv.messages) {
        if (m.attachment && m.attachment.url) {
          try {
            // Solo intentamos fetch si es una URL válida (http/https)
            if (m.attachment.url.startsWith("http")) {
              const res = await fetch(m.attachment.url);
              const blob = await res.arrayBuffer();
              const filename = m.attachment.name || `attachment_${m.id}`;
              folder.file(filename, blob);
            }
          } catch (e) {
            console.warn("Failed to fetch attachment:", e);
          }
        }
      }
    }

    const content = await zip.generateAsync({ type: "blob" });
    const filename = `chats_signmedios_${selectedAgentId}_${Date.now()}.zip`;
    downloadBlob(content, filename);

    return {
      label: `Respaldo de chats - ${selectedAgentId === "todos" ? "Todos" : selectedAgentId} (ZIP)`,
      time: timestamp(),
      type: "chats" as const
    };
  },

  /**
   * Genera un archivo CSV con los contactos del directorio
   */
  generateContactsCSV: () => {
    const rows = [
      ["ID", "Nombre", "Teléfono", "Asignado a"],
      ...mockContacts.map((c) => [
        c.id,
        `${c.firstName} ${c.lastName}`,
        c.phoneNumber,
        c.agentAssigned ?? "Sin asignar"
      ])
    ];

    const filename = `contactos_signmedios_${Date.now()}.csv`;
    downloadCSV(rows, filename);

    return {
      label: "Respaldo de contactos (CSV)",
      time: timestamp(),
      type: "contacts" as const
    };
  },

  /**
   * Genera un respaldo completo (Chats + Contactos) en un ZIP
   */
  generateFullBackup: async () => {
    const zip = new JSZip();

    // 1. Agregar Chats
    for (const conv of mockConversations) {
      const folderName = `chats/${conv.clientName.replace(/[^a-z0-9]/gi, "_")}_${conv.id}`;
      const folder = zip.folder(folderName);
      if (!folder) continue;

      const transcript = chatTranscript("Agente", {
        clientName: conv.clientName,
        topic: conv.topic,
        startTime: conv.assignedSince,
        messages: conv.messages.map(m => ({
          type: m.type,
          text: m.text,
          time: m.time,
          authorName: m.authorName,
          attachment: m.attachment
        }))
      });
      folder.file("messages.txt", transcript);

      for (const m of conv.messages) {
        if (m.attachment && m.attachment.url && m.attachment.url.startsWith("http")) {
          try {
            const res = await fetch(m.attachment.url);
            const blob = await res.arrayBuffer();
            folder.file(m.attachment.name || `attachment_${m.id}`, blob);
          } catch (e) { console.warn("Failed to fetch attachment:", e); }
        }
      }
    }

    // 2. Agregar Contactos CSV
    const contactsCsv = [
      ["ID", "Nombre", "Teléfono", "Asignado a"],
      ...mockContacts.map((c) => [
        c.id,
        `${c.firstName} ${c.lastName}`,
        c.phoneNumber,
        c.agentAssigned ?? "Sin asignar"
      ])
    ].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");

    zip.file("contactos.csv", "﻿" + contactsCsv);

    const content = await zip.generateAsync({ type: "blob" });
    const filename = `backup_completo_signmedios_${Date.now()}.zip`;
    downloadBlob(content, filename);

    return {
      label: "Respaldo completo (ZIP)",
      time: timestamp(),
      type: "full" as const
    };
  },

  /**
   * Obtiene el historial de respaldos (simulado)
   */
  getBackupHistory: () => {
    // En un entorno real esto vendría de una base de datos o localStorage
    return [];
  },
};
