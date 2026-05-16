/**
 * LivePresenceEngine
 * Server-side presence tracking for live rooms.
 * Distinct from presenceEngine.ts (React hook for UI bot simulation).
 * Tracks real join/leave events, roles, and per-room counts.
 */

import { platformLearningCore } from '@/lib/learning/PlatformLearningCore';
import { experienceOptimizationEngine } from '@/lib/learning/ExperienceOptimizationEngine';

export type LivePresenceRole =
  | "fan"
  | "performer"
  | "host"
  | "judge"
  | "sponsor"
  | "moderator";

export type LivePresenceRecord = {
  userId: string;
  displayName: string;
  role: LivePresenceRole;
  roomId: string;
  joinedAtMs: number;
  lastSeenAtMs: number;
  isActive: boolean;
};

export type LivePresenceSnapshot = {
  roomId: string;
  totalCount: number;
  fanCount: number;
  performerCount: number;
  hostCount: number;
  sponsorCount: number;
  activePerformers: LivePresenceRecord[];
  activeFans: LivePresenceRecord[];
  updatedAtMs: number;
};

// --- in-memory store ---
// roomId → Map<userId, record>
const rooms: Map<string, Map<string, LivePresenceRecord>> = new Map();

function getRoomMap(roomId: string): Map<string, LivePresenceRecord> {
  if (!rooms.has(roomId)) rooms.set(roomId, new Map());
  return rooms.get(roomId)!;
}

// --- Write API ---

export function joinLiveRoom(
  roomId: string,
  userId: string,
  displayName: string,
  role: LivePresenceRole,
): LivePresenceRecord {
  const roomMap = getRoomMap(roomId);
  const existing = roomMap.get(userId);

  if (existing) {
    existing.isActive = true;
    existing.lastSeenAtMs = Date.now();
    return existing;
  }

  const record: LivePresenceRecord = {
    userId,
    displayName,
    role,
    roomId,
    joinedAtMs: Date.now(),
    lastSeenAtMs: Date.now(),
    isActive: true,
  };
  roomMap.set(userId, record);

  platformLearningCore.ingestEvent({
    type: 'join',
    userId,
    route: roomId,
    targetId: role,
    context: {
      displayName,
      role,
      source: 'LivePresenceEngine',
    },
  });

  return record;
}

export function leaveLiveRoom(roomId: string, userId: string): void {
  const record = rooms.get(roomId)?.get(userId);
  if (record) {
    record.isActive = false;
    record.lastSeenAtMs = Date.now();
    platformLearningCore.ingestEvent({
      type: 'leave',
      userId,
      route: roomId,
      targetId: record.role,
      context: {
        source: 'LivePresenceEngine',
      },
    });
  }
}

export function heartbeatPresence(roomId: string, userId: string): void {
  const record = rooms.get(roomId)?.get(userId);
  if (record) record.lastSeenAtMs = Date.now();
}

export function evictStalePresence(roomId: string, staleThresholdMs = 60_000): void {
  const roomMap = rooms.get(roomId);
  if (!roomMap) return;
  const cutoff = Date.now() - staleThresholdMs;
  for (const record of roomMap.values()) {
    if (record.lastSeenAtMs < cutoff && record.isActive) {
      record.isActive = false;
    }
  }
}

// --- Read API ---

export function getLivePresenceSnapshot(roomId: string): LivePresenceSnapshot {
  const roomMap = getRoomMap(roomId);
  const active = [...roomMap.values()].filter((r) => r.isActive);

  return {
    roomId,
    totalCount: active.length,
    fanCount: active.filter((r) => r.role === "fan").length,
    performerCount: active.filter((r) => r.role === "performer").length,
    hostCount: active.filter((r) => r.role === "host").length,
    sponsorCount: active.filter((r) => r.role === "sponsor").length,
    activePerformers: active.filter((r) => r.role === "performer"),
    activeFans: active.filter((r) => r.role === "fan"),
    updatedAtMs: Date.now(),
  };
}

export function getPresenceRecord(roomId: string, userId: string): LivePresenceRecord | undefined {
  return rooms.get(roomId)?.get(userId);
}

export function isUserInRoom(roomId: string, userId: string): boolean {
  return rooms.get(roomId)?.get(userId)?.isActive === true;
}

export function getActivePerformers(roomId: string): LivePresenceRecord[] {
  return [...(rooms.get(roomId)?.values() ?? [])]
    .filter((r) => r.isActive && r.role === "performer");
}

export function getLiveRoomCount(roomId: string): number {
  return [...(rooms.get(roomId)?.values() ?? [])].filter((r) => r.isActive).length;
}

export function getAllActiveRoomIds(): string[] {
  return [...rooms.keys()].filter(id => {
    const roomMap = rooms.get(id);
    return roomMap && [...roomMap.values()].some(r => r.isActive);
  });
}

export function getAllRoomSnapshots(): LivePresenceSnapshot[] {
  return getAllActiveRoomIds().map(id => getLivePresenceSnapshot(id));
}

export function getAdaptiveLiveRuntimeHints(roomId: string) {
  const plan = experienceOptimizationEngine.getRuntimeOptimizationPlan();
  const snapshot = getLivePresenceSnapshot(roomId);
  return {
    roomId,
    crowdDensityHint: Math.min(100, snapshot.totalCount * 2.5),
    sponsorVisibilityPacing: plan.sponsorVisibilityPacing,
    topTicketDemand: plan.ticketPricingSuggestions[0] ?? null,
    topRewardTiming: plan.rewardTimingPlans[0] ?? null,
    conversionSurfacePriority: plan.fanConversionSurfacePriority,
  };
}
