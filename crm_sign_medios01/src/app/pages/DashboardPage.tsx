import { useState, useMemo } from "react";
import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { Sidebar } from "../components/dashboard/Sidebar";
import { AgentCard } from "../components/dashboard/AgentCard";
import { AgentChatTree } from "../components/dashboard/AgentChatTree";
import { agentsData } from "../components/dashboard/agentsData";
import { AgentKPICards } from "../components/dashboard/AgentKPICards";
import { AgentFilters } from "../components/dashboard/AgentFilters";
import { useSearch } from "../hooks/useSearch";
import type { Agent } from "../components/dashboard/AgentCard";

export function DashboardPage() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "online" | "offline">("all");

  const counts = useMemo(() => {
    const total = agentsData.length;
    const online = agentsData.filter((a) => a.online).length;
    return { total, online, offline: total - online };
  }, []);

  const { query, setQuery, results: searchedAgents } = useSearch({
    data: agentsData,
    searchFields: ["name", "role"],
  });

  const filteredAgents = useMemo(() => {
    return searchedAgents.filter((agent) => {
      if (statusFilter === "all") return true;
      return statusFilter === "online" ? agent.online : !agent.online;
    });
  }, [searchedAgents, statusFilter]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar selectedNode="dashboard" onSelectNode={() => {}} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto px-6 py-5">
          <AgentKPICards totalAgents={counts.total} onlineAgents={counts.online} offlineAgents={counts.offline} />
          <AgentFilters count={filteredAgents.length} query={query} setQuery={setQuery} statusFilter={statusFilter} setStatusFilter={setStatusFilter} />

          {filteredAgents.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-slate-400">No se encontraron agentes</div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredAgents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} isSelected={selectedAgent?.id === agent.id} onClick={(a) => setSelectedAgent(a)} />
              ))}
            </div>
          )}
        </main>
      </div>
      {selectedAgent && (
        <AgentChatTree key={selectedAgent.id} agent={selectedAgent} open={true} onClose={() => setSelectedAgent(null)} />
      )}
    </div>
  );
}
