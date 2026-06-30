import { Mail, Clock, X } from "lucide-react";
import type { Role } from "../../types";
import { RoleBadge } from "./RoleBadge";

export interface Invitation { id: string; email: string; role: Role; sentAt: string }

interface InvitationRowProps {
  inv: Invitation;
  onRevoke: (id: string) => void;
}

export function InvitationRow({ inv, onRevoke }: InvitationRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
        <Mail size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-slate-800">{inv.email}</p>
        <p className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
          <Clock size={10} /> Enviada: {inv.sentAt}
        </p>
      </div>
      <RoleBadge role={inv.role} />
      <button onClick={() => onRevoke(inv.id)}
        className="ml-1 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500">
        <X size={14} />
      </button>
    </div>
  );
}
