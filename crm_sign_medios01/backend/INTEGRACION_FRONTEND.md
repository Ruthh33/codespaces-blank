# Guía de Integración Frontend-Backend

## 🔗 Configuración de CORS

El backend está configurado para aceptar requests del frontend en desarrollo:

```env
FRONTEND_URL=http://localhost:5173
```

## 🌐 Conectar Frontend a Backend

### 1. Crear un cliente API en el frontend

En `src/lib/api.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('authToken');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: error.error || 'Error en la solicitud' };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return { error: 'Error de conexión con el servidor' };
  }
}

export { apiCall, API_BASE_URL };
```

### 2. Crear servicio de autenticación

En `src/services/authService.ts`:

```typescript
import { apiCall } from '../lib/api.js';

export interface LoginResponse {
  token: string;
  usuario: {
    id: string;
    nombreUsuario: string;
    nombre: string;
    rol: string;
  };
  permisos: string[];
}

export async function login(nombreUsuario: string, contrasena: string) {
  const response = await apiCall<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ nombreUsuario, contrasena }),
  });

  if (response.error) {
    throw new Error(response.error);
  }

  if (response.data) {
    localStorage.setItem('authToken', response.data.token);
    localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
    localStorage.setItem('permisos', JSON.stringify(response.data.permisos));
    return response.data;
  }

  throw new Error('Respuesta vacía del servidor');
}

export async function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('usuario');
  localStorage.removeItem('permisos');
}

export function getToken() {
  return localStorage.getItem('authToken');
}

export function getPermisos(): string[] {
  const permisos = localStorage.getItem('permisos');
  return permisos ? JSON.parse(permisos) : [];
}

export function tienePermiso(permiso: string): boolean {
  return getPermisos().includes(permiso);
}
```

### 3. Actualizar LoginForm en el frontend

```typescript
import { useState } from 'react';
import { login } from '@/services/authService';

export function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(username, password);
      // Redirigir al dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Campos del formulario */}
      <button type="submit" disabled={loading}>
        {loading ? 'Autenticando...' : 'Iniciar Sesión'}
      </button>
    </form>
  );
}
```

### 4. Variables de entorno del frontend

En `.env.local` del frontend:

```env
VITE_API_URL=http://localhost:3001/api
```

## 📋 Flujo de Trabajo Completo

```
1. Usuario completa formulario de login
   ↓
2. Frontend envía POST /api/auth/login
   ↓
3. Backend valida credenciales
   ↓
4. Backend devuelve JWT + usuario + permisos
   ↓
5. Frontend almacena JWT en localStorage
   ↓
6. Usuario redirected a dashboard
   ↓
7. Todas las solicitudes futuras incluyen JWT en headers
```

## 🔐 Proteger Rutas en Frontend

```typescript
// src/lib/ProtectedRoute.tsx
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { getToken, tienePermiso } from '@/services/authService';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermiso?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredPermiso 
}: ProtectedRouteProps) {
  const token = getToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermiso && !tienePermiso(requiredPermiso)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
```

## 📝 Servicios API para Usuarios

```typescript
// src/services/usuarioService.ts
import { apiCall } from '../lib/api.js';

export async function crearUsuario(datos: any) {
  const response = await apiCall('/usuarios', {
    method: 'POST',
    body: JSON.stringify(datos),
  });

  if (response.error) throw new Error(response.error);
  return response.data;
}

export async function listarUsuarios(filtro?: string) {
  const url = filtro ? `/usuarios?filtro=${encodeURIComponent(filtro)}` : '/usuarios';
  const response = await apiCall(url);

  if (response.error) throw new Error(response.error);
  return response.data;
}

export async function obtenerUsuario(id: string) {
  const response = await apiCall(`/usuarios/${id}`);

  if (response.error) throw new Error(response.error);
  return response.data;
}

export async function editarUsuario(id: string, datos: any) {
  const response = await apiCall(`/usuarios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos),
  });

  if (response.error) throw new Error(response.error);
  return response.data;
}

export async function desactivarUsuario(id: string) {
  const response = await apiCall(`/usuarios/${id}`, {
    method: 'DELETE',
  });

  if (response.error) throw new Error(response.error);
  return response.data;
}
```

## 🧪 Pruebas con cURL

```bash
# 1. Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"nombreUsuario":"admin","contrasena":"Admin@2026"}'

# 2. Listar usuarios (con token)
curl -X GET http://localhost:3001/api/usuarios \
  -H "Authorization: Bearer {token}"

# 3. Crear usuario
curl -X POST http://localhost:3001/api/usuarios \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "fichaId": "uuid",
    "primerNombre": "Juan",
    "apellido": "Pérez",
    "cargo": "Ejecutivo",
    "fechaIngreso": "2024-01-15",
    "rolId": "uuid-rol-agente"
  }'
```

## 📊 Integrando con UserRecordManagement

Actualiza `UserRecordManagement.tsx` para usar la API:

```typescript
import { useEffect, useState } from 'react';
import { listarUsuarios, crearUsuario as crearUsuarioAPI } from '@/services/usuarioService';

export function UserRecordManagement() {
  const [records, setRecords] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      const usuarios = await listarUsuarios();
      setRecords(usuarios);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecord = async (record: Omit<UserRecord, 'id'>) => {
    try {
      const nuevoUsuario = await crearUsuarioAPI({
        fichaId: record.id,
        primerNombre: record.firstName,
        apellido: record.lastName,
        cargo: record.position,
        fechaIngreso: record.entryDate,
        rolId: record.role,
      });

      setRecords([...records, nuevoUsuario]);
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error creando usuario:', error);
    }
  };

  return (
    // ... resto del componente
  );
}
```

## ✅ Checklist de Integración

- [ ] Backend instalado y en ejecución
- [ ] PostgreSQL configurada
- [ ] Variables de entorno configuradas
- [ ] Cliente API creado en frontend
- [ ] Servicio de autenticación implementado
- [ ] LoginForm conectado a API
- [ ] Token almacenado en localStorage
- [ ] Rutas protegidas configuradas
- [ ] UserRecordManagement conectado a API
- [ ] Pruebas de login exitosas
- [ ] Pruebas de creación de usuarios exitosas
