export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sendEmail } from '@/lib/email/TMIEmailSystem';
import type { EmailType } from '@/lib/email/TMIEmailSystem';

const ALLOWED_ADMIN_EMAILS = new Set(['berntmusic33@gmail.com']);

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

  let body: { to?: string; type?: string; data?: Record<string, unknown> };
  try { body = await req.json(); } catch {
    return NextResponse.json({ ok: false, error: 'Invalid body' }, { status: 400 });
  }

  const to = body.to?.trim();
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return NextResponse.json({ ok: false, error: 'Valid `to` email required' }, { status: 400 });
  }

  const type = body.type as EmailType | undefined;
  if (!type) {
    return NextResponse.json({ ok: false, error: '`type` required' }, { status: 400 });
  }

  const result = await sendEmail({ to, type, data: body.data ?? {} });

  if (!result.success) {
    return NextResponse.json({ ok: false, error: result.error ?? 'Send failed' }, { status: 502 });
  }

  return NextResponse.json({ ok: true, id: result.messageId });
}
