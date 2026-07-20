export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isFounderDiamondEmail } from '@/lib/promos/FounderDiamondPassEngine';
import { getAccountStatus } from '@/lib/moderation/ModerationEngine';
import prisma from '@/lib/prisma';

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
  const tier = isFounderDiamondEmail(rawEmail) ? 'DIAMOND' : cookieTier;

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

  if (rawEmail) {
    try {
      const dbUser = await withTimeout(
        prisma.user.findUnique({
          where: { email: rawEmail },
          select: {
            id: true,
            isLive: true,
            liveRoomId: true,
            onboardingState: true,
            userProfile: {
              select: {
                avatarUrl: true,
                socialLinks: true,
              }
            }
          },
        }),
        SESSION_DB_LOOKUP_TIMEOUT_MS
      );
      if (dbUser) {
        canonicalUserId = dbUser.id;
        isLive = dbUser.isLive;
        liveRoomId = dbUser.liveRoomId;
        avatarUrl = dbUser.userProfile?.avatarUrl ?? null;
        dbOnboardingState = dbUser.onboardingState ?? 'NO_ROLE_SELECTED';
        const links = (dbUser.userProfile?.socialLinks as Record<string, any>) ?? {};
        dbOnboardingStep = links.onboarding_step ?? '2';
      }
    } catch {
      // Keep session fallback identity if DB is temporarily unavailable.
    }
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
  const displayName = scopedEmail ? scopedEmail.split('@')[0] : `user-${canonicalUserId.substring(0, 8)}`;

  const response = NextResponse.json({
    authenticated: true,
    csrfToken,
    user: {
      id: canonicalUserId,
      email: scopedEmail,
      name: displayName,
      role,
      tier,
      isLive,
      liveRoomId,
      avatarUrl,
      onboardingState: dbOnboardingState.toLowerCase(),
      onboardingStep: dbOnboardingStep,
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

  return response;
}
