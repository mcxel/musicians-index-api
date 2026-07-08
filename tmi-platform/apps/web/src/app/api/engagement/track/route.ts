import { NextRequest, NextResponse } from 'next/server';
import type { EngagementEvent } from '@/lib/engagement/EngagementRegistry';
import { LogAggregatorSink } from '@/lib/engagement/LogAggregatorSink';

/**
 * POST /api/engagement/track
 *
 * Receives engagement events from HeartButton, FanJoinButton, MomentMark, etc.
 * v1: validates and acknowledges. Logging only — no persistence yet.
 * v2: writes to analytics database (Supabase / Prisma / Redis stream).
 * v3: feeds real-time aggregations to performer analytics dashboard.
 *
 * Rule 20: this endpoint only processes real user actions.
 */

const VALID_ACTIONS = new Set([
  'heart', 'unheart', 'join_fan', 'leave_fan', 'share', 'comment',
  'tip', 'ticket_purchase', 'merch_purchase', 'follow_playlist',
  'save_article', 'watch_live', 'replay', 'booking_inquiry', 'moment_mark',
]);

const VALID_CONTENT_TYPES = new Set([
  'song', 'album', 'video', 'motion_poster', 'article', 'photo',
  'live_performance', 'world_concert', 'magazine_interview', 'fan_creation',
  'merch_item', 'playlist', 'event_replay', 'performer_profile',
]);

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    // Support both JSON body and sendBeacon (text body)
    const text = await req.text();
    body = JSON.parse(text);
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const event = body as Partial<EngagementEvent>;

  // Basic validation
  if (!event.contentId || typeof event.contentId !== 'string') {
    return NextResponse.json({ ok: false, error: 'missing_content_id' }, { status: 400 });
  }
  if (!event.performerId || typeof event.performerId !== 'string') {
    return NextResponse.json({ ok: false, error: 'missing_performer_id' }, { status: 400 });
  }
  if (!event.action || !VALID_ACTIONS.has(event.action)) {
    return NextResponse.json({ ok: false, error: 'invalid_action' }, { status: 400 });
  }
  if (!event.contentType || !VALID_CONTENT_TYPES.has(event.contentType)) {
    return NextResponse.json({ ok: false, error: 'invalid_content_type' }, { status: 400 });
  }

  // Persist via sink. v1 = stdout NDJSON. v2 = DB. v3 = Redis stream.
  // fanId is intentionally excluded — PII must not enter the log layer.
  LogAggregatorSink.write({
    ts: new Date().toISOString(),
    action: event.action,
    contentType: event.contentType,
    contentId: event.contentId,
    performerId: event.performerId,
    source: (event.source as string) ?? null,
    sessionId: event.sessionId ?? null,
    venueId: event.venueId ?? null,
  });

  return NextResponse.json({ ok: true });
}

// sendBeacon fires without CORS preflight, but we keep this for fetch fallback
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
