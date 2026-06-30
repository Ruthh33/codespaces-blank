import React from "react";
import { Crown, UserCog, Shield } from "lucide-react";
import type { Role } from "../../types";

export const roleConfig: Record<Role, { icon: React.ReactNode; color: string; bg: string; desc: string }> = {
  "Administrador": {
    icon: <Crown size={13} />,
    color: "text-blue-700",
    bg: "bg-blue-100",
    desc: "Acceso total al sistema: usuarios, ajustes, respaldos y permisos.",
  },
  "Supervisor": {
    icon: <UserCog size={13} />,
    color: "text-emerald-700",
    bg: "bg-emerald-100",
    desc: "Puede ver todos los agentes, chats y gestionar fichas.",
  },
  "Agente": {
    icon: <Shield size={13} />,
    color: "text-amber-700",
    bg: "bg-amber-100",
    desc: "Accede solo a sus propias conversaciones y contactos asignados.",
  },
};

export function RoleBadge({ role }: { role: Role }) {
  const cfg = roleConfig[role];
  return (
    <span className={["inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", cfg.bg, cfg.color].join(" ")}>
      {cfg.icon}{role}
    </span>
  );
}
