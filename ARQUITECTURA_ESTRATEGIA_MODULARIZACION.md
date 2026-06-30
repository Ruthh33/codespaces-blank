# 📋 DOCUMENTO DE ESTRATEGIA ARQUITECTÓNICA
## Modularización, Mantenibilidad y Escalabilidad del CRM SIGN Medios

**Fecha:** 30 de Junio de 2026  
**Versión:** 1.0  
**Modo:** Planificación (No-Code)  

---

## 1. ANÁLISIS DE ESTRUCTURA ACTUAL

### 1.1 Descripción General del Estado Actual

El proyecto CRM SIGN Medios sigue una estructura tradicional de carpetas por capas funcionales:
```
src/app/
├── pages/          (6 páginas principales)
├── components/     (sub-carpetas: agent, dashboard, ui, figma)
├── lib/            (utilidades)
├── routes.tsx
└── App.tsx
```

**Características observadas:**
- **Enfoque Top-Down:** Componentes agrupados por contexto (agent vs dashboard)
- **Lógica Mixta:** Estados, validaciones y lógica de negocio mezclados en componentes
- **Falta de Capa de Servicios:** No existe abstracción para APIs/datos
- **Datos Mock Distribuidos:** Cada página/componente define sus propios datos ficticios
- **Duplicación de Patrones:** Formularios y validaciones replicadas en múltiples archivos

---

### 1.2 Identificación de "God Files" y Problemas Críticos

#### **CRÍTICO: SettingsPage.tsx (792 líneas)**
- **Responsabilidades Acumuladas:**
  - Gestión de pestañas (Backup vs Team)
  - Lógica completa de backup (ZIP, CSV, full exports)
  - Funcionalidad de equipo (miembros, invitaciones, roles)
  - Validación de roles y permisos
  - Estado de múltiples modales (invitaciones, cambios de rol)
  - Lógica de descarga de archivos
  - Formato de transcripciones
  - Manejo de decodificación de URLs de datos

- **Riesgos:**
  - Cambios en funcionalidad de backup rompen gestión de equipo
  - Difícil de testear (requisitos dispares)
  - Difícil de reutilizar componentes internos
  - Alto acoplamiento con librerías específicas (JSZip)

#### **ALTO: DirectorioPage.tsx (530 líneas)**
- **Responsabilidades Acumuladas:**
  - Gestión de contactos (CRUD completo)
  - Lógica de búsqueda y filtrado
  - Modal de agregar contacto
  - Validación de formularios
  - Estados de éxito/error
  - Agrupación por agentes

#### **ALTO: AgentChatTree.tsx (620 líneas)**
- **Responsabilidades Acumuladas:**
  - Renderizado de árbol de mensajes
  - Lógica de tipos de mensajes especiales (supervisor)
  - Formateo de timestamps
  - Estados de lectura de mensajes
  - Manejo de archivos adjuntos

#### **ALTO: ReasignacionConversaciones.tsx (554 líneas)**
- **Responsabilidades Acumuladas:**
  - Gestión de reasignación de chats
  - Interfaz drag-and-drop
  - Confirmación de transacciones
  - Historial de cambios

#### **ALTO: UserRecordForm.tsx (467 líneas)**
- **Responsabilidades Acumuladas:**
  - Formulario de 12+ campos
  - Carga de fotos (conversión base64)
  - Validación compleja
  - Manejo de roleSelect adicional
  - Estados de foto preview

---

### 1.3 Problemas Transversales Detectados

#### **A. Carencia de Capa de Servicios**
- Mock data distribuida en múltiples archivos (`agentsData.ts`, `agentPanelData.ts`, inline)
- No existe abstracción para API calls
- Imposible separar lógica de UI de lógica de datos
- Difícil transición a backend real

#### **B. Duplicación de Lógica**
- **Validación de formularios:** Replicada en DirectorioPage, UserRecordForm, SettingsPage
- **Descarga de archivos:** Helper en SettingsPage, CSV generation inline
- **Estados de carga:** Todos los formularios reimplementan "isSubmitting"
- **Estilos de error:** Clases Tailwind repetidas en múltiples campos

#### **C. Mezcla de Responsabilidades**
- **Helpers vs Utilities:** Funciones de formato/transformación en archivos de componentes
- **UI Helpers:** Componentes pequeños (StatCard, BackupCard) dentro de páginas
- **Custom Types:** Tipos específicos de cada página, sin reutilización

#### **D. Falta de Estructura de Hooks Reutilizables**
- Lógica de estado compleja hecha inline en cada componente
- No hay custom hooks para patrones comunes (búsqueda, filtrado, paginación)
- Manejo de modales repetido

#### **E. Agrupación Débil de Componentes UI**
- Carpeta `ui/` existe pero contenido está fuera de uso
- Componentes de negocio (AgentCard, ContactCard) duplican estilos de `ui/`
- No hay sistema de diseño consistente

---

### 1.4 Dependencias Externas Críticas

- **JSZip:** Usado solo en SettingsPage para backup
- **Radix UI:** Componentes base esparcidos (Dialog, Select, DropdownMenu, Label)
- **Lucide React:** Iconografía consistente (bien usado)
- **Tailwind CSS:** Estilos, sin sistema de tokens centralizado

