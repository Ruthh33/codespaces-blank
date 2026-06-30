import { mockTeamMembers, TeamMember, Invitation } from "../../mocks/teams";
import { timestamp } from "../../utils/formatters";
import type { Role } from "../../constants/roles";

// Team Service
// Gestión de equipo y permisos (extraído de SettingsPage)

export const teamService = {
  /**
   * Obtiene todos los miembros del equipo
   */
  getTeamMembers: (): TeamMember[] => {
    return [...mockTeamMembers];
  },

  /**
   * Envía una invitación a un nuevo usuario
   */
  inviteUser: (email: string, role: Role): Invitation => {
    return {
      id: String(Date.now()),
      email,
      role,
      sentAt: timestamp(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días
      status: "pending",
    };
  },

  /**
   * Revoca una invitación pendiente
   */
  revokeInvite: (id: string): boolean => {
    // Simulación
    return true;
  },

  /**
   * Actualiza el rol de un miembro
   */
  updateMemberRole: (id: string, role: Role): Partial<TeamMember> => {
    return { id, role };
  },

  /**
   * Cambia el estado de un miembro (activo/suspendido)
   */
  toggleMemberStatus: (id: string, currentStatus: string): string => {
    return currentStatus === "suspendido" ? "activo" : "suspendido";
  },

  /**
   * Elimina un miembro del equipo
   */
  removeMember: (id: string): boolean => {
    // Simulación
    return true;
  },

  /**
   * Valida si un email es apto para invitación
   */
  validateInviteEmail: (email: string, members: TeamMember[], invitations: Invitation[]): { valid: boolean; error?: string } => {
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) return { valid: false, error: "Ingresa un correo electrónico." };
    if (!emailRx.test(email)) return { valid: false, error: "El correo no tiene un formato válido." };

    const exists = members.some((m) => m.email === email) || invitations.some((i) => i.email === email);
    if (exists) return { valid: false, error: "Este correo ya está registrado o tiene una invitación pendiente." };

    return { valid: true };
  },
};
