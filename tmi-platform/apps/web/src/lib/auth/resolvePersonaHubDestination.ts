/**
 * resolvePersonaHubDestination — single destination authority for persona switches.
 *
 * ADMIN retains permanent authority; active persona only changes the hub destination.
 * Never routes to Live Lobby Mosaic or legacy /dashboard/* paths.
 */

import { getMemberByEmail } from "@/lib/auth/GovernanceClusterEngine";

export type PersonaHubTarget =
  | "ADMIN"
  | "STAFF"
  | "SUPERADMIN"
  | "FAN"
  | "USER"
  | "MEMBER"
  | "PERFORMER"
  | "ARTIST"
  | "BAND"
  | "PRODUCER";

function adminHubForEmail(email: string | null | undefined): string {
  const member = email ? getMemberByEmail(email) : undefined;
  if (member?.memberId === "justin") return "/admin/justin";
  if (member?.memberId === "jaypaul") return "/admin/jay-paul";
  if (member?.memberId === "marcel") return "/admin/marcel";
  return "/admin/overseer";
}

/** Canonical hub destination after a persona / activeRole switch. */
export function resolvePersonaHubDestination(
  persona: string,
  _email?: string | null,
): string {
  const p = (persona ?? "").trim().toUpperCase();
  if (p === "ADMIN" || p === "STAFF" || p === "SUPERADMIN") {
    return "/admin/overseer";
  }
  if (p === "PERFORMER" || p === "ARTIST" || p === "BAND" || p === "PRODUCER") {
    return "/hub/performer";
  }
  return "/hub/fan";
}

/** Normalize switch-role target aliases to a canonical persona token. */
export function normalizePersonaSwitchTarget(role: string): PersonaHubTarget {
  const p = role.trim().toUpperCase();
  if (p === "MEMBER" || p === "USER") return "FAN";
  if (p === "ARTIST" || p === "BAND" || p === "PRODUCER") return "PERFORMER";
  return p as PersonaHubTarget;
}
