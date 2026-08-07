/**
 * GET /api/live/lobby-wall
 *
 * Returns a unified LobbyWallCard[] combining:
 *   1. All 12 permanent anchor rooms (always present, honest empty states)
 *   2. Active live sessions from performers
 *   3. Elastic overflow rooms from ElasticRoomOrchestrator
 *   4. (future) Scheduled events
 *
 * No fake data. Counts come from real audienceRuntimeEngine occupancy.
 */

import { NextResponse } from "next/server";
import { getAllAnchors } from "@/lib/live/AnchorRoomRegistry";
import { getVenueOccupancy } from "@/lib/live/audienceRuntimeEngine";
import { getActiveSessions } from "@/lib/broadcast/GlobalLiveSessionRegistry";
import {
  getAllOverflowRooms,
  readRealOccupancy,
} from "@/lib/live/ElasticRoomOrchestrator";

// ── Shared card type ──────────────────────────────────────────────────────────

export type LobbyWallStatus =
  | "LIVE"
  | "READY_TO_START"
  | "RECRUITING"
  | "OPEN_CALL"
  | "FULL"
  | "PRESHOW"
  | "SCHEDULED";

export type LobbyWallCard = {
  id: string;
  sourceType: "ANCHOR" | "LIVE_SESSION" | "OVERFLOW" | "SCHEDULED";
  category: string;
  title: string;
  status: LobbyWallStatus;
  route: string;
  host?: {
    userId: string;
    displayName: string;
    avatarUrl: string | null;
  };
  realHumanCount: number;
  capacity: number;
  availableSlots: number;
  recruitmentLabel?: string;
  previewAsset?: string;
};

// ── GET handler ───────────────────────────────────────────────────────────────

export async function GET(): Promise<NextResponse> {
  const cards: LobbyWallCard[] = [];

  // 1. Permanent anchor rooms ──────────────────────────────────────────────────
  const anchors = getAllAnchors();
  const activeSessions = getActiveSessions();
  const sessionByRoomId = new Map(activeSessions.map((s) => [s.roomId, s]));

  for (const anchor of anchors) {
    const occ = getVenueOccupancy(anchor.slug);
    const realHumans = occ.members.filter((m) => m.active && m.role !== "bot").length;
    const liveSession = sessionByRoomId.get(anchor.slug);

    let status: LobbyWallStatus;
    if (realHumans === 0) {
      status = "RECRUITING";
    } else if (realHumans >= anchor.maximumHumans) {
      status = "FULL";
    } else if (liveSession) {
      status = "LIVE";
    } else {
      status = "OPEN_CALL";
    }

    cards.push({
      id: anchor.id,
      sourceType: "ANCHOR",
      category: anchor.category,
      title: anchor.title,
      status,
      route: anchor.route,
      host: liveSession
        ? {
            userId: liveSession.userId,
            displayName: liveSession.displayName,
            avatarUrl: liveSession.avatarUrl ?? null,
          }
        : undefined,
      realHumanCount: realHumans,
      capacity: anchor.maximumHumans,
      availableSlots: Math.max(0, anchor.maximumHumans - realHumans),
      recruitmentLabel:
        status === "RECRUITING"
          ? `Join first — ${anchor.tagline}`
          : undefined,
      previewAsset: liveSession?.previewUrl ?? liveSession?.thumbnailUrl ?? undefined,
    });
  }

  // 2. Live sessions NOT attached to an anchor (performer-created rooms) ────────
  const anchorSlugs = new Set(anchors.map((a) => a.slug));

  for (const session of activeSessions) {
    if (anchorSlugs.has(session.roomId)) continue; // already covered above

    const occ = getVenueOccupancy(session.roomId);
    const realHumans = occ.members.filter((m) => m.active && m.role !== "bot").length;

    cards.push({
      id: `session-${session.userId}`,
      sourceType: "LIVE_SESSION",
      category: session.category ?? "GENERAL",
      title: session.title,
      status: "LIVE",
      route: `/live/rooms/${session.roomId}`,
      host: {
        userId: session.userId,
        displayName: session.displayName,
        avatarUrl: session.avatarUrl ?? null,
      },
      realHumanCount: realHumans,
      capacity: 200,
      availableSlots: Math.max(0, 200 - realHumans),
      previewAsset: session.previewUrl ?? session.thumbnailUrl ?? undefined,
    });
  }

  // 3. Overflow rooms ────────────────────────────────────────────────────────────
  const overflows = getAllOverflowRooms();

  for (const overflow of overflows) {
    const realHumans = readRealOccupancy(overflow.slug);
    const anchor = anchors.find((a) => a.slug === overflow.parentAnchorSlug);
    const capacity = anchor?.maximumHumans ?? 200;

    cards.push({
      id: overflow.id,
      sourceType: "OVERFLOW",
      category: anchor?.category ?? "GENERAL",
      title: overflow.title,
      status: realHumans === 0 ? "RECRUITING" : realHumans >= capacity ? "FULL" : "LIVE",
      route: overflow.route,
      realHumanCount: realHumans,
      capacity,
      availableSlots: Math.max(0, capacity - realHumans),
    });
  }

  // Sort: LIVE first, then OPEN_CALL, then RECRUITING/FULL — within each group
  // anchor rooms first, then sessions, then overflows
  const ORDER: Record<LobbyWallStatus, number> = {
    LIVE: 0,
    PRESHOW: 1,
    READY_TO_START: 2,
    OPEN_CALL: 3,
    RECRUITING: 4,
    SCHEDULED: 5,
    FULL: 6,
  };

  const SOURCE_ORDER: Record<string, number> = {
    ANCHOR: 0,
    LIVE_SESSION: 1,
    OVERFLOW: 2,
    SCHEDULED: 3,
  };

  cards.sort((a, b) => {
    const statusDiff = ORDER[a.status] - ORDER[b.status];
    if (statusDiff !== 0) return statusDiff;
    return SOURCE_ORDER[a.sourceType] - SOURCE_ORDER[b.sourceType];
  });

  return NextResponse.json({ cards });
}
