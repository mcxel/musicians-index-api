export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

const COOKIE_CLEAR = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 0,
  path: '/',
};

/**
 * POST /api/auth/deactivate
 * Clears all session cookies and marks the account as deactivated.
 * Proxies to the backend API if NEXT_PUBLIC_API_URL is set.
 */
export async function POST(req: NextRequest) {
  const sessionCookie = req.cookies.get('tmi_session_id')?.value;

  if (!sessionCookie) {
    return NextResponse.json({ ok: false, error: 'Not authenticated' }, { status: 401 });
  }

  // Proxy to backend if available
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (apiBase) {
    try {
      const upstream = await fetch(`${apiBase}/auth/deactivate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: req.headers.get('cookie') ?? '',
        },
        signal: AbortSignal.timeout(8000),
      });
      if (!upstream.ok) {
        console.warn('[auth/deactivate] Upstream returned', upstream.status);
      }
    } catch (err) {
      console.error('[auth/deactivate] Upstream unreachable:', err);
    }
  }

  const res = NextResponse.json({ ok: true });

  // Clear all TMI auth cookies
  for (const name of ['tmi_session_id', 'tmi_user_id', 'tmi_user_email', 'tmi_tier', 'tmi_role', 'tmi_display_name']) {
    res.cookies.set(name, '', COOKIE_CLEAR);
  }

  return res;
}
