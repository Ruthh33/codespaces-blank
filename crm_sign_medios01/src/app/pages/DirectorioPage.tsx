import { useState, useEffect, useMemo } from "react";
import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { Sidebar } from "../components/dashboard/Sidebar";
import { Search, Plus, ChevronDown, Users, Phone, CheckCircle2 } from "lucide-react";
import * as Select from "@radix-ui/react-select";

// UI Components
import { ContactCard, AddContactModal } from "../components/contacts";

// Services & Hooks
import { contactService } from "../services/domain/contactService";
import { useSearch } from "../hooks/useSearch";
import { useModal } from "../hooks/useModal";
import type { Contact } from "../types";

type Tab = "todos" | "por-agentes";

/* ══════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════ */
export function DirectorioPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("todos");
  const [selectedPhoneFilter, setSelectedPhoneFilter] = useState<string>("todos");
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);

  const { isOpen: modalOpen, open: openModal, close: closeModal, onOpenChange: setModalOpen } = useModal();

  useEffect(() => {
    setContacts(contactService.getContacts());
  }, []);

  /* Search Hook */
  const { query, setQuery, results: filteredBySearch } = useSearch({
    data: contacts,
    searchFields: ["firstName", "lastName", "phoneNumber"],
  });

  /* Get unique phone numbers for filter */
  const phoneNumbers = useMemo(() =>
    Array.from(new Set(contacts.map((c) => c.phoneNumber))).sort(),
  [contacts]);

  const agents = useMemo(() =>
    Array.from(new Set(contacts.filter((c) => c.agentAssigned).map((c) => c.agentAssigned as string))).sort(),
  [contacts]);

  /* Final filtered contacts */
  const filteredContacts = useMemo(() => {
    return filteredBySearch.filter((c) => {
      const matchesPhone = selectedPhoneFilter === "todos" || c.phoneNumber === selectedPhoneFilter;

      if (activeTab === "todos") {
        return matchesPhone;
      } else {
        // Por agentes - only show assigned contacts
        return !!c.agentAssigned && matchesPhone;
      }
    });
  }, [filteredBySearch, selectedPhoneFilter, activeTab]);

  /* Group by agent */
  const groupedByAgent = useMemo(() => {
    return agents.reduce(
      (acc, agent) => {
        acc[agent] = filteredContacts.filter((c) => c.agentAssigned === agent);
        return acc;
      },
      {} as Record<string, Contact[]>
    );
  }, [agents, filteredContacts]);

  const handleAddContact = (newContact: Omit<Contact, "id" | "createdAt">) => {
    const contact = contactService.addContact(newContact);
    setContacts([contact, ...contacts]);
    setAddSuccess(true);
    setTimeout(() => setAddSuccess(false), 3000);
  };

  const handleDeleteContact = (id: string) => {
    contactService.deleteContact(id);
    setContacts((prev) => prev.filter((c) => c.id !== id));
    setDeleteSuccess(true);
    setTimeout(() => setDeleteSuccess(false), 3000);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar selectedNode="directorio" onSelectNode={() => {}} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto px-6 py-5">
          {/* Page header */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Directorio</h1>
              <p className="mt-1 text-sm text-slate-500">Gestión centralizada de contactos y números telefónicos</p>
            </div>
            <button
              onClick={openModal}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-700 shadow-sm"
            >
              <Plus size={16} />
              Agregar Contacto
            </button>
          </div>

          {/* Success messages */}
          {addSuccess && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700 border border-emerald-200">
              <CheckCircle2 size={16} />
              Contacto agregado exitosamente
            </div>
          )}
          {deleteSuccess && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700 border border-emerald-200">
              <CheckCircle2 size={16} />
              Contacto eliminado exitosamente
            </div>
          )}

          {/* Tabs */}
          <div className="mb-6 flex gap-1 rounded-xl border border-slate-200 bg-white p-1 w-fit shadow-sm">
            <button
              onClick={() => {
                setActiveTab("todos");
                setQuery("");
                setSelectedPhoneFilter("todos");
              }}
              className={[
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                activeTab === "todos"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100",
              ].join(" ")}
            >
              <Users size={14} />
              Todos ({contacts.length})
            </button>
            <button
              onClick={() => {
                setActiveTab("por-agentes");
                setQuery("");
                setSelectedPhoneFilter("todos");
              }}
              className={[
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                activeTab === "por-agentes"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100",
              ].join(" ")}
            >
              <Phone size={14} />
              Por Agentes ({agents.length})
            </button>
          </div>

          {/* Search and filters */}
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

          {/* Content */}
          {activeTab === "todos" ? (
            <div className="space-y-3">
              {filteredContacts.length === 0 ? (
                <div className="flex h-64 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50">
                  <div className="text-center">
                    <Users size={32} className="mx-auto mb-2 text-slate-400 opacity-30" />
                    <p className="text-sm text-slate-500">No hay contactos para mostrar</p>
                  </div>
                </div>
              ) : (
                filteredContacts.map((contact) => (
                  <ContactCard key={contact.id} contact={contact} onDelete={handleDeleteContact} />
                ))
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {agents.length === 0 ? (
                <div className="flex h-64 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50">
                  <div className="text-center">
                    <Phone size={32} className="mx-auto mb-2 text-slate-400 opacity-30" />
                    <p className="text-sm text-slate-500">No hay agentes con contactos asignados</p>
                  </div>
                </div>
              ) : (
                agents.map((agent) => (
                  <div key={agent} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <h3 className="mb-3 text-sm font-semibold text-slate-800">{agent}</h3>
                    <div className="space-y-2">
                      {groupedByAgent[agent]?.map((contact) => (
                        <ContactCard key={contact.id} contact={contact} onDelete={handleDeleteContact} />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
      <AddContactModal open={modalOpen} onOpenChange={setModalOpen} onAddContact={handleAddContact} />
    </div>
  );
}
