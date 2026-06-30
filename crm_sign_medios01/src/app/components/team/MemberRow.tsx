import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MoreVertical, UserCog, ChevronDown, RefreshCw, Trash2, CheckCircle2, BadgeCheck } from "lucide-react";
import type { TeamMember, Role } from "../../types";
import { RoleBadge, roleConfig } from "./RoleBadge";
import { StatusBadge } from "./StatusBadge";

interface MemberRowProps {
  member: TeamMember;
  onChangeRole: (id: string, role: Role) => void;
  onToggleSuspend: (id: string) => void;
  onRemove: (id: string) => void;
}

export function MemberRow({ member, onChangeRole, onToggleSuspend, onRemove }: MemberRowProps) {
  const isCurrentUser = member.id === "m1";
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition-shadow hover:shadow-md">
      {/* Avatar */}
      <div className={["flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white", member.avatarColor].join(" ")}>
        {member.initials}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-slate-800">{member.name}</p>
          {isCurrentUser && (
            <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">
              <BadgeCheck size={10} /> Tú
            </span>
          )}
        </div>
        <p className="truncate text-xs text-slate-500">{member.email}</p>
        <p className="mt-0.5 text-[11px] text-slate-400">Desde {member.joinedAt}</p>
      </div>

      {/* Role */}
      <div className="hidden sm:block">
        <RoleBadge role={member.role} />
      </div>

      {/* Status */}
      <StatusBadge status={member.status} />

      {/* Actions */}
      {!isCurrentUser && (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700">
              <MoreVertical size={16} />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="z-50 min-w-[200px] rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg"
              sideOffset={5} align="end">
              {/* Change role submenu */}
              <DropdownMenu.Sub>
                <DropdownMenu.SubTrigger className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none hover:bg-slate-100">
                  <UserCog size={14} /> Cambiar rol
                  <ChevronDown size={12} className="ml-auto -rotate-90" />
                </DropdownMenu.SubTrigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.SubContent className="z-50 min-w-[180px] rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg" sideOffset={4}>
                    {(["Administrador","Supervisor","Agente"] as Role[]).map((r) => (
                      <DropdownMenu.Item key={r}
                        className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none hover:bg-slate-100"
                        onSelect={() => onChangeRole(member.id, r)}>
                        <span className={roleConfig[r].color}>{roleConfig[r].icon}</span>
                        {r}
                        {member.role === r && <CheckCircle2 size={12} className="ml-auto text-blue-500" />}
                      </DropdownMenu.Item>
                    ))}
                  </DropdownMenu.SubContent>
                </DropdownMenu.Portal>
              </DropdownMenu.Sub>

              <DropdownMenu.Item
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none hover:bg-slate-100"
                onSelect={() => onToggleSuspend(member.id)}>
                <RefreshCw size={14} />
                {member.status === "suspendido" ? "Reactivar acceso" : "Suspender acceso"}
              </DropdownMenu.Item>

              <DropdownMenu.Separator className="my-1.5 h-px bg-slate-200" />

              <DropdownMenu.Item
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 outline-none hover:bg-red-50"
                onSelect={() => onRemove(member.id)}>
                <Trash2 size={14} /> Eliminar del equipo
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      )}
    </div>
  );
}
