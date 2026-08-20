/**
 * POST /api/live/go  — register creator as live (writes to GlobalLiveSessionRegistry)
 * DELETE /api/live/go — end broadcast
 * GET  /api/live/go  — list all active live sessions
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  registerLiveSession,
  endLiveSession,
  getSession,
  getSessionsByCategory,
  type GoLivePayload,
  type LivePingPayload,
} from '@/lib/broadcast/globalLiveSessionStore';
import {
  ensureHydrated,
  getActiveSessionsDurable,
  persistSessionNow,
  removeSessionNow,
  pingSessionWithTelemetryPersisted,
} from '@/lib/broadcast/GlobalLiveSessionRegistry.server';
import { getActiveRoomTruthCount } from '@/lib/broadcast/globalLiveSessionStore';
import { seedRoomWithBots } from '@/lib/live/audienceRuntimeEngine';
import { botCrowdFillEngine } from '@/lib/live/BotCrowdFillEngine';
import { prisma } from '@/lib/prisma';
import { ensureAnchorRoomsSeeded, getAnchorDiscoveryRecords, listAnchorLiveRoomRecords } from '@/lib/live/AnchorRoomNetwork';
import { ensureGenreRoomsSeeded, getAllGenreDiscoveryRecords } from '@/lib/live/performerGenreRoomNetwork';
import { assertCreateRoomEntitlement } from '@/lib/subscriptions/assertCreateRoomEntitlement';

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
  let body: Partial<GoLivePayload> & {
    action?: string;
    intent?: string;
    createRoom?: boolean;
  } & LivePingPayload = {};
  try { body = await req.json(); } catch { /* body optional */ }

  // Ping-only (heartbeat from broadcaster) — auth by session id only
  if (body.action === 'ping') {
    const userId = await sessionUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await ensureHydrated();
    pingSessionWithTelemetryPersisted(userId, body);
    return NextResponse.json({ ok: true });
  }

  const isCreateRoomIntent =
    body.intent === 'create-room' || body.createRoom === true;

  let userId: string;
  let displayName: string;

  if (isCreateRoomIntent) {
    // Target 2/3: member CREATE ROOM requires PLATINUM+ (server 403 otherwise)
    const gate = await assertCreateRoomEntitlement(req);
    if (!gate.ok) {
      return NextResponse.json(
        { ok: false, error: gate.error, code: gate.code, tier: gate.tier },
        { status: gate.status },
      );
    }
    userId = gate.userId;
    displayName = body.displayName ?? gate.displayName;
  } else {
    // Go Live / broadcast path — authenticated session only (not the CREATE ROOM gate)
    const uid = await sessionUserId(req);
    if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    userId = uid;
    displayName = body.displayName ?? uid;
  }

  await ensureHydrated();

  const roomId = body.roomId ?? `room-${userId}-${Date.now()}`;

  const session = registerLiveSession({
    userId,
    displayName,
    title:         body.title ?? `${displayName} — Live`,
    category:      body.category ?? 'live',
    roomId,
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

  // Durable persist (User.isLive + FeedItem LIVE_SESSION + RoomSession)
  try {
    await persistSessionNow(session);
  } catch (err) {
    endLiveSession(userId);
    console.error('[api/live/go] persist failed', err);
    return NextResponse.json(
      { ok: false, error: 'Could not persist live session. Please try again.', code: 'PERSIST_FAIL' },
      { status: 503 },
    );
  }

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

  return NextResponse.json({
    ok: true,
    session,
    roomId: session.roomId,
    href: `/live/rooms/${encodeURIComponent(session.roomId)}?from=live-lobby`,
  }, { status: 200 });
}

export async function DELETE(req: NextRequest) {
  const userId = await sessionUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await ensureHydrated();
  // Look up the session before ending it so we can deactivate the correct roomId
  const session = getSession(userId);
  endLiveSession(userId);

  // Stop bot activity for this room
  if (session?.roomId) {
    botCrowdFillEngine.deactivate(session.roomId);
  }

  await removeSessionNow(userId).catch((err) => {
    console.error('[api/live/go] remove persist failed', err);
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}

/**
 * Target 4 SoT — LIVE NOW active-room inventory.
 * sessions = registry-active only (TTL-evicted; no LiveRegistry seeds).
 * count = public truth (dedupe roomId; exclude INVITE_ONLY). Anchors are
 * returned separately and MUST NOT be added into count.
 */
export async function GET() {
  try {
    ensureAnchorRoomsSeeded();
    ensureGenreRoomsSeeded();
    const anchorRecords = getAnchorDiscoveryRecords();
    const genreRecords = getAllGenreDiscoveryRecords();
    const sessions = await getActiveSessionsDurable();
    const count = getActiveRoomTruthCount(sessions);
    // Map to LiveApiEntry shape for MixedLobbyWall and other consumers expecting { live: [] }
    const live = sessions.map((s) => ({
      userId:        s.userId,
      displayName:   s.displayName,
      genre:         s.category,
      role:          'performer' as const,
      viewerCount:   s.viewerCount,
      roomId:        s.roomId,
      avatarUrl:     s.avatarUrl ?? undefined,
      accentColor:   s.accentColor,
      privacy:       s.privacy,
      performerTier: s.performerTier,
    }));
    return NextResponse.json({
      sessions,
      live,
      count,
      anchors: listAnchorLiveRoomRecords(),
      anchorDiscovery: anchorRecords,
      genreDiscovery: genreRecords,
      activeDefinition: {
        source: 'GlobalLiveSessionRegistry.getActiveSessions',
        staleEvictionMs: 120_000,
        publicCountExcludes: ['INVITE_ONLY'],
        dedupeKey: 'roomId',
        neverCounted: ['seedSessions', 'anchors', 'static-/rooms/*', 'stale-db-without-registry'],
      },
    });
  } catch (err) {
    console.error('[api/live/go] GET error:', err);
    return NextResponse.json({
      sessions: [],
      live: [],
      count: 0,
      anchors: [],
      anchorDiscovery: [],
      activeDefinition: {
        source: 'GlobalLiveSessionRegistry.getActiveSessions',
        staleEvictionMs: 120_000,
        publicCountExcludes: ['INVITE_ONLY'],
        dedupeKey: 'roomId',
        neverCounted: ['seedSessions', 'anchors', 'static-/rooms/*', 'stale-db-without-registry'],
      },
    });
  }
}
