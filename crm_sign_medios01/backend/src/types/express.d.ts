declare global {
  namespace Express {
    interface Request {
      usuario?: {
        usuarioId: string;
        nombreUsuario: string;
        rol: string;
        permisos: string[];
      };
      ipOrigen?: string;
    }
  }
}

export {};
