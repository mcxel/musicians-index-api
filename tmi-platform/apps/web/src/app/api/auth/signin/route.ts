export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { loginUser, dbReady } from '@/lib/auth/UserStore';
import { createSession } from '@/lib/auth/SessionManager';
import { checkRateLimit } from '@/lib/security/TMISecurityEngine';
import { StreakEngine } from '@/lib/gamification/StreakEngine';
import { grantXP } from '@/lib/xp/xpEngine';
import { compare } from 'bcryptjs';
import prisma, { ensureUserDatabaseSchema } from '@/lib/prisma';
import { resolveTierFromDb } from '@/lib/auth/resolveAuthoritativeTier';
import { getAccountStatus } from '@/lib/moderation/ModerationEngine';

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
    //
    // dbUnavailable tracks whether BOTH DB attempts timed out / threw a
    // connection error. When true we return 503 "server warming up" rather
    // than the misleading 401 "invalid credentials" — callers should retry
    // instead of thinking their password is wrong.
    let dbUnavailable = false;

    function isDbConnError(err: unknown): boolean {
      const msg = String((err as any)?.message ?? '').toLowerCase();
      const code = String((err as any)?.code ?? '').toLowerCase();
      return (
        msg.includes('timeout') ||
        msg.includes('timed out') ||
        msg.includes("can't reach") ||
        msg.includes('connection') ||
        msg.includes('econnreset') ||
        msg.includes('enotfound') ||
        /^p1\d{3}$/.test(code) // Prisma P1xxx = DB connection/engine errors
      );
    }

    const DB_ROLE_MAP: Record<string, string> = {
      ADMIN: 'admin', STAFF: 'staff', FAN: 'fan', ARTIST: 'artist',
      PERFORMER: 'performer', SPONSOR: 'sponsor', ADVERTISER: 'advertiser',
      VENUE: 'venue', WRITER: 'writer', PROMOTER: 'promoter', USER: 'user',
    };

    if (!user) {
      try {
        const dbUser = await prisma.user.findUnique({
          where: { email },
          select: { id: true, email: true, passwordHash: true, displayName: true, tier: true, role: true, userCreatedAt: true },
        });
        if (dbUser?.passwordHash && await compare(password, dbUser.passwordHash)) {
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
      } catch (dbErr) {
        if (isDbConnError(dbErr)) dbUnavailable = true;
        console.warn('[auth/signin] DB lookup notice, triggering schema DDL self-healing:', dbErr);
        await ensureUserDatabaseSchema().catch(() => {});
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email },
            select: { id: true, email: true, passwordHash: true, displayName: true, tier: true, role: true, userCreatedAt: true },
          });
          if (dbUser?.passwordHash && await compare(password, dbUser.passwordHash)) {
            dbUnavailable = false; // DB came back — we have a real answer
            user = {
              id: dbUser.id,
              email: dbUser.email ?? '',
              passwordHash: dbUser.passwordHash,
              displayName: dbUser.displayName ?? (dbUser.email ?? '').split('@')[0],
              tier: (dbUser.tier?.toUpperCase() ?? 'FREE') as import('@/lib/auth/UserStore').UserTier,
              role: (DB_ROLE_MAP[dbUser.role ?? 'USER'] ?? 'fan') as import('@/lib/auth/UserStore').UserRole,
              createdAt: dbUser.userCreatedAt?.getTime() ?? Date.now(),
            };
          } else {
            dbUnavailable = false; // DB responded — user simply not found or wrong password
          }
        } catch (dbErr2) {
          if (isDbConnError(dbErr2)) dbUnavailable = true;
          // Both attempts failed — fall through to the check below
        }
      }
    }

    if (!user) {
      if (dbUnavailable) {
        // DB is cold-starting or temporarily unreachable — tell the user to
        // retry instead of making them think their credentials are wrong.
        return NextResponse.json(
          { error: 'The server is warming up. Please wait a few seconds and try again.' },
          { status: 503 }
        );
      }
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Authoritative tier resolution (P0 Identity/Entitlement Integrity) —
    // same rule every session-reading route now shares via
    // resolveAuthoritativeTier.ts, was previously duplicated inline here.
    const resolvedUser = { ...user, tier: resolveTierFromDb(email, user.tier) };

    // Trust & safety gate — blocks sign-in for suspended/banned accounts.
    // A temporary auto-suspend self-clears here once its hold window
    // passes without a human escalating it (see ModerationEngine).
    try {
      const status = await getAccountStatus(resolvedUser.id);
      if (status && status.accountStatus !== 'active') {
        return NextResponse.json(
          {
            error: status.accountStatus === 'banned' ? 'This account has been banned.' : 'This account is temporarily suspended.',
            accountStatus: status.accountStatus,
            reason: status.accountStatusReason ?? undefined,
          },
          { status: 403 }
        );
      }
    } catch (modErr) {
      console.warn('[auth/signin] Moderation check warning (continuing signin):', modErr);
    }

    const userAgent = req.headers.get('user-agent') ?? '';
    const { sessionId, sessionToken } = createSession(resolvedUser.id, resolvedUser.role, clientIp, userAgent);

    // tmi_roles (plural) is what middleware's hub-access gate actually reads
    // for multi-role accounts. Registration sets it from the real UserRole
    // rows, but until now login never refreshed it - so it went stale after
    // the cookie's 7-day maxAge and multi-role hub access silently broke.
    let userRoles: string[] = [resolvedUser.role.toUpperCase()];
    try {
      const roleRows = await prisma.userRole.findMany({
        where: { userId: resolvedUser.id },
        select: { role: true },
      });
      if (roleRows.length > 0) {
        userRoles = roleRows.map((r) => r.role);
      }
    } catch (roleErr) {
      console.warn('[auth/signin] UserRole lookup warning (falling back to single role):', roleErr);
    }

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
    response.cookies.delete('tmi_roles');
    response.cookies.set('tmi_session_id', sessionId, COOKIE_OPTS);
    response.cookies.set('tmi_session', sessionToken, COOKIE_OPTS);
    response.cookies.set('tmi_role', resolvedUser.role, COOKIE_OPTS);
    response.cookies.set('tmi_roles', JSON.stringify(userRoles), COOKIE_OPTS);
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
  } catch (err) {
    console.error('[auth/signin] login handler crashed:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
