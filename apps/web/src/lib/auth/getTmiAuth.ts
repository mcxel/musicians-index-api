import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import {
  entitlementEvidenceFromUser,
  resolveTierFromDb,
} from '@/lib/auth/resolveAuthoritativeTier';
import { resolveSessionDisplayName } from '@/lib/auth/resolveSessionIdentity';
import {
  SESSION_IDENTITY_COOKIE,
  verifySignedUserIdentity,
} from '@/lib/auth/verifiedSessionIdentity';
import {
  decideCanonicalSession,
  decideHubWorkspaceAccess,
  type CanonicalSessionDecision,
  type CanonicalSessionUser,
  type HubWorkspace,
  type HubWorkspaceAccess,
} from '@/lib/auth/canonicalSessionAuthority';

/** Existence lookup budget shared by the session route and the hub page. */
const AUTH_DB_LOOKUP_TIMEOUT_MS = 1500;

function traceAuth(stage: string, detail: Record<string, string | number | boolean | null>) {
  if (process.env.NODE_ENV === "production") return;
  console.info("[hub-auth-trace]", JSON.stringify({ stage, ...detail }));
}

function missingRelation(error: unknown): string | null {
  const message = error instanceof Error ? error.message : "";
  const match = message.match(/`([^`]+)` does not exist/);
  return match ? match[1] : null;
}

/**
 * Existence, identity, and role only. displayName and other presentation
 * fields are intentionally absent: a missing profile column must not decide
 * whether the User row exists.
 */
/**
 * Existence and persona only. These columns are present on the canonical User
 * table. Tier, billing, userRef, and artist profile are read afterward and
 * cannot fail the session when that optional schema is absent.
 */
const CANONICAL_USER_SELECT = {
  id: true,
  email: true,
  emailVerified: true,
  name: true,
  role: true,
  activeRole: true,
  stripeSubscriptionId: true,
  stripePriceId: true,
  isLive: true,
  liveRoomId: true,
  onboardingState: true,
  age: true,
  dateOfBirth: true,
} as const;

export interface TmiAuthSession {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    tier: string;
  };
}

type LookupResult =
  | { status: 'found'; user: CanonicalSessionUser }
  | { status: 'absent' }
  | { status: 'error' };

function logLookupFailure(error: unknown): void {
  const code =
    error && typeof error === 'object' && 'code' in error
      ? String((error as { code?: unknown }).code ?? 'unknown')
      : error instanceof Error && error.message === 'canonical_user_lookup_timeout'
        ? 'canonical_user_lookup_timeout'
        : 'unknown';
  console.error('[auth] canonical user lookup failed; failing closed', { code });
}

let optionalSchemaMissing = false;

function logOptionalFieldFailure(error: unknown): void {
  const code =
    error && typeof error === 'object' && 'code' in error
      ? String((error as { code?: unknown }).code ?? 'unknown')
      : 'unknown';
  console.error('[auth] optional session fields unavailable; identity stays the canonical row', { code });
}

async function readOptionalSessionFields(userId: string): Promise<{
  tier: string;
  billingStatus: string | null;
  userRef: string | null;
  artistSlug: string | null;
}> {
  const fallback = { tier: 'FREE', billingStatus: null, userRef: null, artistSlug: null };
  if (optionalSchemaMissing) return fallback;
  const optionalStarted = Date.now();
  traceAuth("optional-query-start", { select: "tier,billingStatus,userRef,artistProfile.slug" });
  try {
    const extra = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        tier: true,
        billingStatus: true,
        userRef: true,
        artistProfile: { select: { slug: true } },
      },
    });
    if (!extra) {
      traceAuth("optional-query-end", { ms: Date.now() - optionalStarted, tier: fallback.tier });
      return fallback;
    }
    const resolved = {
      tier: extra.tier ?? 'FREE',
      billingStatus: extra.billingStatus ?? null,
      userRef: extra.userRef ?? null,
      artistSlug: extra.artistProfile?.slug ?? null,
    };
    traceAuth("optional-query-end", { ms: Date.now() - optionalStarted, tier: resolved.tier });
    return resolved;
  } catch (error) {
    logOptionalFieldFailure(error);
    const code =
      error && typeof error === "object" && "code" in error
        ? String((error as { code?: unknown }).code ?? "")
        : "";
    if (code === "P2022" || code === "P2021") optionalSchemaMissing = true;
    traceAuth("optional-query-error", {
      code:
        error && typeof error === "object" && "code" in error
          ? String((error as { code?: unknown }).code ?? "unknown")
          : "unknown",
      missing: missingRelation(error),
    });
    return fallback;
  }
}

/**
 * Real UserProfile photo and username only.
 * A missing row or a failed read stays null. Nothing is invented.
 */
export async function readAccountSessionPresentation(userId: string): Promise<{
  avatarUrl: string | null;
  username: string | null;
}> {
  const empty = { avatarUrl: null, username: null };
  try {
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      select: { avatarUrl: true, username: true },
    });
    return {
      avatarUrl: profile?.avatarUrl?.trim() || null,
      username: profile?.username?.trim() || null,
    };
  } catch {
    return empty;
  }
}

/** Presentation fields. Not part of hub authorization. */
export async function enrichCanonicalSessionUser(
  user: CanonicalSessionUser,
): Promise<CanonicalSessionUser> {
  const optional = await readOptionalSessionFields(user.id);
  return {
    ...user,
    tier: optional.tier,
    billingStatus: optional.billingStatus,
    userRef: optional.userRef,
    artistSlug: optional.artistSlug,
  };
}

async function lookupCanonicalUser(userId: string): Promise<LookupResult> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const queryStarted = Date.now();
  traceAuth("canonical-query-start", { select: Object.keys(CANONICAL_USER_SELECT).join(",") });
  const query = prisma.user.findUnique({
    where: { id: userId },
    select: CANONICAL_USER_SELECT,
  });
  try {
    const row = await Promise.race([
      query,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("canonical_user_lookup_timeout")), AUTH_DB_LOOKUP_TIMEOUT_MS);
      }),
    ]);
    traceAuth("canonical-query-end", { ms: Date.now() - queryStarted, found: Boolean(row) });
    if (!row) return { status: "absent" };
    return {
      status: 'found',
      user: {
        id: row.id,
        email: row.email ?? '',
        role: String(row.role),
        activeRole: row.activeRole ? String(row.activeRole) : null,
        tier: 'FREE',
        name: row.name ?? null,
        isLive: row.isLive,
        liveRoomId: row.liveRoomId,
        onboardingState: row.onboardingState ?? 'NO_ROLE_SELECTED',
        userRef: null,
        artistSlug: null,
        age: typeof row.age === 'number' ? row.age : null,
        dateOfBirth: row.dateOfBirth ?? null,
        emailVerified: row.emailVerified ?? null,
        stripeSubscriptionId: row.stripeSubscriptionId,
        stripePriceId: row.stripePriceId,
        billingStatus: null,
      },
    };
  } catch (error) {
    void query.catch(() => undefined);
    logLookupFailure(error);
    traceAuth("canonical-query-error", {
      ms: Date.now() - queryStarted,
      code:
        error && typeof error === "object" && "code" in error
          ? String((error as { code?: unknown }).code ?? "unknown")
          : error instanceof Error && error.message === "canonical_user_lookup_timeout"
            ? "canonical_user_lookup_timeout"
            : "unknown",
      missing: missingRelation(error),
    });
    return { status: "error" };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function resolveCanonicalSession(
  verifiedUserId: string | null,
  cookieRole?: string | null,
): Promise<CanonicalSessionDecision> {
  if (!verifiedUserId) {
    return decideCanonicalSession({
      verifiedUserId: null,
      lookup: 'absent',
      dbUser: null,
      cookieRole,
    });
  }
  const lookup = await lookupCanonicalUser(verifiedUserId);
  return decideCanonicalSession({
    verifiedUserId,
    lookup: lookup.status === 'found' ? 'found' : lookup.status,
    dbUser: lookup.status === 'found' ? lookup.user : null,
    cookieRole,
  });
}

// Shared identity resolution for server components/route handlers that don't
// have direct access to a NextRequest.
//
// SECURITY (2026-09-23, Batch 2): identity now comes exclusively from the
// HMAC-signed tmi_uid_sig cookie (see verifiedSessionIdentity.ts) — never
// from tmi_session_id (an opaque token that never matches a real User.id)
// and never from the plain, client-writable tmi_user_email cookie. A
// forged/missing/tampered signature returns null (unauthenticated); there is
// no fallback path that trusts client-supplied identity claims.
//
// A valid signature is not current authority. The canonical User lookup must
// succeed and return that row. Schema errors, timeouts, and a missing row
// all fail closed. Cookie role is never the authenticated role.
export async function getTmiAuth(): Promise<TmiAuthSession | null> {
  const cookieStore = await cookies();
  const verifiedUserId = verifySignedUserIdentity(cookieStore.get(SESSION_IDENTITY_COOKIE)?.value);
  const cookieRole = cookieStore.get('tmi_role')?.value ?? null;
  const decision = await resolveCanonicalSession(verifiedUserId, cookieRole);
  if (decision.outcome !== 'authenticated') return null;

  const dbUser = await enrichCanonicalSessionUser(decision.user);
  const tier = resolveTierFromDb(
    dbUser.email,
    dbUser.tier,
    entitlementEvidenceFromUser({
      stripeSubscriptionId: dbUser.stripeSubscriptionId,
      stripePriceId: dbUser.stripePriceId,
      billingStatus: dbUser.billingStatus,
      emailVerified: dbUser.emailVerified,
    }),
  );

  return {
    user: {
      id: dbUser.id,
      name: resolveSessionDisplayName({
        email: dbUser.email,
        dbName: dbUser.name,
        userId: dbUser.id,
      }),
      email: dbUser.email,
      role: dbUser.role,
      tier,
    },
  };
}

export async function authorizeHubWorkspace(workspace: HubWorkspace): Promise<{
  access: HubWorkspaceAccess;
  decision: CanonicalSessionDecision;
  hubShell: string | null;
}> {
  const started = Date.now();
  const cookieStore = await cookies();
  const cookieStarted = Date.now();
  const verifiedUserId = verifySignedUserIdentity(cookieStore.get(SESSION_IDENTITY_COOKIE)?.value);
  const cookieRole = cookieStore.get('tmi_role')?.value ?? null;
  const hubShell = cookieStore.get('tmi_hub_shell')?.value ?? null;
  traceAuth("cookie-validation", { ms: Date.now() - cookieStarted, valid: Boolean(verifiedUserId), workspace });
  const decision = await resolveCanonicalSession(verifiedUserId, cookieRole);
  const access = decideHubWorkspaceAccess({ decision, workspace, hubShell, cookieRole });
  traceAuth("hub-access-decision", {
    ms: Date.now() - started,
    outcome: decision.outcome,
    allowed: access.allowed,
    reason: access.allowed ? "open" : access.reason,
  });
  return { access, decision, hubShell };
}
