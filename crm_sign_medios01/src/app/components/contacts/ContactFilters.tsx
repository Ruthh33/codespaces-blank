import React from "react";
import { Search, ChevronDown } from "lucide-react";
import * as Select from "@radix-ui/react-select";

interface ContactFiltersProps {
  query: string;
  setQuery: (q: string) => void;
  selectedPhoneFilter: string;
  setSelectedPhoneFilter: (p: string) => void;
  phoneNumbers: string[];
}

export function ContactFilters({
  query,
  setQuery,
  selectedPhoneFilter,
  setSelectedPhoneFilter,
  phoneNumbers
}: ContactFiltersProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end">
      {/* Search */}
      <div className="flex-1 min-w-0">
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Buscar contacto</label>
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-200">
          <Search size={16} className="shrink-0 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nombre, apellido o número..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Phone filter */}
      <div className="min-w-0">
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Filtrar por número</label>
        <Select.Root value={selectedPhoneFilter} onValueChange={setSelectedPhoneFilter}>
          <Select.Trigger className="flex h-9 w-full min-w-[200px] items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200">
            <Select.Value />
            <Select.Icon>
              <ChevronDown size={14} className="text-slate-400" />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content className="z-50 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
              <Select.Viewport>
                <Select.Item
                  value="todos"
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none hover:bg-slate-100 focus:bg-slate-100"
                >
                  <Select.ItemText>Todos los números ({phoneNumbers.length})</Select.ItemText>
                </Select.Item>
                {phoneNumbers.map((phone) => (
                  <Select.Item
                    key={phone}
                    value={phone}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none hover:bg-slate-100 focus:bg-slate-100"
                  >
                    <Select.ItemText>{phone}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>
    </div>
  );
}
