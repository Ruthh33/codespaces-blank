import { mockContacts, Contact } from "../../mocks/contacts";

// Contact Service
// CRUD y operaciones de contactos (extraído de DirectorioPage)

export const contactService = {
  /**
   * Obtiene todos los contactos
   */
  getContacts: () => {
    return [...mockContacts];
  },

  /**
   * Busca contactos por término (nombre, apellido o número)
   */
  searchContacts: (query: string, contacts: Contact[] = mockContacts) => {
    const term = query.toLowerCase();
    return contacts.filter(
      (c) =>
        c.firstName.toLowerCase().includes(term) ||
        c.lastName.toLowerCase().includes(term) ||
        c.phoneNumber.includes(term)
    );
  },

  /**
   * Filtra contactos por número de teléfono
   */
  filterByPhone: (phoneNumber: string, contacts: Contact[] = mockContacts) => {
    if (phoneNumber === "todos") return contacts;
    return contacts.filter((c) => c.phoneNumber === phoneNumber);
  },

  /**
   * Agrupa contactos por agente asignado
   */
  groupByAgent: (contacts: Contact[] = mockContacts) => {
    const agents = Array.from(
      new Set(contacts.filter((c) => c.agentAssigned).map((c) => c.agentAssigned as string))
    ).sort();

    return agents.reduce((acc, agent) => {
      acc[agent] = contacts.filter((c) => c.agentAssigned === agent);
      return acc;
    }, {} as Record<string, Contact[]>);
  },

  /**
   * Agrega un nuevo contacto
   */
  addContact: (data: Omit<Contact, "id" | "createdAt">) => {
    const newContact: Contact = {
      ...data,
      id: String(Date.now()),
      createdAt: new Date().toISOString().split("T")[0],
    };
    // En una app real, aquí se persistiría en el backend
    return newContact;
  },

  /**
   * Elimina un contacto por ID
   */
  deleteContact: (id: string) => {
    // Simulación de eliminación
    return true;
  },

  /**
   * Actualiza un contacto existente
   */
  updateContact: (id: string, data: Partial<Contact>) => {
    // Simulación de actualización
    return { id, ...data };
  },
};
