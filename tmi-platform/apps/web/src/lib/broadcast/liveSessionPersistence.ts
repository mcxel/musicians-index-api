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
  };
}

function sessionFromUserRow(u: {
  id: string;
  displayName: string | null;
  name: string | null;
  image: string | null;
  tier: string | null;
  liveRoomId: string | null;
  liveGenre: string | null;
  liveStartedAt: Date | null;
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
    lastPingAt: startedAt,
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
  const normalized = normalizeSession(session);
  await prisma.user.updateMany({
    where: { OR: [{ id: normalized.userId }, { userRef: normalized.userId }] },
    data: {
      isLive: true,
      liveRoomId: normalized.roomId,
      liveGenre: normalized.category,
      liveStartedAt: new Date(normalized.startedAt),
    },
  });
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
  try {
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
  } catch {
    /* Room id may not match cuid — User/FeedItem still durable */
  }
}

export async function patchPersistedLiveSession(
  userId: string,
  patch: Partial<LiveSession>,
): Promise<void> {
  const existing = await prisma.feedItem.findFirst({
    where: { userId, type: LIVE_FEED_TYPE },
    orderBy: { createdAt: "desc" },
  });
  if (!existing || !isLiveSessionShape(existing.data)) return;
  const existingSession: LiveSession = existing.data;
  const next = normalizeSession({ ...existingSession, ...patch, userId });
  await prisma.feedItem.update({
    where: { id: existing.id },
    data: { data: next as object, entityId: next.roomId, expiresAt: FAR_FUTURE },
  });
}

export async function removePersistedLiveSession(userId: string): Promise<void> {
  await prisma.user.updateMany({
    where: { OR: [{ id: userId }, { userRef: userId }] },
    data: { isLive: false, liveRoomId: null, liveGenre: null, liveStartedAt: null },
  });
  await prisma.feedItem.deleteMany({ where: { userId, type: LIVE_FEED_TYPE } });
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
  await prisma.user.updateMany({
    where: { isLive: true, liveStartedAt: { lt: crashThreshold } },
    data: { isLive: false, liveRoomId: null, liveGenre: null, liveStartedAt: null },
  }).catch(() => {});
  const liveUsers = await prisma.user.findMany({
    where: { isLive: true },
    select: {
      id: true, displayName: true, name: true, image: true, tier: true,
      liveRoomId: true, liveGenre: true, liveStartedAt: true,
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
  const staleUserIds: string[] = [];
  for (const u of liveUsers) {
    const session = feedByUser.get(u.id) ?? sessionFromUserRow(u);
    if (now - session.lastPingAt > staleMs) { staleUserIds.push(u.id); continue; }
    result.push(session);
  }
  for (const id of staleUserIds) {
    await removePersistedLiveSession(id).catch(() => {});
  }
  return result.sort((a, b) => {
    if (b.viewerCount !== a.viewerCount) return b.viewerCount - a.viewerCount;
    return b.startedAt - a.startedAt;
  });
}
