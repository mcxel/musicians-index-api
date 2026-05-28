export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function getGoogleClientId(): string {
  return (
    process.env.GOOGLE_CLIENT_ID
    ?? process.env.AUTH_GOOGLE_ID
    ?? process.env.GOOGLE_OAUTH_CLIENT_ID
    ?? ''
  ).trim();
}

export async function GET(req: NextRequest) {
  const googleClientId = getGoogleClientId();
  const baseUrl = (process.env.NEXTAUTH_URL ?? req.nextUrl.origin ?? 'https://themusiciansindex.com').trim();

  if (!googleClientId) {
    return NextResponse.redirect(`${baseUrl}/auth?error=oauth_not_configured`);
  }

  const state = crypto.randomUUID();
  const params = new URLSearchParams({
    client_id:     googleClientId,
    redirect_uri:  `${baseUrl}/api/auth/google/callback`,
    response_type: 'code',
    scope:         'openid email profile',
    access_type:   'online',
    prompt:        'select_account',
    state,
  });

  const res = NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
  // Store state in a short-lived cookie to verify on callback
  res.cookies.set('tmi_oauth_state', state, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   600,
    path:     '/',
  });
  return res;
}
