# Guía de Arquitectura - CRM SIGN Medios

Esta guía describe los patrones y mejores prácticas para el desarrollo dentro del CRM, siguiendo la estructura modular implementada.

## 🪝 Custom Hooks

Los hooks encapsulan lógica de estado reutilizable.

### `useForm`
Gestiona el estado de formularios, validación y envío.

```typescript
import { useForm } from '@/app/hooks/useForm';

const { formData, handleChange, handleSubmit, errors } = useForm({
  initialValues: { name: '' },
  onSubmit: (values) => console.log(values),
  validate: (values) => {
    const errors: any = {};
    if (!values.name) errors.name = 'Requerido';
    return errors;
  }
});
```

### `useSearch`
Proporciona búsqueda y filtrado de datos con lógica centralizada.

```typescript
import { useSearch } from '@/app/hooks/useSearch';

const { query, results } = useSearch({
  data: contacts,
  searchFields: ['firstName', 'lastName']
});
```

## 🔌 Servicios de Dominio

Los servicios encapsulan la lógica de negocio pura, facilitando la transición a un backend real.

### `contactService`
Gestión de contactos (CRUD).

```typescript
import { contactService } from '@/app/services/domain/contactService';

// Obtener todos
const contacts = contactService.getContacts();

// Agregar
const newContact = contactService.addContact(data);
```

### `backupService`
Lógica para generación de respaldos ZIP y CSV.

```typescript
import { backupService } from '@/app/services/domain/backupService';

// Generar backup de chats
const status = await backupService.generateChatsZip(agentId);
```

## 📊 Datos Mock

Toda la data ficticia debe residir en `src/app/mocks/` para mantener consistencia en toda la aplicación.

## 🧩 Componentes por Dominio

Los componentes deben agruparse por su dominio de negocio (e.g., `components/contacts/`, `components/team/`). Cada carpeta debe tener un `index.ts` (barrel export) para simplificar los imports.