---

## 2. PROPUESTA DE ARQUITECTURA DE CARPETAS

### 2.1 Nuevo Árbol de Directorios Propuesto

```
src/
├── app/
│   ├── pages/                          # PÁGINAS DE NIVEL SUPERIOR (contenedores)
│   │   ├── AgentPanelPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── DirectorioPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── SettingsPage.tsx
│   │   └── UserManagementPage.tsx
│   │
│   ├── components/                     # COMPONENTES ORGANIZADOS POR DOMINIO
│   │   ├── common/                     # Componentes reutilizables globales
│   │   │   ├── DashboardHeader.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── BrandPanel.tsx
│   │   │
│   │   ├── backup/                     # DOMINIO: Gestión de Respaldos
│   │   │   ├── BackupCard.tsx          # Tarjeta individual de backup
│   │   │   ├── BackupStats.tsx         # Estadísticas de respaldos
│   │   │   ├── BackupHistory.tsx       # Historial de respaldos
│   │   │   └── index.ts                # Export barrel
│   │   │
│   │   ├── team/                       # DOMINIO: Gestión de Equipo & Permisos
│   │   │   ├── TeamMemberRow.tsx       # Fila de miembro del equipo
│   │   │   ├── RoleBadge.tsx           # Badge de rol
│   │   │   ├── StatusBadge.tsx         # Badge de estado
│   │   │   ├── InvitationRow.tsx       # Fila de invitación
│   │   │   ├── TeamTable.tsx           # Tabla de miembros
│   │   │   ├── RoleReference.tsx       # Panel de referencia de roles
│   │   │   └── index.ts
│   │   │
│   │   ├── contacts/                   # DOMINIO: Gestión de Contactos (Directorio)
│   │   │   ├── ContactCard.tsx         # Card de contacto
│   │   │   ├── ContactList.tsx         # Lista de contactos
│   │   │   ├── ContactFilters.tsx      # Barra de filtros
│   │   │   ├── ContactTabs.tsx         # Sistema de pestañas
│   │   │   ├── AddContactModal.tsx     # Modal de nuevo contacto
│   │   │   ├── ContactSearch.tsx       # Búsqueda de contactos
│   │   │   └── index.ts
│   │   │
│   │   ├── users/                      # DOMINIO: Gestión de Fichas/Usuarios
│   │   │   ├── UserRecordForm.tsx      # Formulario de ficha
│   │   │   ├── UserRecordCard.tsx      # Card de usuario
│   │   │   ├── UserRecordTable.tsx     # Tabla de fichas
│   │   │   ├── UserPhotoUpload.tsx     # Componente de carga de foto
│   │   │   └── index.ts
│   │   │
│   │   ├── chats/                      # DOMINIO: Gestión de Conversaciones
│   │   │   ├── ChatView.tsx            # Vista de chat
│   │   │   ├── ChatSidebar.tsx         # Sidebar de chats
│   │   │   ├── ChatMessage.tsx         # Mensaje individual
│   │   │   ├── ChatTree.tsx            # Árbol de mensajes
│   │   │   ├── LabelModal.tsx          # Modal de etiquetas
│   │   │   ├── AgentProfileModal.tsx   # Modal de perfil
│   │   │   └── index.ts
│   │   │
│   │   ├── agents/                     # DOMINIO: Gestión de Agentes
│   │   │   ├── AgentCard.tsx           # Card de agente
│   │   │   ├── AgentDropZone.tsx       # Zona de drop para asignación
│   │   │   ├── DraggableContact.tsx    # Contacto draggable
│   │   │   └── index.ts
│   │   │
│   │   ├── forms/                      # FORMULARIOS REUTILIZABLES
│   │   │   ├── FormField.tsx           # Campo de formulario con validación
│   │   │   ├── FormError.tsx           # Componente de error de campo
│   │   │   ├── FormSelect.tsx          # Select personalizado
│   │   │   ├── FormButton.tsx          # Botones tipificados
│   │   │   └── index.ts
│   │   │
│   │   ├── dialogs/                    # MODALES & DIÁLOGOS COMUNES
│   │   │   ├── ConfirmDialog.tsx       # Diálogo de confirmación
│   │   │   ├── BaseDialog.tsx          # Dialog base reutilizable
│   │   │   └── index.ts
│   │   │
│   │   ├── ui/                         # COMPONENTES UI PRIMITIVOS (sin cambios)
│   │   │   ├── accordion.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── button.tsx
│   │   │   └── ...
│   │   │
│   │   ├── figma/                      # Componentes específicos de Figma (sin cambios)
│   │   │   └── ImageWithFallback.tsx
│   │   │
│   │   └── index.ts                    # Export barrel consolidado
│   │
│   ├── hooks/                          # CUSTOM HOOKS (NUEVA CAPA)
│   │   ├── useForm.ts                  # Hook para manejo de formularios
│   │   ├── useSearch.ts                # Hook para búsqueda y filtrado
│   │   ├── usePagination.ts            # Hook para paginación
│   │   ├── useModal.ts                 # Hook para estado de modales
│   │   ├── useAsync.ts                 # Hook para operaciones async
│   │   ├── useLocalStorage.ts          # Hook para persistencia local
│   │   └── index.ts
│   │
│   ├── services/                       # CAPA DE SERVICIOS (NUEVA CAPA)
│   │   ├── api/
│   │   │   ├── client.ts               # Cliente HTTP base
│   │   │   └── config.ts               # Config de API
│   │   │
│   │   ├── domain/                     # Servicios de negocio
│   │   │   ├── backupService.ts        # Lógica de backup
│   │   │   ├── contactService.ts       # CRUD de contactos
│   │   │   ├── userService.ts          # CRUD de usuarios
│   │   │   ├── teamService.ts          # Gestión de equipo
│   │   │   ├── chatService.ts          # Gestión de chats
│   │   │   ├── authService.ts          # Autenticación
│   │   │   └── index.ts
│   │   │
│   │   └── file/
│   │       ├── exportService.ts        # Exportación de datos
│   │       ├── importService.ts        # Importación de datos
│   │       └── fileHelpers.ts          # Utilidades de archivos
│   │
│   ├── types/                          # TIPOS COMPARTIDOS (REFACTORIZADO)
│   │   ├── common.ts                   # Tipos comunes
│   │   ├── domain.ts                   # Tipos de dominio
│   │   ├── api.ts                      # Tipos de API
│   │   ├── forms.ts                    # Tipos de formularios
│   │   └── index.ts
│   │
│   ├── constants/                      # CONSTANTES GLOBALES (NUEVA CAPA)
│   │   ├── roles.ts                    # Configuración de roles
│   │   ├── statuses.ts                 # Estados del sistema
│   │   ├── validationRules.ts          # Reglas de validación
│   │   ├── apiEndpoints.ts             # Endpoints de API
│   │   └── index.ts
│   │
│   ├── utils/                          # FUNCIONES DE UTILIDAD
│   │   ├── formatters.ts               # Formateo (timestamps, moneda, etc)
│   │   ├── validators.ts               # Funciones de validación
│   │   ├── transforms.ts               # Transformación de datos
│   │   ├── csv.ts                      # Utilidades CSV
│   │   ├── zip.ts                      # Utilidades ZIP
│   │   ├── download.ts                 # Descarga de archivos
│   │   └── index.ts
│   │
│   ├── mocks/                          # DATOS MOCK CENTRALIZADOS (NUEVA CAPA)
│   │   ├── contacts.ts                 # Mock de contactos
│   │   ├── agents.ts                   # Mock de agentes
│   │   ├── chats.ts                    # Mock de conversaciones
│   │   ├── users.ts                    # Mock de usuarios
│   │   ├── teams.ts                    # Mock de equipos
│   │   └── index.ts
│   │
│   ├── context/                        # CONTEXT API (NUEVA CAPA - OPCIONAL)
│   │   ├── AuthContext.tsx             # Context de autenticación
│   │   ├── UserContext.tsx             # Context de usuario
│   │   └── index.ts
│   │
│   ├── lib/                            # Librerías internas
│   │   ├── auth.ts
│   │   └── index.ts
│   │
│   ├── routes.tsx
│   ├── App.tsx
│   └── main.tsx
│
└── styles/
    ├── globals.css
    ├── tailwind.config.ts
    └── theme.ts                        # Tokens de diseño (NUEVO)
```

