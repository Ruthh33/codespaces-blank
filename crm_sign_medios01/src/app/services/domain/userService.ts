import { mockUsers, UserRecord } from "../../mocks/users";

// User Service
// CRUD y operaciones de fichas de usuario (extraído de UserRecordManagement)

export const userService = {
  /**
   * Obtiene todos los usuarios/fichas
   */
  getUsers: (): UserRecord[] => {
    return [...mockUsers];
  },

  /**
   * Obtiene un usuario por ID
   */
  getUser: (id: string): UserRecord | undefined => {
    return mockUsers.find((u) => u.id === id);
  },

  /**
   * Crea un nuevo registro de usuario
   */
  createUser: (data: Omit<UserRecord, "id">): UserRecord => {
    const newUser: UserRecord = {
      ...data,
      id: String(Date.now()),
    };
    // Simulación de persistencia
    return newUser;
  },

  /**
   * Actualiza un registro de usuario
   */
  updateUser: (id: string, data: Partial<UserRecord>): UserRecord => {
    // Simulación
    return { id, ...data } as UserRecord;
  },

  /**
   * Elimina un usuario
   */
  deleteUser: (id: string): boolean => {
    // Simulación
    return true;
  },

  /**
   * Procesa la carga de una foto de usuario
   */
  uploadUserPhoto: async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  },
};
