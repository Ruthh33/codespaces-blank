import * as Select from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";
import type { Role } from "../../types";
import { roleConfig } from "./RoleBadge";

interface RoleSelectProps {
  value: Role;
  onChange: (r: Role) => void;
}

export function RoleSelect({ value, onChange }: RoleSelectProps) {
  const roles: Role[] = ["Administrador", "Supervisor", "Agente"];
  return (
    <Select.Root value={value} onValueChange={(v) => onChange(v as Role)}>
      <Select.Trigger className="flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200">
        <Select.Value />
        <Select.Icon><ChevronDown size={14} className="text-slate-400" /></Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="z-50 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
          <Select.Viewport>
            {roles.map((r) => (
              <Select.Item key={r} value={r}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none hover:bg-slate-100 focus:bg-slate-100">
                <span className={["flex items-center gap-1", roleConfig[r].color].join(" ")}>
                  {roleConfig[r].icon}
                </span>
                <Select.ItemText>{r}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
