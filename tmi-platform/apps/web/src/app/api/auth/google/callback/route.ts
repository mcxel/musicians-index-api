export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { registerUser, getUserByEmail, resolveHardcodedTierRole } from '@/lib/auth/UserStore';
import { createSession } from '@/lib/auth/SessionManager';

function getGoogleClientId(): string {
  return (
    process.env.GOOGLE_CLIENT_ID
    ?? process.env.AUTH_GOOGLE_ID
    ?? process.env.GOOGLE_OAUTH_CLIENT_ID
    ?? ''
  ).trim();
}

function getGoogleClientSecret(): string {
  return (
    process.env.GOOGLE_CLIENT_SECRET
    ?? process.env.AUTH_GOOGLE_SECRET
    ?? process.env.GOOGLE_OAUTH_CLIENT_SECRET
    ?? ''
  ).trim();
}

const COOKIE_OPTS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge:   7 * 24 * 60 * 60,
  path:     '/',
};

function roleToHub(role: string): string {
  if (role === 'admin' || role === 'staff') return '/admin';
  if (role === 'performer') return '/hub/performer';
  if (role === 'sponsor')   return '/hub/sponsor';
  if (role === 'advertiser') return '/hub/advertiser';
  if (role === 'venue')     return '/hub/venue';
  if (role === 'writer')    return '/hub/writer';
  if (role === 'promoter')  return '/hub/fan';
  return '/hub/fan';
}

interface GoogleTokenResponse {
  access_token: string;
  id_token?:    string;
  error?:       string;
}

interface GoogleUserInfo {
  email: string;
  name:  string;
  sub:   string;
  picture?: string;
}

export async function GET(req: NextRequest) {
  const GOOGLE_CLIENT_ID = getGoogleClientId();
  const GOOGLE_CLIENT_SECRET = getGoogleClientSecret();
  const BASE_URL = (process.env.NEXTAUTH_URL ?? req.nextUrl.origin ?? 'https://themusiciansindex.com').trim();

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return NextResponse.redirect(`${BASE_URL}/auth?error=oauth_not_configured`);
  }

  const url    = new URL(req.url);
  const code   = url.searchParams.get('code')  ?? '';
  const state  = url.searchParams.get('state') ?? '';
  const stored = req.cookies.get('tmi_oauth_state')?.value ?? '';

  if (!code || !state || state !== stored) {
    return NextResponse.redirect(`${BASE_URL}/auth?error=oauth_state`);
  }

  // Exchange auth code for access token
  let tokenData: GoogleTokenResponse;
  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    new URLSearchParams({
        code,
        client_id:     GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri:  `${BASE_URL}/api/auth/google/callback`,
        grant_type:    'authorization_code',
      }),
    });
    tokenData = await tokenRes.json() as GoogleTokenResponse;
  } catch {
    return NextResponse.redirect(`${BASE_URL}/auth?error=oauth_token`);
  }

  if (!tokenData.access_token) {
    return NextResponse.redirect(`${BASE_URL}/auth?error=oauth_token`);
  }

  // Fetch user profile from Google
  let profile: GoogleUserInfo;
  try {
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    profile = await profileRes.json() as GoogleUserInfo;
  } catch {
    return NextResponse.redirect(`${BASE_URL}/auth?error=oauth_profile`);
  }

  const email = (profile.email ?? '').toLowerCase().trim();
  if (!email) return NextResponse.redirect(`${BASE_URL}/auth?error=oauth_no_email`);

  // Look up existing user or auto-register
  let user = getUserByEmail(email);
  if (!user) {
    const hardcoded = resolveHardcodedTierRole(email);
    const result = registerUser({
      email,
      password:    `google_oauth_${profile.sub}`, // not used for Google auth
      displayName: profile.name ?? email.split('@')[0],
      role:        (hardcoded?.role ?? 'fan') as import('@/lib/auth/UserStore').UserRole,
    });
    user = result.user ?? null;
  }

  if (!user) return NextResponse.redirect(`${BASE_URL}/auth?error=register_failed`);

  const clientIp  = req.headers.get('x-forwarded-for') ?? 'unknown';
  const userAgent = req.headers.get('user-agent') ?? '';
  const { sessionId, sessionToken } = createSession(user.id, user.role, clientIp, userAgent);

  const dest = roleToHub(user.role);
  const res  = NextResponse.redirect(`${BASE_URL}${dest}`);

  res.cookies.delete('tmi_oauth_state');
  res.cookies.delete('tmi_role');
  res.cookies.delete('tmi_tier');
  res.cookies.set('tmi_session_id', sessionId,       COOKIE_OPTS);
  res.cookies.set('tmi_session',    sessionToken,     COOKIE_OPTS);
  res.cookies.set('tmi_role',       user.role,        COOKIE_OPTS);
  res.cookies.set('tmi_tier',       user.tier,        COOKIE_OPTS);
  res.cookies.set('tmi_user_email', email, { ...COOKIE_OPTS, httpOnly: false });

  return res;
}