---

### 2.2 Criterios de Organización

#### **Por Dominio de Negocio (Primario)**
- Cada carpeta en `components/` representa un área de negocio
- Ejemplos: `backup/`, `contacts/`, `team/`, `chats/`, `agents/`, `users/`
- **Ventaja:** Facilita localizar toda la lógica relacionada
- **Beneficio:** Permite extraer dominios como módulos independientes

#### **Por Tipo Funcional (Secundario)**
- `hooks/`, `services/`, `utils/`, `types/`, `constants/`, `mocks/`
- Servicios reutilizables que soportan múltiples dominios
- **Ventaja:** Fácil localizar y reutilizar lógica transversal

#### **Barrel Exports (Índices)**
- Cada carpeta de dominio exporta sus componentes via `index.ts`
- Simplifica imports: `import { ContactCard, ContactList } from '@/components/contacts'`
- Facilita futuros refactorings internos

---

## 3. DEFINICIÓN DE RESPONSABILIDADES POR MÓDULO

### 3.1 CAPAS PRINCIPALES

#### **CAPA 1: Pages (Contenedores)**
- **Responsabilidad:** Orquestar componentes para una vista completa
- **Límites:** Máximo 150-200 líneas
- **Dependencias:** Usa componentes de dominio + services
- **Estado:** Solo estado de página (pestañas, modales visibles)

#### **CAPA 2: Components (Vistas por Dominio)**
- **Responsabilidad:** Renderización y captura de eventos UI
- **Límites:** Máximo 50-100 líneas por componente
- **Tipos:**
  - **Presentacionales:** Solo props y callback (ej: ContactCard)
  - **Contenedores:** Coordinan hooks y state (ej: ContactList)
  - **Modales:** Aislados en su propio contexto (ej: AddContactModal)

