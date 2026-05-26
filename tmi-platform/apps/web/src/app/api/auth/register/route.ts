export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { registerUser } from '@/lib/auth/UserStore';
import { createSession } from '@/lib/auth/SessionManager';
import { sendEmail } from '@/lib/email/TMIEmailSystem';
import { DiamondInviteEngine } from '@/lib/auth/DiamondInviteEngine';
import { checkRateLimit, validateSignupEmail } from '@/lib/security/TMISecurityEngine';

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 12 * 60 * 60,
  path: '/',
};

export async function POST(req: NextRequest) {
  let parsed: {
    email?: string; password?: string; displayName?: string; name?: string;
    dateOfBirth?: string; termsAccepted?: boolean; ref?: string; role?: string;
    inviteToken?: string;
  } = {};

  try {
    parsed = await req.json() as typeof parsed;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const email       = (parsed.email ?? '').trim().toLowerCase();
  const password    = parsed.password ?? '';
  const displayName = (parsed.displayName ?? parsed.name ?? '').trim();
  const clientIp = req.headers.get('x-forwarded-for') ?? req.headers.get('x-client-ip') ?? 'unknown';

  const rateLimit = checkRateLimit(`auth:signup:${clientIp}`, 20, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many signup attempts. Please wait and try again.' }, { status: 429 });
  }

  // Normalize account type / role to platform role
  const ROLE_MAP: Record<string, string> = {
    MEMBER: 'fan', FAN: 'fan', ARTIST: 'artist', PERFORMER: 'performer',
    SPONSOR: 'sponsor', ADVERTISER: 'advertiser', VENUE: 'venue',
    WRITER: 'writer', PROMOTER: 'promoter',
  };
  const rawRole = (parsed.role ?? '').toUpperCase();
  const platformRole = (ROLE_MAP[rawRole] ?? '') as import('@/lib/auth/UserStore').UserRole | '';

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  const emailValidation = validateSignupEmail(email);
  if (!emailValidation.valid) {
    return NextResponse.json({ error: emailValidation.error ?? 'Invalid email address' }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  }

  if (!parsed.termsAccepted) {
    return NextResponse.json({ error: 'Terms must be accepted' }, { status: 400 });
  }

  // Register into shared UserStore (standalone — no backend required)
  const result = registerUser({ email, password, displayName, ref: parsed.ref, role: platformRole || undefined });

  if (!result.ok || !result.user) {
    const status = result.error?.includes('already exists') ? 409 : 400;
    return NextResponse.json({ error: result.error ?? 'Registration failed' }, { status });
  }

  const user = result.user;

  // Auto-login: create session immediately so user lands on dashboard authenticated
  const userAgent = req.headers.get('user-agent') ?? '';
  const { sessionId, sessionToken } = createSession(user.id, user.role, clientIp, userAgent);

  // Role-specific welcome email via TMIEmailSystem magazine templates
  const name = displayName || user.displayName;
  const isArtist = platformRole === 'artist' || platformRole === 'performer';
  const emailType = isArtist ? 'welcome_artist'
    : platformRole === 'sponsor' ? 'sponsor_confirmation'
    : platformRole === 'venue' ? 'welcome_venue'
    : 'welcome_fan';
  const emailData: Record<string, unknown> = { name, slug: user.id };
  if (platformRole === 'venue') { emailData.venueName = name; emailData.venueSlug = user.id; }
  if (platformRole === 'sponsor') {
    emailData.sponsorName = name;
    emailData.packageName = 'Standard';
    emailData.monthlyBudget = '0';
    emailData.activeUntil = 'Pending';
    emailData.repEmail = 'sponsors@themusiciansindex.com';
  }
  void sendEmail({ to: email, type: emailType, data: emailData });

  // Redeem invite token NOW that the account actually exists
  if (parsed.inviteToken) {
    void DiamondInviteEngine.validateAndRedeem(parsed.inviteToken, user.id);
  }

  const response = NextResponse.json(
    { ok: true, userId: user.id, user: { id: user.id, email: user.email, tier: user.tier, role: user.role } },
    { status: 201 }
  );

  response.cookies.set('tmi_session_id', sessionId, COOKIE_OPTS);
  response.cookies.set('tmi_session', sessionToken, COOKIE_OPTS);
  response.cookies.set('tmi_role', user.role, COOKIE_OPTS);
  response.cookies.set('tmi_tier', user.tier, COOKIE_OPTS);
  response.cookies.set('tmi_user_email', email, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 12 * 60 * 60,
    path: '/',
  });

  return response;
}
