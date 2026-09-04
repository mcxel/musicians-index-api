/**
 * Role / relationship rules for who may start a DM with whom.
 * Server-side only — UI never decides permission.
 */

export type MessagingRole =
  | "FAN"
  | "PERFORMER"
  | "ARTIST"
  | "BAND"
  | "VENUE"
  | "PROMOTER"
  | "SPONSOR"
  | "ADVERTISER"
  | "WRITER"
  | "ADMIN"
  | "STAFF"
  | "USER";

const CANON: Record<string, MessagingRole> = {
  FAN: "FAN",
  MEMBER: "FAN",
  USER: "FAN",
  PERFORMER: "PERFORMER",
  ARTIST: "PERFORMER",
  BAND: "BAND",
  VENUE: "VENUE",
  PROMOTER: "PROMOTER",
  SPONSOR: "SPONSOR",
  ADVERTISER: "ADVERTISER",
  WRITER: "WRITER",
  ADMIN: "ADMIN",
  STAFF: "ADMIN",
};

export function normalizeMessagingRole(role: string | null | undefined): MessagingRole {
  if (!role) return "FAN";
  return CANON[role.toUpperCase()] ?? "FAN";
}

/** Undirected allowed pairs (sorted key). Admin may message anyone. */
const ALLOWED_PAIRS = new Set([
  "ADMIN|*",
  "FAN|FAN",
  "FAN|PERFORMER",
  "FAN|BAND",
  "FAN|WRITER",
  "PERFORMER|PERFORMER",
  "PERFORMER|BAND",
  "PERFORMER|VENUE",
  "PERFORMER|PROMOTER",
  "PERFORMER|SPONSOR",
  "PERFORMER|WRITER",
  "BAND|VENUE",
  "BAND|PROMOTER",
  "BAND|SPONSOR",
  "VENUE|PROMOTER",
  "VENUE|SPONSOR",
  "PROMOTER|SPONSOR",
  "SPONSOR|ADVERTISER",
  "ADVERTISER|VENUE",
  "WRITER|WRITER",
]);

function pairKey(a: MessagingRole, b: MessagingRole): string {
  if (a === "ADMIN" || b === "ADMIN") return "ADMIN|*";
  return [a, b].sort().join("|");
}

export function isMessagingRelationshipAllowed(
  roleA: string | null | undefined,
  roleB: string | null | undefined,
): { allowed: boolean; reason?: string; kind: string } {
  const a = normalizeMessagingRole(roleA);
  const b = normalizeMessagingRole(roleB);
  const key = pairKey(a, b);
  if (ALLOWED_PAIRS.has(key)) {
    return { allowed: true, kind: `${a.toLowerCase()}-${b.toLowerCase()}` };
  }
  return {
    allowed: false,
    reason: `Messaging between ${a} and ${b} is not permitted`,
    kind: `${a.toLowerCase()}-${b.toLowerCase()}`,
  };
}

export function conversationKindForRoles(
  roleA: string | null | undefined,
  roleB: string | null | undefined,
): string {
  const a = normalizeMessagingRole(roleA);
  const b = normalizeMessagingRole(roleB);
  if (a === "ADMIN" || b === "ADMIN") return "admin-any";
  const pair = [a, b].sort().join("-").toLowerCase();
  if (pair.includes("venue") && pair.includes("performer")) return "artist-venue";
  if (pair.includes("promoter") && pair.includes("performer")) return "promoter-artist";
  if (pair.includes("sponsor") && pair.includes("performer")) return "artist-sponsor";
  if (pair.includes("fan") && pair.includes("performer")) return "fan-artist";
  if (pair === "fan-fan") return "fan-fan";
  return pair;
}
