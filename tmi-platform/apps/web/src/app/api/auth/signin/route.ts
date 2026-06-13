export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { loginUser, dbReady } from '@/lib/auth/UserStore';
import { createSession } from '@/lib/auth/SessionManager';
import { checkRateLimit } from '@/lib/security/TMISecurityEngine';
import { StreakEngine } from '@/lib/gamification/StreakEngine';
import { grantXP } from '@/lib/xp/xpEngine';
import { compare } from 'bcryptjs';
import prisma from '@/lib/prisma';
import { isFounderDiamondEmail } from '@/lib/promos/FounderDiamondPassEngine';

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60,
  path: '/',
};

export async function POST(req: NextRequest) {
  try {
    let body: { email?: string; password?: string };
    try {
      body = await req.json() as { email?: string; password?: string };
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const email    = (body.email ?? '').trim().toLowerCase();
    const password = body.password ?? '';
    const clientIp = req.headers.get('x-forwarded-for') ?? req.headers.get('x-client-ip') ?? 'unknown';

    const rateLimit = checkRateLimit(`auth:signin:${clientIp}`, 40, 60_000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Too many login attempts. Please wait and try again.' }, { status: 429 });
    }

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Wait for DB preload to finish on cold starts before reading the store
    await dbReady;

    // Verify against UserStore (handles hardcoded admins + registered users)
    let user = loginUser(email, password);

    // Fallback: user registered via /api/auth/register (bcryptjs hash in DB, not in UserStore)
    if (!user) {
      const dbUser = await prisma.user.findUnique({ where: { email } });
      if (dbUser?.passwordHash && await compare(password, dbUser.passwordHash)) {
        const DB_ROLE_MAP: Record<string, string> = {
          ADMIN: 'admin', STAFF: 'staff', FAN: 'fan', ARTIST: 'artist',
          PERFORMER: 'performer', SPONSOR: 'sponsor', ADVERTISER: 'advertiser',
          VENUE: 'venue', WRITER: 'writer', PROMOTER: 'promoter', USER: 'user',
        };
        user = {
          id: dbUser.id,
          email: dbUser.email ?? '',
          passwordHash: dbUser.passwordHash,
          displayName: dbUser.displayName ?? (dbUser.email ?? '').split('@')[0],
          tier: (dbUser.tier?.toUpperCase() ?? 'FREE') as import('@/lib/auth/UserStore').UserTier,
          role: (DB_ROLE_MAP[dbUser.role ?? 'USER'] ?? 'fan') as import('@/lib/auth/UserStore').UserRole,
          createdAt: dbUser.userCreatedAt?.getTime() ?? Date.now(),
        };
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Founder diamond override — lifetime grant list takes priority over DB tier
    const resolvedUser = isFounderDiamondEmail(email) && user.tier !== 'DIAMOND'
      ? (() => {
          // Persist to DB so future logins read DIAMOND directly (fire-and-forget)
          prisma.user.updateMany({ where: { email }, data: { tier: 'DIAMOND' } }).catch(() => {});
          return { ...user, tier: 'DIAMOND' as import('@/lib/auth/UserStore').UserTier };
        })()
      : user;

    const userAgent = req.headers.get('user-agent') ?? '';
    const { sessionId, sessionToken } = createSession(resolvedUser.id, resolvedUser.role, clientIp, userAgent);

    const streakResult = StreakEngine.recordDailyVisit(resolvedUser.id);
    if (streakResult.isNewDay && streakResult.xpGranted > 0) {
      grantXP({ userId: resolvedUser.id, source: 'login_daily', amount: streakResult.xpGranted });
    }

    const response = NextResponse.json(
      {
        ok: true,
        message: 'Session created',
        userId: resolvedUser.id,
        role: resolvedUser.role,
        tier: resolvedUser.tier,
        streak: {
          current: streakResult.streak.currentStreak,
          longest: streakResult.streak.longestStreak,
          isNewDay: streakResult.isNewDay,
          multiplier: streakResult.xpMultiplier,
          xpGranted: streakResult.xpGranted,
        },
      },
      { status: 200 }
    );

    response.cookies.delete('tmi_role');
    response.cookies.delete('tmi_tier');
    response.cookies.set('tmi_session_id', sessionId, COOKIE_OPTS);
    response.cookies.set('tmi_session', sessionToken, COOKIE_OPTS);
    response.cookies.set('tmi_role', resolvedUser.role, COOKIE_OPTS);
    response.cookies.set('tmi_tier', resolvedUser.tier, COOKIE_OPTS);
    response.cookies.set('tmi_user_email', email, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });
    response.cookies.set('phase11_session', sessionToken, COOKIE_OPTS);

    return response;
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
