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

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sanitizeUrl(input: string): string {
  if (!input) return 'https://themusiciansindex.com';
  if (/^https?:\/\/[a-zA-Z0-9.-]+(?:\:[0-9]+)?(?:\/.*)?$/.test(input)) return input;
  return 'https://themusiciansindex.com';
}

function parseBoolean(value: string | undefined, fallback = false): boolean {
  if (!value) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
}

function parseAllowedOrigins(raw: string | undefined): Set<string> {
  const origins = (raw || '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
    .map((v) => {
      try {
        const origin = new URL(v).origin;
        return origin.toLowerCase();
      } catch {
        return null;
      }
    })
    .filter((v): v is string => !!v);

  return new Set(origins);
}

function isAllowedOrigin(req: NextRequest, allowed: Set<string>): boolean {
  const origin = req.headers.get('origin')?.trim().toLowerCase();
  if (!origin) return false;
  if (allowed.has(origin)) return true;

  const host = req.headers.get('host')?.trim().toLowerCase();
  const xfHost = req.headers.get('x-forwarded-host')?.split(',')[0]?.trim().toLowerCase();
  if (host && origin === `https://${host}`) return true;
  if (xfHost && origin === `https://${xfHost}`) return true;
  return false;
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
  const name = escapeHtml(String(data.name ?? 'there')).slice(0, 80);
  const link = sanitizeUrl(String(data.link ?? 'https://themusiciansindex.com')).slice(0, 300);
  const eventName = escapeHtml(String(data.event ?? 'the event')).slice(0, 120);
  const reference = escapeHtml(String(data.ref ?? 'N/A')).slice(0, 120);
  const message = escapeHtml(String(data.message ?? 'You have a new notification from TMI.')).slice(0, 500);

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
        html: `<h1 style="color:#AA2DFF">Your Ticket</h1><p>Hi ${name}, your ticket for <strong>${eventName}</strong> is confirmed.</p><p>Reference: <code>${reference}</code></p>`,
        text: `Hi ${name}, your ticket for ${eventName} is confirmed. Reference: ${reference}`,
      };
    case 'notification':
      return {
        html: `<p style="color:#fff">${message}</p>`,
        text: message,
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
  const internalEmailKey = process.env.INTERNAL_EMAIL_API_KEY?.trim();
  const headerKey = req.headers.get('x-tmi-email-key')?.trim();
  const strictMode = parseBoolean(process.env.EMAIL_API_STRICT_MODE, false);
  const requireInternalKey = parseBoolean(process.env.EMAIL_API_REQUIRE_INTERNAL_KEY, false);
  const allowedOrigins = parseAllowedOrigins(process.env.EMAIL_API_ALLOWED_ORIGINS);

  const hasValidInternalKey = !!internalEmailKey && !!headerKey && headerKey === internalEmailKey;
  if (!!internalEmailKey && !hasValidInternalKey) {
    return NextResponse.json({ ok: false, error: 'Unauthorized email dispatch' }, { status: 401 });
  }

  if ((requireInternalKey || (strictMode && !!internalEmailKey)) && !hasValidInternalKey) {
    return NextResponse.json({ ok: false, error: 'Unauthorized email dispatch' }, { status: 401 });
  }

  // Browser-origin traffic must come from an approved origin in strict mode.
  if (strictMode && !hasValidInternalKey && !isAllowedOrigin(req, allowedOrigins)) {
    return NextResponse.json({ ok: false, error: 'Origin not allowed for email dispatch' }, { status: 403 });
  }

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
