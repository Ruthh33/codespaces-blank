import { useState, useEffect, useMemo } from "react";
import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { Sidebar } from "../components/dashboard/Sidebar";
import { agentsData } from "../components/dashboard/agentsData";
import { UserRecordManagement } from "../components/dashboard/UserRecordManagement";
import {
  Download, MessageSquare, Users, HardDrive, CheckCircle2, Loader2,
  Clock, FileText, ShieldCheck, AlertCircle, ChevronDown,
} from "lucide-react";
import * as Select from "@radix-ui/react-select";

// UI Components
import { StatCard, BackupCard, BackupHistory, type BackupOperationStatus } from "../components/backup";
import { InvitationRow, TeamTable, RoleReference } from "../components/team";

// Services & Utils
import { backupService } from "../services/domain/backupService";
import { teamService } from "../services/domain/teamService";
import { mockContacts } from "../mocks/contacts";
import type { TeamMember, Role, BackupStatus, Invitation } from "../types";

/* ══════════════════════════════════════════════════════
   TABS
══════════════════════════════════════════════════════ */
const TABS = [
  { id: "backup", label: "Copias de seguridad", icon: <HardDrive size={15} /> },
  { id: "team",   label: "Equipo y permisos",   icon: <Users size={15} /> },
] as const;
type Tab = (typeof TABS)[number]["id"];

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("backup");

  /* ── backup state ── */
  const [chatsStatus, setChatsStatus] = useState<BackupOperationStatus>("idle");
  const [contactsStatus, setContactsStatus] = useState<BackupOperationStatus>("idle");
  const [fullStatus, setFullStatus] = useState<BackupOperationStatus>("idle");
  const [selectedAgent, setSelectedAgent] = useState<string>("todos");
  const [history, setHistory] = useState<BackupStatus[]>([]);

  const stats = useMemo(() => ({
    totalChats: agentsData.reduce((a, ag) => a + ag.conversations.length, 0),
    totalMsgs: agentsData.reduce((a, ag) => a + ag.conversations.reduce((s, c) => s + c.messages.length, 0), 0)
  }), []);

  useEffect(() => {
    setHistory(backupService.getBackupHistory());
  }, []);

  const simulate = async (setter: (s: BackupOperationStatus) => void, action: () => Promise<BackupStatus>) => {
    setter("running");
    try {
      const record = await action();
      setter("done");
      setHistory(h => [record, ...h]);
      setTimeout(() => setter("idle"), 4000);
    } catch (e) { setter("error"); }
  };

  /* ── team state ── */
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  useEffect(() => {
    setMembers(teamService.getTeamMembers());
  }, []);

  const handleRevokeInvite = (id: string) => {
    teamService.revokeInvite(id);
    setInvitations(prev => prev.filter(i => i.id !== id));
  };

  const handleChangeRole = (id: string, role: Role) => {
    teamService.updateMemberRole(id, role);
    setMembers(prev => prev.map(m => (m.id === id ? { ...m, role } : m)));
  };

  const handleToggleSuspend = (id: string) => {
    teamService.toggleMemberStatus(id);
    setMembers(prev => prev.map(m => m.id === id ? { ...m, status: m.status === "suspendido" ? "activo" : "suspendido" } : m));
  };

  const handleRemove = (id: string) => {
    if (confirm("¿Confirmas que deseas eliminar este miembro del equipo?")) {
      teamService.removeMember(id);
      setMembers(prev => prev.filter(m => m.id !== id));
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar selectedNode="ajustes" onSelectNode={() => {}} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto px-6 py-5">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-800">Ajustes</h2>
            <p className="mt-1 text-sm text-slate-500">Administra tu equipo, permisos y copias de seguridad.</p>
          </div>

          <div className="mb-6 flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm w-fit">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={["flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all", activeTab === t.id ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"].join(" ")}>
                {t.icon}{t.label}
              </button>
            ))}
          </div>

          {activeTab === "backup" && (
            <>
              <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard icon={<Users size={20} />} label="Total de Agentes" value={agentsData.length} color="bg-blue-50 text-blue-600" />
                <StatCard icon={<MessageSquare size={20} />} label="Conversaciones" value={stats.totalChats} color="bg-emerald-50 text-emerald-600" />
                <StatCard icon={<FileText size={20} />} label="Mensajes totales" value={stats.totalMsgs} color="bg-amber-50 text-amber-600" />
                <StatCard icon={<Users size={20} />} label="Contactos" value={mockContacts.length} color="bg-purple-50 text-purple-600" />
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                <div className="flex flex-col gap-4 lg:col-span-2">
                  <div className="flex items-center gap-2"><ShieldCheck size={18} className="text-blue-600" /><h3 className="font-semibold text-slate-800">Copias de seguridad</h3></div>
                  <BackupCard icon={<MessageSquare size={18} />} title="Respaldo de Chats" formats={["zip"]} status={chatsStatus} onBackupZip={() => simulate(setChatsStatus, () => backupService.generateChatsZip(selectedAgent))} description="Exporta el historial de conversaciones y mensajes de todos los agentes o selecciona un agente específico.">
                    <div className="mt-4 flex flex-col gap-2">
                      <label className="text-xs font-medium text-slate-600">Seleccionar agente:</label>
                      <Select.Root value={selectedAgent} onValueChange={setSelectedAgent}>
                        <Select.Trigger className="flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"><Select.Value /><Select.Icon><ChevronDown size={14} className="text-slate-400" /></Select.Icon></Select.Trigger>
                        <Select.Portal><Select.Content className="z-50 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg"><Select.Viewport>
                          <Select.Item value="todos" className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none hover:bg-slate-100 focus:bg-slate-100"><Select.ItemText><span className="font-medium">Todos los agentes</span><span className="ml-2 text-xs text-slate-500">({stats.totalChats} conversaciones)</span></Select.ItemText></Select.Item>
                          {agentsData.map(a => (<Select.Item key={a.id} value={a.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none hover:bg-slate-100 focus:bg-slate-100"><Select.ItemText><span className="font-medium">{a.name}</span><span className="ml-2 text-xs text-slate-500">({a.conversations.length} conversaciones)</span></Select.ItemText></Select.Item>))}
                        </Select.Viewport></Select.Content></Select.Portal>
                      </Select.Root>
                    </div>
                  </BackupCard>
                  <BackupCard icon={<Users size={18} />} title="Respaldo de Contactos" formats={["csv"]} status={contactsStatus} onBackupCSV={() => simulate(setContactsStatus, async () => backupService.generateContactsCSV())} description={`Exporta los ${mockContacts.length} contactos del directorio con sus asignaciones.`} />
                  <div className="flex flex-col gap-4 rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm">
                    <div className="flex items-start gap-3"><div className="rounded-lg bg-blue-600 p-2.5 text-white"><HardDrive size={18} /></div><div className="flex-1"><p className="font-semibold text-slate-800">Respaldo Completo</p></div>{fullStatus === "done" && <CheckCircle2 size={18} className="mt-0.5 text-emerald-500" />}</div>
                    <button onClick={() => simulate(setFullStatus, () => backupService.generateFullBackup())} disabled={fullStatus === "running"} className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow transition-all hover:bg-blue-700 disabled:opacity-60">{fullStatus === "running" ? <><Loader2 size={16} className="animate-spin" />Generando respaldo…</> : <><Download size={16} />Descargar respaldo completo</>}</button>
                    {fullStatus === "done" && <p className="flex items-center justify-center gap-1.5 text-xs text-emerald-600"><CheckCircle2 size={12} />Archivo generado y descargado correctamente</p>}
                  </div>
                </div>
                <BackupHistory history={history} />
              </div>
              <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4"><p className="flex items-start gap-2 text-xs text-amber-700"><AlertCircle size={14} className="mt-0.5 shrink-0" />Se recomienda un respaldo completo al menos una vez por semana.</p></div>
            </>
          )}

          {activeTab === "team" && (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="flex flex-col gap-5 lg:col-span-2">
                {invitations.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Clock size={14} className="text-amber-500" />Invitaciones pendientes ({invitations.length})</h4>
                    {invitations.map(inv => <InvitationRow key={inv.id} inv={inv} onRevoke={handleRevokeInvite} />)}
                  </div>
                )}
                <div className="mb-6">
                  <div className="mb-5"><h1 className="text-2xl font-bold text-slate-800">Gestión de Fichas</h1><p className="mt-1 text-sm text-slate-600">Administración completa de usuarios y equipos asignados</p></div>
                  <UserRecordManagement />
                </div>
                <TeamTable members={members} onChangeRole={handleChangeRole} onToggleSuspend={handleToggleSuspend} onRemove={handleRemove} />
              </div>
              <RoleReference />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
