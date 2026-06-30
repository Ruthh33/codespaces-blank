import React from "react";
import { Clock, HardDrive, MessageSquare, Users, CheckCircle2 } from "lucide-react";
import type { BackupStatus } from "../../types";

interface BackupHistoryProps {
  history: BackupStatus[];
}

export function BackupHistory({ history }: BackupHistoryProps) {
  const typeIcon = (t: BackupStatus["type"]) => ({
    chats:    <MessageSquare size={13} className="text-blue-500" />,
    contacts: <Users         size={13} className="text-emerald-500" />,
    full:     <HardDrive     size={13} className="text-purple-500" />,
  }[t]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Clock size={18} className="text-slate-500" />
        <h3 className="font-semibold text-slate-800">Historial de respaldos</h3>
      </div>
      <div className="flex flex-1 flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-slate-400">
            <HardDrive size={32} className="opacity-30" />
            <p className="text-sm">Sin respaldos en esta sesión</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {history.map((rec, i) => (
              <li key={i} className="flex items-start gap-3 px-4 py-3">
                <div className="mt-0.5 rounded-md bg-slate-100 p-1.5">{typeIcon(rec.type)}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-700">{rec.label}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                    <Clock size={10} />{rec.time}
                  </p>
                </div>
                <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-500" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
