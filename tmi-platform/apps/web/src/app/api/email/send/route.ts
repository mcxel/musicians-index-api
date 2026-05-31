export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/TmiEmailService';
import {
  welcomeEmail,
  battleInviteEmail,
  revenueAlertEmail,
  bookingConfirmEmail,
  passwordResetEmail,
  subscriptionEmail,
  notificationEmail,
} from '@/lib/email/TmiEmailTemplates';
import { getServerSession } from 'next-auth/next';

type TemplateName =
  | 'welcome'
  | 'battle-invite'
  | 'revenue-alert'
  | 'booking-confirm'
  | 'password-reset'
  | 'subscription'
  | 'notification';

interface SendEmailBody {
  to: string;
  template: TemplateName;
  data: Record<string, unknown>;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_TEMPLATES = new Set<TemplateName>([
  'welcome',
  'battle-invite',
  'revenue-alert',
  'booking-confirm',
  'password-reset',
  'subscription',
  'notification',
]);

function buildHtml(template: TemplateName, data: Record<string, unknown>): { subject: string; html: string } {
  const name = String(data.name ?? 'there');

  switch (template) {
    case 'welcome':
      return {
        subject: 'Welcome to TMI — The Musician\'s Index',
        html: welcomeEmail(name, String(data.role ?? 'Member')),
      };
    case 'battle-invite':
      return {
        subject: `Battle Challenge from ${String(data.opponent ?? 'Another Artist')}`,
        html: battleInviteEmail(name, String(data.opponent ?? 'Unknown'), String(data.battleId ?? '')),
      };
    case 'revenue-alert':
      return {
        subject: 'TMI Revenue Alert — You Just Got Paid',
        html: revenueAlertEmail(name, Number(data.amount ?? 0)),
      };
    case 'booking-confirm':
      return {
        subject: `Booking Confirmed — ${String(data.venueName ?? 'TMI Venue')}`,
        html: bookingConfirmEmail(name, String(data.venueName ?? 'TMI Venue'), String(data.date ?? '')),
      };
    case 'password-reset':
      return {
        subject: 'Reset your TMI password',
        html: passwordResetEmail(name, String(data.resetLink ?? 'https://themusiciansindex.com/reset')),
      };
    case 'subscription':
      return {
        subject: `TMI ${String(data.tier ?? 'Subscription')} Activated`,
        html: subscriptionEmail(name, String(data.tier ?? 'Member')),
      };
    case 'notification':
      return {
        subject: String(data.subject ?? 'New notification from TMI'),
        html: notificationEmail(name, String(data.message ?? ''), String(data.link ?? 'https://themusiciansindex.com')),
      };
  }
}

function isAuthorized(req: NextRequest): boolean {
  // Accept internal header from server-side callers
  if (req.headers.get('x-tmi-internal') === 'true') return true;

  // Accept internal email API key if configured
  const internalKey = process.env.INTERNAL_EMAIL_API_KEY;
  if (internalKey && req.headers.get('x-tmi-email-key') === internalKey) return true;

  return false;
}

export async function POST(req: NextRequest) {
  // Allow internal header OR valid session
  const hasInternalAuth = isAuthorized(req);

  if (!hasInternalAuth) {
    // Check for a valid session as fallback
    try {
      const session = await getServerSession();
      if (!session?.user) {
        return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
      }
    } catch {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
  }

  let body: Partial<SendEmailBody>;
  try {
    body = await req.json() as Partial<SendEmailBody>;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const { to, template, data = {} } = body;

  if (!to || !EMAIL_REGEX.test(to)) {
    return NextResponse.json({ ok: false, error: 'Invalid or missing `to` address' }, { status: 400 });
  }

  if (!template || !VALID_TEMPLATES.has(template)) {
    return NextResponse.json(
      { ok: false, error: `Invalid template. Must be one of: ${[...VALID_TEMPLATES].join(', ')}` },
      { status: 400 },
    );
  }

  const { subject, html } = buildHtml(template, data);

  const result = await sendEmail({ to, subject, html });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 502 });
  }

  return NextResponse.json({ ok: true, id: result.id });
}
