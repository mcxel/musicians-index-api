export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import {
  registerUser,
  getUserByEmail,
  resolveHardcodedTierRole,
  dbReady,
  type UserRole,
} from '@/lib/auth/UserStore';
import { createSession } from '@/lib/auth/SessionManager';
import prisma from '@/lib/prisma';
import {
  getMessagingEligibility,
  needsAgeOrPolicyGate,
} from '@/lib/messaging/MessagingEligibility';
import { needsFreshRoleChoicePage } from '@/lib/auth/roleChoiceAuthority';

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
  if (role === 'performer' || role === 'artist') return '/hub/performer';
  if (role === 'sponsor')   return '/hub/sponsor';
  if (role === 'advertiser') return '/hub/advertiser';
  if (role === 'venue')     return '/hub/venue';
  if (role === 'writer')    return '/hub/writer';
  if (role === 'promoter')  return '/hub/fan';
  if (role === 'user')      return '/onboarding';
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
 * Ensure Prisma User + Google Account for OAuth identity.
 * Authentication ≠ role selection: new OAuth users stay Role.USER with
 * onboardingState=NO_ROLE_SELECTED until /onboarding (or recovery) records
 * an explicit choice on User.onboardingState.
 */
async function ensureOauthPrismaUser(params: {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  tier: string;
  role: string;
  googleSub: string;
  isNewUser: boolean;
}): Promise<{ prismaUserId: string; onboardingState: string; role: string }> {
  const dbRole = ROLE_TO_DB[params.role] ?? 'USER';
  try {
    const existing = await prisma.user.findUnique({
      where: { email: params.email },
      select: {
        id: true,
        role: true,
        onboardingState: true,
        passwordHash: true,
      },
    });

    let prismaUserId: string;
    let onboardingState: string;
    let role: string;

    if (existing?.id) {
      prismaUserId = existing.id;
      onboardingState = String(existing.onboardingState ?? 'NO_ROLE_SELECTED');
      role = String(existing.role ?? dbRole).toLowerCase();
      // Backfill Account link for legacy Google users (eligibility + audit).
    } else {
      // Hardcoded admin/performer emails keep their assigned role; everyone else
      // stays USER until explicit role choice (never silent FAN).
      const preserveAssignedRole = ['admin', 'staff', 'performer', 'artist'].includes(
        params.role.toLowerCase(),
      );
      const createRole = params.isNewUser && !preserveAssignedRole ? 'USER' : dbRole;
      const createOnboarding =
        params.isNewUser && !preserveAssignedRole ? 'NO_ROLE_SELECTED' : 'INCOMPLETE';
      const created = await prisma.user.create({
        data: {
          id: params.id,
          email: params.email,
          passwordHash: params.passwordHash,
          displayName: params.displayName,
          tier: params.tier,
          role: createRole as never,
          onboardingState: createOnboarding as never,
          termsAccepted: false,
        },
        select: { id: true, role: true, onboardingState: true },
      });
      prismaUserId = created.id;
      onboardingState = String(created.onboardingState ?? createOnboarding);
      role = String(created.role ?? createRole).toLowerCase();
    }

    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: 'google',
          providerAccountId: params.googleSub,
        },
      },
      create: {
        userId: prismaUserId,
        type: 'oauth',
        provider: 'google',
        providerAccountId: params.googleSub,
      },
      update: {
        userId: prismaUserId,
      },
    });

    return { prismaUserId, onboardingState, role };
  } catch {
    return {
      prismaUserId: params.id,
      onboardingState: 'NO_ROLE_SELECTED',
      role: params.role,
    };
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

  const existingStoreUser = getUserByEmail(email);
  const isNewUser = !existingStoreUser;

  let user = existingStoreUser;
  if (!user) {
    const hardcoded = resolveHardcodedTierRole(email);
    // Hardcoded admins/performers keep their assigned role; everyone else stays
    // USER until /onboarding records an explicit choice (never silent FAN).
    const roleForStore = (hardcoded?.role ?? 'user') as UserRole;
    const result = registerUser({
      email,
      password:    `google_oauth_${profile.sub}`,
      displayName: profile.name ?? email.split('@')[0],
      role:        roleForStore,
    });
    user = result.user ?? null;
  }

  if (!user) return NextResponse.redirect(`${BASE_URL}/auth?error=register_failed`);

  const ensured = await ensureOauthPrismaUser({
    id: user.id,
    email: user.email,
    passwordHash: user.passwordHash,
    displayName: user.displayName,
    tier: user.tier,
    role: user.role,
    googleSub: profile.sub,
    isNewUser,
  });

  const sessionRole = (ensured.role || user.role || 'user').toLowerCase();
  const clientIp  = req.headers.get('x-forwarded-for') ?? 'unknown';
  const userAgent = req.headers.get('user-agent') ?? '';
  const { sessionId, sessionToken } = createSession(ensured.prismaUserId, sessionRole, clientIp, userAgent);

  const hub = roleToHub(sessionRole);
  let dest = hub;

  if (needsFreshRoleChoicePage({ role: sessionRole, onboardingState: ensured.onboardingState })) {
    dest = '/onboarding';
  }

  try {
    const eligibility = await getMessagingEligibility(ensured.prismaUserId);
    if (needsAgeOrPolicyGate(eligibility.state)) {
      dest = `/onboarding/communication-setup?next=${encodeURIComponent(dest)}`;
    }
  } catch {
    dest = `/onboarding/communication-setup?next=${encodeURIComponent(dest)}`;
  }

  const res = NextResponse.redirect(`${BASE_URL}${dest}`);

  res.cookies.delete('tmi_oauth_state');
  res.cookies.delete('tmi_role');
  res.cookies.delete('tmi_tier');
  res.cookies.set('tmi_session_id', sessionId,       COOKIE_OPTS);
  res.cookies.set('tmi_session',    sessionToken,     COOKIE_OPTS);
  res.cookies.set('tmi_role',       sessionRole,      COOKIE_OPTS);
  res.cookies.set('tmi_tier',       user.tier,        COOKIE_OPTS);
  res.cookies.set('tmi_user_email', email, { ...COOKIE_OPTS, httpOnly: false });
  res.cookies.set('tmi_onboarding_state', ensured.onboardingState.toLowerCase(), COOKIE_OPTS);

  return res;
}
