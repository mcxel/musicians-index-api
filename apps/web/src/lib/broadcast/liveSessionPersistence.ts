/**
 * Durable live-session persistence — FeedItem (LIVE_SESSION) + User.isLive fields.
 * Backs GlobalLiveSessionRegistry across serverless cold starts (Rule 20 / Phase 2).
 */

import { prisma } from "@/lib/prisma";
import type { LiveSession, StreamCategory, StreamHealth, StageState } from "./globalLiveSessionStore";

export const LIVE_FEED_TYPE = "LIVE_SESSION";
const FAR_FUTURE = new Date("2099-01-01T00:00:00.000Z");
const DEFAULT_STALE_MS = 120_000;

function isLiveSessionShape(data: unknown): data is LiveSession {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return typeof d.userId === "string" && typeof d.roomId === "string" && typeof d.displayName === "string";
}

function normalizeSession(raw: LiveSession): LiveSession {
  return {
    userId: raw.userId,
    displayName: raw.displayName,
    avatarUrl: raw.avatarUrl ?? null,
    performerTier: raw.performerTier ?? "free",
    title: raw.title ?? (raw.displayName + " — Live"),
    category: (raw.category as StreamCategory) ?? "live",
    roomId: raw.roomId,
    previewUrl: raw.previewUrl ?? null,
    thumbnailUrl: raw.thumbnailUrl ?? null,
    stageState: (raw.stageState as StageState) ?? "live",
    streamHealth: (raw.streamHealth as StreamHealth) ?? "unknown",
    viewerCount: Math.max(0, Number(raw.viewerCount) || 0),
    tipTotal: Math.max(0, Number(raw.tipTotal) || 0),
    privacy: raw.privacy ?? "PUBLIC",
    audiencePrivacyMode: raw.audiencePrivacyMode ?? null,
    entryPriceUsd: raw.entryPriceUsd ?? null,
    accentColor: raw.accentColor ?? "#00FFFF",
    startedAt: Number(raw.startedAt) || Date.now(),
    lastPingAt: Number(raw.lastPingAt) || Date.now(),
    hostDisconnectedAt: raw.hostDisconnectedAt ?? null,
    bitrateKbps: Math.max(0, Number(raw.bitrateKbps) || 0),
    droppedFramesPct: Math.max(0, Number(raw.droppedFramesPct) || 0),
    rttMs: Math.max(0, Number(raw.rttMs) || 0),
    audioOk: raw.audioOk !== false,
    audienceCountries: Array.isArray(raw.audienceCountries) ? raw.audienceCountries : [],
    recentAudienceEntries: Array.isArray(raw.recentAudienceEntries) ? raw.recentAudienceEntries : [],
    lastAudienceEntryAt: raw.lastAudienceEntryAt ?? null,
    venueEnvironment:
      raw.venueEnvironment === "indoor" || raw.venueEnvironment === "outdoor"
        ? raw.venueEnvironment
        : null,
    venueSkinId: typeof raw.venueSkinId === "string" && raw.venueSkinId.trim()
      ? raw.venueSkinId.trim()
      : null,
    hostRole: raw.hostRole === "FAN" ? "FAN" : raw.hostRole === "PERFORMER" ? "PERFORMER" : undefined,
  };
}

