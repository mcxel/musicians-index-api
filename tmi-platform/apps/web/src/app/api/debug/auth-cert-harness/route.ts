export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { issuePasswordResetToken } from '@/lib/auth/PasswordResetTokenEngine';
import { issueEmailVerificationToken } from '@/lib/auth/EmailVerificationEngine';

type HarnessFlow = 'reset' | 'verify' | 'both';

function isAuthorized(req: NextRequest): boolean {
  if (process.env.NODE_ENV !== 'development') return false;

  const configuredKey = process.env.CERTIFICATION_HARNESS_KEY?.trim();
  const providedKey = req.headers.get('x-certification-key')?.trim();
  if (configuredKey) return providedKey === configuredKey;

  // Fallback for local runs when key is not configured.
  const localBypass = req.headers.get('x-certification-local') === 'true';
  const host = req.nextUrl.hostname;
  return localBypass && (host === 'localhost' || host === '127.0.0.1');
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, reason: 'forbidden' }, { status: 403 });
  }

  let body: { email?: string; flow?: HarnessFlow } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, reason: 'invalid_request' }, { status: 400 });
  }

  const email = (body.email ?? '').trim().toLowerCase();
  const flow: HarnessFlow = body.flow ?? 'both';

  if (!email || !flow) {
    return NextResponse.json({ ok: false, reason: 'missing_fields' }, { status: 400 });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';
  const userAgent = req.headers.get('user-agent') ?? 'certification-harness';

  const payload: {
    ok: true;
    email: string;
    expiresAt: { reset?: number; verify?: number };
    tokens: { reset?: string; verify?: string };
  } = {
    ok: true,
    email,
    expiresAt: {},
    tokens: {},
  };

  if (flow === 'reset' || flow === 'both') {
    const issued = issuePasswordResetToken({ email, ip, userAgent });
    payload.tokens.reset = issued.token;
    payload.expiresAt.reset = issued.record.expiresAt;
  }

  if (flow === 'verify' || flow === 'both') {
    const issued = issueEmailVerificationToken(email);
    payload.tokens.verify = issued.token;
    payload.expiresAt.verify = issued.expiresAt;
  }

  return NextResponse.json(payload, {
    status: 200,
    headers: {
      'cache-control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      pragma: 'no-cache',
      expires: '0',
    },
  });
}
