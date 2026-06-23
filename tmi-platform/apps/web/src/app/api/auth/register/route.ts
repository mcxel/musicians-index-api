export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { hash } from 'bcryptjs';
import prisma from '@/lib/prisma';
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
    dateOfBirth?: string; termsAccepted?: boolean; ref?: string; roles?: string[];
    inviteToken?: string;
    tier?: string;
    paymentToken?: string;
    promoCode?: string;
    performerTypes?: string[];
  } = {};

  try {
    parsed = await req.json() as typeof parsed;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const email       = (parsed.email ?? '').trim().toLowerCase();
  const password    = parsed.password ?? '';
  const displayName = (parsed.displayName ?? parsed.name ?? '').trim();
  const requestedTier = (parsed.tier ?? '').trim().toUpperCase();
  const clientIp = req.headers.get('x-forwarded-for') ?? req.headers.get('x-client-ip') ?? 'unknown';

  const rateLimit = checkRateLimit(`auth:signup:${clientIp}`, 20, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many signup attempts. Please wait and try again.' }, { status: 429 });
  }

  // Normalize account types / roles to platform roles
  const ROLE_MAP: Record<string, string> = {
    MEMBER: 'fan', FAN: 'fan', ARTIST: 'artist', PERFORMER: 'performer',
    SPONSOR: 'sponsor', ADVERTISER: 'advertiser', VENUE: 'venue',
    WRITER: 'writer', PROMOTER: 'promoter',
  };

  // Handle both single role (legacy) and multi-role (new)
  const rawRoles = Array.isArray(parsed.roles)
    ? parsed.roles.map(r => (r ?? '').toUpperCase())
    : [];

  const platformRoles = rawRoles
    .map(r => ROLE_MAP[r])
    .filter((r): r is string => r !== undefined && r.length > 0);

  // Default to FAN if no roles provided
  if (platformRoles.length === 0) {
    platformRoles.push('fan');
  }

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

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }

    const hashedPassword = await hash(password, 10);

    // Revenue protection guardrail:
    // All fresh registrations start FREE unless an explicit post-create verifier
    // (invite token/promo/payment webhook) upgrades them.
    const resolvedTier = 'FREE';

    if (requestedTier && requestedTier !== 'FREE') {
      emitAdminLiveEvent({
        type: 'alert',
        message: `[${new Date().toLocaleTimeString()}] 🚫 Blocked premium tier assignment at signup (${requestedTier}) for ${email}`,
        meta: {
          email,
          requestedTier,
          hasInviteToken: Boolean(parsed.inviteToken),
          hasPromoCode: Boolean(parsed.promoCode),
          hasPaymentToken: Boolean(parsed.paymentToken),
        },
      });
    }

    // Create user with first role as primary (legacy compatibility)
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        displayName: displayName || email.split('@')[0],
        role: platformRoles[0].toUpperCase() as any,
        activeRole: platformRoles[0].toUpperCase() as any,
        tier: resolvedTier
      }
    });

    // Create UserRole records for all selected roles
    await Promise.all(platformRoles.map(role =>
      prisma.userRole.create({
        data: {
          userId: user.id,
          role: role.toUpperCase() as any,
        }
      }).catch(err => {
        if (err.code === 'P2002') {
          // Unique constraint — role already assigned (no-op)
          return;
        }
        throw err;
      })
    ));

    const userAgent = req.headers.get('user-agent') ?? '';
    const { sessionId, sessionToken } = createSession(user.id, user.role, clientIp, userAgent);

    const name = displayName || user.displayName || email.split('@')[0];
    const hasPerformerRole = platformRoles.includes('artist') || platformRoles.includes('performer');

    // Create performer types if PERFORMER role selected
    if (hasPerformerRole) {
      const performerTypes = Array.isArray(parsed.performerTypes)
        ? parsed.performerTypes.filter((t): t is string => typeof t === 'string' && t.trim().length > 0).slice(0, 15)
        : [];
      // UI labels don't map 1:1 onto the PerformerType enum (no naive
      // .toUpperCase() — "Spoken Word" -> "SPOKEN WORD" isn't a valid enum
      // value, and "Musician" has no generic equivalent). Unmapped labels
      // fall back to OTHER instead of throwing and failing the whole signup.
      const PERFORMER_TYPE_MAP: Record<string, string> = {
        RAPPER: 'RAPPER', SINGER: 'SINGER', DJ: 'DJ', PRODUCER: 'PRODUCER',
        COMEDIAN: 'COMEDIAN', DANCER: 'DANCER', ACTOR: 'ACTOR', BAND: 'BAND',
        MAGICIAN: 'MAGICIAN', 'SPOKEN WORD': 'SPOKEN_WORD', MUSICIAN: 'OTHER',
        OTHER: 'OTHER', GUITARIST: 'GUITARIST', DRUMMER: 'DRUMMER',
        ORCHESTRA: 'ORCHESTRA', CHOIR: 'CHOIR',
      };
      await Promise.all(performerTypes.map(type =>
        prisma.userPerformerType.create({
          data: {
            userId: user.id,
            type: (PERFORMER_TYPE_MAP[type.toUpperCase()] ?? 'OTHER') as any,
          }
        }).catch(err => {
          if (err.code === 'P2002') return; // Already assigned
          throw err;
        })
      ));

      // Also create ArtistProfile for backwards compatibility
      await prisma.artistProfile.create({
        data: { userId: user.id, skills: performerTypes },
      }).catch((err) => console.error('[register] ArtistProfile create failed', err));
    }

    // Determine email type based on primary role
    const primaryRole = platformRoles[0];
    const emailType = (primaryRole === 'artist' || primaryRole === 'performer') ? 'welcome_artist'
      : primaryRole === 'sponsor' ? 'sponsor_confirmation'
      : primaryRole === 'venue' ? 'welcome_venue'
      : primaryRole === 'advertiser' ? 'welcome_advertiser'
      : primaryRole === 'promoter' ? 'welcome_promoter'
      : 'welcome_fan';
    const emailData: Record<string, unknown> = { name, slug: user.id };
    if (primaryRole === 'venue') { emailData.venueName = name; emailData.venueSlug = user.id; }
    if (primaryRole === 'sponsor') {
      emailData.sponsorName = name;
      emailData.packageName = 'Standard';
      emailData.monthlyBudget = '0';
      emailData.activeUntil = 'Pending';
      emailData.repEmail = 'sponsors@themusiciansindex.com';
    }
    const sendWelcomeEmailWithRetry = async () => {
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
    };

    void sendWelcomeEmailWithRetry().catch((e) => {
      emitAdminLiveEvent({
        type: 'alert',
        message: `[${new Date().toLocaleTimeString()}] ⚠️ Welcome email exception: ${email} (${emailType})`,
        meta: { userId: user.id, email, emailType, error: String(e) },
      });
      console.error('[TMI register email] exception', e);
    });

    let effectiveTier: 'FREE' | 'DIAMOND' = 'FREE';

    if (parsed.inviteToken) {
      const invite = DiamondInviteEngine.getInvite(parsed.inviteToken);
      const normalizedInviteEmail = invite?.email?.toLowerCase();
      const inviteAliases = (invite?.emailAliases ?? []).map((a) => a.toLowerCase());
      const inviteMatchesEmail = normalizedInviteEmail === email || inviteAliases.includes(email);

      const redeemed = inviteMatchesEmail
        ? await DiamondInviteEngine.validateAndRedeem(parsed.inviteToken, user.id)
        : false;

      if (redeemed) {
        await prisma.user.update({ where: { id: user.id }, data: { tier: 'DIAMOND' } });
        effectiveTier = 'DIAMOND';
      } else {
        emitAdminLiveEvent({
          type: 'alert',
          message: `[${new Date().toLocaleTimeString()}] 🚫 Invalid diamond invite usage blocked for ${email}`,
          meta: {
            email,
            inviteToken: parsed.inviteToken,
            inviteMatchesEmail,
          },
        });
      }
    }

    if (parsed.ref) {
      try {
        registerArrival(parsed.ref, user.id);
        const refResult = qualifyReferral(parsed.ref, user.id, 999, 1);
        if (refResult.qualified && refResult.milestoneBonus > 0) {
          const link = resolveToken(parsed.ref);
          if (link) {
            const owner = await prisma.user.findUnique({ where: { id: link.ownerId } });
            if (owner) await prisma.user.update({ where: { id: owner.id }, data: { tier: 'GOLD' } });
          }
        }
      } catch (refErr) {
        console.error('[TMI register] referral bonus failed (non-fatal):', refErr);
      }
    }

    const response = NextResponse.json(
      { ok: true, userId: user.id, user: { id: user.id, email: user.email, tier: effectiveTier, role: user.role, roles: platformRoles } },
      { status: 201 }
    );

    response.cookies.set('tmi_session_id', sessionId, COOKIE_OPTS);
    response.cookies.set('tmi_session', sessionToken, COOKIE_OPTS);
    response.cookies.set('tmi_role', user.role, COOKIE_OPTS);
    response.cookies.set('tmi_roles', JSON.stringify(platformRoles), COOKIE_OPTS);  // All roles
    response.cookies.set('tmi_tier', effectiveTier, COOKIE_OPTS);
    response.cookies.set('tmi_user_email', email, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('[TMI register] error:', err);
    return NextResponse.json(
      { error: 'Registration is temporarily unavailable. Please try again in a moment.' },
      { status: 500 }
    );
  }
}
