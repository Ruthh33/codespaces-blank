import { Trash2, Phone } from "lucide-react";
import type { Contact } from "../../types";

interface ContactCardProps {
  contact: Contact;
  onDelete: (id: string) => void;
}

export function ContactCard({ contact, onDelete }: ContactCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      {/* Avatar */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
        {contact.firstName.charAt(0)}{contact.lastName.charAt(0)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-slate-800">{contact.firstName} {contact.lastName}</p>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
          <Phone size={12} />
          <p className="truncate">{contact.phoneNumber}</p>
        </div>
        {contact.agentAssigned && (
          <p className="mt-1 text-xs text-slate-600">
            <span className="font-medium">Asignado a:</span> {contact.agentAssigned}
          </p>
        )}
      </div>

      {/* Delete button */}
      <button
        onClick={() => {
          if (confirm(`¿Eliminar el contacto ${contact.firstName} ${contact.lastName}?`)) {
            onDelete(contact.id);
          }
        }}
        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
