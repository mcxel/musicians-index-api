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
  type LiveSession,
  type StreamCategory,
  type GoLivePayload,
  type LivePingPayload,
} from '@/lib/broadcast/GlobalLiveSessionRegistry';
import { seedRoomWithBots } from '@/lib/live/audienceRuntimeEngine';
import { botCrowdFillEngine } from '@/lib/live/BotCrowdFillEngine';
import { prisma } from '@/lib/prisma';
import { OFFICIAL_HOME_ORBIT_BOT_ACCOUNTS } from '@/lib/bots/homeOrbitBotAccounts';
import { markDisplayedCandidates, rankLiveDiscoveryCandidates } from '@/lib/discovery/LiveDiscoveryRankingEngine';
import {
  countRealPublicDiscoverySessions,
  getDiscoveryPopulationConfig,
  shouldUseOfficialBotPopulation,
} from '@/lib/discovery/DiscoveryPopulationConfig';
import {
  completeCompetitiveSession,
  createCompetitiveSession,
  expireStaleCompetitiveSessions,
  getCompetitiveSession,
  type CompetitiveSessionState,
} from '@/lib/live/CompetitiveSessionLifecycleEngine';

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

const MAX_CONCURRENT_LIVE_SESSIONS = 500;

type LiveWallKind = 'all' | 'battle' | 'cypher' | 'challenge' | 'game' | 'live';

function parseWallKind(value: string | null): LiveWallKind {
  const normalized = (value ?? 'all').toLowerCase();
  if (normalized === 'battle' || normalized === 'cypher' || normalized === 'challenge' || normalized === 'game' || normalized === 'live') {
    return normalized;
  }
  return 'all';
}

function sessionsForWall(sessions: LiveSession[], wall: LiveWallKind): LiveSession[] {
  if (wall === 'all') return sessions;
  return sessions.filter((s) => s.category === wall);
}

function wallLabel(wall: LiveWallKind): string {
  switch (wall) {
    case 'battle': return 'battle';
    case 'cypher': return 'cypher';
    case 'challenge': return 'challenge';
    case 'game': return 'game';
    case 'live': return 'live';
    default: return 'live';
  }
}

function rotateBySeed<T>(rows: T[], seed: number): T[] {
  if (rows.length === 0) return rows;
  const start = Math.abs(seed) % rows.length;
  return [...rows.slice(start), ...rows.slice(0, start)];
}

function hashText(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return hash;
}

function buildBotPreviewLiveEntries(wall: LiveWallKind, desired: number, allowedBotCategories: string[]) {
  if (desired <= 0) return [];

  const allBots = OFFICIAL_HOME_ORBIT_BOT_ACCOUNTS
    .filter((bot) => Boolean(bot.image?.trim()))
    .filter((bot) => {
      if (!allowedBotCategories.length) return true;
      return allowedBotCategories.includes(bot.botRole);
    });
  const seed = Math.floor(Date.now() / 60_000) + hashText(wall);
  const rotated = rotateBySeed(allBots, seed);

  return rotated.slice(0, Math.min(desired, rotated.length)).map((bot) => ({
    userId: `bot-preview-${bot.slug}`,
    displayName: bot.name,
    genre: wallLabel(wall),
    role: 'system-bot' as const,
    viewerCount: 0,
    roomId: `preview-${bot.slug}`,
    avatarUrl: bot.image,
    accentColor: undefined,
    privacy: 'INVITE_ONLY' as const,
    isBot: true,
    isJoinable: false,
    status: 'starting' as const,
    profileRoute: bot.profileRoute,
  }));
}

function isCompetitiveCategory(category: StreamCategory): category is 'battle' | 'cypher' | 'challenge' {
  return category === 'battle' || category === 'cypher' || category === 'challenge';
}

