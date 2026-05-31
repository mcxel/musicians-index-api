export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

interface StartBody {
  title:       string;
  roomId:      string;
  performerId: string;
}

function generateStreamId(): string {
  return `stream-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function generateRtmpKey(): string {
  return `rtmp-${Math.random().toString(36).slice(2, 18)}-${Math.random().toString(36).slice(2, 18)}`;
}

export async function POST(req: NextRequest) {
  let body: Partial<StartBody>;
  try {
    body = await req.json() as Partial<StartBody>;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const { title, roomId, performerId } = body;

  if (!performerId) {
    return NextResponse.json({ ok: false, error: 'performerId is required' }, { status: 400 });
  }

  const streamId = generateStreamId();
  const rtmpKey  = generateRtmpKey();
  const startedAt = new Date().toISOString();

  // Log stream start — replace with DB write in production
  console.log('[live/start] Stream started:', { streamId, performerId, roomId, title, startedAt });

  // TODO: persist to DB — e.g.
  // await prisma.liveSession.create({
  //   data: { id: streamId, performerId, roomId, title, startedAt, isLive: true }
  // });

  return NextResponse.json({
    ok:       true,
    streamId,
    rtmpKey,
    startedAt,
    room:     roomId ?? 'default',
  });
}
