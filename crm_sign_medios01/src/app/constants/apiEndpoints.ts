// API Endpoints Constants
// Configuración de endpoints de API

export const API_ENDPOINTS = {
  // Auth
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
  },
  // Contacts
  contacts: {
    list: '/contacts',
    detail: '/contacts/:id',
    create: '/contacts',
    update: '/contacts/:id',
    delete: '/contacts/:id',
  },
  // Users
  users: {
    list: '/users',
    detail: '/users/:id',
    create: '/users',
    update: '/users/:id',
    delete: '/users/:id',
    uploadPhoto: '/users/:id/photo',
  },
  // Team
  team: {
    members: '/team/members',
    invite: '/team/invite',
    revokeInvite: '/team/invitations/:id/revoke',
  },
  // Chats
  chats: {
    conversations: '/chats/conversations',
    detail: '/chats/conversations/:id',
    messages: '/chats/conversations/:id/messages',
  },
  // Backups
  backups: {
    generate: '/backups/generate',
    history: '/backups/history',
  },
} as const;
