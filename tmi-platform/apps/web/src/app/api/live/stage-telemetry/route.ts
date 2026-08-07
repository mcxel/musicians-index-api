import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  getRecentStageEvents,
  getStageEventSummary,
  ingestStageEvent,
  type StageTelemetryEvent,
} from '@/lib/live/stageTelemetryStore';

export async function GET(req: NextRequest) {
  const limitRaw = req.nextUrl.searchParams.get('limit');
  const limit = limitRaw ? Math.min(300, Math.max(1, Number(limitRaw) || 50)) : 50;

  return NextResponse.json({
    summary: getStageEventSummary(),
    events: getRecentStageEvents(limit),
  });
}

export async function POST(req: NextRequest) {
  let body: Partial<StageTelemetryEvent>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { kind, roomId, ts, meta, id } = body;
  if (!kind || !roomId) {
    return NextResponse.json({ error: 'Missing required fields: kind, roomId' }, { status: 400 });
  }

  const event: StageTelemetryEvent = {
    id: typeof id === 'string' && id ? id : `${Date.now()}-api`,
    kind,
    ts: typeof ts === 'number' && Number.isFinite(ts) ? ts : Date.now(),
    roomId,
    meta: meta && typeof meta === 'object' ? (meta as Record<string, unknown>) : {},
  };

  ingestStageEvent(event);
  return NextResponse.json({ received: true, id: event.id });
}
