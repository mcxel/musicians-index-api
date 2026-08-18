export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { resolveTierFromDb, computeAuthoritativeTier } from '@/lib/auth/resolveAuthoritativeTier';
import { getAccountStatus } from '@/lib/moderation/ModerationEngine';
import { resolveSessionDisplayName } from '@/lib/auth/resolveSessionIdentity';
import prisma from '@/lib/prisma';
import { ageYearsFromDateOfBirth, youthBandFromAgeYears } from '@/lib/trustSafety/YouthSocialGuard';

const SESSION_DB_LOOKUP_TIMEOUT_MS = 1200;

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), timeoutMs);
    }),
  ]);
}

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
export async function GET(req: NextRequest) {
  const sessionId = req.cookies.get('tmi_session_id')?.value;
  const sessionToken = req.cookies.get('tmi_session')?.value;
  const role = (req.cookies.get('tmi_role')?.value ?? 'USER').toUpperCase();
  const cookieTier = req.cookies.get('tmi_tier')?.value ?? 'FREE';
  const rawEmail = req.cookies.get('tmi_user_email')?.value ?? '';
  // P0 Identity/Entitlement Integrity: the cookie is a display cache, not
  // an authority. It's only the fallback below if the fresh DB read a few
  // lines down fails/times out — the DB tier read there overwrites this.
  let tier: string = cookieTier;

  const csrfToken = 'tmi-phase1-csrf';

  if (!sessionId || !sessionToken) {
    return NextResponse.json({ authenticated: false, csrfToken, user: null, expires: null });
  }

  let canonicalUserId = sessionId;
  let isLive = false;
  let liveRoomId: string | null = null;
  let avatarUrl: string | null = null;
  let dbOnboardingState = 'NO_ROLE_SELECTED';
  let dbOnboardingStep = '2';
  let dbDisplayName: string | null = null;
  let dbActiveRole: string | null = null;
  let sessionYouthBand: 'YOUTH' | 'ADULT' | null = null;
  let sessionAgeKnown = false;

  try {
    const dbUser = await withTimeout(
      prisma.user.findFirst({
        where: {
          OR: [
            { id: sessionId },
            ...(rawEmail ? [{ email: rawEmail }] : []),
          ],
        },
        select: {
          id: true,
          email: true,
          activeRole: true,
          displayName: true,
          name: true,
          tier: true,
          isLive: true,
          liveRoomId: true,
          onboardingState: true,
          age: true,
          dateOfBirth: true,
          userProfile: {
            select: {
              avatarUrl: true,
              socialLinks: true,
              displayName: true,
            },
          },
        },
      }),
      SESSION_DB_LOOKUP_TIMEOUT_MS
    );
    if (dbUser) {
      canonicalUserId = dbUser.id;
      dbActiveRole = dbUser.activeRole ?? null;
      isLive = dbUser.isLive;
      liveRoomId = dbUser.liveRoomId;
      avatarUrl = dbUser.userProfile?.avatarUrl ?? null;
      dbOnboardingState = dbUser.onboardingState ?? 'NO_ROLE_SELECTED';
      // Authoritative tier — overwrites the cookie fallback above with the
      // real DB value (plus founder-pass self-heal) now that the lookup
      // succeeded. Never derived from role.
      tier = resolveTierFromDb(dbUser.email ?? rawEmail, dbUser.tier);
      const links = (dbUser.userProfile?.socialLinks as Record<string, any>) ?? {};
      dbOnboardingStep = links.onboarding_step ?? '2';
      dbDisplayName =
        dbUser.displayName ??
        dbUser.userProfile?.displayName ??
        dbUser.name ??
        null;
      const ageYears =
        typeof dbUser.age === 'number' && dbUser.age > 0
          ? Math.floor(dbUser.age)
          : dbUser.dateOfBirth
            ? ageYearsFromDateOfBirth(dbUser.dateOfBirth)
            : null;
      const band = youthBandFromAgeYears(ageYears);
      sessionAgeKnown = band === 'YOUTH' || band === 'ADULT' || band === 'BELOW_PLATFORM';
      // youthBand: YOUTH = protected teens 16–17; ADULT = 18+. Never a 16–18 youth band.
      sessionYouthBand = band === 'YOUTH' || band === 'ADULT' ? band : null;
    } else if (rawEmail) {
      // DB timed out — apply founder-email check in-memory so founder accounts
      // never fall back to a stale FREE cookie on a cold-start DB delay.
      tier = computeAuthoritativeTier(rawEmail, cookieTier).tier;
    }
  } catch {
    // Keep session fallback identity if DB is temporarily unavailable.
  }

  // Trust & safety gate — a user suspended/banned mid-session (existing
  // cookie, up to 7 days old) must not keep working just because their
  // cookie hasn't expired yet. Checked on every session poll, not only at
  // login. Kept inside the existing "always 200" contract for this route —
  // authenticated:false plus accountStatus tells the frontend why.
  if (canonicalUserId !== sessionId) {
    const status = await getAccountStatus(canonicalUserId).catch(() => null);
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
  response.cookies.set('tmi_role', role, COOKIE_OPTS);

  return response;
}
