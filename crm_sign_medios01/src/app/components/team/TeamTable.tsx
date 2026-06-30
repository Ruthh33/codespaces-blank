import React from "react";
import { MemberRow } from "./MemberRow";
import type { TeamMember, Role } from "../../types";

interface TeamTableProps {
  members: TeamMember[];
  onChangeRole: (id: string, role: Role) => void;
  onToggleSuspend: (id: string) => void;
  onRemove: (id: string) => void;
}

export function TeamTable({
  members,
  onChangeRole,
  onToggleSuspend,
  onRemove
}: TeamTableProps) {
  return (
    <div className="mt-8 border-t border-slate-200 pt-8">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-800">Miembros del Equipo</h2>
        <p className="mt-1 text-sm text-slate-500">Listado de personal con acceso al sistema</p>
      </div>
      <div className="space-y-3">
        {members.map((member) => (
          <MemberRow
            key={member.id}
            member={member}
            onChangeRole={onChangeRole}
            onToggleSuspend={onToggleSuspend}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
}
