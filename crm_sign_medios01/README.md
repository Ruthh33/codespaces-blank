# CRM SIGN Medios - Sistema de Gestión

Este proyecto es un CRM moderno diseñado para la gestión de agentes, contactos y fichas de usuario.

## 🚀 Arquitectura Modular

El proyecto sigue una arquitectura modular y escalable organizada por capas de dominio y funcionalidad:

### Estructura de Directorios

- `src/app/pages/`: Contenedores de nivel superior que orquestan los componentes.
- `src/app/components/`: Componentes organizados por dominio (`contacts/`, `users/`, `team/`, `backup/`, `chats/`, etc.).
- `src/app/services/`: Capa de servicios para lógica de negocio y comunicación con datos.
- `src/app/hooks/`: Custom hooks reutilizables (`useForm`, `useSearch`, `useModal`, etc.).
- `src/app/utils/`: Funciones de utilidad puras (formateadores, validadores, etc.).
- `src/app/mocks/`: Datos de prueba centralizados.
- `src/app/types/`: Definiciones de tipos TypeScript compartidos.

## 🛠️ Desarrollo

### Instalación de Dependencias

```bash
pnpm install
```

### Servidor de Desarrollo

```bash
npm run dev
```

### Construcción para Producción

```bash
npm run build
```

## 🧪 Testing

Las pruebas funcionales están ubicadas en la carpeta `tests/` y utilizan Playwright.

```bash
npx playwright test
```

## 📄 Documentación Adicional

- [Guía de Arquitectura](./GUIDE_ARQUITECTURA.md): Detalles sobre el uso de hooks y servicios.
- [Estrategia de Modularización](../ARQUITECTURA_ESTRATEGIA_MODULARIZACION.md): Plan de migración y diseño arquitectónico original.
