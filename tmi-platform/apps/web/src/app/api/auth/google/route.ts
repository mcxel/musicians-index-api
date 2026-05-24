export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? '';
const BASE_URL = process.env.NEXTAUTH_URL ?? 'https://themusiciansindex.com';

export async function GET() {
  if (!GOOGLE_CLIENT_ID) {
    return NextResponse.json({ error: 'Google OAuth not configured' }, { status: 501 });
  }

  const state = crypto.randomUUID();
  const params = new URLSearchParams({
    client_id:     GOOGLE_CLIENT_ID,
    redirect_uri:  `${BASE_URL}/api/auth/google/callback`,
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
