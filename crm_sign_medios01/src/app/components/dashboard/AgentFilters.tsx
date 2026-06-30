import React from "react";
import { Search } from "lucide-react";

interface AgentFiltersProps {
  count: number;
  query: string;
  setQuery: (q: string) => void;
  statusFilter: "all" | "online" | "offline";
  setStatusFilter: (f: "all" | "online" | "offline") => void;
}

export function AgentFilters({
  count,
  query,
  setQuery,
  statusFilter,
  setStatusFilter
}: AgentFiltersProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-base font-semibold text-slate-800">
        Agentes ({count})
      </h2>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar agente..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-8 rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
          />
        </div>
        {(["all", "online", "offline"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={[
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              statusFilter === f
                ? "bg-blue-600 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
            ].join(" ")}
          >
            {f === "all" ? "Todos" : f === "online" ? "Conectados" : "Desconectados"}
          </button>
        ))}
      </div>
    </div>
  );
}
