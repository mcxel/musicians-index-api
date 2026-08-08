export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  getActiveSessions,
  endLiveSession,
} from '@/lib/broadcast/globalLiveSessionStore';
import { ensureHydrated, removeSessionNow } from '@/lib/broadcast/GlobalLiveSessionRegistry.server';

interface EndBody {
  streamId: string;
  userId?: string;
}

export async function POST(req: NextRequest) {
  let body: Partial<EndBody>;
  try {
    body = await req.json() as Partial<EndBody>;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const { streamId, userId } = body;
  if (!streamId) {
    return NextResponse.json({ ok: false, error: 'streamId is required' }, { status: 400 });
  }

  await ensureHydrated();
  const sessions = getActiveSessions();
  const session =
    sessions.find((s) => s.roomId === streamId) ??
    (userId ? sessions.find((s) => s.userId === userId) : undefined);

  const endedAt = Date.now();
  const startedAt = session?.startedAt ?? endedAt;
  const duration = Math.max(0, Math.round((endedAt - startedAt) / 1000));
  const peakViewers = session?.viewerCount ?? 0;

  if (session) {
    endLiveSession(session.userId);
    await removeSessionNow(session.userId).catch(() => {});
  }

  return NextResponse.json({
    ok: true,
    duration,
    peakViewers,
    endedAt: new Date(endedAt).toISOString(),
  });
}
