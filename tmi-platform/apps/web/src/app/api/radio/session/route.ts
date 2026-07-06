/**
 * GET  /api/radio/session — current Stream & Win session state (real counts only)
 * POST /api/radio/session — join the waiting room { submitterId, submissionId, title }
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  getRadioSessionState,
  joinRadioWaitingRoom,
  hasJoinedRadioSession,
} from '@/lib/radio/RadioSessionEngine';
import { checkRateLimit } from '@/lib/security/TMISecurityEngine';

function clientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}

export async function GET(req: NextRequest) {
  const rl = checkRateLimit(`${clientIp(req)}:radio-session`, 60, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }
  const { searchParams } = new URL(req.url);
  const submitterId = searchParams.get('submitterId') ?? '';
  const state = getRadioSessionState();
  return NextResponse.json({
    ...state,
    joined: submitterId ? hasJoinedRadioSession(submitterId) : false,
  });
}

export async function POST(req: NextRequest) {
  const rl = checkRateLimit(`${clientIp(req)}:radio-session`, 20, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { submitterId, submissionId, title } = body as {
    submitterId?: string;
    submissionId?: string;
    title?: string;
  };

  if (!submitterId || typeof submitterId !== 'string') {
    return NextResponse.json({ error: 'submitterId is required' }, { status: 400 });
  }
  if (!submissionId || typeof submissionId !== 'string') {
    return NextResponse.json({ error: 'submissionId is required' }, { status: 400 });
  }

  const result = joinRadioWaitingRoom({
    submitterId,
    submissionId,
    title: typeof title === 'string' ? title : 'Untitled',
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ...result.state, joined: true }, { status: 200 });
}