function sessionFromUserRow(u: {
  id: string;
  displayName?: string | null;
  name: string | null;
  image: string | null;
  tier?: string | null;
  liveRoomId: string | null;
  liveGenre?: string | null;
  liveStartedAt?: Date | null;
}): LiveSession {
  const displayName = u.displayName ?? u.name ?? "Performer";
  const startedAt = u.liveStartedAt?.getTime() ?? Date.now();
  return normalizeSession({
    userId: u.id,
    displayName,
    avatarUrl: u.image,
    performerTier: (u.tier?.toLowerCase() as LiveSession["performerTier"]) ?? "free",
    title: displayName + " — Live",
    category: (u.liveGenre as StreamCategory) ?? "live",
    roomId: u.liveRoomId ?? ("room-" + u.id),
    previewUrl: null,
    thumbnailUrl: null,
    stageState: "live",
    streamHealth: "unknown",
    viewerCount: 0,
    tipTotal: 0,
    privacy: "PUBLIC",
    entryPriceUsd: null,
    accentColor: "#00FFFF",
    startedAt,
    lastPingAt: Date.now(),
    hostDisconnectedAt: null,
    bitrateKbps: 0,
    droppedFramesPct: 0,
    rttMs: 0,
    audioOk: true,
    audienceCountries: [],
    recentAudienceEntries: [],
    lastAudienceEntryAt: null,
  });
}

export async function persistLiveSession(session: LiveSession): Promise<void> {
  const started = Date.now();
  const trace = (step: string, extra?: Record<string, string | number | null>) => {
    if (process.env.NODE_ENV === "production") return;
    console.info("[live-go-trace]", JSON.stringify({ step, ms: Date.now() - started, ...extra }));
  };
  const normalized = normalizeSession(session);
  trace("USER_LIVE_UPDATE_START");
  const updated = await prisma.user.updateMany({
    where: { id: normalized.userId },
    data: {
      isLive: true,
      liveRoomId: normalized.roomId,
    },
  });
  trace("USER_LIVE_UPDATE_END", { rows: updated.count });
  if (updated.count === 0) {
    throw new Error(
      `[liveSessionPersistence] persistLiveSession: no User row for userId=${normalized.userId}`,
    );
  }
  trace("FEED_LOOKUP_START");
  try {
  const existing = await prisma.feedItem.findFirst({
    where: { userId: normalized.userId, type: LIVE_FEED_TYPE },
    orderBy: { createdAt: "desc" },
  });
  if (existing) {
    await prisma.feedItem.update({
      where: { id: existing.id },
      data: {
        entityId: normalized.roomId,
        entityType: "live_room",
        data: normalized as object,
        weight: 10,
        expiresAt: FAR_FUTURE,
      },
    });
  } else {
    await prisma.feedItem.create({
      data: {
        userId: normalized.userId,
        type: LIVE_FEED_TYPE,
        entityId: normalized.roomId,
        entityType: "live_room",
        data: normalized as object,
        weight: 10,
        expiresAt: FAR_FUTURE,
      },
    });
  }
  trace("FEED_WRITE_END");
  } catch (err) {
    const code = err && typeof err === "object" && "code" in err ? String((err as { code?: unknown }).code ?? "") : "none";
    trace("FEED_WRITE_ERROR", { code });
  }
  try {
    trace("ROOM_LOOKUP_START");
    let room = await prisma.room.findFirst({ where: { id: normalized.roomId } });
    if (!room) {
      room = await prisma.room.create({
        data: {
          id: normalized.roomId,
          name: normalized.title,
          type: "LIVE",
          status: "LIVE",
          ownerId: normalized.userId,
        },
      });
    } else {
      await prisma.room.update({
        where: { id: room.id },
        data: { status: "LIVE", name: normalized.title, ownerId: normalized.userId },
      });
    }
    const active = await prisma.roomSession.findFirst({
      where: { roomId: room.id, status: "ACTIVE" },
    });
    if (!active) {
      await prisma.roomSession.create({
        data: { roomId: room.id, status: "ACTIVE", startedAt: new Date(normalized.startedAt) },
      });
    }
  } catch (err) {
    const code = err && typeof err === "object" && "code" in err ? String((err as { code?: unknown }).code ?? "") : "none";
    trace("ROOM_WRITE_ERROR", { code });
    /* Room id may not match cuid — User/FeedItem still durable */
  }
  trace("PERSIST_FUNCTION_END");
}

