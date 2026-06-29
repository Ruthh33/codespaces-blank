export interface Usuario {
  id: string;
  nombre_usuario: string;
  contrasena_hash: string;
  email?: string;
  primer_nombre: string;
  apellido: string;
  numero_serie_1?: string;
  numero_serie_2?: string;
  telefono_asignado?: string;
  modelo_dispositivo?: string;
  numero_dispositivo?: string;
  cargo: string;
  fecha_ingreso: string;
  activo: boolean;
  rol_id: string;
  ficha_id?: string;
  fecha_creacion: Date;
  fecha_modificacion: Date;
}

export interface Rol {
  id: string;
  nombre: string;
  descripcion?: string;
  nivel_acceso: number;
  activo: boolean;
  fecha_creacion: Date;
}

export interface Permiso {
  id: string;
  nombre: string;
  descripcion?: string;
  modulo: string;
  accion: string;
  fecha_creacion: Date;
}

export interface Ficha {
  id: string;
  codigo_ficha: string;
  tipo_dispositivo?: string;
  estado: 'activa' | 'utilizada' | 'expirada' | 'cancelada';
  fecha_emision: Date;
  fecha_vencimiento?: Date;
  datos_adicionales?: Record<string, any>;
  activa: boolean;
  fecha_creacion: Date;
}

export interface AuditoriaAcceso {
  id: string;
  usuario_id?: string;
  accion: string;
  recurso?: string;
  resultado: string;
  ip_origen: string;
  fecha_acceso: Date;
  detalles?: Record<string, any>;
}

export interface TokenPayload {
  usuarioId: string;
  nombreUsuario: string;
  rol: string;
  permisos: string[];
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  usuario?: TokenPayload;
  permisos?: string[];
}

export interface CrearUsuarioPayload {
  fichaId: string;
  primerNombre: string;
  apellido: string;
  cargo: string;
  fechaIngreso: string;
  telefonoAsignado?: string;
  modeloDispositivo?: string;
  numeroDispositivo?: string;
  numeroSerie1?: string;
  numeroSerie2?: string;
  rolId: string;
  adminId: string;
}

export interface LoginPayload {
  nombreUsuario: string;
  contrasena: string;
  ipOrigen: string;
}
