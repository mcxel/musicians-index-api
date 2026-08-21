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
import { getTmiAuth } from '@/lib/auth/getTmiAuth';
import { canCreateBattle, canCreateCypher } from '@/lib/subscriptions/BattleCreationGate';
import type { SubscriptionTier } from '@/lib/subscriptions/SubscriptionPricingEngine';
import {
  resolveEventVenueEnvironment,
  type VenueEnvironmentKind,
} from '@/lib/venues/EventVenueEnvironment';
import { mapLivePrivacyToRegistry } from '@/lib/live/liveRoomPrivacyGate';

export const dynamic = 'force-dynamic';

function parseVenueEnvironment(raw: unknown): VenueEnvironmentKind | null {
  const s = String(raw ?? '').toLowerCase().trim();
  if (s === 'indoor' || s === 'outdoor') return s;
  return null;
}

function parseVenueSkinId(raw: unknown): string | null {
  const s = typeof raw === 'string' ? raw.trim() : '';
  return s.length > 0 ? s : null;
}

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

  const miniBody = body as { isMini?: boolean };
  if (miniBody.isMini === true) {
    const cat = String(body.category ?? "").toLowerCase();
    if (cat === "cypher" || cat === "challenge" || cat === "battle") {
      const auth = await getTmiAuth();
      if (!auth) {
        return NextResponse.json({ error: "authentication_required" }, { status: 401 });
      }
      const rawTier = (auth.user.tier || "free").toUpperCase();
      const tier = (rawTier === "RUBY" ? "RUBY" : rawTier.toLowerCase()) as SubscriptionTier;
      const gate = cat === "cypher" ? canCreateCypher(tier) : canCreateBattle(tier);
      if (!gate.allowed) {
        return NextResponse.json({ error: "tier_gate", ...gate }, { status: 403 });
      }
    }
  }

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

  // Normalize show/release categories onto StreamCategory "concert" so discovery
  // + getSessionsByCategory verification succeed (SHOWS & RELEASES wall).
  const rawCategory = String(body.category ?? "live").toLowerCase().replace(/_/g, "-");

  // Rule 21: World Dance Party + Monday Night Stage are bot/platform-only flagship events.
  if (rawCategory === "world-dance-party" || rawCategory === "monday-night-stage") {
    const mini = (body as { isMini?: boolean }).isMini === true;
    if (!mini) {
      return NextResponse.json(
        { error: "flagship_bot_only", message: "Official World/Monday events cannot be created by humans." },
        { status: 403 },
      );
    }
  }

  const category =
    rawCategory === "release-party" ||
    rawCategory === "mini-release" ||
    rawCategory === "world-release" ||
    rawCategory === "mini-concert" ||
    rawCategory === "world-concert" ||
    rawCategory === "live-online-concert" ||
    rawCategory === "concert"
      ? ("concert" as const)
      : ((body.category ?? "live") as import("@/lib/broadcast/globalLiveSessionStore").StreamCategory);

  // Persist indoor|outdoor (+ skin) on the session so joiners without URL params resolve correctly.
  const bodyEnv = parseVenueEnvironment((body as { venueEnvironment?: unknown }).venueEnvironment);
  const bodySkinId = parseVenueSkinId((body as { venueSkinId?: unknown }).venueSkinId);
  const isMini = (body as { isMini?: boolean }).isMini === true;
  let venueEnvironment: VenueEnvironmentKind | null = bodyEnv;
  let venueSkinId: string | null = bodySkinId;
  if (bodyEnv) {
    const kindHint =
      isMini && (rawCategory === "dance-party" || rawCategory === "world-dance-party")
        ? "mini-dance-party"
        : isMini && (rawCategory === "listening" || rawCategory.includes("slow-jam"))
          ? "mini-slow-jam"
          : isMini && rawCategory === "release-party"
            ? "mini-release"
            : isMini && rawCategory === "concert"
              ? "mini-concert"
              : rawCategory === "dance-party"
                ? "world-dance-party"
                : rawCategory === "listening"
                  ? "slow-jams"
                  : rawCategory;
    const resolved = resolveEventVenueEnvironment({
      kind: kindHint,
      environment: bodyEnv,
      skinId: bodySkinId,
    });
    venueEnvironment = resolved.environment;
    venueSkinId = resolved.skinId;
  }

  const session = registerLiveSession({
    userId,
    displayName,
    title:         body.title ?? `${displayName} — Live`,
    category,
    roomId,
    avatarUrl:     body.avatarUrl,
    previewUrl:    body.previewUrl,
    thumbnailUrl:  body.thumbnailUrl,
    privacy:       mapLivePrivacyToRegistry(
      (body as { audiencePrivacy?: string }).audiencePrivacy ?? body.privacy ?? 'PUBLIC',
    ),
    entryPriceUsd: body.entryPriceUsd,
    accentColor:   body.accentColor,
    performerTier: body.performerTier,
    venueEnvironment,
    venueSkinId,
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
    venueEnvironment: session.venueEnvironment ?? null,
    venueSkinId: session.venueSkinId ?? null,
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
    return NextResponse.json(
      {
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
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      },
    );
  } catch (err) {
    console.error('[api/live/go] GET error:', err);
    return NextResponse.json(
      {
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
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      },
    );
  }
}
