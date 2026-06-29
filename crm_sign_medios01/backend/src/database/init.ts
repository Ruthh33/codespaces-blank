import { query } from '../config/database.js';

const SQL_SCHEMA = `
-- Tabla de Roles
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) UNIQUE NOT NULL,
  descripcion TEXT,
  nivel_acceso INT DEFAULT 0,
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Permisos
CREATE TABLE IF NOT EXISTS permisos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) UNIQUE NOT NULL,
  descripcion TEXT,
  modulo VARCHAR(100) NOT NULL,
  accion VARCHAR(50) NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Asociación Roles-Permisos
CREATE TABLE IF NOT EXISTS rol_permisos (
  rol_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permiso_id UUID NOT NULL REFERENCES permisos(id) ON DELETE CASCADE,
  PRIMARY KEY (rol_id, permiso_id),
  fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Fichas
CREATE TABLE IF NOT EXISTS fichas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_ficha VARCHAR(255) UNIQUE NOT NULL,
  tipo_dispositivo VARCHAR(100),
  estado VARCHAR(50) DEFAULT 'activa',
  fecha_emision DATE NOT NULL,
  fecha_vencimiento DATE,
  datos_adicionales JSONB,
  activa BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_usuario VARCHAR(255) UNIQUE NOT NULL,
  contrasena_hash VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  primer_nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  numero_serie_1 VARCHAR(255),
  numero_serie_2 VARCHAR(255),
  telefono_asignado VARCHAR(20),
  modelo_dispositivo VARCHAR(100),
  numero_dispositivo VARCHAR(50),
  cargo VARCHAR(100),
  fecha_ingreso DATE NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  rol_id UUID NOT NULL REFERENCES roles(id),
  ficha_id UUID REFERENCES fichas(id),
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Auditoría
CREATE TABLE IF NOT EXISTS auditoria_acceso (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id),
  accion VARCHAR(100) NOT NULL,
  recurso VARCHAR(255),
  resultado VARCHAR(50),
  ip_origen VARCHAR(45),
  fecha_acceso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  detalles JSONB
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_usuario_activo ON usuarios(activo);
CREATE INDEX IF NOT EXISTS idx_usuario_rol ON usuarios(rol_id);
CREATE INDEX IF NOT EXISTS idx_ficha_codigo ON fichas(codigo_ficha);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON auditoria_acceso(usuario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_fecha ON auditoria_acceso(fecha_acceso);
`;

async function initializeDatabase() {
  try {
    console.log('Inicializando schema de base de datos...');
    await query(SQL_SCHEMA);
    console.log('✓ Schema creado exitosamente');
  } catch (error) {
    console.error('✗ Error al crear schema:', error);
    process.exit(1);
  }
}

initializeDatabase();
