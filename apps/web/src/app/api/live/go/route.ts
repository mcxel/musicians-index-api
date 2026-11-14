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
  updateLiveSessionPrivacy,
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
import { patchPersistedLiveSession } from '@/lib/broadcast/liveSessionPersistence';
import { getActiveRoomTruthCount } from '@/lib/broadcast/globalLiveSessionStore';
import { seedRoomWithBots } from '@/lib/live/audienceRuntimeEngine';
import { botCrowdFillEngine } from '@/lib/live/BotCrowdFillEngine';
import { prisma } from '@/lib/prisma';
import { ensureAnchorRoomsSeeded, getAnchorDiscoveryRecords, listAnchorLiveRoomRecords } from '@/lib/live/AnchorRoomNetwork';
import { ensureGenreRoomsSeeded, getAllGenreDiscoveryRecords } from '@/lib/live/performerGenreRoomNetwork';
import { assertCreateRoomEntitlement } from '@/lib/subscriptions/assertCreateRoomEntitlement';
import { getTmiAuth } from '@/lib/auth/getTmiAuth';
import {
  canCreateBattle,
  canCreateCypher,
  canCreateRule38Experience,
  isRule38Experience,
} from '@/lib/subscriptions/BattleCreationGate';
import type { SubscriptionTier } from '@/lib/subscriptions/SubscriptionPricingEngine';
import {
  resolveEventVenueEnvironment,
  type VenueEnvironmentKind,
} from '@/lib/venues/EventVenueEnvironment';
import { mapLivePrivacyToRegistry, normalizeLivePrivacyMode } from '@/lib/live/liveRoomPrivacyGate';
import { admitGoLive } from '@/lib/live/goLiveAdmitGate';
import { DiscoveryBus } from '@/lib/discovery/DiscoveryBus';
import { liveSessionToDiscoveryRecord } from '@/lib/discovery/DiscoveryPublisher';

export const dynamic = 'force-dynamic';

function liveGoTrace(step: string, startedAt: number, extra?: Record<string, string | number | boolean | null>) {
  if (process.env.NODE_ENV === "production") return;
  console.info("[live-go-trace]", JSON.stringify({ step, ms: Date.now() - startedAt, ...extra }));
}

function parseVenueEnvironment(raw: unknown): VenueEnvironmentKind | null {
  const s = String(raw ?? '').toLowerCase().trim();
  if (s === 'indoor' || s === 'outdoor') return s;
  return null;
}

function parseVenueSkinId(raw: unknown): string | null {
  const s = typeof raw === 'string' ? raw.trim() : '';
  return s.length > 0 ? s : null;
}

// SECURITY (2026-09-23, Batch 2): verified identity via getTmiAuth() — the
// previous tmi_user_email cookie lookup (with a raw tmi_session_id fallback
// that isn't even a real User.id) let a forged cookie go live, or end a
// broadcast, as any real victim account. This is the identity used for the
// entire Go Live / End Live / broadcast-registration flow below.
async function sessionUserId(req: NextRequest): Promise<string | null> {
  const auth = await getTmiAuth();
  return auth?.user.id ?? null;
}

