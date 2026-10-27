export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import {
  registerUser,
  getUserByEmail,
  resolveHardcodedTierRole,
  dbReady,
  type UserRole,
} from '@/lib/auth/UserStore';
import { authSessionCookieOpts, createSession } from '@/lib/auth/SessionManager';
import prisma from '@/lib/prisma';
import {
  getMessagingEligibility,
  needsAgeOrPolicyGate,
} from '@/lib/messaging/MessagingEligibility';

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

const ROLE_TO_DB: Record<string, string> = {
  admin: 'ADMIN',
  staff: 'STAFF',
  fan: 'FAN',
  artist: 'ARTIST',
  performer: 'PERFORMER',
  sponsor: 'SPONSOR',
  advertiser: 'ADVERTISER',
  venue: 'VENUE',
  writer: 'WRITER',
  promoter: 'PROMOTER',
  user: 'USER',
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

/**
 * Ensure Prisma User exists for OAuth identity.
 * Never sets termsAccepted=true — consent is collected on
 * /onboarding/communication-setup (or password signup checkboxes).
 */
async function ensureOauthPrismaUser(params: {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  tier: string;
  role: string;
}): Promise<string> {
  const dbRole = ROLE_TO_DB[params.role] ?? 'USER';
  try {
    const existing = await prisma.user.findUnique({
      where: { email: params.email },
      select: { id: true },
    });
    if (existing?.id) return existing.id;

    const created = await prisma.user.create({
      data: {
        id: params.id,
        email: params.email,
        passwordHash: params.passwordHash,
        displayName: params.displayName,
        tier: params.tier,
        role: dbRole as never,
        termsAccepted: false,
      },
      select: { id: true },
    });
    return created.id;
  } catch {
    // Fall back to UserStore id — eligibility may be incomplete until DB sync
    return params.id;
  }
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

  await dbReady;

  // Look up existing user or auto-register (no silent policy accept)
  let user = getUserByEmail(email);
  if (!user) {
    const hardcoded = resolveHardcodedTierRole(email);
    const result = registerUser({
      email,
      password:    `google_oauth_${profile.sub}`, // not used for Google auth
      displayName: profile.name ?? email.split('@')[0],
      role:        (hardcoded?.role ?? 'fan') as UserRole,
    });
    user = result.user ?? null;
  }

  if (!user) return NextResponse.redirect(`${BASE_URL}/auth?error=register_failed`);

  const prismaUserId = await ensureOauthPrismaUser({
    id: user.id,
    email: user.email,
    passwordHash: user.passwordHash,
    displayName: user.displayName,
    tier: user.tier,
    role: user.role,
  });

  const clientIp  = req.headers.get('x-forwarded-for') ?? 'unknown';
  const userAgent = req.headers.get('user-agent') ?? '';
  const { sessionId, sessionToken } = createSession(prismaUserId, user.role, clientIp, userAgent);

  const hub = roleToHub(user.role);
  let dest = hub;

  try {
    const eligibility = await getMessagingEligibility(prismaUserId);
    if (needsAgeOrPolicyGate(eligibility.state)) {
      dest = `/onboarding/communication-setup?next=${encodeURIComponent(hub)}`;
    }
  } catch {
    // If eligibility check fails, still force the consent gate for OAuth
    dest = `/onboarding/communication-setup?next=${encodeURIComponent(hub)}`;
  }

  const res = NextResponse.redirect(`${BASE_URL}${dest}`);

  res.cookies.delete('tmi_oauth_state');
  res.cookies.delete('tmi_role');
  res.cookies.delete('tmi_tier');
  const COOKIE_OPTS = authSessionCookieOpts();
  res.cookies.set('tmi_session_id', sessionId,       COOKIE_OPTS);
  res.cookies.set('tmi_session',    sessionToken,     COOKIE_OPTS);
  res.cookies.set('tmi_role',       user.role,        COOKIE_OPTS);
  res.cookies.set('tmi_tier',       user.tier,        COOKIE_OPTS);
  res.cookies.set('tmi_user_email', email, authSessionCookieOpts({ httpOnly: false }));

  return res;
}