export async function patchPersistedLiveSession(
  userId: string,
  patch: Partial<LiveSession>,
): Promise<boolean> {
  const existing = await prisma.feedItem.findFirst({
    where: { userId, type: LIVE_FEED_TYPE },
    orderBy: { createdAt: "desc" },
  });
  if (!existing || !isLiveSessionShape(existing.data)) return false;
  const existingSession: LiveSession = existing.data;
  const next = normalizeSession({ ...existingSession, ...patch, userId });
  await prisma.feedItem.update({
    where: { id: existing.id },
    data: { data: next as object, entityId: next.roomId, expiresAt: FAR_FUTURE },
  });
  return true;
}

export async function removePersistedLiveSession(userId: string): Promise<void> {
  await prisma.user.updateMany({
    where: { id: userId },
    data: { isLive: false, liveRoomId: null },
  });
  await prisma.feedItem.deleteMany({ where: { userId, type: LIVE_FEED_TYPE } }).catch(() => undefined);
  try {
    const rooms = await prisma.room.findMany({
      where: { ownerId: userId, status: "LIVE" },
      select: { id: true },
    });
    for (const room of rooms) {
      await prisma.roomSession.updateMany({
        where: { roomId: room.id, status: "ACTIVE" },
        data: { status: "ENDED", endedAt: new Date() },
      });
      await prisma.room.update({ where: { id: room.id }, data: { status: "CLOSED" } });
    }
  } catch {
    /* non-fatal */
  }
}

export async function loadPersistedLiveSessions(staleMs = DEFAULT_STALE_MS): Promise<LiveSession[]> {
  const now = Date.now();
  const crashThreshold = new Date(now - 6 * 60 * 60 * 1000);
  if (!(process.env.NODE_ENV === "development" && process.env.TMI_SKIP_LIVE_STALE_CLEANUP === "1")) {
    await prisma.user.updateMany({
      where: { isLive: true, liveStartedAt: { lt: crashThreshold } },
      data: { isLive: false, liveRoomId: null, liveGenre: null, liveStartedAt: null },
    }).catch(() => {});
  }
  const liveUsers = await prisma.user.findMany({
    where: { isLive: true },
    select: {
      id: true, name: true, image: true, liveRoomId: true,
    },
  });
  if (liveUsers.length === 0) return [];
  const feedItems = await prisma.feedItem.findMany({
    where: { type: LIVE_FEED_TYPE, userId: { in: liveUsers.map((u) => u.id) } },
    orderBy: { createdAt: "desc" },
  });
  const feedByUser = new Map<string, LiveSession>();
  for (const item of feedItems) {
    if (feedByUser.has(item.userId)) continue;
    if (isLiveSessionShape(item.data)) feedByUser.set(item.userId, normalizeSession(item.data));
  }
  const result: LiveSession[] = [];
  for (const u of liveUsers) {
    const fromFeed = feedByUser.get(u.id);
    const session = fromFeed ?? sessionFromUserRow(u);
    // GET must never delete durable rows — concurrent /home/3 polls were racing
    // create and zeroing LIVE NOW while the host worker still reported n+1.
    // Rescue stale feed pings via user-row freshness while isLive remains true.
    // A fresh ping must keep the feed's privacy. Resetting to PUBLIC here put
    // a private room back on the public lite list.
    if (now - session.lastPingAt > staleMs) {
      const rescued = sessionFromUserRow(u);
      if (fromFeed) {
        rescued.privacy = fromFeed.privacy;
        rescued.audiencePrivacyMode = fromFeed.audiencePrivacyMode ?? null;
        rescued.roomId = fromFeed.roomId || rescued.roomId;
        rescued.category = fromFeed.category;
        rescued.title = fromFeed.title || rescued.title;
        if (fromFeed.hostRole) rescued.hostRole = fromFeed.hostRole;
      }
      result.push(rescued);
      continue;
    }
    result.push(session);
  }
  return result.sort((a, b) => {
    if (b.viewerCount !== a.viewerCount) return b.viewerCount - a.viewerCount;
    return b.startedAt - a.startedAt;
  });
}
