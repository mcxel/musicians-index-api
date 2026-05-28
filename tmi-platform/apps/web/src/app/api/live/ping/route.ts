export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  getSession,
  pingSessionWithTelemetry,
  type LivePingPayload,
} from '@/lib/broadcast/GlobalLiveSessionRegistry';

function sessionUserId(req: NextRequest): string | null {
  const sessionId = req.cookies.get('tmi_session_id')?.value;
  if (!sessionId) return null;
  return sessionId.substring(0, 8);
}

export async function POST(req: NextRequest) {
  const userId = sessionUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const session = getSession(userId);
  if (!session) {
    return NextResponse.json({ ok: false, reason: 'session-not-live' }, { status: 404 });
  }

  let body: LivePingPayload = {};
  try {
    body = (await req.json()) as LivePingPayload;
  } catch {
    body = {};
  }

  pingSessionWithTelemetry(userId, body);
  const updated = getSession(userId);

  return NextResponse.json({
    ok: true,
    userId,
    lastPingAt: updated?.lastPingAt ?? Date.now(),
    streamHealth: updated?.streamHealth ?? 'unknown',
  });
}
