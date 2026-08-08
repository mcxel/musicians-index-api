/**
 * resolveSessionIdentity — map session email → stable human name.
 *
 * Session must never present Marcel's email local-part (berntmusic33 / "music331")
 * as another operator's display name. Prefer DB displayName, then governance
 * roster names, then a generic fallback — never a foreign email handle.
 */

import { TMI_GOVERNANCE_CLUSTER } from "@/lib/auth/GovernanceClusterEngine";

/** All known login emails → canonical public name for that person only. */
const EMAIL_TO_DISPLAY_NAME: Record<string, string> = {
  "berntmusic33@gmail.com": "Marcel Dickens",
  "justin@themusiciansindex.com": "Justin King",
  "rjking42@icloud.com": "Justin King",
  "rjking@icloud.com": "Justin King",
  "jay@themusiciansindex.com": "Jay Paul Sanchez",
  "bjmtherapper1@gmail.com": "Jay Paul Sanchez",
  "bjmbeat@berntoutglobal.com": "BJM",
};

for (const member of TMI_GOVERNANCE_CLUSTER.members) {
  const email = member.adminEmail?.trim().toLowerCase();
  if (email && !email.startsWith("[") && !EMAIL_TO_DISPLAY_NAME[email]) {
    EMAIL_TO_DISPLAY_NAME[email] = member.name;
  }
}

/** Marcel-only email local-parts — never use as anyone else's display name. */
const MARCEL_EMAIL_HANDLES = new Set(["berntmusic33", "music331", "berntmusic"]);

export function normalizeEmail(email: string | null | undefined): string {
  return (email ?? "").trim().toLowerCase();
}

export function displayNameForEmail(email: string | null | undefined): string | null {
  const e = normalizeEmail(email);
  if (!e) return null;
  return EMAIL_TO_DISPLAY_NAME[e] ?? null;
}

/**
 * Resolve the name shown in session / hubs.
 * Never returns another user's email handle (e.g. berntmusic33 on BJM surfaces).
 */
export function resolveSessionDisplayName(opts: {
  email?: string | null;
  dbDisplayName?: string | null;
  dbName?: string | null;
  userId?: string | null;
}): string {
  const email = normalizeEmail(opts.email);
  const fromDb = (opts.dbDisplayName ?? opts.dbName ?? "").trim();
  if (fromDb) {
    const handle = fromDb.includes("@") ? fromDb.split("@")[0]! : fromDb;
    // Block DB rows that were incorrectly seeded with Marcel's email handle
    // for a non-Marcel account.
    if (
      MARCEL_EMAIL_HANDLES.has(handle.toLowerCase()) &&
      email &&
      email !== "berntmusic33@gmail.com"
    ) {
      return displayNameForEmail(email) ?? "Member";
    }
    return fromDb;
  }

  const fromRoster = displayNameForEmail(email);
  if (fromRoster) return fromRoster;

  if (email) {
    const local = email.split("@")[0] ?? "";
    // Never surface Marcel's handle as a generic fallback for other accounts.
    if (MARCEL_EMAIL_HANDLES.has(local.toLowerCase()) && email !== "berntmusic33@gmail.com") {
      return "Member";
    }
    // Prefer not to show raw email handles for known governance aliases.
    if (local && !MARCEL_EMAIL_HANDLES.has(local.toLowerCase())) {
      return local;
    }
  }

  if (opts.userId) return `user-${opts.userId.slice(0, 8)}`;
  return "Member";
}

/** Never show raw email / foreign email handles on semi-public surfaces (playlists, casts, etc.). */
export function sanitizePublicDisplayLabel(
  label: string | null | undefined,
  opts?: { email?: string | null; userId?: string | null }
): string {
  const raw = (label ?? "").trim();
  if (!raw) {
    return resolveSessionDisplayName({
      email: opts?.email,
      userId: opts?.userId,
    });
  }
  if (raw.includes("@")) {
    return resolveSessionDisplayName({
      email: raw,
      userId: opts?.userId,
    });
  }
  return resolveSessionDisplayName({
    email: opts?.email,
    dbDisplayName: raw,
    userId: opts?.userId,
  });
}

/**
 * Roles every HARDCODED_ADMIN / governance operator should be able to switch into.
 * Canonical triad: ADMIN + FAN + PERFORMER (ARTIST kept as alias hub for legacy cookies).
 */
export const GOVERNANCE_SWITCHABLE_ROLES = ["ADMIN", "FAN", "PERFORMER", "ARTIST"] as const;

/** Preferred order for role switcher tiles (triad first). */
export const GOVERNANCE_ROLE_DISPLAY_ORDER = ["ADMIN", "FAN", "PERFORMER", "ARTIST"] as const;

export function getCanonicalInitials(displayName: string | null | undefined): string {
  const name = (displayName ?? "").trim();
  if (!name) return "?";
  const firstChar = Array.from(name)[0];
  return firstChar ? firstChar.toUpperCase() : "?";
}

export function resolveAccountIdentity(session: {
  userId?: string | null;
  email?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
}) {
  const name = resolveSessionDisplayName({
    email: session.email,
    dbDisplayName: session.displayName,
    userId: session.userId,
  });
  return {
    userId: session.userId ?? "guest",
    displayName: name,
    avatarUrl: session.avatarUrl ?? null,
    initials: getCanonicalInitials(name),
  };
}