#### **CAPA 3: Hooks (Lógica Reutilizable)**
- **Responsabilidad:** Encapsular lógica de estado repetida
- **Ejemplos:**
  - `useForm()` - Manejo de formularios con validación
  - `useSearch()` - Búsqueda y filtrado
  - `useModal()` - Control de visibilidad de modales
  - `useAsync()` - Operaciones asincrónicas con estado

#### **CAPA 4: Services (Lógica de Negocio)**
- **Responsabilidad:** Operaciones de datos y transformaciones
- **Sub-capas:**
  - **API Client:** Comunicación HTTP
  - **Domain Services:** Lógica de negocio pura
  - **File Services:** Operaciones de archivos
- **Independencia:** Sin dependencia de React

#### **CAPA 5: Utils (Funciones Puras)**
- **Responsabilidad:** Transformaciones sin estado
- **Ejemplos:**
  - Formateo de fechas
  - Validación de emails/teléfonos
  - Transformación CSV
  - Generación de URLs de descarga

#### **CAPA 6: Types, Constants, Mocks**
- **Responsabilidad:** Datos y definiciones compartidas
- **Mantención:** Punto único de verdad para constantes

---

### 3.2 MÓDULOS POR DOMINIO

#### **DOMINIO: Backup (Respaldos)**

**Componentes:**
- `BackupCard` - Tarjeta individual (ZIP, CSV, Full)
- `BackupStats` - Estadísticas de respaldos
- `BackupHistory` - Historial con timeline

**Servicios:**
- `backupService.generateChatsZip()` - Generar ZIP de chats
- `backupService.generateContactsCSV()` - Generar CSV de contactos
- `backupService.generateFullBackup()` - Backup completo
- `backupService.filterChatsByAgent()` - Filtrar por agente

**Utilidades:**
- `zip.ts` - Wrapper de JSZip
- `csv.ts` - Generación de CSV
- `download.ts` - Descarga de archivos
- `formatters.ts` - Transcripciones de chats

**Tipos:**
- `BackupStatus`, `BackupRecord`, `BackupFilter`

**Estado:**
- Estados de carga por tipo de backup
- Historial de respaldos generados
- Filtro de agente seleccionado

---

#### **DOMINIO: Equipo (Team & Permissions)**

**Componentes:**
- `TeamMemberRow` - Fila de miembro
- `RoleBadge` - Badge de rol
- `StatusBadge` - Badge de estado
- `InvitationRow` - Fila de invitación
- `TeamTable` - Tabla completa
- `RoleReference` - Panel informativo

**Servicios:**
- `teamService.fetchTeamMembers()`
- `teamService.inviteUser()`
- `teamService.revokeInvite()`
- `teamService.updateMemberRole()`
- `teamService.toggleMemberStatus()`
- `teamService.removeMember()`

**Tipos:**
- `TeamMember`, `Invitation`, `Role`, `MemberStatus`

**Constants:**
- `ROLE_CONFIG` - Config de roles
- `STATUS_CONFIG` - Config de estados

**Validaciones:**
- Email format
- Rol válido
- Permisos de operación

---

#### **DOMINIO: Contactos (Directory)**

**Componentes:**
- `ContactCard` - Tarjeta de contacto
- `ContactList` - Lista renderizada
- `ContactFilters` - Dropdown de filtros
- `ContactTabs` - Pestañas (Todos/Por Agentes)
- `ContactSearch` - Barra de búsqueda
- `AddContactModal` - Modal de nuevo contacto

**Services:**
- `contactService.fetchContacts()`
- `contactService.searchContacts(query, filters)`
- `contactService.groupByAgent()`
- `contactService.addContact()`
- `contactService.deleteContact()`
- `contactService.updateContact()`

**Hooks:**
- `useContactSearch()` - Búsqueda con debounce
- `useContactFilters()` - Gestión de filtros
- `useContactGrouping()` - Agrupación por agente

**Tipos:**
- `Contact`, `ContactFilter`, `ContactSearchQuery`

---

#### **DOMINIO: Usuarios (User Records)**

**Componentes:**
- `UserRecordForm` - Formulario principal
- `UserRecordCard` - Card de usuario
- `UserRecordTable` - Tabla de registros
- `UserPhotoUpload` - Carga de foto con preview
- Componentes de campo específico (Device, Serial, etc)

**Services:**
- `userService.fetchUsers()`
- `userService.createUser()`
- `userService.updateUser()`
- `userService.deleteUser()`
- `userService.uploadPhoto()`

**Hooks:**
- `useUserForm()` - Extender `useForm()` con lógica de usuario
- `usePhotoUpload()` - Manejo de foto

**Tipos:**
- `UserRecord`, `UserRecordFormData`, `UserRole`

**Validaciones:**
- Username (alphanumeric)
- Password requirements
- Phone format
- Device data

---

#### **DOMINIO: Chats (Conversaciones)**

**Componentes:**
- `ChatView` - Visor de chat principal
- `ChatSidebar` - Sidebar de conversaciones
- `ChatMessage` - Mensaje individual
- `ChatTree` - Árbol de mensajes
- `LabelModal` - Modal de etiquetas
- `AgentProfileModal` - Modal de perfil

