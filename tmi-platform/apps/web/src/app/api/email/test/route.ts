export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { EmailProviderEngine } from '@/lib/email/EmailProviderEngine';

const ALLOWED_ADMIN_EMAILS = new Set(['berntmusic33@gmail.com']);

function buildTestHtml(to: string): string {
  return `
    <div style="background:#060410;color:#fff;font-family:sans-serif;padding:32px;max-width:560px;margin:0 auto;border-radius:12px">
      <div style="text-align:center;margin-bottom:24px">
        <span style="font-size:32px;font-weight:900;letter-spacing:0.06em;color:#00FFFF">TMI</span>
        <span style="font-size:12px;color:rgba(255,255,255,0.4);display:block;letter-spacing:0.25em;margin-top:4px">THE MUSICIANS INDEX</span>
      </div>
      <h2 style="color:#FFD700;font-size:20px;margin:0 0 12px">📧 Email System Active</h2>
      <p style="color:rgba(255,255,255,0.8);line-height:1.6;margin:0 0 20px">
        This is a live test email confirming that <strong style="color:#00FFFF">Resend</strong> delivery is working correctly for the TMI platform.
      </p>
      <div style="background:rgba(0,255,255,0.06);border:1px solid rgba(0,255,255,0.2);border-radius:8px;padding:16px;margin:0 0 20px">
        <div style="font-size:11px;color:rgba(255,255,255,0.4);letter-spacing:0.15em;margin-bottom:8px">DELIVERY TARGET</div>
        <div style="font-size:14px;color:#00FFFF;font-weight:700">${to}</div>
      </div>
      <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:0">
        Sent ${new Date().toUTCString()} · TMI Admin Email Command
      </p>
    </div>
  `;
}

export async function POST(req: NextRequest) {
  const jar = cookies();
  const sessionId = jar.get('tmi_session_id')?.value;
  const role      = jar.get('tmi_role')?.value;
  const email     = jar.get('tmi_user_email')?.value ?? '';

  if (!sessionId) {
    return NextResponse.json({ ok: false, error: 'Not authenticated' }, { status: 401 });
  }
  if (role !== 'ADMIN' && !ALLOWED_ADMIN_EMAILS.has(email)) {
    return NextResponse.json({ ok: false, error: 'Admin only' }, { status: 403 });
  }

  let body: { to?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ ok: false, error: 'Invalid body' }, { status: 400 });
  }

  const to = body.to?.trim();
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return NextResponse.json({ ok: false, error: 'Valid `to` email required' }, { status: 400 });
  }

  const result = await EmailProviderEngine.sendAsync({
    to,
    subject: '✅ TMI Email System — Live Test',
    html:    buildTestHtml(to),
    text:    `TMI Email System — Live Test\n\nThis confirms email delivery is active for ${to}.\n\nSent: ${new Date().toUTCString()}`,
    tags:    ['admin-test'],
  });

  if (!result.success) {
    return NextResponse.json({ ok: false, error: result.error ?? 'Send failed', provider: result.provider }, { status: 502 });
  }

  return NextResponse.json({
    ok:         true,
    id:         result.externalId,
    provider:   result.provider,
    devMode:    result.devMode ?? false,
    sentAt:     result.sentAt,
  });
}
