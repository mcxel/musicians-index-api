export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createSession } from '@/lib/auth/SessionManager';

/**
 * POST /api/auth/signin
 *
 * Login endpoint. Creates session tokens.
 * Expects: { email, password }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-client-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || '';

    const userId = email;
    const emailLower = email.toLowerCase();

    // Hardcoded admin fallback — covers Jay, Justin, Marcel even before ADMIN_EMAILS env var is set
    const HARDCODED_ADMINS = new Set([
      'berntmusic33@gmail.com',
      'bjmtherapper1@gmail.com',
      'rjking42@icloud.com',
    ]);

    // Diamond lifetime accounts — 0% rake, DIAMOND tier cookie
    const DIAMOND_EMAILS = new Set([
      't.muse82@icloud.com',
      'facethebully916@gmail.com',
      'kevenfobbsgrip@gmail.com',
      'parisdcooper91@gmail.com',
      'mystictrinity@yahoo.com',
      'sharingmyblessing1978@gmail.com',
      'blackstargoldpr@gmail.com',
    ]);

    const envAdminEmails = (process.env.ADMIN_EMAILS ?? '').toLowerCase().split(',').map((e) => e.trim()).filter(Boolean);
    const isAdmin = HARDCODED_ADMINS.has(emailLower) || envAdminEmails.includes(emailLower);
    const role = isAdmin ? 'admin' : 'user';
    const tier = isAdmin ? 'ADMIN' : DIAMOND_EMAILS.has(emailLower) ? 'DIAMOND' : 'FREE';

    // Create session
    const { sessionId, sessionToken } = createSession(userId, role, clientIp, userAgent);

    // Create response with session cookies
    const response = NextResponse.json(
      {
        ok: true,
        message: 'Session created',
        userId,
        role,
        tier,
      },
      { status: 200 }
    );

    const cookieOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 12 * 60 * 60,
      path: '/',
    };

    response.cookies.set('tmi_session_id', sessionId, cookieOpts);
    response.cookies.set('tmi_session', sessionToken, cookieOpts);
    response.cookies.set('tmi_role', role, cookieOpts);
    response.cookies.set('tmi_tier', tier, cookieOpts);

    response.cookies.set('tmi_user_email', emailLower, {
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