**Services:**
- `chatService.fetchConversations()`
- `chatService.getConversationDetail()`
- `chatService.sendMessage()`
- `chatService.formatTranscript()`
- `chatService.addLabel()`

**Utils:**
- `formatters.formatMessageTime()`
- `formatters.formatChatTranscript()`

**Tipos:**
- `Conversation`, `Message`, `ChatLabel`, `MessageType`

---

### 3.3 MÓDULOS TRANSVERSALES

#### **Hooks Compartidos**

```
useForm()
├── estado: formData, errors
├── validación: validate(), setErrors()
├── handlers: handleChange(), handleSubmit()
└── reset: resetForm()

useSearch()
├── query, setQuery
├── debounce: 300ms
└── onSearch callback

usePagination()
├── page, pageSize, total
└── handlers: next(), prev(), goTo()

useModal()
├── isOpen, open(), close()
└── handler: onOpenChange()

useAsync()
├── estado: data, loading, error
└── trigger: execute()

useLocalStorage()
├── getter/setter sincronizado
└── serialización automática
```

#### **Services Compartidos**

```
backupService
├── generateZip()
├── generateCSV()
└── downloadFile()

exportService
├── exportChatsToJSON()
├── exportContactsToCSV()
└── exportTeamToCSV()

fileHelpers
├── decodeDataUrl()
├── validateFile()
└── compressImage()

validatorService
├── validateEmail()
├── validatePhone()
├── validatePassword()
└── validateForm()
```

#### **Utilidades**

```
formatters.ts
├── formatDate()
├── formatPhone()
├── formatCurrency()
└── formatTimestamp()

validators.ts
├── isValidEmail()
├── isValidPhone()
├── isValidUsername()
└── isValidPassword()

transforms.ts
├── groupBy()
├── flatten()
├── normalizeData()
└── denormalizeData()

download.ts
├── downloadBlob()
├── downloadJSON()
├── downloadCSV()
└── downloadZip()
```

---

## 4. PLAN DE MIGRACIÓN PASO A PASO

### **FASE 0: PREPARACIÓN (Día 1)**

#### Hito 0.1: Crear Estructura Base
1. Crear carpetas raíz: `hooks/`, `services/`, `types/`, `constants/`, `utils/`, `mocks/`
2. Crear índices (barrel exports): `index.ts` en cada carpeta
3. Crear `services/domain/`, `services/api/`, `services/file/`
4. **Tiempo:** 30 minutos
5. **Risk:** Bajo - solo creación de directorios

#### Hito 0.2: Centralizar Tipos
1. Extraer todos los tipos de archivos existentes
2. Consolidar en `types/domain.ts` (tipos de negocio)
3. Consolidar en `types/forms.ts` (tipos de formularios)
4. Actualizar imports: buscar `interface` y migrar
5. **Tiempo:** 1 hora
6. **Risk:** Bajo - solo reorganización
7. **Validación:** `npm run build` sin errores

---

### **FASE 1: CENTRALIZAR DATOS (Día 1-2)**

#### Hito 1.1: Consolidar Mock Data
1. Crear `mocks/contacts.ts` - Extraer de DirectorioPage
2. Crear `mocks/agents.ts` - Extraer de agentsData.ts + agentPanelData.ts
3. Crear `mocks/chats.ts` - Extraer de panelConversations
4. Crear `mocks/users.ts` - Extraer de UserRecordManagement
5. Crear `mocks/teams.ts` - Extraer de SettingsPage
6. Crear `mocks/index.ts` - Export barrel
7. **Tiempo:** 1.5 horas
8. **Risk:** Bajo-Medio - requiere validación de referencias
9. **Validación:** Todos los archivos que importaban mock data ahora importan de `mocks/`

#### Hito 1.2: Crear Constantes Globales
1. Crear `constants/roles.ts` - Consolidar `roleConfig` de SettingsPage
2. Crear `constants/statuses.ts` - Estados (activo, suspendido, etc)
3. Crear `constants/validationRules.ts` - Reglas de validación
4. Crear `constants/index.ts`
5. **Tiempo:** 45 minutos
6. **Risk:** Bajo
7. **Validación:** Buscar hardcoded strings y reemplazar con constantes

---

### **FASE 2: CREAR CAPA DE UTILIDADES (Día 2-3)**

#### Hito 2.1: Extraer Funciones de Utilidad
1. **`utils/formatters.ts`**
   - Extraer `timestamp()` de SettingsPage
   - Extraer `chatTranscript()` de SettingsPage
   - Crear función para formateo de fecha genérica
   - **Fuente:** SettingsPage (líneas 82-93)

2. **`utils/validators.ts`**
   - Extraer validación de email (SettingsPage)
   - Extraer validación de phone (DirectorioPage)
   - Crear regla de validador genérica
   - **Fuente:** DirectorioPage, SettingsPage

3. **`utils/download.ts`**
   - Extraer `downloadBlob()` de SettingsPage
   - Extraer `downloadCSV()` de SettingsPage
   - Crear `downloadJSON()`, `downloadZip()`
   - **Fuente:** SettingsPage (líneas 66-73)