function toDiscoveryStatus(state: CompetitiveSessionState | null): 'starting' | 'live' {
  if (!state) return 'starting';
  if (state === 'live') return 'live';
  return 'starting';
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

  // Concurrent connection cap — protects against runaway load at scale
  const activeSessions = getAllSessions();
  const alreadyLive = activeSessions.some((s) => s.userId === userId);
  if (!alreadyLive && activeSessions.length >= MAX_CONCURRENT_LIVE_SESSIONS) {
    return NextResponse.json(
      { ok: false, error: 'Platform is at capacity. Please try again in a few minutes.', code: 'CAPACITY_LIMIT' },
      { status: 503 },
    );
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

  if (isCompetitiveCategory(session.category)) {
    createCompetitiveSession({
      roomId: session.roomId,
      mode: session.category,
      hostUserId: userId,
    });
  }

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
  if (session?.roomId) {
    completeCompetitiveSession(session.roomId);
  }
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

export async function GET(req: NextRequest) {
  try {
    expireStaleCompetitiveSessions();

    const wall = parseWallKind(req.nextUrl.searchParams.get('wall'));
    const includeBots = req.nextUrl.searchParams.get('includeBots') === '1';
    const config = getDiscoveryPopulationConfig();
    let sessions = getAllSessions();

    // DB cold-start recovery: if the in-memory registry is empty (cold module, dev
    // hot-reload, or Vercel serverless cold start), reconstruct sessions from the
    // DB-persisted isLive/liveRoomId/liveGenre/liveStartedAt fields so discovery
    // surfaces never show a false "no one is live" state after a restart.
    if (sessions.length === 0) {
      const liveUsers = await prisma.user.findMany({
        where: { isLive: true },
        select: { id: true, displayName: true, liveRoomId: true, liveGenre: true, liveStartedAt: true },
      }).catch(() => []);

      for (const u of liveUsers) {
        if (!u.liveRoomId) continue;
        registerLiveSession({
          userId:      u.id,
          displayName: u.displayName ?? u.id,
          title:       `${u.displayName ?? u.id} — Live`,
          category:    (u.liveGenre as StreamCategory) ?? 'live',
          roomId:      u.liveRoomId,
        });
      }
      sessions = getAllSessions();
    }

    const filtered = sessionsForWall(sessions, wall);
    const realPublicCount = countRealPublicDiscoverySessions(sessions);

    // Map to LiveApiEntry shape for MixedLobbyWall and other consumers expecting { live: [] }
    const ranked = rankLiveDiscoveryCandidates(
      filtered.map((s) => ({
        id: s.userId,
        roomId: s.roomId,
        category: s.category,
        status: s.stageState === 'live' ? 'live' as const : 'starting' as const,
        isBot: false,
        isJoinable: s.privacy === 'PUBLIC',
        viewerCount: s.viewerCount,
        startedAt: s.startedAt,
        lastPingAt: s.lastPingAt,
      })),
      { surfaceKey: `live-wall:${wall}` },
    );

    markDisplayedCandidates(ranked.slice(0, config.surfaceTargetCount), { surfaceKey: `live-wall:${wall}` });

    const rankedIds = new Set(ranked.map((row) => row.id));
    const rankedSessions = ranked
      .map((row) => filtered.find((s) => s.userId === row.id))
      .filter((row): row is LiveSession => Boolean(row));
    const unrankedSessions = filtered.filter((s) => !rankedIds.has(s.userId));
    const orderedSessions = [...rankedSessions, ...unrankedSessions];

    const live = orderedSessions.map((s) => {
      const competitiveSession = isCompetitiveCategory(s.category)
        ? getCompetitiveSession(s.roomId)
        : null;

      const lifecycleState = competitiveSession?.state ?? null;
      const lifecycleJoinable = lifecycleState === 'preparing' ? false : s.privacy === 'PUBLIC';

      return {
        userId:      s.userId,
        displayName: s.displayName,
        genre:       s.category,
        role:        'performer' as const,
        viewerCount: s.viewerCount,
        roomId:      s.roomId,
        avatarUrl:   s.avatarUrl ?? undefined,
        accentColor: s.accentColor,
        privacy:     s.privacy,
        isBot:       false,
        isJoinable:  lifecycleJoinable,
        status:      competitiveSession
          ? toDiscoveryStatus(competitiveSession.state)
          : (s.stageState === 'live' ? 'live' as const : 'starting' as const),
        competitiveLifecycleState: lifecycleState,
      };
    });

    let botRows: ReturnType<typeof buildBotPreviewLiveEntries> = [];
    if (includeBots && shouldUseOfficialBotPopulation(realPublicCount, config)) {
      const targetGap = Math.max(0, config.surfaceTargetCount - live.length);
      const hasWaitingCompetitive = live.some((row) => row.competitiveLifecycleState === 'waiting_for_contender');
      const minimumBoost = hasWaitingCompetitive ? 2 : 0;
      const maxAllowed = Math.max(0, Math.min(config.maxBotCards, Math.max(targetGap, minimumBoost)));
      botRows = buildBotPreviewLiveEntries(wall, maxAllowed, config.botCategoriesAllowed);
    }

    const blendedLive = [...live, ...botRows];
    return NextResponse.json({
      sessions: filtered,
      live: blendedLive,
      count: blendedLive.length,
      discoveryPopulation: {
        enabled: config.enabled,
        realPublicCount,
        threshold: config.realSessionThreshold,
        botsIncluded: botRows.length,
      },
      config: {
        rotationIntervalSeconds: config.rotationIntervalSeconds,
        maxBotCards: config.maxBotCards,
      },
    });
  } catch (err) {
    console.error('[api/live/go] GET error:', err);
    return NextResponse.json({ sessions: [], live: [], count: 0 });
  }
}
