import React from "react";
import { Users, Phone } from "lucide-react";
import { ContactCard } from "./ContactCard";
import type { Contact } from "../../types";

interface ContactListProps {
  activeTab: "todos" | "por-agentes";
  filteredContacts: Contact[];
  agents: string[];
  groupedByAgent: Record<string, Contact[]>;
  onDeleteContact: (id: string) => void;
}

export function ContactList({
  activeTab,
  filteredContacts,
  agents,
  groupedByAgent,
  onDeleteContact
}: ContactListProps) {
  if (activeTab === "todos") {
    return (
      <div className="space-y-3">
        {filteredContacts.length === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50">
            <div className="text-center">
              <Users size={32} className="mx-auto mb-2 text-slate-400 opacity-30" />
              <p className="text-sm text-slate-500">No hay contactos para mostrar</p>
            </div>
          </div>
        ) : (
          filteredContacts.map((contact) => (
            <ContactCard key={contact.id} contact={contact} onDelete={onDeleteContact} />
          ))
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {agents.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50">
          <div className="text-center">
            <Phone size={32} className="mx-auto mb-2 text-slate-400 opacity-30" />
            <p className="text-sm text-slate-500">No hay agentes con contactos asignados</p>
          </div>
        </div>
      ) : (
        agents.map((agent) => (
          <div key={agent} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-slate-800">{agent}</h3>
            <div className="space-y-2">
              {groupedByAgent[agent]?.map((contact) => (
                <ContactCard key={contact.id} contact={contact} onDelete={onDeleteContact} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
