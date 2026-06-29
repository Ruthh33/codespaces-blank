/* ══════════════════════════════════════════════════════
   Mock authentication module
   In production, replace with real JWT endpoint calls.
══════════════════════════════════════════════════════ */

export type UserRole = "admin" | "agent";

export interface AuthUser {
  id: string;
  name: string;
  initials: string;
  username: string;
  role: UserRole;
  title: string;
}

/* ── Mock user database ── */
const MOCK_USERS: Array<AuthUser & { password: string }> = [
  /* Administrators */
  {
    id:       "admin-1",
    name:     "Supervisor SIGN",
    initials: "SS",
    username: "supervisor",
    password: "admin2026",
    role:     "admin",
    title:    "Administrador del sistema",
  },
  {
    id:       "admin-2",
    name:     "Gerente General",
    initials: "GG",
    username: "gerente",
    password: "admin2026",
    role:     "admin",
    title:    "Gerente General",
  },


];

/* ── Login result ── */
export type LoginResult =
  | { ok: true;  user: AuthUser }
  | { ok: false; error: "invalid_credentials" | "server_error" };

/* ── Mock login (simulates a network call) ── */
export async function mockLogin(username: string, password: string): Promise<LoginResult> {
  await new Promise((r) => setTimeout(r, 1200)); // simulate latency

  const found = MOCK_USERS.find(
    (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
  );

  if (!found) return { ok: false, error: "invalid_credentials" };

  const { password: _pw, ...user } = found;
  return { ok: true, user };
}

/* ── Route each role to its home ── */
export function homeRouteFor(role: UserRole): string {
  return role === "admin" ? "/dashboard" : "/panel-agente";
}
