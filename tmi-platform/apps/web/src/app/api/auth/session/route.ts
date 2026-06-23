export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isFounderDiamondEmail } from '@/lib/promos/FounderDiamondPassEngine';
import prisma from '@/lib/prisma';

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

  if (rawEmail) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { email: rawEmail },
        select: { id: true, isLive: true, liveRoomId: true, userProfile: { select: { avatarUrl: true } } },
      });
      if (dbUser) {
        canonicalUserId = dbUser.id;
        isLive = dbUser.isLive;
        liveRoomId = dbUser.liveRoomId;
        avatarUrl = dbUser.userProfile?.avatarUrl ?? null;
      }
    } catch {
      // Keep session fallback identity if DB is temporarily unavailable.
    }
  }

  const scopedEmail = redactEmailForRole(rawEmail, role);
  const displayName = scopedEmail ? scopedEmail.split('@')[0] : `user-${canonicalUserId.substring(0, 8)}`;

  return NextResponse.json({
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
      onboardingState: 'complete',
    },
    role,
    tier,
    expires: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
  });
}
