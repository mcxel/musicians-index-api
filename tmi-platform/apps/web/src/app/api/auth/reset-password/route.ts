export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { completePasswordReset } from '@/lib/auth/PasswordResetCompleteEngine';
import { checkRateLimit } from '@/lib/security/TMISecurityEngine';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const rateLimit = checkRateLimit(`auth:reset-complete:${ip}`, 5, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ ok: false, reason: 'rate_limited' }, { status: 429 });
  }

  let body: { email?: string; token?: string; newPassword?: string; confirmPassword?: string };
  try {
    body = await req.json() as typeof body;
  } catch {
    return NextResponse.json({ ok: false, reason: 'invalid_request' }, { status: 400 });
  }

  const { email, token, newPassword, confirmPassword } = body;
  if (!email || !token || !newPassword || !confirmPassword) {
    return NextResponse.json({ ok: false, reason: 'missing_fields' }, { status: 400 });
  }

  const result = completePasswordReset({
    email: email.trim().toLowerCase(),
    token,
    newPassword,
    confirmPassword,
    ip,
    userAgent: req.headers.get('user-agent') ?? undefined,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, reason: result.reason }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
