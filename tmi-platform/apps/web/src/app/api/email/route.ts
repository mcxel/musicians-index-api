export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { EmailProviderEngine } from '@/lib/email/EmailProviderEngine';

// ─── Types ───────────────────────────────────────────────────────────────────

type EmailType = 'welcome' | 'reset' | 'ticket' | 'notification' | 'invite';

interface EmailRequestBody {
  type: EmailType;
  to: string;
  data?: Record<string, unknown>;
}

// ─── Rate limiting (module-level, resets on cold start) ──────────────────────

interface RateBucket {
  count: number;
  windowStart: number;
}

const rateLimitMap = new Map<string, RateBucket>();
const RATE_WINDOW_MS = 60_000; // 1 minute
const RATE_MAX = 10;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const bucket = rateLimitMap.get(ip);
  if (!bucket || now - bucket.windowStart > RATE_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, windowStart: now });
    return false;
  }
  if (bucket.count >= RATE_MAX) return true;
  bucket.count++;
  return false;
}

// ─── Email template builder ───────────────────────────────────────────────────

const EMAIL_SUBJECTS: Record<EmailType, string> = {
  welcome:      'Welcome to TMI — The Musicians Index',
  reset:        'Reset your TMI password',
  ticket:       'Your TMI ticket confirmation',
  notification: 'TMI notification',
  invite:       'You have been invited to TMI',
};

function buildEmailContent(
  type: EmailType,
  data: Record<string, unknown>,
): { html: string; text: string } {
  const name = String(data.name ?? 'there');
  const link = String(data.link ?? 'https://themusiciansindex.com');

  switch (type) {
    case 'welcome':
      return {
        html: `<h1 style="color:#00FFFF">Welcome to TMI, ${name}!</h1><p>Your account is ready. <a href="${link}" style="color:#FF2DAA">Get started</a></p>`,
        text: `Welcome to TMI, ${name}! Get started at ${link}`,
      };
    case 'reset':
      return {
        html: `<h1 style="color:#FFD700">Reset your password</h1><p>Hi ${name}, click below to reset your password:</p><p><a href="${link}" style="color:#FF2DAA">Reset Password</a></p><p>Link expires in 1 hour. If you did not request this, ignore this email.</p>`,
        text: `Hi ${name}, reset your password at ${link}. Expires in 1 hour.`,
      };
    case 'ticket':
      return {
        html: `<h1 style="color:#AA2DFF">Your Ticket</h1><p>Hi ${name}, your ticket for <strong>${String(data.event ?? 'the event')}</strong> is confirmed.</p><p>Reference: <code>${String(data.ref ?? 'N/A')}</code></p>`,
        text: `Hi ${name}, your ticket for ${String(data.event ?? 'the event')} is confirmed. Reference: ${String(data.ref ?? 'N/A')}`,
      };
    case 'notification':
      return {
        html: `<p style="color:#fff">${String(data.message ?? 'You have a new notification from TMI.')}</p>`,
        text: String(data.message ?? 'You have a new notification from TMI.'),
      };
    case 'invite':
      return {
        html: `<h1 style="color:#FF2DAA">You're invited!</h1><p>Hi ${name}, you've been invited to join TMI.</p><p><a href="${link}" style="color:#00FFFF">Accept Invitation</a></p>`,
        text: `Hi ${name}, you've been invited to join TMI. Accept at ${link}`,
      };
  }
}

// ─── Validation ───────────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_TYPES = new Set<EmailType>(['welcome', 'reset', 'ticket', 'notification', 'invite']);

function isValidEmailAddress(email: string): boolean {
  return EMAIL_REGEX.test(email) && email.length <= 254;
}

// ─── POST /api/email ──────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // IP-based rate limiting
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: 'Rate limit exceeded. Try again in a minute.' },
      { status: 429 },
    );
  }

  let body: Partial<EmailRequestBody>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const { type, to, data = {} } = body;

  // Validate type
  if (!type || !VALID_TYPES.has(type)) {
    return NextResponse.json(
      { ok: false, error: `Invalid type. Must be one of: ${[...VALID_TYPES].join(', ')}` },
      { status: 400 },
    );
  }

  // Validate recipient address
  if (!to || !isValidEmailAddress(to)) {
    return NextResponse.json(
      { ok: false, error: 'Invalid or missing email address in `to` field' },
      { status: 400 },
    );
  }

  const subject = EMAIL_SUBJECTS[type];
  const { html, text } = buildEmailContent(type, data ?? {});

  try {
    const result = await EmailProviderEngine.sendAsync({ to, subject, html, text, tags: [type] });

    if (!result.success) {
      console.error('[api/email] Send failed:', result.error);
      return NextResponse.json({ ok: false, error: result.error ?? 'Send failed' }, { status: 502 });
    }

    return NextResponse.json({ ok: true, id: result.externalId });
  } catch (err) {
    console.error('[api/email] Unexpected error:', err);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
