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

  /* Agents / Vendors */
  {
    id:       "agent-1",
    name:     "Carlos Mendoza",
    initials: "CM",
    username: "cmendoza",
    password: "agente2026",
    role:     "agent",
    title:    "Agente Senior",
  },
  {
    id:       "agent-2",
    name:     "María Torres",
    initials: "MT",
    username: "mtorres",
    password: "agente2026",
    role:     "agent",
    title:    "Agente de Soporte",
  },
  {
    id:       "agent-3",
    name:     "Andrés Vargas",
    initials: "AV",
    username: "avargas",
    password: "agente2026",
    role:     "agent",
    title:    "Agente Comercial",
  },
  {
    id:       "agent-4",
    name:     "Gabriela Ruiz",
    initials: "GR",
    username: "gruiz",
    password: "agente2026",
    role:     "agent",
    title:    "Agente Senior",
  },
  {
    id:       "agent-5",
    name:     "Patricia Flores",
    initials: "PF",
    username: "pflores",
    password: "agente2026",
    role:     "agent",
    title:    "Agente de Ventas",
  },
];

const USER_DATABASE: Array<AuthUser & { password: string }> = [...MOCK_USERS];

function normalizeNameToUsername(name: string) {
  const cleaned = name
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);

  const base = cleaned.length > 1
    ? `${cleaned[0]}${cleaned[cleaned.length - 1][0]}`
    : cleaned[0] || "usuario";

  let username = base;
  let suffix = 1;
  while (USER_DATABASE.some((user) => user.username === username)) {
    username = `${base}${suffix++}`;
  }
  return username;
}

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function authRoleForRecordRole(role: "Administrador" | "Supervisor" | "Agente" | "Suspendido"): UserRole {
  return role === "Administrador" || role === "Supervisor" ? "admin" : "agent";
}

export function addOrUpdateAuthUser(user: AuthUser & { password: string }) {
  const existing = USER_DATABASE.find(
    (entry) => entry.username.toLowerCase() === user.username.toLowerCase()
  );
  if (existing) {
    Object.assign(existing, user);
    return;
  }
  USER_DATABASE.push(user);
}

export function removeAuthUser(username: string) {
  const index = USER_DATABASE.findIndex(
    (entry) => entry.username.toLowerCase() === username.toLowerCase()
  );
  if (index >= 0) {
    USER_DATABASE.splice(index, 1);
  }
}

export function createUserFromRecord(record: {
  firstName: string;
  lastName: string;
  position: string;
  role: "Administrador" | "Supervisor" | "Agente" | "Suspendido";
  username?: string;
  password?: string;
}) {
  const fullName = `${record.firstName} ${record.lastName}`.trim();
  const username = record.username || normalizeNameToUsername(fullName);
  const password = record.password || generatePassword();
  const role = authRoleForRecordRole(record.role);
  addOrUpdateAuthUser({
    id: `user-${Date.now()}`,
    name: fullName,
    initials: getInitials(fullName),
    username,
    password,
    role,
    title: record.position || (role === "admin" ? "Administrador" : "Agente"),
  });

  return { username, password };
}

/* ── Login result ── */
export type LoginResult =
  | { ok: true;  user: AuthUser }
  | { ok: false; error: "invalid_credentials" | "server_error" };

/* ── Mock login (simulates a network call) ── */
export async function mockLogin(username: string, password: string): Promise<LoginResult> {
  await new Promise((r) => setTimeout(r, 1200)); // simulate latency

  const found = USER_DATABASE.find(
    (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
  );

  if (!found) return { ok: false, error: "invalid_credentials" };

  const { password: _pw, ...user } = found;
  return { ok: true, user };
}

/* ── Route each role to its home ── */
export function homeRouteFor(role: UserRole): string {
  return "/dashboard";
}
