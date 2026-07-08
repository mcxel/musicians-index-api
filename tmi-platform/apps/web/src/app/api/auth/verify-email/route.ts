export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { verifyEmailToken, verifyEmailTokenFromDB } from '@/lib/auth/EmailVerificationEngine';
import prisma from '@/lib/prisma';

async function verifyWithFallback(email: string, token: string) {
  const inMemory = verifyEmailToken(email, token);
  if (inMemory.ok || inMemory.reason === 'expired' || inMemory.reason === 'used') {
    return inMemory;
  }

  // Cross-instance/serverless fallback.
  return verifyEmailTokenFromDB(email, token);
}

export async function POST(req: NextRequest) {
  let body: { token?: string; email?: string } = {};
  try { body = await req.json(); } catch { }

  const { token, email } = body;
  if (!token || !email) {
    return NextResponse.json({ ok: false, reason: 'missing' }, { status: 400 });
  }

  const result = await verifyWithFallback(email, token);
  if (!result.ok) {
    return NextResponse.json({ ok: false, reason: result.reason }, { status: 400 });
  }

  // Mark email as verified in Prisma (fire-and-forget)
  prisma.user.updateMany({
    where: { email: email.trim().toLowerCase() },
    data:  { emailVerified: new Date() },
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}

// Support GET for email client links: /api/auth/verify-email?token=...&email=...
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const token = searchParams.get('token') ?? '';
  const email = searchParams.get('email') ?? '';

  if (!token || !email) {
    return NextResponse.redirect(new URL('/auth/verify-email/invalid?reason=missing', req.url));
  }

  const result = await verifyWithFallback(email, token);
  if (!result.ok) {
    return NextResponse.redirect(new URL(`/auth/verify-email/invalid?reason=${result.reason}`, req.url));
  }

  prisma.user.updateMany({
    where: { email: email.trim().toLowerCase() },
    data:  { emailVerified: new Date() },
  }).catch(() => {});

  return NextResponse.redirect(new URL('/auth/verify-email/success', req.url));
}
