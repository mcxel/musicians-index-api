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
    const adminEmails = (process.env.ADMIN_EMAILS ?? '').toLowerCase().split(',').map((e) => e.trim()).filter(Boolean);
    const role = adminEmails.includes(email.toLowerCase()) ? 'admin' : 'user';

    // Create session
    const { sessionId, sessionToken } = createSession(userId, role, clientIp, userAgent);

    // Create response with session cookies
    const response = NextResponse.json(
      {
        ok: true,
        message: 'Session created',
        userId,
        role,
      },
      { status: 200 }
    );

    response.cookies.set('tmi_session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 12 * 60 * 60, // 12 hours
      path: '/',
    });

    response.cookies.set('tmi_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 12 * 60 * 60, // 12 hours
      path: '/',
    });

    response.cookies.set('tmi_role', role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 12 * 60 * 60,
      path: '/',
    });

    response.cookies.set('tmi_user_email', email.toLowerCase(), {
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
