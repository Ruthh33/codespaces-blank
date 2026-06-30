import { useState } from "react";
import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { Sidebar } from "../components/dashboard/Sidebar";
import { Search, Plus, Trash2, ChevronDown, Users, Phone, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Select from "@radix-ui/react-select";

/* ══════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════ */
interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  agentAssigned?: string;
  createdAt: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

type Tab = "todos" | "por-agentes";

/* ══════════════════════════════════════════════════════
   MOCK DATA
══════════════════════════════════════════════════════ */
const mockContacts: Contact[] = [
  {
    id: "1",
    firstName: "María",
    lastName: "González",
    phoneNumber: "+58 412-555-0101",
    agentAssigned: "Carlos Mendoza",
    createdAt: "2026-06-15",
  },
  {
    id: "2",
    firstName: "Juan",
    lastName: "Pérez",
    phoneNumber: "+58 424-555-0102",
    agentAssigned: "María Torres",
    createdAt: "2026-06-14",
  },
  {
    id: "3",
    firstName: "Ana",
    lastName: "Martínez",
    phoneNumber: "+58 212-555-0103",
    agentAssigned: "Carlos Mendoza",
    createdAt: "2026-06-13",
  },
  {
    id: "4",
    firstName: "Carlos",
    lastName: "López",
    phoneNumber: "+58 416-555-0104",
    agentAssigned: null,
    createdAt: "2026-06-12",
  },
  {
    id: "5",
    firstName: "Laura",
    lastName: "Fernández",
    phoneNumber: "+58 414-555-0105",
    agentAssigned: "María Torres",
    createdAt: "2026-06-11",
  },
];

/* ══════════════════════════════════════════════════════
   MODAL COMPONENT — Add Contact
══════════════════════════════════════════════════════ */
interface AddContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddContact: (contact: Omit<Contact, "id" | "createdAt">) => void;
}

function AddContactModal({ open, onOpenChange, onAddContact }: AddContactModalProps) {
  const [formData, setFormData] = useState({ firstName: "", lastName: "", phoneNumber: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "El nombre es obligatorio";
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "El nombre debe tener al menos 2 caracteres";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "El apellido es obligatorio";
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = "El apellido debe tener al menos 2 caracteres";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "El número de teléfono es obligatorio";
    } else if (!/^\+?[\d\s\-()]{10,}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Ingresa un número de teléfono válido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onAddContact({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        agentAssigned: null,
      });
      setFormData({ firstName: "", lastName: "", phoneNumber: "" });
      setErrors({});
      setIsSubmitting(false);
      onOpenChange(false);
    }, 800);
  };

  const handleCancel = () => {
    setFormData({ firstName: "", lastName: "", phoneNumber: "" });
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl">
          <div className="mb-6">
            <Dialog.Title className="text-xl font-bold text-slate-800">Agregar Nuevo Contacto</Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-slate-500">
              Completa los campos para registrar un nuevo contacto en el directorio.
            </Dialog.Description>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre *</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => {
                  setFormData({ ...formData, firstName: e.target.value });
                  if (errors.firstName) setErrors({ ...errors, firstName: undefined });
                }}
                placeholder="Ej: María"
                className={[
                  "w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all",
                  errors.firstName
                    ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-1 focus:ring-red-200"
                    : "border-slate-200 bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-200",
                ].join(" ")}
              />
              {errors.firstName && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                  <AlertCircle size={12} /> {errors.firstName}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Apellido *</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => {
                  setFormData({ ...formData, lastName: e.target.value });
                  if (errors.lastName) setErrors({ ...errors, lastName: undefined });
                }}
                placeholder="Ej: González"
                className={[
                  "w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all",
                  errors.lastName
                    ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-1 focus:ring-red-200"
                    : "border-slate-200 bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-200",
                ].join(" ")}
              />
              {errors.lastName && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                  <AlertCircle size={12} /> {errors.lastName}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Número de Teléfono *</label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => {
                  setFormData({ ...formData, phoneNumber: e.target.value });
                  if (errors.phoneNumber) setErrors({ ...errors, phoneNumber: undefined });
                }}
                placeholder="Ej: +58 412-555-0101"
                className={[
                  "w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all",
                  errors.phoneNumber
                    ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-1 focus:ring-red-200"
                    : "border-slate-200 bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-200",
                ].join(" ")}
              />
              {errors.phoneNumber && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                  <AlertCircle size={12} /> {errors.phoneNumber}
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700 disabled:opacity-60"
              >
                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                {isSubmitting ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* ══════════════════════════════════════════════════════
   CONTACT CARD COMPONENT
══════════════════════════════════════════════════════ */
function ContactCard({
  contact,
  onDelete,
}: {
  contact: Contact;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      {/* Avatar */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
        {contact.firstName.charAt(0)}{contact.lastName.charAt(0)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-slate-800">{contact.firstName} {contact.lastName}</p>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
          <Phone size={12} />
          <p className="truncate">{contact.phoneNumber}</p>
        </div>
        {contact.agentAssigned && (
          <p className="mt-1 text-xs text-slate-600">
            <span className="font-medium">Asignado a:</span> {contact.agentAssigned}
          </p>
        )}
      </div>

      {/* Delete button */}
      <button
        onClick={() => {
          if (confirm(`¿Eliminar el contacto ${contact.firstName} ${contact.lastName}?`)) {
            onDelete(contact.id);
          }
        }}
        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════ */
export function DirectorioPage() {
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const [activeTab, setActiveTab] = useState<Tab>("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPhoneFilter, setSelectedPhoneFilter] = useState<string>("todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);

  /* Get unique phone numbers for filter */
  const phoneNumbers = Array.from(new Set(contacts.map((c) => c.phoneNumber))).sort();
  const agents = Array.from(new Set(contacts.filter((c) => c.agentAssigned).map((c) => c.agentAssigned as string))).sort();

  /* Filter contacts */
  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phoneNumber.includes(searchTerm);

    const matchesPhone = selectedPhoneFilter === "todos" || c.phoneNumber === selectedPhoneFilter;

    if (activeTab === "todos") {
      return matchesSearch && matchesPhone;
    } else {
      // Por agentes - only show assigned contacts
      return c.agentAssigned && matchesSearch && matchesPhone;
    }
  });

  /* Group by agent */
  const groupedByAgent = agents.reduce(
    (acc, agent) => {
      acc[agent] = filteredContacts.filter((c) => c.agentAssigned === agent);
      return acc;
    },
    {} as Record<string, Contact[]>
  );

  const handleAddContact = (newContact: Omit<Contact, "id" | "createdAt">) => {
    const contact: Contact = {
      ...newContact,
      id: String(Date.now()),
      createdAt: new Date().toISOString().split("T")[0],
    };
    setContacts([contact, ...contacts]);
    setAddSuccess(true);
    setTimeout(() => setAddSuccess(false), 3000);
  };

  const handleDeleteContact = (id: string) => {
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
              onClick={() => setModalOpen(true)}
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
                setSearchTerm("");
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
                setSearchTerm("");
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
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                      {groupedByAgent[agent].map((contact) => (
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
