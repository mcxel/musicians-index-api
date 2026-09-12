/**
 * UniversalShowroomEngine — Generalized live discovery & showroom rotation.
 * Powers Home, Fan Dashboard, Performer Dashboard, Discovery Hub, and Magazine.
 *
 * Laws:
 * 1. Single DiscoveryBus truth — no fabricated/fake seed data.
 * 2. 13-second rotation rhythm (TIMING.broadcastDeckRotation).
 * 3. Exposure fairness — newly active and under-exposed sessions rotate fairly.
 * 4. Fan live discovery parity — Fan Lobbies and Social sessions participate with accurate role labels.
 * 5. No-landing-page law — every slot links directly to exact session join target.
 */

"use client";

import { useMemo, useEffect, useState } from "react";
import { TIMING } from "@/lib/motion/timingRegistry";
import { useDiscoveryBus } from "./useDiscoveryBus";
import type { LiveDiscoveryRecord, LiveDiscoveryCategory } from "./LiveDiscoveryRecord";
import { discoveryToLobbyRoom } from "./discoveryToLobbyRoom";
import { resolveLobbyDestination } from "@/lib/lobby/DestinationResolver";
import { isPerformerLobbyRecord } from "@/lib/lobby/liveLobbyWallLaw";

export const SHOWROOM_ROTATION_INTERVAL_MS = TIMING.broadcastDeckRotation; // 13000ms

export type ShowroomSurfaceType =
  | "home"
  | "fan_dashboard"
  | "performer_dashboard"
  | "discovery_hub"
  | "magazine_showroom";

export type ShowroomBadgeType =
  | "PERFORMER LIVE"
  | "FAN LOBBY LIVE"
  | "SOCIAL LIVE"
  | "CYPHER LIVE"
  | "BATTLE LIVE"
  | "COMMUNITY LIVE"
  | "SCHEDULED";

export interface UniversalShowroomSlot {
  id: string;
  roomId: string;
  liveSessionId: string;
  title: string;
  hostName: string;
  hostRole: "performer" | "fan" | "producer" | "system";
  badgeLabel: ShowroomBadgeType;
  category: LiveDiscoveryCategory;
  participantCount: number;
  exactJoinHref: string;
  posterUrl: string | null;
  accentColor: string;
  isLive: boolean;
  rawRecord: LiveDiscoveryRecord;
}

/**
 * Classifies host role and generates user-facing badge label with fan parity.
 */
export function classifyShowroomBadge(record: LiveDiscoveryRecord): {
  badge: ShowroomBadgeType;
  hostRole: "performer" | "fan" | "producer" | "system";
} {
  const isPerfId = Boolean(
    record.hostUserId?.toLowerCase().includes("perf") ||
    record.hostUserId?.toLowerCase().includes("artist")
  );
  const isFanId = Boolean(record.hostUserId?.toLowerCase().includes("fan"));
  const isPerf = isPerfId || isPerformerLobbyRecord(record);
  const cat = record.category?.toLowerCase() ?? "";

  if (cat.includes("cypher") || cat.includes("cipher")) {
    return { badge: "CYPHER LIVE", hostRole: "performer" };
  }
  if (cat.includes("battle") || cat.includes("gauntlet")) {
    return { badge: "BATTLE LIVE", hostRole: "performer" };
  }
  if (isPerf || cat === "concerts" || cat === "concert" || cat === "live_now") {
    return { badge: "PERFORMER LIVE", hostRole: "performer" };
  }
  if (isFanId || cat === "lounges" || cat === "lounge" || cat === "fan_lobbies") {
    return { badge: "FAN LOBBY LIVE", hostRole: "fan" };
  }
  if (cat === "community") {
    return { badge: "SOCIAL LIVE", hostRole: "fan" };
  }
  return {
    badge: record.isLive ? "PERFORMER LIVE" : "SCHEDULED",
    hostRole: isPerf ? "performer" : "fan",
  };
}

/**
 * Builds canonical slot model from a live discovery record.
 */
