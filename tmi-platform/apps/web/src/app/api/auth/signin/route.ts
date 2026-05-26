export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { loginUser } from '@/lib/auth/UserStore';
import { createSession } from '@/lib/auth/SessionManager';
import { checkRateLimit } from '@/lib/security/TMISecurityEngine';

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 12 * 60 * 60,
  path: '/',
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { email?: string; password?: string };
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

    // Verify against UserStore (handles hardcoded admins + registered users)
    const user = loginUser(email, password);
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const userAgent = req.headers.get('user-agent') ?? '';
    const { sessionId, sessionToken } = createSession(user.id, user.role, clientIp, userAgent);

    const response = NextResponse.json(
      { ok: true, message: 'Session created', userId: user.id, role: user.role, tier: user.tier },
      { status: 200 }
    );

    response.cookies.set('tmi_session_id', sessionId, COOKIE_OPTS);
    response.cookies.set('tmi_session', sessionToken, COOKIE_OPTS);
    response.cookies.set('tmi_role', user.role, COOKIE_OPTS);
    response.cookies.set('tmi_tier', user.tier, COOKIE_OPTS);
    response.cookies.set('tmi_user_email', email, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 12 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Login failed' },
      { status: 500 }
    );
  }
}