4. **`utils/csv.ts`**
   - Extraer lógica de generación CSV
   - Crear función parametrizada

5. **`utils/zip.ts`**
   - Wrapper alrededor de JSZip
   - Funciones: createZip(), addFile(), addJSON()

6. **`utils/transforms.ts`**
   - `groupBy()` - Agrupación genérica
   - `normalizePhone()` - Normalizar números

7. **`utils/index.ts`** - Export barrel

**Tiempo:** 3 horas  
**Risk:** Medio - requiere extraer y refactorizar lógica  
**Validación:** Cada función tiene su función correspondiente en un archivo de test

---

#### Hito 2.2: Crear Servicios de Archivo
1. **`services/file/fileHelpers.ts`**
   - Extraer `decodeDataUrl()` de SettingsPage
   - Crear `validateFileSize()`, `validateFileType()`
   - Crear `compressImage()`
   - **Fuente:** SettingsPage (líneas 95-99)

2. **`services/file/exportService.ts`**
   - `exportChatsToZip()`
   - `exportContactsToCSV()`
   - `exportUsersToCSV()`
   - `exportTeamToCSV()`

3. **`services/file/index.ts`**

**Tiempo:** 1.5 horas  
**Risk:** Bajo-Medio
**Validación:** Pruebas manuales de descarga

---

### **FASE 3: CREAR CAPA DE SERVICIOS DE NEGOCIO (Día 3-5)**

#### Hito 3.1: Backup Service
1. Crear `services/domain/backupService.ts`
2. **Métodos:**
   - `generateChatsZip(agentId?, contacts?)`
   - `generateContactsCSV()`
   - `generateFullBackup()`
   - `getBackupHistory()`
3. **Fuente:** Extraer de SettingsPage (líneas 415-490)
4. **Dependencias:** usa `utils/zip.ts`, `utils/csv.ts`, `utils/formatters.ts`
5. **Tiempo:** 2 horas
6. **Risk:** Medio
7. **Validación:** Backup generado exitosamente con mismo contenido

---

#### Hito 3.2: Contact Service
1. Crear `services/domain/contactService.ts`
2. **Métodos:**
   - `getContacts()` - Retorna todos
   - `searchContacts(query)` - Búsqueda
   - `filterContacts(phoneNumber)` - Filtro
   - `groupByAgent()` - Agrupación
   - `addContact(data)` - Crear
   - `deleteContact(id)` - Eliminar
   - `updateContact(id, data)` - Actualizar
3. **Fuente:** Extraer de DirectorioPage (líneas 200-350)
4. **Dependencias:** usa `mocks/contacts.ts`, `utils/transforms.ts`
5. **Tiempo:** 2 horas
6. **Risk:** Bajo
7. **Validación:** CRUD completo funciona

---

#### Hito 3.3: Team Service
1. Crear `services/domain/teamService.ts`
2. **Métodos:**
   - `getTeamMembers()`
   - `inviteUser(email, role)`
   - `revokeInvite(id)`
   - `updateMemberRole(id, role)`
   - `toggleMemberStatus(id)`
   - `removeMember(id)`
   - `validateInviteEmail(email)`
3. **Fuente:** SettingsPage (líneas 490-550)
4. **Tiempo:** 1.5 horas
5. **Risk:** Bajo
6. **Validación:** Invitación y cambios de rol funcionan

---

#### Hito 3.4: User Service
1. Crear `services/domain/userService.ts`
2. **Métodos:**
   - `getUsers()`, `getUser(id)`
   - `createUser(data)`, `updateUser(id, data)`
   - `deleteUser(id)`
   - `uploadUserPhoto(file)`
3. **Fuente:** UserRecordForm, UserRecordManagement
4. **Tiempo:** 1.5 horas
5. **Risk:** Bajo

---

#### Hito 3.5: Chat Service
1. Crear `services/domain/chatService.ts`
2. **Métodos:**
   - `getConversations()`, `getConversation(id)`
   - `formatConversationTranscript(conversation)`
   - `getMessagesByAgent(agentId)`
   - `addLabel(conversationId, label)`
3. **Fuente:** AgentChatTree, ChatView
4. **Tiempo:** 1.5 horas
5. **Risk:** Bajo

**Total Fase 3:** 8.5 horas (2 días)

---

### **FASE 4: CREAR CUSTOM HOOKS (Día 5-6)**

#### Hito 4.1: useForm Hook
1. Crear `hooks/useForm.ts`
2. **Funcionalidad:**
   - Gestión de estado del formulario
   - Validación automática
   - Handlers: onChange, onSubmit
   - Reset y setValue
3. **Uso:** Reemplaza lógica en UserRecordForm, DirectorioPage
4. **Tiempo:** 1.5 horas
5. **Risk:** Medio
6. **Validación:** Formularios funcionan igual

---

#### Hito 4.2: useSearch Hook
1. Crear `hooks/useSearch.ts`
2. **Funcionalidad:**
   - Manejo de query con debounce
   - Filtrado de resultados
   - Reset de búsqueda
3. **Dependencias:** `utils/transforms.ts`
4. **Tiempo:** 1 hora
5. **Risk:** Bajo

---

