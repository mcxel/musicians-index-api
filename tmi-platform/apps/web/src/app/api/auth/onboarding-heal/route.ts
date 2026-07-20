export const dynamic = 'force-dynamic';
/**
 * GET /api/auth/onboarding-heal?next=<path>
 *
 * Cookie-healing endpoint for the Onboarding Enforcer Gate in middleware.ts.
 *
 * When a user has a valid session but their `tmi_onboarding_state` cookie is
 * missing or stale, the middleware redirects here instead of immediately
 * bouncing them back to /onboarding. This route:
 *
 *   1. Reads the authenticated user's real onboardingState from the DB.
 *   2a. If COMPLETE  → sets tmi_onboarding_state=complete cookie + redirects to `next`.
 *   2b. If INCOMPLETE → sets tmi_onboarding_state=incomplete cookie + redirects to
 *       the appropriate onboarding step.
 *
 * This prevents infinite redirect loops caused by a missing cookie on an
 * account that already completed onboarding (e.g., after cache clear,
 * cross-device login, or invite-link registration).
 *
 * Security: `next` is validated to only accept local paths starting with `/`
 * to prevent open-redirect abuse.
 */

import { type NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { emitAdminLiveEvent } from '@/lib/admin/AdminLiveEventEngine';

const COOKIE_OPTS = {
  httpOnly: false,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60,
  path: '/',
};

function isSafeLocalPath(p: string): boolean {
  return typeof p === 'string' && p.startsWith('/') && !p.startsWith('//') && !p.includes(':');
}

export async function GET(req: NextRequest) {
  const rawNext = req.nextUrl.searchParams.get('next') ?? '/hub/fan';
  const next = isSafeLocalPath(rawNext) ? rawNext : '/hub/fan';

  const email     = req.cookies.get('tmi_user_email')?.value;
  const sessionId = req.cookies.get('tmi_session_id')?.value;

  // Not authenticated at all — send to sign-in
  if (!email || !sessionId) {
    const signinUrl = new URL('/auth', req.url);
    signinUrl.searchParams.set('next', next);
    return NextResponse.redirect(signinUrl, 307);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, role: true, onboardingState: true },
    });

    if (!user) {
      return NextResponse.redirect(new URL('/auth', req.url), 307);
    }

    const isComplete = user.onboardingState === 'COMPLETE';

    if (isComplete) {
      emitAdminLiveEvent({
        type: 'engagement',
        message: `[onboarding-heal] ✅ Healed stale cookie for ${email} → COMPLETE → ${next}`,
        meta: { email, userId: user.id, destination: next },
      });
      const res = NextResponse.redirect(new URL(next, req.url), 302);
      res.cookies.set('tmi_onboarding_state', 'complete', COOKIE_OPTS);
      return res;
    }

    // Not complete — route to the appropriate onboarding step
    const role = (user.role ?? 'FAN').toUpperCase();
    const isPerformer = role === 'PERFORMER' || role === 'ARTIST';
    const targetStep = isPerformer ? '/onboarding/artist' : '/onboarding/fan';

    emitAdminLiveEvent({
      type: 'engagement',
      message: `[onboarding-heal] ⚠️ Onboarding incomplete for ${email} → ${targetStep}`,
      meta: { email, userId: user.id, onboardingState: user.onboardingState, role },
    });

    const res = NextResponse.redirect(new URL(targetStep, req.url), 307);
    res.cookies.set('tmi_onboarding_state', 'incomplete', COOKIE_OPTS);
    return res;

  } catch (err) {
    console.error('[onboarding-heal] DB error:', err);
    // DB unreachable — fall back to onboarding rather than crashing
    const fallback = NextResponse.redirect(new URL('/onboarding', req.url), 307);
    return fallback;
  }
}
