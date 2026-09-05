/**
 * LobbyWallBoostEngine — paid visibility boosts for lobby mosaic tiles (Rule 20).
 * Honest PROMOTED badge; no fake engagement. In-memory until DB persistence lands.
 */

import type { LobbyWallCoreCategoryId } from "@/lib/lobby/liveLobbyWallLaw";

/** Boost active window — 24h from purchase. */
export const LOBBY_WALL_BOOST_DURATION_MS = 24 * 60 * 60 * 1000;

export type LobbyBoostKind = "lobby_wall" | "wdp_submission";

export interface LobbyWallBoostRecord {
  id: string;
  roomId: string;
  performerId: string;
  category: LobbyWallCoreCategoryId | "all";
  kind: LobbyBoostKind;
  wdpEntryId: string | null;
  startedAtMs: number;
  expiresAtMs: number;
  stripeSessionId: string | null;
}

const boostsById = new Map<string, LobbyWallBoostRecord>();
const activeRoomBoost = new Map<string, string>();

function genBoostId(): string {
  return `lwb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function purgeExpiredBoosts(nowMs: number = Date.now()): number {
  let removed = 0;
  for (const [id, rec] of [...boostsById.entries()]) {
    if (rec.expiresAtMs <= nowMs) {
      boostsById.delete(id);
      if (activeRoomBoost.get(rec.roomId) === id) {
        activeRoomBoost.delete(rec.roomId);
      }
      removed += 1;
    }
  }
  return removed;
}

export function recordLobbyWallBoost(input: {
  roomId: string;
  performerId: string;
  category: LobbyWallCoreCategoryId | "all";
  kind: LobbyBoostKind;
  wdpEntryId?: string | null;
  stripeSessionId?: string | null;
  startedAtMs?: number;
  durationMs?: number;
}): LobbyWallBoostRecord {
  purgeExpiredBoosts();
  const startedAtMs = input.startedAtMs ?? Date.now();
  const record: LobbyWallBoostRecord = {
    id: genBoostId(),
    roomId: input.roomId,
    performerId: input.performerId,
    category: input.category,
    kind: input.kind,
    wdpEntryId: input.wdpEntryId ?? null,
    startedAtMs,
    expiresAtMs: startedAtMs + (input.durationMs ?? LOBBY_WALL_BOOST_DURATION_MS),
    stripeSessionId: input.stripeSessionId ?? null,
  };
  boostsById.set(record.id, record);
  activeRoomBoost.set(record.roomId, record.id);
  return record;
}

export function getActiveBoostForRoom(
  roomId: string,
  nowMs: number = Date.now(),
): LobbyWallBoostRecord | null {
  purgeExpiredBoosts(nowMs);
  const id = activeRoomBoost.get(roomId);
  if (!id) return null;
  const rec = boostsById.get(id);
  if (!rec || rec.expiresAtMs <= nowMs) return null;
  return rec;
}

export function getActiveBoostsForRooms(
  roomIds: readonly string[],
  nowMs: number = Date.now(),
): Map<string, LobbyWallBoostRecord> {
  purgeExpiredBoosts(nowMs);
  const out = new Map<string, LobbyWallBoostRecord>();
  for (const roomId of roomIds) {
    const rec = getActiveBoostForRoom(roomId, nowMs);
    if (rec) out.set(roomId, rec);
  }
  return out;
}

export function listActiveBoosts(nowMs: number = Date.now()): LobbyWallBoostRecord[] {
  purgeExpiredBoosts(nowMs);
  return [...boostsById.values()].filter((r) => r.expiresAtMs > nowMs);
}

export function buildBoostCheckoutMetadata(input: {
  roomId: string;
  performerId: string;
  category: string;
  kind: LobbyBoostKind;
  wdpEntryId?: string;
}): Record<string, string> {
  return {
    type: input.kind === "wdp_submission" ? "wdp_submission_boost" : "boost_lobby_wall",
    roomId: input.roomId,
    performerId: input.performerId,
    category: input.category,
    boostKind: input.kind,
    ...(input.wdpEntryId ? { wdpEntryId: input.wdpEntryId } : {}),
  };
}
