import { useState, useEffect, useMemo } from "react";
import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { Sidebar } from "../components/dashboard/Sidebar";
import { Plus, Users, Phone, CheckCircle2 } from "lucide-react";

// UI Components
import { ContactCard, AddContactModal, ContactFilters, ContactList } from "../components/contacts";

// Services & Hooks
import { contactService } from "../services/domain/contactService";
import { useSearch } from "../hooks/useSearch";
import { useModal } from "../hooks/useModal";
import type { Contact } from "../types";

type Tab = "todos" | "por-agentes";

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

  const { query, setQuery, results: filteredBySearch } = useSearch({
    data: contacts,
    searchFields: ["firstName", "lastName", "phoneNumber"],
  });

  const phoneNumbers = useMemo(() => Array.from(new Set(contacts.map((c) => c.phoneNumber))).sort(), [contacts]);
  const agents = useMemo(() => Array.from(new Set(contacts.filter((c) => c.agentAssigned).map((c) => c.agentAssigned as string))).sort(), [contacts]);

  const filteredContacts = useMemo(() => {
    return filteredBySearch.filter((c) => {
      const matchesPhone = selectedPhoneFilter === "todos" || c.phoneNumber === selectedPhoneFilter;
      return activeTab === "todos" ? matchesPhone : !!c.agentAssigned && matchesPhone;
    });
  }, [filteredBySearch, selectedPhoneFilter, activeTab]);

  const groupedByAgent = useMemo(() => {
    return agents.reduce((acc, agent) => {
      acc[agent] = filteredContacts.filter((c) => c.agentAssigned === agent);
      return acc;
    }, {} as Record<string, Contact[]>);
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
          <div className="mb-6 flex items-start justify-between">
            <div><h1 className="text-2xl font-bold text-slate-800">Directorio</h1><p className="mt-1 text-sm text-slate-500">Gestión centralizada de contactos y números telefónicos</p></div>
            <button onClick={openModal} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-700 shadow-sm"><Plus size={16} />Agregar Contacto</button>
          </div>

          {(addSuccess || deleteSuccess) && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700 border border-emerald-200">
              <CheckCircle2 size={16} />
              Contacto {addSuccess ? "agregado" : "eliminado"} exitosamente
            </div>
          )}

          <div className="mb-6 flex gap-1 rounded-xl border border-slate-200 bg-white p-1 w-fit shadow-sm">
            <button onClick={() => { setActiveTab("todos"); setQuery(""); setSelectedPhoneFilter("todos"); }} className={["flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all", activeTab === "todos" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"].join(" ")}><Users size={14} />Todos ({contacts.length})</button>
            <button onClick={() => { setActiveTab("por-agentes"); setQuery(""); setSelectedPhoneFilter("todos"); }} className={["flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all", activeTab === "por-agentes" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"].join(" ")}><Phone size={14} />Por Agentes ({agents.length})</button>
          </div>

          <ContactFilters query={query} setQuery={setQuery} selectedPhoneFilter={selectedPhoneFilter} setSelectedPhoneFilter={setSelectedPhoneFilter} phoneNumbers={phoneNumbers} />
          <ContactList activeTab={activeTab} filteredContacts={filteredContacts} agents={agents} groupedByAgent={groupedByAgent} onDeleteContact={handleDeleteContact} />
        </main>
      </div>
      <AddContactModal open={modalOpen} onOpenChange={setModalOpen} onAddContact={handleAddContact} />
    </div>
  );
}
