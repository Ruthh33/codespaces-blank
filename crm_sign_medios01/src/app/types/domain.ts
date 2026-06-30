// Domain Types
// Tipos de dominio de negocio (extraído del codebase)

import type { Role, MemberStatus } from '../constants';
import type { MessageType, PanelMessage } from '../mocks/chats';

export interface Contact extends Record<string, unknown> {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  agentAssigned?: string;
  createdAt: string;
}

export interface TeamMember extends Record<string, unknown> {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: MemberStatus;
  joinedAt: string;
  initials: string;
  avatarColor: string;
}

export interface Conversation extends Record<string, unknown> {
  id: string;
  clientName: string;
  clientPhone: string;
  clientInitials: string;
  avatarColor: string;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
  clientOnline: boolean;
  assignedSince: string;
  topic: string;
  messages: PanelMessage[];
}

export interface Message extends Record<string, unknown> {
  id: string;
  type: MessageType;
  text: string;
  time: string;
  authorName?: string;
  authorInitials?: string;
  status?: 'sent' | 'delivered' | 'read';
}

export interface BackupStatus extends Record<string, unknown> {
  type: 'chats' | 'contacts' | 'full';
  label: string;
  time: string;
}

export interface Invitation extends Record<string, unknown> {
  id: string;
  email: string;
  role: Role;
  sentAt: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'declined';
}