#### Hito 4.3: useModal Hook
1. Crear `hooks/useModal.ts`
2. **Funcionalidad:**
   - isOpen, open(), close(), toggle()
   - Para múltiples modales: useMultipleModals()
3. **Tiempo:** 45 minutos
4. **Risk:** Bajo

---

#### Hito 4.4: Otros Hooks
1. `useAsync.ts` - Operaciones async con estado
2. `usePagination.ts` - Paginación
3. `useLocalStorage.ts` - Persistencia local
4. **Tiempo:** 2 horas
5. **Risk:** Bajo

**Total Fase 4:** 5 horas (1 día)

---

### **FASE 5: REFACTORIZAR COMPONENTES (Día 6-8)**

#### Hito 5.1: Refactorizar Backup (SettingsPage)
1. Crear estructura en `components/backup/`
2. Dividir SettingsPage → BackupCard, BackupStats, BackupHistory
3. Conectar con `backupService`
4. Eliminar lógica de SettingsPage
5. **Tiempo:** 2 horas
6. **Risk:** Medio (cambios en SettingsPage)
7. **Validación:** Backup tab funciona igual

#### Hito 5.2: Refactorizar Team (SettingsPage)
1. Crear estructura en `components/team/`
2. Dividir en: TeamMemberRow, TeamTable, RoleBadge, StatusBadge, etc
3. Conectar con `teamService`
4. Eliminar lógica de SettingsPage
5. **Tiempo:** 2 horas
6. **Risk:** Medio
7. **Validación:** Team tab funciona igual

#### Hito 5.3: Refactorizar Contacts (DirectorioPage)
1. Crear estructura en `components/contacts/`
2. Dividir en: ContactCard, ContactList, AddContactModal, etc
3. Crear hooks: useContactSearch, useContactFilters
4. Conectar con `contactService`
5. **Tiempo:** 2.5 horas
6. **Risk:** Medio
7. **Validación:** Directorio completo funciona

#### Hito 5.4: Refactorizar Users (UserRecordForm + Management)
1. Crear estructura en `components/users/`
2. Dividir UserRecordForm en componentes menores
3. Crear UserPhotoUpload, UserFormField
4. Conectar con `userService` y `useForm` hook
5. **Tiempo:** 2 horas
6. **Risk:** Medio
7. **Validación:** CRUD de fichas funciona

#### Hito 5.5: Refactorizar Chats (ChatView, etc)
1. Crear estructura en `components/chats/`
2. Mantener componentes existentes
3. Extraer lógica a `chatService`
4. **Tiempo:** 1.5 horas
5. **Risk:** Bajo
6. **Validación:** Chats funcionan igual

**Total Fase 5:** 10 horas (2-3 días)

---

### **FASE 6: REFACTORIZAR PÁGINAS (Día 8-9)**

#### Hito 6.1: SettingsPage Refactored
- Líneas esperadas: 792 → ~150
- Composición de componentes de backup/ y team/
- Gestión de tabs simple
- **Validación:** Misma UI, código más limpio

#### Hito 6.2: DirectorioPage Refactored
- Líneas esperadas: 530 → ~120
- Usa componentes de contacts/ + hooks
- **Validación:** Misma UI

#### Hito 6.3: Otras páginas
- DashboardPage
- AgentPanelPage
- UserManagementPage
- LoginPage (minor)

**Tiempo:** 3 horas
**Risk:** Bajo

---

### **FASE 7: TESTING & VALIDACIÓN (Día 9-10)**

#### Hito 7.1: Pruebas Funcionales
1. Todos los CRUD funcionan
2. Búsqueda y filtrado funcionan
3. Descargas de archivos funcionan
4. Validaciones de formularios funcionan
5. Modales se abren/cierran

#### Hito 7.2: Build & Performance
1. `npm run build` sin errores
2. Bundle size no aumentó significativamente
3. No hay warnings en consola

#### Hito 7.3: Documentación
1. README actualizado con estructura
2. Guía de uso de hooks
3. Guía de uso de services

**Tiempo:** 2 horas

---

## 5. ESTRATEGIA DE MIGRACIÓN SEGURA

### 5.1 Metodología: Refactorización Progresiva

**Principio:** Mantener funcionalidad mientras se reorganiza

```
Semana 1 (Fases 0-1): Setup + Mock Data
├── Bajo riesgo
├── Sin cambios de funcionalidad
└── Build: ✓ Pass

Semana 1 (Fases 2-3): Utils + Services
├── Bajo-Medio riesgo
├── Componentes aún sin cambios
└── Servicios probados en isolación

Semana 2 (Fases 4-5): Hooks + Componentes
├── Medio riesgo
├── Componentes refactorizados gradualmente
└── Build: ✓ Pass después de cada cambio

Semana 2 (Fases 6-7): Páginas + Testing
├── Bajo riesgo
├── Cambios solo en orquestación
└── QA completo
```

### 5.2 Estrategia de Branching

```
main (estable)
└── feature/refactor-architecture
    ├── refactor/phase-0-setup
    ├── refactor/phase-1-mocks
    ├── refactor/phase-2-utils
    ├── refactor/phase-3-services
    ├── refactor/phase-4-hooks
    ├── refactor/phase-5-components
    ├── refactor/phase-6-pages
    └── refactor/phase-7-testing
```

