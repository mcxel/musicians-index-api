/**
 * resolveActiveProfileIdentity
 *
 * Compatibility resolver between the Universal Account header shell and the
 * database, per CLAUDE.md Rule 31 (Dual-Profile Account Architecture).
 * Today's real schema is a single `User` row with one `role`/`userRoles[]`/
 * `activeRole` and one shared name/photo -- there is no FanProfile/
 * PerformerProfile table yet. This resolver is the one seam where that
 * truth lives, so the header component never has to know which schema era
 * it's reading from:
 *
 *   UniversalAccountIdentityControl (React)
 *           |
 *   ActiveProfileIdentity (this file's stable contract)
 *           |
 *   CURRENT SCHEMA: User + activeRole + UserRole  -->  profileKind: "ACCOUNT_FALLBACK"
 *   FUTURE SCHEMA:  FanProfile / PerformerProfile  -->  profileKind: "FAN_PROFILE" | "PERFORMER_PROFILE"
 *
 * When the real per-role profile tables exist, only this file's
 * implementation changes (activeRole===FAN -> resolve FanProfile,
 * activeRole===PERFORMER -> resolve PerformerProfile) -- the header
 * component and its contract stay the same. Until then, this resolver must
 * be honest that no separate Fan/Performer name exists: it always reports
 * ACCOUNT_FALLBACK and uses the one real canonical User identity, never a
 * fabricated per-role name.
 */

import prisma from "@/lib/prisma";
import { getCanonicalInitials } from "@/lib/auth/resolveSessionIdentity";

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

  // No FanProfile/PerformerProfile row exists in this schema era -- the only
  // honest identity to show is the one real canonical User identity. Do not
  // fabricate a separate "Fan name" or "Performer stage name" from it.
  const publicDisplayName =
    source.displayName?.trim() ||
    source.name?.trim() ||
    username?.trim() ||
    "Member";

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

/**
 * Outcome of an identity lookup, distinguishing three genuinely different
 * situations that must never be conflated (Marcel Dickens, 2026-09-06):
 *
 *  - RESOLVED: the database was queried successfully and the account
 *    exists. `identity` is a real, verified ActiveProfileIdentity.
 *  - INVALID_ACCOUNT: the database was queried SUCCESSFULLY and returned no
 *    row for this userId. The session cookie no longer corresponds to a
 *    real account (deleted/revoked/never existed). `identity` is always
 *    null here -- this must NEVER be papered over with a cookie-derived
 *    identity. The caller must treat this as an invalid session.
 *  - DB_UNAVAILABLE: the database call itself threw (connection/config
 *    failure). This is a different, already-accepted risk class -- mirrors
 *    getTmiAuth()'s own existing resilience policy of degrading to
 *    session/cookie-derived data when the DB is unreachable, rather than
 *    hard-failing an otherwise-valid session. `identity`, if present, is
 *    explicitly a degraded projection -- callers must label it as such
 *    (see the `degraded` flag in GET /api/account/identity's response)
 *    rather than presenting it as an equally-verified identity.
 */
export type IdentityLookupStatus = "RESOLVED" | "INVALID_ACCOUNT" | "DB_UNAVAILABLE";

export interface IdentityLookupResult {
  status: IdentityLookupStatus;
  identity: ActiveProfileIdentity | null;
}

/** Result of attempting the database lookup, kept separate from the identity decision so the decision is pure/unit-testable without mocking Prisma. */
export type IdentityQueryOutcome =
  | { kind: "found"; account: AccountIdentitySource }
  | { kind: "not_found" }
  | { kind: "error" };

/**
 * Pure decision: given what the database lookup actually produced, decide
 * the identity outcome. `degradedSessionSource` is consulted ONLY for
 * `kind: "error"` (the database call itself failed) -- it is never used for
 * `kind: "not_found"` (a successful query that found no such account).
 * ACCOUNT_FALLBACK (the profileKind on any returned identity) means "this is
 * a verified account on the current shared-identity schema, pre-Rule-31
 * profile split" -- it must never mean "we couldn't establish this account
 * exists, so we built something plausible from cookies."
 */
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
    // Query succeeded, no such account: never fabricate an identity here.
    return { status: "INVALID_ACCOUNT", identity: null };
  }

  return {
    status: "RESOLVED",
    identity: buildActiveProfileIdentityFromAccount(outcome.account),
  };
}

/**
 * Resolves the identity the header/account shell should display for the
 * given authenticated user. Thin Prisma-touching wrapper around the pure
 * decideIdentityLookupOutcome() -- see that function for the actual policy.
 */
export async function resolveActiveProfileIdentity(
  userId: string,
  degradedSessionSource?: Partial<AccountIdentitySource>,
): Promise<IdentityLookupResult> {
  let outcome: IdentityQueryOutcome;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        activeRole: true,
        displayName: true,
        name: true,
        userRoles: { select: { role: true } },
        // username/avatarUrl live on the related UserProfile, not on User itself.
        userProfile: { select: { username: true, avatarUrl: true } },
      },
    });

    outcome = user
      ? {
          kind: "found",
          account: {
            id: user.id,
            role: user.role as string,
            activeRole: user.activeRole as string | null,
            displayName: user.displayName,
            name: user.name,
            userRoles: user.userRoles.map((r: { role: string }) => ({ role: r.role })),
            username: user.userProfile?.username ?? null,
            avatarUrl: user.userProfile?.avatarUrl ?? null,
          },
        }
      : { kind: "not_found" };
  } catch {
    outcome = { kind: "error" };
  }

  return decideIdentityLookupOutcome(outcome, degradedSessionSource);
}
