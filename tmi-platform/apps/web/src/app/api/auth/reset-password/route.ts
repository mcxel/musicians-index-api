export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { completePasswordReset } from '@/lib/auth/PasswordResetCompleteEngine';
import { checkRateLimit } from '@/lib/security/TMISecurityEngine';
import prisma from '@/lib/prisma';

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

  const cleanEmail = email.trim().toLowerCase();

  const result = completePasswordReset({
    email: cleanEmail,
    token,
    newPassword,
    confirmPassword,
    ip,
    userAgent: req.headers.get('user-agent') ?? undefined,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, reason: result.reason }, { status: 400 });
  }

  // Write bcrypt hash to Prisma so login works after cold starts
  // (UserStore.updateUserPassword writes SHA-256; Prisma login fallback needs bcrypt)
  try {
    const bcryptHash = await hash(newPassword, 12);
    await prisma.user.updateMany({
      where: { email: cleanEmail },
      data: { passwordHash: bcryptHash },
    });
  } catch {
    // Non-fatal: UserStore already has the new password for warm sessions
  }

  return NextResponse.json({ ok: true });
}
