export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  resolveTierFromDb,
  entitlementEvidenceFromUser,
} from '@/lib/auth/resolveAuthoritativeTier';
import { getAccountStatus } from '@/lib/moderation/ModerationEngine';
import { resolveSessionDisplayName } from '@/lib/auth/resolveSessionIdentity';
import { ageYearsFromDateOfBirth, youthBandFromAgeYears } from '@/lib/trustSafety/YouthSocialGuard';
import {
  SESSION_IDENTITY_COOKIE,
  verifySignedUserIdentity,
} from '@/lib/auth/verifiedSessionIdentity';
import { resolveCanonicalSession, enrichCanonicalSessionUser, readAccountSessionPresentation } from '@/lib/auth/getTmiAuth';

/**
 * P0 identity hardening:
 * - Never serialize internal/admin emails to non-admin clients
 * - Return only current scoped user identity
 */
function isPrivilegedRole(role: string): boolean {
  const normalized = role.toUpperCase();
  return normalized === 'ADMIN' || normalized === 'STAFF';
}

function isInternalEmail(email: string): boolean {
  const v = email.trim().toLowerCase();
  if (!v.includes('@')) return false;
  return (
    v.endsWith('@themusiciansindex.com') ||
    v.endsWith('@berntoutglobal.com') ||
    v.includes('+admin@')
  );
}

function redactEmailForRole(email: string, role: string): string {
  if (!email) return '';
  if (isPrivilegedRole(role)) return email;
  if (isInternalEmail(email)) return '';
  return email;
}

/**
 * GET /api/auth/session
 * Returns stable auth state. Always 200 — never 401 — so frontend polling never crashes.
 */
/**
 * SECURITY (2026-09-23, Batch 2): identity is resolved exclusively from the
 * HMAC-signed tmi_uid_sig cookie — never from tmi_session_id (an opaque
 * token that never matches a real User.id) or the plain, client-writable
 * tmi_user_email cookie. Previously this route matched
 * `OR: [{ id: sessionId }, { email: rawEmail }]` and, on a miss, even ran a
 * founder-email tier check against the raw cookie value — both let a forged
 * tmi_user_email cookie impersonate another account or claim DIAMOND tier
 * with zero verification. A missing/forged signature now returns
 * unauthenticated; there is no fallback that trusts client-supplied identity.
 */
function closedSession(
  csrfToken: string,
  authority: 'unauthenticated' | 'unavailable',
  reason: string,
) {
  return NextResponse.json({
    authenticated: false,
    authority,
    reason,
    csrfToken,
    user: null,
    expires: null,
  });
}

export async function GET(req: NextRequest) {
  const verifiedUserId = verifySignedUserIdentity(req.cookies.get(SESSION_IDENTITY_COOKIE)?.value);
  const cookieRole = req.cookies.get('tmi_role')?.value ?? null;
  const csrfToken = 'tmi-phase1-csrf';
  if (!verifiedUserId) {
    return closedSession(csrfToken, 'unauthenticated', 'missing_cookie');
  }
  const decision = await resolveCanonicalSession(verifiedUserId, cookieRole);

  if (decision.outcome !== 'authenticated') {
    return closedSession(
      csrfToken,
      decision.outcome === 'unavailable' ? 'unavailable' : 'unauthenticated',
      decision.reason,
    );
  }

  const dbUser = await enrichCanonicalSessionUser(decision.user);
  const canonicalUserId = dbUser.id;
  const rawEmail = dbUser.email;
  const isLive = dbUser.isLive;
  const liveRoomId = dbUser.liveRoomId;
  const presentation = await readAccountSessionPresentation(canonicalUserId);
  const avatarUrl = presentation.avatarUrl;
  const dbOnboardingState = dbUser.onboardingState;
  const dbOnboardingStep = '2';
  const dbDisplayName = dbUser.name;
  const dbActiveRole = dbUser.activeRole;
  const dbUsername = presentation.username;
  const dbArtistSlug = dbUser.artistSlug;
  const dbUserRef = dbUser.userRef;
  const role = dbUser.role;
  const tier = resolveTierFromDb(
    rawEmail,
    dbUser.tier,
    entitlementEvidenceFromUser(dbUser),
  );
  const ageYears =
    typeof dbUser.age === 'number' && dbUser.age > 0
      ? Math.floor(dbUser.age)
      : dbUser.dateOfBirth
        ? ageYearsFromDateOfBirth(dbUser.dateOfBirth)
        : null;
  const band = youthBandFromAgeYears(ageYears);
  const sessionAgeKnown = band === 'YOUTH' || band === 'ADULT' || band === 'BELOW_PLATFORM';
  const sessionYouthBand = band === 'YOUTH' || band === 'ADULT' ? band : null;

  // Trust & safety gate — a user suspended/banned mid-session must not keep
  // working just because their cookie hasn't expired. Account-status lookup
  // failure does not invent an active session from the cookie; the canonical
  // user row is already proven above.
  {
    const statusStarted = Date.now();
    const status = await getAccountStatus(canonicalUserId).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : "";
      const missing = message.match(/`([^`]+)` does not exist/);
      console.info("[hub-auth-trace]", JSON.stringify({
        stage: "session-account-status-error",
        ms: Date.now() - statusStarted,
        missing: missing ? missing[1] : null,
      }));
      return null;
    });
    console.info("[hub-auth-trace]", JSON.stringify({ stage: "session-account-status", ms: Date.now() - statusStarted }));
    if (status && status.accountStatus !== 'active') {
      return NextResponse.json({
        authenticated: false,
        csrfToken,
        user: null,
        expires: null,
        accountStatus: status.accountStatus,
        accountStatusReason: status.accountStatusReason ?? undefined,
      });
    }
  }

  const scopedEmail = redactEmailForRole(rawEmail, role);
  // Real human name for THIS session user only — never Marcel's email handle
  // (berntmusic33 / "music331") on Justin / Jay Paul / BJM surfaces.
  const displayName = resolveSessionDisplayName({
    email: rawEmail,
    dbDisplayName,
    userId: canonicalUserId,
  });

  const response = NextResponse.json({
    authenticated: true,
    csrfToken,
    user: {
      id: canonicalUserId,
      // Email only on the authenticated owner's session — never invent/leak
      // Marcel's address onto other accounts (scopedEmail already redacts
      // internal addresses for non-admin roles).
      email: scopedEmail,
      name: displayName,
      role,
      activeRole: dbActiveRole ?? role,
      tier,
      isLive,
      liveRoomId,
      avatarUrl,
      username: dbUsername,
      userRef: dbUserRef,
      artistSlug: dbArtistSlug,
      onboardingState: dbOnboardingState.toLowerCase(),
      onboardingStep: dbOnboardingStep,
      youthBand: sessionYouthBand,
      ageKnown: sessionAgeKnown,
    },
    role,
    tier,
    expires: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
  });

  const COOKIE_OPTS = {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  };
  response.cookies.set('tmi_onboarding_state', dbOnboardingState.toLowerCase(), COOKIE_OPTS);
  response.cookies.set('tmi_tier', tier, COOKIE_OPTS);
  response.cookies.set('tmi_role', dbActiveRole ?? role, COOKIE_OPTS);

  return response;
}
