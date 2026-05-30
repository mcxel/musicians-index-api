/**
 * POST /api/live/go  — register creator as live (writes to GlobalLiveSessionRegistry)
 * DELETE /api/live/go — end broadcast
 * GET  /api/live/go  — list all active live sessions
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  registerLiveSession,
  endLiveSession,
  pingSessionWithTelemetry,
  getAllSessions,
  type GoLivePayload,
  type LivePingPayload,
} from '@/lib/broadcast/GlobalLiveSessionRegistry';
import { seedRoomWithBots } from '@/lib/live/audienceRuntimeEngine';

export const dynamic = 'force-dynamic';

function sessionUserId(req: NextRequest): string | null {
  const sessionId = req.cookies.get('tmi_session_id')?.value;
  if (!sessionId) return null;
  return sessionId.substring(0, 8);
}

export async function POST(req: NextRequest) {
  const userId = sessionUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: Partial<GoLivePayload> & { action?: string } & LivePingPayload = {};
  try { body = await req.json(); } catch { /* body optional */ }

  // Ping-only (heartbeat from broadcaster)
  if (body.action === 'ping') {
    pingSessionWithTelemetry(userId, body);
    return NextResponse.json({ ok: true });
  }

  const session = registerLiveSession({
    userId,
    displayName:   body.displayName ?? userId,
    title:         body.title ?? `${body.displayName ?? userId} — Live`,
    category:      body.category ?? 'live',
    roomId:        body.roomId ?? `room-${userId}`,
    avatarUrl:     body.avatarUrl,
    previewUrl:    body.previewUrl,
    thumbnailUrl:  body.thumbnailUrl,
    privacy:       body.privacy ?? 'PUBLIC',
    entryPriceUsd: body.entryPriceUsd,
    accentColor:   body.accentColor,
    performerTier: body.performerTier,
  });

  // Auto-seed 20 bots into the room so performer never sees an empty venue
  seedRoomWithBots(session.roomId, 20);

  return NextResponse.json({ ok: true, session }, { status: 200 });
}

export async function DELETE(req: NextRequest) {
  const userId = sessionUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  endLiveSession(userId);
  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function GET() {
  try {
    const sessions = getAllSessions();
    // Map to LiveApiEntry shape for MixedLobbyWall and other consumers expecting { live: [] }
    const live = sessions.map((s) => ({
      userId:      s.userId,
      displayName: s.displayName,
      genre:       s.category,
      role:        'performer' as const,
      viewerCount: s.viewerCount,
      avatarUrl:   s.avatarUrl ?? undefined,
      accentColor: s.accentColor,
    }));
    return NextResponse.json({ sessions, live, count: sessions.length });
  } catch (err) {
    console.error('[api/live/go] GET error:', err);
    return NextResponse.json({ sessions: [], live: [], count: 0 });
  }
}
