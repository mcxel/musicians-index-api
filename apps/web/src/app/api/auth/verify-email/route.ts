export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { verifyAndClaimEmailAddress } from '@/lib/auth/EmailVerificationEngine';

export async function POST(req: NextRequest) {
  let body: { token?: string; email?: string } = {};
  try { body = await req.json(); } catch { }

  const { token, email } = body;
  if (!token || !email) {
    return NextResponse.json({ ok: false, reason: 'missing' }, { status: 400 });
  }

  try {
    const result = await verifyAndClaimEmailAddress(email, token);
    if (!result.ok) {
      const status = result.reason === 'profile_provision_failed' ? 503 : 400;
      return NextResponse.json({ ok: false, reason: result.reason }, { status });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, reason: 'verification_unavailable' }, { status: 503 });
  }
}

// Support GET for email client links: /api/auth/verify-email?token=...&email=...
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const token = searchParams.get('token') ?? '';
  const email = searchParams.get('email') ?? '';

  if (!token || !email) {
    return NextResponse.redirect(new URL('/auth/verify-email/invalid?reason=missing', req.url));
  }

  try {
    const result = await verifyAndClaimEmailAddress(email, token);
    if (!result.ok) {
      return NextResponse.redirect(new URL(`/auth/verify-email/invalid?reason=${result.reason}`, req.url));
    }
    return NextResponse.redirect(new URL('/auth/verify-email/success', req.url));
  } catch {
    return NextResponse.redirect(new URL('/auth/verify-email/invalid?reason=verification_unavailable', req.url));
  }
}
