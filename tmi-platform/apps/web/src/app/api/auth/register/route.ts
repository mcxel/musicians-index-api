export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { registerUser } from '@/lib/auth/UserStore';
import { createSession } from '@/lib/auth/SessionManager';
import { EmailProviderEngine } from '@/lib/email/EmailProviderEngine';
import { DiamondInviteEngine } from '@/lib/auth/DiamondInviteEngine';

const BASE_URL = process.env.NEXTAUTH_URL ?? 'https://themusiciansindex.com';

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 12 * 60 * 60,
  path: '/',
};

function sendWelcomeEmail(email: string, displayName: string) {
  EmailProviderEngine.sendAsync({
    to: email,
    subject: "Welcome to TMI — The Musician's Index",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#050510;color:#fff;padding:40px;border-radius:12px">
        <h1 style="font-size:24px;font-weight:900;margin:0 0 8px;color:#00FFFF">Welcome to TMI${displayName ? `, ${displayName}` : ''}</h1>
        <p style="font-size:13px;color:rgba(255,255,255,0.45);margin:0 0 20px">The Musician's Index</p>
        <p style="font-size:14px;line-height:1.7;color:rgba(255,255,255,0.75);margin:0 0 28px">
          Your account is ready. Go live, enter battles, vote, earn XP, and invite your crew.<br/><br/>
          Invite fans and performers — you earn XP for everyone who joins through your link.
        </p>
        <a href="${BASE_URL}/join" style="display:inline-block;padding:13px 28px;background:linear-gradient(135deg,#FF2DAA,#AA2DFF);color:#fff;font-weight:800;font-size:12px;letter-spacing:0.12em;border-radius:8px;text-decoration:none">
          GO TO TMI →
        </a>
        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:36px 0 20px" />
        <p style="font-size:11px;color:rgba(255,255,255,0.25);margin:0">BernoutGlobal LLC · The Musician's Index</p>
      </div>
    `,
    text: `Welcome to TMI${displayName ? `, ${displayName}` : ''}.\n\nYour account is ready. Visit: ${BASE_URL}/join\n\n— BernoutGlobal LLC`,
    tags: ['welcome', 'registration'],
  }).catch(() => {/* non-blocking */});
}

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
  const clientIp = req.headers.get('x-forwarded-for') ?? req.headers.get('x-client-ip') ?? 'unknown';
  const userAgent = req.headers.get('user-agent') ?? '';
  const { sessionId, sessionToken } = createSession(user.id, user.role, clientIp, userAgent);

  sendWelcomeEmail(email, displayName || user.displayName);

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
