export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * GET /api/auth/session
 * Returns stable auth state. Always 200 — never 401 — so the frontend polling loop never crashes.
 */
export async function GET(req: NextRequest) {
  const sessionId    = req.cookies.get('tmi_session_id')?.value;
  const sessionToken = req.cookies.get('tmi_session')?.value;
  const role         = req.cookies.get('tmi_role')?.value ?? 'user';
  const email        = req.cookies.get('tmi_user_email')?.value ?? '';

  // Stable CSRF — auth routes are CSRF-exempt in middleware, this is informational only
  const csrfToken = 'tmi-phase1-csrf';

  if (!sessionId || !sessionToken) {
    return NextResponse.json({ authenticated: false, csrfToken, user: null, expires: null });
  }

  return NextResponse.json({
    authenticated: true,
    csrfToken,
    user: { id: sessionId.substring(0, 8), email: email || sessionId.substring(0, 8) },
    role,
    expires: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
  });
}