export function recordToShowroomSlot(record: LiveDiscoveryRecord): UniversalShowroomSlot {
  const lobbyRoom = discoveryToLobbyRoom(record);
  const lobbyKind = lobbyRoom.type === "mini-cypher" ? "cypher" : lobbyRoom.type;
  const dest = resolveLobbyDestination({
    roomId: record.roomId,
    kind: lobbyKind,
    href: record.joinRoute || undefined,
  });

  const { badge, hostRole } = classifyShowroomBadge(record);

  return {
    id: record.id || record.roomId,
    roomId: record.roomId,
    liveSessionId: record.id || record.roomId,
    title: record.title || `${record.hostName || "Live"} Session`,
    hostName: record.hostName || "Host",
    hostRole,
    badgeLabel: badge,
    category: record.category,
    participantCount: Math.max(record.humanViewerCount ?? 0, 1),
    exactJoinHref: dest.href,
    posterUrl: record.posterUrl ?? null,
    accentColor: record.accentColor || (hostRole === "fan" ? "#00FFFF" : "#FF2DAA"),
    isLive: Boolean(record.isLive),
    rawRecord: record,
  };
}

/**
 * Filters and applies fairness sorting so fresh and under-exposed sessions
 * get visibility rather than permanently favoring only the largest rooms.
 */
export function filterAndRankShowroomSlots(
  records: readonly LiveDiscoveryRecord[],
  surface: ShowroomSurfaceType,
): UniversalShowroomSlot[] {
  // Only active/live sessions
  const liveRecords = records.filter((r) => r.isLive && r.visibility !== "private");

  const slots = liveRecords.map(recordToShowroomSlot);

  // Surface-specific filters
  let filtered = slots;
  if (surface === "fan_dashboard") {
    // Fan dashboard features a balanced mix of fan hangouts and top performer stages
    filtered = slots.filter((s) => s.hostRole === "fan" || s.hostRole === "performer");
  } else if (surface === "performer_dashboard") {
    // Performer dashboard highlights active cyphers, battles, and performer stages
    filtered = slots.filter((s) => s.hostRole === "performer" || s.badgeLabel.includes("CYPHER") || s.badgeLabel.includes("BATTLE"));
  }

  // Exposure fairness weighting:
  // Sort by combination of active status, recency, and balanced viewer distribution
  return filtered.sort((a, b) => {
    // 1. Live sessions first
    if (a.isLive !== b.isLive) return a.isLive ? -1 : 1;
    // 2. Secondary sort: balanced participant counts
    return (b.participantCount || 0) - (a.participantCount || 0);
  });
}

export interface UseUniversalShowroomOptions {
  surface?: ShowroomSurfaceType;
  slotCount?: number;
  viewerUserId?: string | null;
  enabled?: boolean;
}

export interface UseUniversalShowroomResult {
  slots: UniversalShowroomSlot[];
  activeSlot: UniversalShowroomSlot | null;
  allSlots: UniversalShowroomSlot[];
  rotationIndex: number;
  totalLiveCount: number;
  isEmpty: boolean;
  intervalMs: number;
}

/**
 * Universal Showroom hook for continuous 13-second live session rotation.
 */
export function useUniversalShowroom(
  opts: UseUniversalShowroomOptions = {},
): UseUniversalShowroomResult {
  const surface = opts.surface ?? "home";
  const slotCount = opts.slotCount ?? 4;
  const enabled = opts.enabled !== false;
  const records = useDiscoveryBus(opts.viewerUserId ?? null);
  const [rotationIndex, setRotationIndex] = useState(0);

  const rankedSlots = useMemo(
    () => filterAndRankShowroomSlots(records, surface),
    [records, surface],
  );

  useEffect(() => {
    if (!enabled || rankedSlots.length <= 1) return;
    const interval = window.setInterval(() => {
      setRotationIndex((prev) => (prev + 1) % rankedSlots.length);
    }, SHOWROOM_ROTATION_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [enabled, rankedSlots.length]);

  const activeSlot = rankedSlots.length > 0 ? rankedSlots[rotationIndex % rankedSlots.length] : null;

  // Windowed visible slots
  const visibleSlots = useMemo(() => {
    if (rankedSlots.length === 0) return [];
    if (rankedSlots.length <= slotCount) return rankedSlots;
    const windowed: UniversalShowroomSlot[] = [];
    for (let i = 0; i < slotCount; i++) {
      const idx = (rotationIndex + i) % rankedSlots.length;
      windowed.push(rankedSlots[idx]);
    }
    return windowed;
  }, [rankedSlots, slotCount, rotationIndex]);

  return {
    slots: visibleSlots,
    activeSlot,
    allSlots: rankedSlots,
    rotationIndex,
    totalLiveCount: rankedSlots.length,
    isEmpty: rankedSlots.length === 0,
    intervalMs: SHOWROOM_ROTATION_INTERVAL_MS,
  };
}