Cada PR incluye:
- Descripción de cambios
- Tests de funcionalidad
- Checklist de validación
- Screenshots si es UI

### 5.3 Checkpoints de Validación

**Después de cada fase:**
1. `npm run build` - Compila sin errores
2. `npm run dev` - Inicia sin problemas
3. Funcionalidad manual - Probada en dev
4. Browser console - Sin errores ni warnings
5. Bundle analysis - Sin aumentos inesperados

### 5.4 Rollback Strategy

Si algo falla:
1. Revertir a commit anterior
2. Identificar causa
3. Crear issue técnica
4. Replantear estrategia

**Risk mitigation:**
- Commits pequeños por cada hito
- Branch protection en main
- Code review requerido

---

## 6. BENEFICIOS ESPERADOS POST-MIGRACIÓN

### 6.1 Mantenibilidad
- ✅ Reducción de tamaño de archivo (SettingsPage: 792 → ~150 líneas)
- ✅ Componentes enfocados (max 100 líneas)
- ✅ Lógica reutilizable centralizada
- ✅ Fácil localizar dónde está la lógica

### 6.2 Escalabilidad
- ✅ Fácil agregar nuevos dominios
- ✅ Servicios preparados para APIs reales
- ✅ Estructura soporta crecimiento 5x

### 6.3 Testing
- ✅ Services testeable en isolación
- ✅ Hooks testeable sin React DOM
- ✅ Componentes pequeños y específicos

### 6.4 Velocidad de Desarrollo
- ✅ Tiempo de búsqueda reducido
- ✅ Reutilización de código aumentada
- ✅ Menos duplicación

### 6.5 Onboarding
- ✅ Nuevos devs entienden estructura rápidamente
- ✅ Guías claras de dónde agregar código
- ✅ Ejemplos de patrones

---

## 7. RIESGOS IDENTIFICADOS & MITIGACIÓN

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|-----------|
| Breaking changes en componentes | Media | Alto | Refactorizar phases paso a paso, unit tests |
| Imports circulares | Baja | Medio | Code review, eslint config |
| Aumento bundle size | Media | Bajo | Tree shaking, lazy loading post-refactor |
| Over-engineering | Media | Bajo | KISS principle, reviewers vigilantes |
| Timeline overrun | Media | Medio | Buffer de 2 días, priorizar core |
| Team alignment | Alta | Medio | Documentación clara, workshop inicial |

---

## 8. TIMELINE ESTIMADO

| Fase | Duración | Días | Riesgo | Estado |
|------|----------|------|--------|--------|
| 0 - Preparación | 1h 30m | 0.5 | Bajo | ⏳ |
| 1 - Mock Data | 2h 30m | 1 | Bajo | ⏳ |
| 2 - Utilidades | 4h 30m | 1.5 | Bajo-Medio | ⏳ |
| 3 - Services | 8h 30m | 2 | Medio | ⏳ |
| 4 - Hooks | 5h | 1 | Bajo | ⏳ |
| 5 - Componentes | 10h | 2-3 | Medio | ⏳ |
| 6 - Páginas | 3h | 1 | Bajo | ⏳ |
| 7 - Testing | 2h | 0.5 | Bajo | ⏳ |
| **TOTAL** | **36.5h** | **9-10 días** | **Medio** | **⏳** |

**Con 1 desarrollador full-time:** ~2 semanas  
**Con 2 desarrolladores:** ~1 semana (paralelizando dominios)

---

## 9. PRÓXIMOS PASOS

### ACCIÓN INMEDIATA (Antes de implementar)
1. ✅ Revisar este documento con el equipo
2. ✅ Validar propuesta arquitectónica
3. ✅ Ajustar timeline según capacidad
4. ✅ Asignar recursos
5. ✅ Crear issues en tracker (GitHub Projects)
6. ✅ Configurar ramas y workflows

### PRE-IMPLEMENTACIÓN
1. Backup del código actual
2. Crear rama feature principal
3. Crear script de validación de build
4. Documentar decisiones arquitectónicas

### DURANTE IMPLEMENTACIÓN
1. Seguir fases secuencialmente
2. Build después de cada fase
3. PR reviews obligatorios
4. Comunicación diaria del progreso

### POST-IMPLEMENTACIÓN
1. Workshop de arquitectura con equipo
2. Documentación de guías de desarrollo
3. Templates para nuevos componentes/services
4. Análisis de lecciones aprendidas

---

## 10. CONCLUSIÓN

Esta arquitectura propuesta convierte un codebase monolítico en uno **modular, escalable y mantenible**, preparando el proyecto para:

- 📈 Crecimiento futuro
- 👥 Nuevos desarrolladores
- 🔧 Features rápidamente
- 🧪 Testing exhaustivo
- 🚀 Deployments confiables

**Estado:** ✅ Listo para implementación en Fase 0

---

**Documento preparado por:** Ingeniero de Software Senior  
**Fecha:** 30 de Junio de 2026  
**Versión:** 1.0  
**Clasificación:** Estrategia Arquitectónica
