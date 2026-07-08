export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { completePasswordReset } from '@/lib/auth/PasswordResetCompleteEngine';
import {
  validatePasswordResetTokenFromDB,
  consumePasswordResetTokenFromDB,
} from '@/lib/auth/PasswordResetTokenEngine';
import { checkRateLimit } from '@/lib/security/TMISecurityEngine';
import { updateUserPassword } from '@/lib/auth/UserStore';
import prisma from '@/lib/prisma';

/** GET /api/auth/reset-password?token=X&email=Y
 * Token pre-flight — validates without consuming, so the page knows
 * whether to show the form or the "expired" state immediately.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const token = searchParams.get('token') ?? '';
  const email = searchParams.get('email')?.trim().toLowerCase() ?? '';

  if (!token || !email) {
    return NextResponse.json({ valid: false, reason: 'missing_fields' });
  }

  try {
    const check = await validatePasswordResetTokenFromDB({ email, token });
    if (check.valid) return NextResponse.json({ valid: true });
    const reason =
      check.reason === 'expired' ? 'expired_token'
      : check.reason === 'used'  ? 'used_token'
      : 'invalid_token';
    return NextResponse.json({ valid: false, reason });
  } catch {
    // If DB is unavailable, allow the form to render — POST will catch it
    return NextResponse.json({ valid: true, warning: 'db_unavailable' });
  }
}

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
  if (newPassword !== confirmPassword) {
    return NextResponse.json({ ok: false, reason: 'password_mismatch' }, { status: 400 });
  }

  const cleanEmail = email.trim().toLowerCase();

  // Try in-memory path first (warm instance — same serverless node that issued the token)
  const inMemoryResult = completePasswordReset({
    email: cleanEmail,
    token,
    newPassword,
    confirmPassword,
    ip,
    userAgent: req.headers.get('user-agent') ?? undefined,
  });

  let resetOk = inMemoryResult.ok;
  let resetReason = inMemoryResult.reason;

  // Fallback: if in-memory token not found, try Prisma (cold-start / cross-instance scenario)
  if (!resetOk && resetReason === 'invalid_token') {
    const dbCheck = await validatePasswordResetTokenFromDB({ email: cleanEmail, token });
    if (dbCheck.valid) {
      const consumed = await consumePasswordResetTokenFromDB({ email: cleanEmail, token });
      if (consumed) {
        resetOk = true;
        resetReason = undefined;
        // Write password to UserStore
        updateUserPassword(cleanEmail, newPassword);
      } else {
        resetReason = 'used_token';
      }
    } else {
      resetReason =
        dbCheck.reason === 'expired' ? 'expired_token'
        : dbCheck.reason === 'used' ? 'used_token'
        : 'invalid_token';
    }
  }

  if (!resetOk) {
    return NextResponse.json({ ok: false, reason: resetReason }, { status: 400 });
  }

  // Write bcrypt hash to Prisma so login works after cold starts
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
