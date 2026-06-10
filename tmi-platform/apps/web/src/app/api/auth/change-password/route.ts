export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { dbReady, loginUser, updateUserPassword } from '@/lib/auth/UserStore';
import { checkRateLimit } from '@/lib/security/TMISecurityEngine';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const limit = checkRateLimit(`auth:change-pw:${ip}`, 5, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ ok: false, error: 'Too many attempts — wait a minute.' }, { status: 429 });
  }

  const email = req.cookies.get('tmi_user_email')?.value;
  const sessionId = req.cookies.get('tmi_session_id')?.value;
  if (!sessionId || !email) {
    return NextResponse.json({ ok: false, error: 'Not authenticated' }, { status: 401 });
  }

  let body: { currentPassword?: string; newPassword?: string };
  try { body = await req.json() as typeof body; } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
  }

  const { currentPassword, newPassword } = body;
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 });
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ ok: false, error: 'Password must be at least 8 characters.' }, { status: 400 });
  }

  await dbReady;
  const verified = loginUser(email, currentPassword);
  if (!verified) {
    return NextResponse.json({ ok: false, error: 'Current password is incorrect.' }, { status: 401 });
  }

  const updated = updateUserPassword(email, newPassword);
  if (!updated) {
    return NextResponse.json({ ok: false, error: 'Update failed.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
