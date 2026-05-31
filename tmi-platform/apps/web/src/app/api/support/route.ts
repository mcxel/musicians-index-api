export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/TmiEmailService';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SupportBody {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Simple in-memory rate limiter — resets on cold start
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 5;

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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';

  if (isRateLimited(ip)) {
    return NextResponse.json({ ok: false, error: 'Too many requests. Try again later.' }, { status: 429 });
  }

  let body: Partial<SupportBody>;
  try {
    body = await req.json() as Partial<SupportBody>;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const { name, email, subject, message } = body;

  if (!name || typeof name !== 'string' || name.trim().length < 1) {
    return NextResponse.json({ ok: false, error: 'Name is required' }, { status: 400 });
  }
  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ ok: false, error: 'Valid email is required' }, { status: 400 });
  }
  if (!subject || typeof subject !== 'string' || subject.trim().length < 1) {
    return NextResponse.json({ ok: false, error: 'Subject is required' }, { status: 400 });
  }
  if (!message || typeof message !== 'string' || message.trim().length < 10) {
    return NextResponse.json({ ok: false, error: 'Message must be at least 10 characters' }, { status: 400 });
  }

  const safeName    = escapeHtml(name.trim().slice(0, 100));
  const safeEmail   = escapeHtml(email.trim().slice(0, 254));
  const safeSubject = escapeHtml(subject.trim().slice(0, 200));
  const safeMessage = escapeHtml(message.trim().slice(0, 2000));

  const supportTo = process.env.TEAM_EMAIL ?? 'support@themusiciansindex.com';

  const html = `
    <div style="font-family:Arial,sans-serif;background:#0A0A0F;color:#E0E0E0;padding:24px;border-radius:8px;">
      <h2 style="color:#00FFFF;margin:0 0 16px;">TMI Support Request</h2>
      <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:8px 16px 8px 0;color:#888;font-size:13px;white-space:nowrap;vertical-align:top;">From</td>
          <td style="padding:8px 0;color:#E0E0E0;font-size:15px;">${safeName} &lt;${safeEmail}&gt;</td>
        </tr>
        <tr>
          <td style="padding:8px 16px 8px 0;color:#888;font-size:13px;white-space:nowrap;vertical-align:top;">Subject</td>
          <td style="padding:8px 0;color:#E0E0E0;font-size:15px;font-weight:700;">${safeSubject}</td>
        </tr>
        <tr>
          <td style="padding:8px 16px 8px 0;color:#888;font-size:13px;white-space:nowrap;vertical-align:top;">Message</td>
          <td style="padding:8px 0;color:#E0E0E0;font-size:15px;line-height:1.7;white-space:pre-wrap;">${safeMessage}</td>
        </tr>
      </table>
    </div>
  `;

  const result = await sendEmail({
    to:      supportTo,
    subject: `[TMI Support] ${safeSubject} — from ${safeName}`,
    html,
    replyTo: email.trim(),
  });

  if (!result.ok) {
    console.error('[support/route] Failed to send support email:', result.error);
    return NextResponse.json({ ok: false, error: 'Failed to send support email. Please try again.' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
