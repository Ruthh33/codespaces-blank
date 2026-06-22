import { useMemo, useRef, useState } from "react";
import {
  Plus,
  Search,
  User,
  Phone,
  Tag,
  Upload,
  Pencil,
  Trash2,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import * as XLSX from "xlsx";
import { DirectorioForm } from "./DirectorioForm";

export interface ClientContact {
  id: string;
  name: string;
  phone: string;
  tags: string[];
}

export interface Segment {
  id: string;
  name: string;
  filterTag: string;
}

const mockContacts: ClientContact[] = [
  { id: "1", name: "María González", phone: "+52 55 1234 5678", tags: [] },
  { id: "2", name: "Juan Pérez", phone: "+52 55 8765 4321", tags: [] },
  { id: "3", name: "Ana Martínez", phone: "+52 55 2468 1357", tags: [] },
  { id: "4", name: "Carlos López", phone: "+52 55 9876 5432", tags: [] },
  { id: "5", name: "Laura Fernández", phone: "+52 55 3691 2580", tags: [] },
];

function normalizeTag(value: string) {
  return value.trim().toLowerCase();
}

function parseTagList(value: string) {
  return value
    .split(/[,;]+/)
    .map(normalizeTag)
    .filter(Boolean);
}

function formatContactTags(tags: string[]) {
  return tags.map((tag) => normalizeTag(tag)).filter(Boolean);
}

export function DirectorioManagement() {
  const [contacts, setContacts] = useState<ClientContact[]>(mockContacts);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);
  const [newSegmentName, setNewSegmentName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ClientContact | null>(null);
  const [importMessage, setImportMessage] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"contacts" | "import" | "segments">("contacts");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const filteredContacts = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return contacts.filter((contact) => {
      if (selectedSegmentId) {
        const segment = segments.find((item) => item.id === selectedSegmentId);
        if (!segment || !contact.tags.includes(segment.filterTag)) {
          return false;
        }
      }

      return (
        !search ||
        contact.name.toLowerCase().includes(search) ||
        contact.phone.toLowerCase().includes(search) ||
        contact.tags.some((tag) => tag.includes(search))
      );
    });
  }, [contacts, searchTerm, selectedSegmentId, segments]);

  const segmentCounts = useMemo(
    () =>
      segments.map((segment) => ({
        ...segment,
        count: contacts.filter((contact) => contact.tags.includes(segment.filterTag)).length,
      })),
    [contacts, segments]
  );

  const handleAddContact = (contactData: Omit<ClientContact, "id">) => {
    const newContact: ClientContact = {
      ...contactData,
      id: String(Date.now()),
      tags: formatContactTags(contactData.tags || []),
    };
    setContacts((prev) => [newContact, ...prev]);
    setIsFormOpen(false);
  };

  const handleEditContact = (contactData: Omit<ClientContact, "id">) => {
    if (!editingContact) return;
    setContacts((prev) =>
      prev.map((contact) =>
        contact.id === editingContact.id
          ? { ...contact, ...contactData, tags: formatContactTags(contactData.tags || []) }
          : contact
      )
    );
    setEditingContact(null);
    setIsFormOpen(false);
  };

  const handleDeleteContact = (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este contacto?")) {
      setContacts((prev) => prev.filter((contact) => contact.id !== id));
    }
  };

  const openAddForm = () => {
    setEditingContact(null);
    setIsFormOpen(true);
  };

  const openEditForm = (contact: ClientContact) => {
    setEditingContact(contact);
    setIsFormOpen(true);
  };

  const handleCreateSegment = () => {
    const tag = normalizeTag(newSegmentName);
    if (!tag) {
      setImportMessage("Introduce un nombre válido para la etiqueta.");
      return;
    }
    if (segments.some((segment) => segment.filterTag === tag)) {
      setImportMessage(`La etiqueta '${tag}' ya existe.`);
      return;
    }
    setSegments((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        name: newSegmentName.trim(),
        filterTag: tag,
      },
    ]);
    setNewSegmentName("");
    setImportMessage(`Segmento '${tag}' creado.`);
  };

  const handleSelectSegment = (segmentId: string) => {
    setSelectedSegmentId((current) => (current === segmentId ? null : segmentId));
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    importContacts(file);
    event.target.value = "";
  };

  const importContacts = (file: File) => {
    const reader = new FileReader();
    const fileName = file.name.toLowerCase();

    reader.onload = (event) => {
      const result = event.target?.result;
      if (!result) {
        setImportMessage("No se pudo leer el archivo.");
        return;
      }

      try {
        const workbook = XLSX.read(result, {
          type: fileName.endsWith(".csv") ? "string" : "array",
        });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

        const importedContacts = rows
          .map((row, index) => {
            const name = String(row["name"] || row["Nombre"] || row["Nombre Completo"] || "").trim();
            const phone = String(row["phone"] || row["Teléfono"] || row["Telefono"] || row["Phone"] || "").trim();
            const rawTags = String(row["tags"] || row["etiquetas"] || row["Tags"] || row["Etiquetas"] || "").trim();
            if (!name || !phone) return null;
            return {
              id: `${Date.now()}-${index}`,
              name,
              phone,
              tags: parseTagList(rawTags),
            } as ClientContact;
          })
          .filter((contact): contact is ClientContact => contact !== null);

        if (importedContacts.length === 0) {
          setImportMessage("No se encontraron contactos válidos en el archivo.");
          return;
        }

        setContacts((prev) => [...importedContacts, ...prev]);
        setImportMessage(`Se importaron ${importedContacts.length} contactos.`);
      } catch (error) {
        setImportMessage("Error al procesar el archivo. Usa CSV o Excel válido.");
      }
    };

    if (fileName.endsWith(".csv")) {
      reader.readAsText(file, "utf-8");
    } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
      reader.readAsArrayBuffer(file);
    } else {
      setImportMessage("Formato no soportado. Usa .csv, .xls o .xlsx.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Contactos</h2>
              <p className="mt-1 text-sm text-slate-600">
                Localiza y administra los contactos que estarán disponibles en directorio.
              </p>
            </div>
            <button
              type="button"
              onClick={openAddForm}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition hover:bg-blue-700"
            >
              <Plus size={16} /> Nuevo contacto
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("import")}
                className={
                  "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition " +
                  (activeTab === "import"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 hover:bg-blue-700"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200")
                }
              >
                <Upload size={16} /> Importación
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("segments")}
                className={
                  "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition " +
                  (activeTab === "segments"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/25 hover:bg-emerald-700"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200")
                }
              >
                <Tag size={16} /> Segmentos
              </button>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <Search size={18} className="text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar contacto por nombre..."
                className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>

          {(activeTab === "import" || activeTab === "segments") && (
            <div className="mt-5 space-y-4 border-t border-slate-200 px-5 py-5">
              {activeTab === "import" && (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                      <Upload size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-800">Importación</h3>
                      <p className="mt-1 text-sm text-slate-600">
                        Importa tus contactos desde CSV o Excel (.csv, .xls, .xlsx).
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <button
                      type="button"
                      onClick={handleFileClick}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      <Upload size={16} /> Seleccionar archivo
                    </button>
                    <p className="text-sm text-slate-500">
                      El archivo debe contener columnas de nombre y teléfono. Usa una columna de etiquetas separadas por comas si deseas agregar etiquetas.
                    </p>
                    {importMessage && (
                      <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
                        {importMessage}
                      </div>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".csv,.xls,.xlsx"
                    onChange={handleFileChange}
                  />
                </div>
              )}

              {activeTab === "segments" && (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                      <Tag size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-800">Segmentos</h3>
                      <p className="mt-1 text-sm text-slate-600">
                        Crea etiquetas y administra segmentos basados en las etiquetas de los contactos.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-4">
                    <div className="grid gap-3 sm:grid-cols-[1fr,auto]">
                      <input
                        type="text"
                        value={newSegmentName}
                        onChange={(event) => setNewSegmentName(event.target.value)}
                        placeholder="Ej. cliente"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                      <button
                        type="button"
                        onClick={handleCreateSegment}
                        className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                      >
                        Crear etiqueta
                      </button>
                    </div>

                    <div className="space-y-3">
                      {segmentCounts.map((segment) => (
                        <button
                          key={segment.id}
                          type="button"
                          onClick={() => handleSelectSegment(segment.id)}
                          className={[
                            "w-full rounded-2xl border px-4 py-3 text-left transition",
                            selectedSegmentId === segment.id
                              ? "border-blue-500 bg-blue-50 text-blue-800"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300",
                          ].join(" ")}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold">{segment.name}</p>
                              <p className="mt-1 text-xs text-slate-500">
                                {segment.count} contacto{segment.count !== 1 ? "s" : ""} con la etiqueta "{segment.filterTag}"
                              </p>
                            </div>
                            <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                              {segment.filterTag}
                            </div>
                          </div>
                        </button>
                      ))}

                      {segments.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-5 text-sm text-slate-600">
                          Crea un segmento para agrupar contactos por etiqueta. Los contactos con esa etiqueta se mostrarán automáticamente en el segmento.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="max-h-[calc(100vh-20rem)] overflow-y-auto p-5">
          <div className="space-y-4">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                        <User size={20} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-slate-900">
                          {contact.name}
                        </h3>
                        <p className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                          <Phone size={14} />
                          {contact.phone}
                        </p>
                      </div>
                    </div>

                    {contact.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {contact.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEditForm(contact)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteContact(contact.id)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-red-600 transition hover:border-red-300 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredContacts.length === 0 && (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-500">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <User size={24} />
                </div>
                <p className="mt-4 text-sm font-medium">
                  {searchTerm ? "No se encontraron contactos." : "No hay contactos en este directorio."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog.Root open={isFormOpen} onOpenChange={setIsFormOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <Dialog.Title className="text-xl font-bold text-slate-800">
              {editingContact ? "Editar Contacto" : "Añadir Nuevo Contacto"}
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-slate-600">
              {editingContact
                ? "Actualiza la información del contacto."
                : "Completa los datos del nuevo contacto."}
            </Dialog.Description>

            <DirectorioForm
              initialData={editingContact || undefined}
              onSubmit={editingContact ? handleEditContact : handleAddContact}
              onCancel={() => setIsFormOpen(false)}
            />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
