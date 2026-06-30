import React from "react";
import { Shield, SlidersHorizontal } from "lucide-react";
import { roleConfig } from "./RoleBadge";
import type { Role } from "../../types";

export function RoleReference() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Shield size={18} className="text-blue-600" />
        <h3 className="font-semibold text-slate-800">Roles disponibles</h3>
      </div>

      {(Object.entries(roleConfig) as [Role, (typeof roleConfig)[Role]][]).map(([role, cfg]) => (
        <div key={role} className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className={["flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base", cfg.bg, cfg.color].join(" ")}>
            {cfg.icon}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{role}</p>
            <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">{cfg.desc}</p>
          </div>
        </div>
      ))}

      {/* Info note */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <p className="flex items-start gap-2 text-xs text-blue-700">
          <SlidersHorizontal size={14} className="mt-0.5 shrink-0" />
          Solo el Administrador puede modificar roles, suspender accesos y enviar invitaciones.
        </p>
      </div>
    </div>
  );
}
