export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { destroySession } from '@/lib/auth/SessionManager';
import { invalidateCSRFToken } from '@/lib/auth/CSRFTokenManager';

/**
 * POST /api/auth/logout
 *
 * Logout endpoint. Destroys session and invalidates tokens.
 */
export async function POST(req: NextRequest) {
  try {
    const sessionId = req.cookies.get('tmi_session_id')?.value;
    const sessionToken = req.cookies.get('tmi_session')?.value;
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-client-ip') || 'unknown';

    if (sessionId && sessionToken) {
      destroySession(sessionId, sessionToken);
      invalidateCSRFToken(clientIp);
    }

    // Create response clearing session cookies
    const response = NextResponse.json(
      {
        ok: true,
        message: 'Logged out',
      },
      { status: 200 }
    );

    response.cookies.delete('tmi_session_id');
    response.cookies.delete('tmi_session');
    response.cookies.delete('tmi_role');

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Logout failed' },
      { status: 500 }
    );
  }
}
