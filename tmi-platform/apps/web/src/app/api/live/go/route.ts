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
  getSession,
  getSessionsByCategory,
  type GoLivePayload,
  type LivePingPayload,
} from '@/lib/broadcast/GlobalLiveSessionRegistry';
import { seedRoomWithBots } from '@/lib/live/audienceRuntimeEngine';
import { botCrowdFillEngine } from '@/lib/live/BotCrowdFillEngine';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

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

  // ── Atomic Discovery Emitter (Rule: Session Exists AND Discovery Tile Exists = PUBLIC) ──
  // Read the session back through the exact same paths every discovery wall uses
  // (getSession, getSessionsByCategory). If it isn't actually retrievable there,
  // the registry write is rolled back and the request fails — "live but
  // undiscoverable" is treated as a runtime failure, not a partial success.
  const verifiedSession = getSession(userId);
  const discoverableInCategory = getSessionsByCategory(session.category).some((s) => s.userId === userId);
  if (!verifiedSession || !discoverableInCategory) {
    endLiveSession(userId);
    console.error('[api/live/go] RUNTIME_FAIL: session registered but not discoverable', { userId, category: session.category });
    return NextResponse.json(
      { ok: false, error: 'Could not verify your stream is discoverable. Please try going live again.', code: 'RUNTIME_FAIL', reason: 'discovery_tile_not_verified' },
      { status: 409 },
    );
  }

  // Persist live state to DB so serverless cold starts don't drop the session
  await prisma.user.updateMany({
    where: { OR: [{ id: userId }, { userRef: userId }] },
    data: {
      isLive:       true,
      liveRoomId:   session.roomId,
      liveGenre:    session.category,
      liveStartedAt: new Date(),
    },
  }).catch(() => {});

  // Auto-seed 20 bots into the room so performer never sees an empty venue
  seedRoomWithBots(session.roomId, 20);

  // Wire BotCrowdFillEngine: activate progressive fill (Rule 15 — 92% max, fill if real audience < 5)
  // and start periodic bot activity (reactions, state changes every 8s).
  botCrowdFillEngine.activate({
    roomId: session.roomId,
    minimumFillRatio: 0.4,
    minimumRealThreshold: 5,
    maxBotCount: 92, // 92% of a 100-seat room — Rule 15 hard cap
  });
  botCrowdFillEngine.startActivity(session.roomId);

  return NextResponse.json({ ok: true, session }, { status: 200 });
}

export async function DELETE(req: NextRequest) {
  const userId = await sessionUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Look up the session before ending it so we can deactivate the correct roomId
  const session = getSession(userId);
  endLiveSession(userId);

  // Stop bot activity for this room
  if (session?.roomId) {
    botCrowdFillEngine.deactivate(session.roomId);
  }

  // Clear DB live state so the billboard stops showing this performer
  await prisma.user.updateMany({
    where: { OR: [{ id: userId }, { userRef: userId }] },
    data: { isLive: false, liveRoomId: null, liveGenre: null, liveStartedAt: null },
  }).catch(() => {});

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
      roomId:      s.roomId,
      avatarUrl:   s.avatarUrl ?? undefined,
      accentColor: s.accentColor,
    }));
    return NextResponse.json({ sessions, live, count: sessions.length });
  } catch (err) {
    console.error('[api/live/go] GET error:', err);
    return NextResponse.json({ sessions: [], live: [], count: 0 });
  }
}
