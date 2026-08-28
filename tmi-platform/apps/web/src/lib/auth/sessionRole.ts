/**
 * Canonical session-role resolution for Fan / Performer shell roots.
 * Unknown / missing role → ROLE_RESOLVING — never default to FAN.
 */

export type ShellRoleIdentity = "FAN" | "PERFORMER" | "OTHER";

export type RoleResolveState =
  | { status: "ROLE_RESOLVING" }
  | { status: "RESOLVED"; identity: ShellRoleIdentity; raw: string };

const PERFORMER_ROLES = new Set([
  "PERFORMER",
  "ARTIST",
  "BAND",
  /** Specialty — Prisma Role is PERFORMER + UserPerformerType PRODUCER; session may surface PRODUCER. */
  "PRODUCER",
]);

const FAN_ROLES = new Set(["FAN", "USER", "MEMBER"]);

export function normalizeRoleToken(role: string | null | undefined): string {
  return (role ?? "").trim().toUpperCase();
}

export function classifyShellIdentity(role: string | null | undefined): ShellRoleIdentity | null {
  const r = normalizeRoleToken(role);
  if (!r) return null;
  if (PERFORMER_ROLES.has(r)) return "PERFORMER";
  if (FAN_ROLES.has(r)) return "FAN";
  if (r === "ADMIN" || r === "STAFF" || r === "SUPERADMIN") return "OTHER";
  if (
    r === "VENUE" ||
    r === "PROMOTER" ||
    r === "SPONSOR" ||
    r === "ADVERTISER" ||
    r === "WRITER"
  ) {
    return "OTHER";
  }
  return null;
}

export function hubPathForIdentity(identity: ShellRoleIdentity, raw: string): string {
  if (identity === "FAN") return "/hub/fan";
  if (identity === "PERFORMER") return "/hub/performer";
  const r = normalizeRoleToken(raw);
  if (r === "WRITER") return "/hub/writer";
  if (r === "VENUE") return "/hub/venue";
  if (r === "PROMOTER") return "/hub/promoter";
  if (r === "SPONSOR") return "/hub/sponsor";
  if (r === "ADVERTISER") return "/hub/advertiser";
  if (r === "ADMIN" || r === "STAFF" || r === "SUPERADMIN") return "/admin";
  return "/hub";
}

export function isPerformerShellRole(role: string | null | undefined): boolean {
  return classifyShellIdentity(role) === "PERFORMER";
}

export function isFanShellRole(role: string | null | undefined): boolean {
  return classifyShellIdentity(role) === "FAN";
}
