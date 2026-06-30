import React from "react";
import { Users, UserCheck, UserX } from "lucide-react";
import { KPICard } from "./KPICards";

interface AgentKPICardsProps {
  totalAgents: number;
  onlineAgents: number;
  offlineAgents: number;
}

export function AgentKPICards({
  totalAgents,
  onlineAgents,
  offlineAgents
}: AgentKPICardsProps) {
  return (
    <div className="mb-5 grid gap-4 sm:grid-cols-3">
      <KPICard
        icon={<Users size={22} />}
        label="Total de Agentes"
        value={totalAgents}
        color="blue"
      />
      <KPICard
        icon={<UserCheck size={22} />}
        label="Agentes Conectados"
        value={onlineAgents}
        color="emerald"
      />
      <KPICard
        icon={<UserX size={22} />}
        label="Agentes Desconectados"
        value={offlineAgents}
        color="gray"
      />
    </div>
  );
}
