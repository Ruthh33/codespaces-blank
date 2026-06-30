import { useState, useEffect } from "react";
import { ChatSidebar } from "../components/agent/ChatSidebar";
import { ChatView } from "../components/agent/ChatView";
import { chatService } from "../services/domain/chatService";
import type { PanelConversation, PanelMessage } from "../components/agent/agentPanelData";

export function AgentPanelPage() {
  const [conversations, setConversations] = useState<PanelConversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [localMessages, setLocalMessages] = useState<Record<string, PanelMessage[]>>({});
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchedConvs = chatService.getConversations();
    setConversations(fetchedConvs);
    if (fetchedConvs.length > 0) {
      setSelectedId(fetchedConvs[0].id);
    }

    const initialMessages = Object.fromEntries(fetchedConvs.map((c) => [c.id, c.messages]));
    setLocalMessages(initialMessages);
  }, []);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setReadIds((prev) => new Set([...prev, id]));
  };

  const handleUpdateMessages = (convId: string, msgs: PanelMessage[]) => {
    setLocalMessages((prev) => ({ ...prev, [convId]: msgs }));
  };

  const processedConversations: PanelConversation[] = conversations.map((c) => ({
    ...c,
    unreadCount: readIds.has(c.id) ? 0 : c.unreadCount,
    lastMessage:
      localMessages[c.id]?.length
        ? localMessages[c.id][localMessages[c.id].length - 1].text
        : c.lastMessage,
  }));

  const selectedConv = processedConversations.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <ChatSidebar
        conversations={processedConversations}
        selectedId={selectedId}
        onSelect={handleSelect}
      />
      <ChatView
        conv={selectedConv}
        localMessages={selectedId ? (localMessages[selectedId] ?? []) : []}
        onUpdateMessages={handleUpdateMessages}
      />
    </div>
  );
}
