export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  getSession,
  pingSessionWithTelemetry,
  type LivePingPayload,
} from '@/lib/broadcast/GlobalLiveSessionRegistry';
import { prisma } from '@/lib/prisma';

async function sessionUserId(req: NextRequest): Promise<string | null> {
  const email = req.cookies.get('tmi_user_email')?.value;
  if (email) {
    const dbUser = await prisma.user.findUnique({ where: { email }, select: { id: true } }).catch(() => null);
    if (dbUser?.id) return dbUser.id;
  }
  const sessionId = req.cookies.get('tmi_session_id')?.value;
  if (!sessionId) return null;
  return sessionId;
}

export async function POST(req: NextRequest) {
  const userId = await sessionUserId(req);
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
