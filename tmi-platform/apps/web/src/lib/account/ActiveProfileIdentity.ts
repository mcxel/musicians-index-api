/**
 * ActiveProfileIdentity contract — client-safe types + pure builders.
 * Prisma-backed resolveActiveProfileIdentity lives in resolveActiveProfileIdentity.ts
 * and must only be imported from server routes.
 */

import {
  displayNameForEmail,
  getCanonicalInitials,
} from "@/lib/auth/resolveSessionIdentity";

export type ActiveProfileKind = "ACCOUNT_FALLBACK" | "FAN_PROFILE" | "PERFORMER_PROFILE";

export interface ActiveProfileIdentity {
  accountUserId: string;
  activeRole: "FAN" | "PERFORMER" | string;
  publicDisplayName: string;
  publicHandle?: string | null;
  publicImageUrl?: string | null;
  canonicalInitials: string;
  profileKind: ActiveProfileKind;
  profileComplete: boolean;
  ownedRoles: string[];
}

/** Input shape for the pure builder -- mirrors today's User + UserRole + UserProfile join. */
export interface AccountIdentitySource {
  id: string;
  role: string;
  activeRole?: string | null;
  displayName?: string | null;
  name?: string | null;
  userRoles?: Array<{ role: string }>;
  username?: string | null;
  avatarUrl?: string | null;
  email?: string | null;
}

/**
 * Pure, unit-testable projection. Always ACCOUNT_FALLBACK until dedicated
 * FanProfile/PerformerProfile tables exist -- never invents per-role names.
 */
export function buildActiveProfileIdentityFromAccount(
  source: AccountIdentitySource,
): ActiveProfileIdentity {
  const ownedRoles = Array.from(
    new Set(
      [source.role, ...(source.userRoles ?? []).map((r) => r.role)]
        .filter(Boolean)
        .map((r) => String(r).toUpperCase()),
    ),
  );

  const activeRole = String(source.activeRole ?? source.role ?? "FAN").toUpperCase();
  const username = source.username ?? null;
  const avatarUrl = source.avatarUrl ?? null;

  const canonicalRosterName = displayNameForEmail(source.email);
  const accountDisplayName =
    source.displayName?.trim() || source.name?.trim() || username?.trim() || "Member";
  const publicDisplayName =
    (canonicalRosterName && ["jk", "jp", "bjm"].includes(accountDisplayName.toLowerCase())
      ? canonicalRosterName
      : accountDisplayName) || "Member";

  return {
    accountUserId: source.id,
    activeRole,
    publicDisplayName,
    publicHandle: username,
    publicImageUrl: avatarUrl,
    canonicalInitials: getCanonicalInitials(publicDisplayName),
    profileKind: "ACCOUNT_FALLBACK",
    profileComplete: Boolean(publicDisplayName && publicDisplayName !== "Member"),
    ownedRoles,
  };
}

export type IdentityLookupStatus = "RESOLVED" | "INVALID_ACCOUNT" | "DB_UNAVAILABLE";

export interface IdentityLookupResult {
  status: IdentityLookupStatus;
  identity: ActiveProfileIdentity | null;
}

export type IdentityQueryOutcome =
  | { kind: "found"; account: AccountIdentitySource }
  | { kind: "not_found" }
  | { kind: "error" };

export function decideIdentityLookupOutcome(
  outcome: IdentityQueryOutcome,
  degradedSessionSource?: Partial<AccountIdentitySource>,
): IdentityLookupResult {
  if (outcome.kind === "error") {
    if (!degradedSessionSource) {
      return { status: "DB_UNAVAILABLE", identity: null };
    }
    return {
      status: "DB_UNAVAILABLE",
      identity: buildActiveProfileIdentityFromAccount({
        id: degradedSessionSource.id ?? "unknown",
        role: degradedSessionSource.role ?? "FAN",
        activeRole: degradedSessionSource.activeRole ?? degradedSessionSource.role ?? "FAN",
        displayName: degradedSessionSource.displayName ?? null,
        name: degradedSessionSource.name ?? null,
        username: degradedSessionSource.username ?? null,
        avatarUrl: degradedSessionSource.avatarUrl ?? null,
        userRoles:
          degradedSessionSource.userRoles ??
          (degradedSessionSource.role ? [{ role: degradedSessionSource.role }] : []),
      }),
    };
  }

  if (outcome.kind === "not_found") {
    return { status: "INVALID_ACCOUNT", identity: null };
  }

  return {
    status: "RESOLVED",
    identity: buildActiveProfileIdentityFromAccount(outcome.account),
  };
}
