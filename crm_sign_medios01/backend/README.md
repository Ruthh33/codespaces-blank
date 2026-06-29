# CRM Backend API

Backend Node.js + Express + TypeScript para gestión de usuarios y control de acceso basado en roles (RBAC).

## 🚀 Requisitos Previos

- Node.js 18+
- PostgreSQL 12+
- npm o pnpm

## 📦 Instalación

### 1. Instalar dependencias

```bash
cd backend
npm install
# o
pnpm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con tu configuración:

```env
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/crm_db
JWT_SECRET=tu_secreto_jwt_muy_largo_y_seguro
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### 3. Crear la base de datos PostgreSQL

```bash
createdb crm_db
```

### 4. Inicializar schema y datos

```bash
# Crear tablas
npm run db:init

# Poblar con datos iniciales
npm run db:seed
```

## 🏃 Ejecutar la Aplicación

### Desarrollo

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3001`

### Producción

```bash
npm run build
npm start
```

## 📚 API Endpoints

### Autenticación

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "nombreUsuario": "admin",
  "contrasena": "Admin@2026"
}

# Respuesta
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": "uuid",
    "nombreUsuario": "admin",
    "nombre": "Administrador Sistema",
    "rol": "rol-uuid"
  },
  "permisos": ["crear_usuario", "editar_usuario", "eliminar_usuario", ...]
}
```

#### Verificar Token
```bash
POST /api/auth/verificar
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Obtener Usuario Autenticado
```bash
GET /api/auth/me
Authorization: Bearer {token}
```

### Usuarios

#### Crear Usuario (Admin Only)
```bash
POST /api/usuarios
Authorization: Bearer {token}
Content-Type: application/json

{
  "fichaId": "uuid",
  "primerNombre": "Juan",
  "apellido": "Pérez",
  "cargo": "Ejecutivo de Ventas",
  "fechaIngreso": "2024-01-15",
  "telefonoAsignado": "+52 55 1234 5678",
  "modeloDispositivo": "iPhone 14 Pro",
  "numeroDispositivo": "5512345678",
  "numeroSerie1": "ABC123",
  "numeroSerie2": "XYZ789",
  "rolId": "uuid-rol"
}

# Respuesta
{
  "mensaje": "Usuario creado exitosamente",
  "usuario": {
    "id": "uuid",
    "nombre_usuario": "jperez1",
    "nombre": "Juan Pérez",
    "cargo": "Ejecutivo de Ventas",
    "rol_id": "uuid-rol"
  },
  "credenciales": {
    "nombreUsuario": "jperez1",
    "contrasenaTemp": "K@mP9xL2!sQ5nV8",
    "advertencia": "GUARDA ESTAS CREDENCIALES - Solo se muestran una vez"
  }
}
```

#### Listar Usuarios
```bash
GET /api/usuarios
Authorization: Bearer {token}

# Con filtro
GET /api/usuarios?filtro=juan
```

#### Obtener Usuario
```bash
GET /api/usuarios/:id
Authorization: Bearer {token}
```

#### Editar Usuario
```bash
PUT /api/usuarios/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "cargo": "Gerente de Ventas",
  "telefono_asignado": "+52 55 9876 5432"
}
```

#### Desactivar Usuario
```bash
DELETE /api/usuarios/:id
Authorization: Bearer {token}
```

## 🔐 Control de Acceso (RBAC)

### Roles Disponibles

1. **Administrador** (nivel 10)
   - Acceso total al sistema
   - Puede crear, editar y eliminar usuarios
   - Acceso a toda la auditoría

2. **Supervisor** (nivel 5)
   - Gestión limitada de usuarios
   - Acceso a reportes
   - Lectura de auditoría

3. **Agente** (nivel 1)
   - Solo lectura de usuarios y reportes

### Permisos Disponibles

| Permiso | Descripción | Módulo |
|---------|-------------|--------|
| `crear_usuario` | Crear nuevos usuarios | usuarios |
| `editar_usuario` | Editar información de usuarios | usuarios |
| `eliminar_usuario` | Eliminar usuarios | usuarios |
| `ver_usuarios` | Listar usuarios | usuarios |
| `ver_reportes` | Acceder a reportes | reportes |
| `crear_reportes` | Crear nuevos reportes | reportes |
| `exportar_datos` | Exportar datos | reportes |
| `configurar_sistema` | Configuración de sistema | configuracion |
| `ver_auditoria` | Acceso a logs | auditoria |

## 📊 Estructura de Base de Datos

### Tabla: usuarios
```sql
- id (UUID)
- nombre_usuario (VARCHAR, UNIQUE)
- contrasena_hash (VARCHAR)
- primer_nombre, apellido
- cargo, telefono_asignado
- numero_serie_1, numero_serie_2
- rol_id (FK -> roles)
- ficha_id (FK -> fichas)
- activo (BOOLEAN)
```

### Tabla: roles
```sql
- id (UUID)
- nombre (VARCHAR, UNIQUE)
- descripcion (TEXT)
- nivel_acceso (INT)
- activo (BOOLEAN)
```

### Tabla: permisos
```sql
- id (UUID)
- nombre (VARCHAR, UNIQUE)
- modulo (VARCHAR)
- accion (VARCHAR)
```

### Tabla: fichas
```sql
- id (UUID)
- codigo_ficha (VARCHAR, UNIQUE)
- estado ('activa' | 'utilizada' | 'expirada')
- fecha_vencimiento (DATE)
- activa (BOOLEAN)
```

### Tabla: auditoria_acceso
```sql
- id (UUID)
- usuario_id (FK -> usuarios)
- accion (VARCHAR)
- resultado (VARCHAR)
- ip_origen (VARCHAR)
- fecha_acceso (TIMESTAMP)
- detalles (JSONB)
```

## 🧪 Usuarios de Prueba

```
Admin
- Usuario: admin
- Contraseña: Admin@2026

Supervisor
- Usuario: supervisor
- Contraseña: Supervisor@2026
```

## 🔒 Seguridad

- ✅ Contraseñas hashadas con bcrypt (12 rounds)
- ✅ JWT con expiración configurada
- ✅ Validación de permisos en cada endpoint
- ✅ Auditoría completa de accesos
- ✅ Soft deletes (registros no se eliminan)
- ✅ CORS configurado
- ✅ Prepared statements contra SQL injection

## 📝 Logging

Los logs se guardan con morgan en la consola. En producción, considera usar:
- Winston
- Pino
- Bunyan

## 🐛 Troubleshooting

### Error de conexión a BD
```
Verifica que PostgreSQL esté corriendo:
sudo service postgresql start

Verifica las credenciales en .env
```

### Error: "Token inválido"
```
Asegúrate que JWT_SECRET esté configurado correctamente
en ambos archivos .env del backend y frontend
```

### Error: "Usuario o contraseña inválida"
```
Ejecuta npm run db:seed para crear usuarios de prueba
Verifica que la contraseña sea correcta (Admin@2026)
```

## 📚 Documentación Adicional

- [Express.js](https://expressjs.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [JWT](https://jwt.io/)
- [PostgreSQL](https://www.postgresql.org/docs/)
- [bcrypt](https://www.npmjs.com/package/bcrypt)

## 📄 Licencia

MIT
