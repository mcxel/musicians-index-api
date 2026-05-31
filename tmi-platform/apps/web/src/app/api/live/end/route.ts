export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

interface EndBody {
  streamId: string;
}

// In-memory session store — replace with DB in production
// Maps streamId → startedAt (epoch ms)
const activeSessions = new Map<string, number>();

export async function POST(req: NextRequest) {
  let body: Partial<EndBody>;
  try {
    body = await req.json() as Partial<EndBody>;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const { streamId } = body;

  if (!streamId) {
    return NextResponse.json({ ok: false, error: 'streamId is required' }, { status: 400 });
  }

  const endedAt   = Date.now();
  const startedAt = activeSessions.get(streamId) ?? endedAt - 60_000; // fallback: assume 1 min
  const duration  = Math.round((endedAt - startedAt) / 1000); // seconds
  const peakViewers = Math.floor(Math.random() * 50) + 1; // simulated — replace with real tracking

  activeSessions.delete(streamId);

  console.log('[live/end] Stream ended:', { streamId, duration, peakViewers, endedAt: new Date(endedAt).toISOString() });

  // TODO: persist to DB — e.g.
  // await prisma.liveSession.update({
  //   where: { id: streamId },
  //   data:  { isLive: false, endedAt: new Date(endedAt), duration, peakViewers }
  // });

  return NextResponse.json({
    ok:          true,
    duration,
    peakViewers,
    endedAt:     new Date(endedAt).toISOString(),
  });
}
