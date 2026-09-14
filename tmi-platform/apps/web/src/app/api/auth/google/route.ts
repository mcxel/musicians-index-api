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

function resolveBaseUrl(req: NextRequest): string {
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || req.nextUrl.host;
  const proto = req.headers.get('x-forwarded-proto') || (req.nextUrl.protocol ? req.nextUrl.protocol.replace(':', '') : 'http');
  const reqOrigin = `${proto}://${host}`;

  if (process.env.NODE_ENV !== 'production') {
    return reqOrigin || req.nextUrl.origin;
  }
  const configured = process.env.NEXTAUTH_URL?.trim();
  if (configured && !configured.startsWith('https://localhost') && !configured.startsWith('https://127.0.0.1') && !configured.startsWith('https://10.')) {
    return configured;
  }
  return reqOrigin || req.nextUrl.origin || 'https://themusiciansindex.com';
}

export async function GET(req: NextRequest) {
  const googleClientId = getGoogleClientId();
  const baseUrl = resolveBaseUrl(req);

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
