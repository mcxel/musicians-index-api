export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { registerUser, dbReady, getUserById, updateUserTier } from '@/lib/auth/UserStore';
import { registerArrival, qualifyReferral, resolveToken } from '@/lib/referral/ReferralEngine';
import { createSession } from '@/lib/auth/SessionManager';
import { sendEmail } from '@/lib/email/TMIEmailSystem';
import { DiamondInviteEngine } from '@/lib/auth/DiamondInviteEngine';
import { checkRateLimit, validateSignupEmail } from '@/lib/security/TMISecurityEngine';
import { emitAdminLiveEvent } from '@/lib/admin/AdminLiveEventEngine';

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60,
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

  // Ensure DB is preloaded so duplicate detection works on cold starts
  await dbReady;

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
  async function sendWelcomeEmailWithRetry() {
    const first = await sendEmail({ to: email, type: emailType, data: emailData });
    if (first.success) {
      emitAdminLiveEvent({
        type: 'engagement',
        message: `[${new Date().toLocaleTimeString()}] 📧 Welcome email sent: ${email} (${emailType})`,
        meta: { userId: user.id, email, emailType, attempt: 1 },
      });
      return;
    }

    const retryable = /(fetch|network|timeout|resend|socket|5\d\d)/i.test(first.error ?? '');
    if (retryable) {
      const second = await sendEmail({ to: email, type: emailType, data: emailData });
      if (second.success) {
        emitAdminLiveEvent({
          type: 'engagement',
          message: `[${new Date().toLocaleTimeString()}] 📧 Welcome email sent on retry: ${email} (${emailType})`,
          meta: { userId: user.id, email, emailType, attempt: 2 },
        });
        return;
      }
      emitAdminLiveEvent({
        type: 'alert',
        message: `[${new Date().toLocaleTimeString()}] ⚠️ Welcome email failed after retry: ${email} (${emailType})`,
        meta: { userId: user.id, email, emailType, error: second.error ?? 'unknown' },
      });
      console.error('[TMI register email] retry failed', email, emailType, second.error);
      return;
    }

    emitAdminLiveEvent({
      type: 'alert',
      message: `[${new Date().toLocaleTimeString()}] ⚠️ Welcome email failed: ${email} (${emailType})`,
      meta: { userId: user.id, email, emailType, error: first.error ?? 'unknown' },
    });
    console.error('[TMI register email] failed', email, emailType, first.error);
  }

  void sendWelcomeEmailWithRetry().catch((e) => {
    emitAdminLiveEvent({
      type: 'alert',
      message: `[${new Date().toLocaleTimeString()}] ⚠️ Welcome email exception: ${email} (${emailType})`,
      meta: { userId: user.id, email, emailType, error: String(e) },
    });
    console.error('[TMI register email] exception', e);
  });

  // Redeem invite token NOW that the account actually exists
  if (parsed.inviteToken) {
    void DiamondInviteEngine.validateAndRedeem(parsed.inviteToken, user.id);
  }

  // Auto-qualify referral on signup — a signup is stronger than 30s stay
  if (parsed.ref) {
    registerArrival(parsed.ref, user.id);
    const refResult = qualifyReferral(parsed.ref, user.id, 999, 1);
    if (refResult.qualified && refResult.milestoneBonus > 0) {
      const link = resolveToken(parsed.ref);
      if (link) {
        const owner = getUserById(link.ownerId);
        if (owner) updateUserTier(owner.email, 'GOLD');
      }
    }
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
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });

  return response;
}