export async function POST(req: NextRequest) {
  const routeEnteredAt = Date.now();
  liveGoTrace("ROUTE_ENTER", routeEnteredAt);
  let body: Partial<GoLivePayload> & {
    action?: string;
    intent?: string;
    createRoom?: boolean;
  } & LivePingPayload = {};
  try { body = await req.json(); } catch { /* body optional */ }
  liveGoTrace("BODY_PARSED", routeEnteredAt, { action: body.action ?? null, category: String(body.category ?? "") });

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

  // SECURITY (2026-09-23): this gate previously only ran `if (isMini === true)`
  // — a client-controlled body flag. Omitting both `isMini` and
  // `intent:'create-room'`/`createRoom:true` let a Rule-38 category
  // (battle/challenge/cypher/lounge/dance-party) fall through to the
  // no-tier-check "regular go live" branch below and register anyway,
  // trivially bypassing Silver+ for any authenticated Free-tier account.
  // The tier check now applies unconditionally based on `category` alone —
  // no client-supplied flag can route around it. `assertCreateRoomEntitlement`
  // below independently re-applies the same check when isCreateRoomIntent is
  // also set; running both is redundant, not conflicting (defense in depth).
  const requestedCategory = String(body.category ?? "").toLowerCase();
  if (isRule38Experience(requestedCategory)) {
    const auth = await getTmiAuth();
    if (!auth) {
      return NextResponse.json({ error: "authentication_required" }, { status: 401 });
    }
    const rawTier = (auth.user.tier || "free").toUpperCase();
    const tier = (rawTier === "RUBY" ? "RUBY" : rawTier.toLowerCase()) as SubscriptionTier;
    const gate = canCreateRule38Experience(requestedCategory, tier);
    if (!gate.allowed) {
      return NextResponse.json({ error: "tier_gate", ...gate }, { status: 403 });
    }
  }

  let userId: string;
  let displayName: string;
  let roleHint = "FAN";

  if (isCreateRoomIntent) {
    // Rule 38: Silver+ creates Battle/Challenge/Cypher/Lounge/Mini Dance Party (PLATINUM+ for member venues)
    const gate = await assertCreateRoomEntitlement(req, body.category);
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
    const authStarted = Date.now();
    const uid = await sessionUserId(req);
    liveGoTrace("AUTH_RESOLVED", routeEnteredAt, { authMs: Date.now() - authStarted, authenticated: Boolean(uid) });
    if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    userId = uid;
    displayName = body.displayName ?? uid;

    // Persistent-environment go-live admit (role × privacy) — does not trust
    // ?workspace=. SECURITY (2026-09-23, Batch 2): sessionUserId() above
    // already requires a verified getTmiAuth() session to reach this point,
    // so auth here is always non-null with a real DB-backed role — the old
    // tmi_role/tmi_user_email cookie fallbacks are removed rather than left
    // as dead, misleading-looking insecure code.
    const auth = await getTmiAuth().catch(() => null);
    roleHint = auth?.user?.role || 'PERFORMER';
    liveGoTrace("ADMIT_CHECKED", routeEnteredAt, { role: roleHint });
    const privacyHint =
      (body as { audiencePrivacy?: string }).audiencePrivacy ?? body.privacy ?? 'PUBLIC';
    const listedHint = (body as { listed?: boolean }).listed;
    const admit = admitGoLive({
      authenticated: true,
      role: roleHint,
      privacy: privacyHint,
      listed: listedHint,
    });
    if (!admit.allowed) {
      return NextResponse.json(
        { error: admit.code, message: admit.reason, code: admit.code },
        { status: admit.status },
      );
    }
  }

  const hydrateStarted = Date.now();
  await ensureHydrated();
  liveGoTrace("HYDRATE_DONE", routeEnteredAt, { hydrateMs: Date.now() - hydrateStarted });

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
      : rawCategory === "fan-lobby" || rawCategory === "fan_lobby" || rawCategory === "fan-social-live"
        ? ("fan-lobby" as const)
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

  const rawAudiencePrivacy =
    (body as { audiencePrivacy?: string }).audiencePrivacy ?? body.privacy ?? 'PUBLIC';
  const audiencePrivacyMode = normalizeLivePrivacyMode(String(rawAudiencePrivacy));

  const session = registerLiveSession({
    userId,
    displayName,
    title:         body.title ?? `${displayName} — Live`,
    category,
    roomId,
    avatarUrl:     body.avatarUrl,
    previewUrl:    body.previewUrl,
    thumbnailUrl:  body.thumbnailUrl,
    privacy:       mapLivePrivacyToRegistry(rawAudiencePrivacy),
    audiencePrivacyMode,
    entryPriceUsd: body.entryPriceUsd,
    accentColor:   body.accentColor,
    performerTier: body.performerTier,
    venueEnvironment,
    venueSkinId,
    hostRole: String(roleHint).toUpperCase() === "FAN" ? "FAN" : "PERFORMER",
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
    const persistStarted = Date.now();
    liveGoTrace("PERSIST_START", routeEnteredAt);
    await persistSessionNow(session);
    liveGoTrace("PERSIST_DONE", routeEnteredAt, { persistMs: Date.now() - persistStarted });
  } catch (err) {
    endLiveSession(userId);
    const prismaCode = err && typeof err === "object" && "code" in err ? String((err as { code?: unknown }).code ?? "") : "";
    const message = err instanceof Error ? err.message : "";
    const missing = message.match(/`([^`]+)` does not exist/)?.[1] ?? "";
    console.error("[api/live/go] persist failed", { prismaCode, missing });
    return NextResponse.json(
      { ok: false, error: "Could not persist live session. Please try again.", code: "PERSIST_FAIL", prismaCode, missing },
      { status: 503 },
    );
  }

  // Fan Personal Live / Fan Avatar Lobby must have ZERO fake bots or fake fans
  const isFanPersonalRoom = category === "fan-lobby" || rawCategory === "fan-social-live" || rawCategory === "fan_lobby";
  if (!isFanPersonalRoom) {
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
  }

  liveGoTrace("RESPONSE_SENT", routeEnteredAt, { ok: true });
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

export async function PATCH(req: NextRequest) {
  const userId = await sessionUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: { visibility?: unknown; roomId?: unknown } = {};
  try { body = await req.json(); } catch { /* invalid body is rejected below */ }
  const visibility = String(body.visibility ?? '').trim().toLowerCase();
  if (visibility !== 'public' && visibility !== 'private') {
    return NextResponse.json({ error: 'visibility must be public or private' }, { status: 400 });
  }

  await ensureHydrated();
  const current = getSession(userId);
  if (!current) return NextResponse.json({ error: 'No active live session' }, { status: 404 });
  if (typeof body.roomId === 'string' && body.roomId !== current.roomId) {
    return NextResponse.json({ error: 'room_id_mismatch' }, { status: 409 });
  }

  const nextPrivacy = visibility === 'private' ? 'INVITE_ONLY' :
    current.entryPriceUsd && current.entryPriceUsd > 0 ? 'PAID_ENTRY' : 'PUBLIC';
  try {
    const persisted = await patchPersistedLiveSession(userId, {
      privacy: nextPrivacy,
      audiencePrivacyMode: visibility,
    });
    if (!persisted) {
      return NextResponse.json({ error: 'Live session persistence is unavailable' }, { status: 503 });
    }
  } catch (error) {
    console.error('[api/live/go] privacy patch failed', error);
    return NextResponse.json({ error: 'Could not update live visibility' }, { status: 503 });
  }

  const updated = updateLiveSessionPrivacy(userId, visibility);
  if (!updated) return NextResponse.json({ error: 'No active live session' }, { status: 404 });

  for (const record of DiscoveryBus.getAll()) {
    if (record.hostUserId === userId) DiscoveryBus.remove(record.id);
  }
  if (visibility === 'public') {
    const record = liveSessionToDiscoveryRecord(updated);
    if (record) DiscoveryBus.upsert(record);
  }

  return NextResponse.json({
    ok: true,
    roomId: updated.roomId,
    visibility,
    sessionPreserved: true,
  }, { status: 200 });
}

/**
 * Target 4 SoT — LIVE NOW active-room inventory.
 * sessions = registry-active only (TTL-evicted; no LiveRegistry seeds).
 * count = public truth (dedupe roomId; exclude INVITE_ONLY). Anchors are
 * returned separately and MUST NOT be added into count.
 *
 * Default = lite (sessions/live/count only). Hub DiscoveryBus / HUD / dock polls
 * must not serialize anchors + genreDiscovery every few seconds — that starved
 * browser HTTP/1.1 so POST /api/live/go never completed.
 * Explicit full inventory: ?full=1 (lobby walls / PlaylistLounge that need anchors).
 * ?lite=1 remains an explicit lite alias.
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const wantFull =
    sp.get("full") === "1" ||
    sp.get("full") === "true" ||
    sp.get("lite") === "0" ||
    sp.get("lite") === "false";
  const lite = !wantFull;
  try {
    if (!lite) {
      ensureAnchorRoomsSeeded();
      ensureGenreRoomsSeeded();
    }
    const sessions = await getActiveSessionsDurable();
    const count = getActiveRoomTruthCount(sessions);
    const visibleSessions = sessions.filter((session) =>
      session.privacy !== 'INVITE_ONLY' &&
      session.audiencePrivacyMode !== 'private' &&
      session.audiencePrivacyMode !== 'invite' &&
      session.audiencePrivacyMode !== 'friends',
    );
    // Map to LiveApiEntry shape for MixedLobbyWall and other consumers expecting { live: [] }
    const live = visibleSessions.map((s) => ({
      userId:        s.userId,
      displayName:   s.displayName,
      genre:         s.category,
      role:          s.hostRole === "FAN" ? ("fan" as const) : ("performer" as const),
      viewerCount:   s.viewerCount,
      roomId:        s.roomId,
      avatarUrl:     s.avatarUrl ?? undefined,
      accentColor:   s.accentColor,
      privacy:       s.privacy,
      performerTier: s.performerTier,
    }));
    if (lite) {
      return NextResponse.json(
        {
          sessions: visibleSessions,
          live,
          count,
          lite: true,
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
    const anchorRecords = getAnchorDiscoveryRecords();
    const genreRecords = getAllGenreDiscoveryRecords();
    return NextResponse.json(
      {
        sessions: visibleSessions,
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
        lite: lite || undefined,
        anchors: lite ? undefined : [],
        anchorDiscovery: lite ? undefined : [],
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
