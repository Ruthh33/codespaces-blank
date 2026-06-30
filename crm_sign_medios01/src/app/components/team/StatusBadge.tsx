import React from "react";
import type { MemberStatus } from "../../types";

export const statusConfig: Record<MemberStatus, { label: string; cls: string; dot: string }> = {
  activo:     { label: "Activo",     cls: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  pendiente:  { label: "Pendiente",  cls: "bg-amber-100 text-amber-700",     dot: "bg-amber-400" },
  suspendido: { label: "Suspendido", cls: "bg-red-100 text-red-600",         dot: "bg-red-400" },
};

export function StatusBadge({ status }: { status: MemberStatus }) {
  const cfg = statusConfig[status];
  return (
    <span className={["inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", cfg.cls].join(" ")}>
      <span className={["h-1.5 w-1.5 rounded-full", cfg.dot].join(" ")} />
      {cfg.label}
    </span>
  );
}
