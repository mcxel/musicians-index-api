/**
 * Client session cache for durable Green Room membership.
 * Cache never grants private access alone — server STATE always revalidates.
 * Room-scoped: switching rooms cannot inherit another room's entryId.
 */

import {
  fetchDurableQueueState,
  isDurablePrivateBackstageMember,
  type DurableQueueResponse,
} from "@/lib/live/DurableGreenRoomPresentationBridge";

export const DURABLE_GREEN_ROOM_MEMBERSHIP_SESSION_ID =
  "DURABLE_GREEN_ROOM_MEMBERSHIP_SESSION_v1" as const;

export const CACHE_ALONE_GRANTS_PRIVATE_BACKSTAGE = 0 as const;
export const CROSS_ROOM_MEMBERSHIP_TRANSFER = 0 as const;

export type GreenRoomMembershipSnapshot = {
  roomId: string;
  userId: string;
  entryId: string | null;
  status: string;
  cameraConsent: boolean;
  privateBackstageAllowed: boolean;
  serverConfirmed: boolean;
  migrationNotApplied: boolean;
  cypherTurnSeconds: number | null;
  cypherTurnSource: "SAVED" | "DEFAULT" | null;
  updatedAtMs: number;
};

const STORAGE_PREFIX = "tmi.greenRoom.membership.v1";

function key(roomId: string, userId: string): string {
  return `${STORAGE_PREFIX}:${roomId}:${userId}`;
}

export function readMembershipCache(
  roomId: string,
  userId: string,
): GreenRoomMembershipSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(key(roomId, userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GreenRoomMembershipSnapshot;
    if (parsed.roomId !== roomId || parsed.userId !== userId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeMembershipCache(snap: GreenRoomMembershipSnapshot): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(key(snap.roomId, snap.userId), JSON.stringify(snap));
  } catch {
    /* quota / private mode — ignore */
  }
}

export function clearMembershipCache(roomId: string, userId: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(key(roomId, userId));
  } catch {
    /* ignore */
  }
}

/** Clear every room cache for this user (logout / hard reset). */
export function clearAllMembershipCachesForUser(userId: string): void {
  if (typeof window === "undefined") return;
  try {
    const prefix = `${STORAGE_PREFIX}:`;
    const suffix = `:${userId}`;
    const doomed: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith(prefix) && k.endsWith(suffix)) doomed.push(k);
    }
    for (const k of doomed) sessionStorage.removeItem(k);
  } catch {
    /* ignore */
  }
}

/**
 * Presentation hint from cache only — NEVER sufficient for private mosaic.
 * UI may show "revalidating…" when cache.privateBackstageAllowed && !serverConfirmed.
 */
export function membershipHintFromCache(
  roomId: string,
  userId: string,
): { mayBeMember: boolean; entryId: string | null; needsRevalidate: true } {
  const cached = readMembershipCache(roomId, userId);
  if (!cached || cached.roomId !== roomId) {
    return { mayBeMember: false, entryId: null, needsRevalidate: true };
  }
  return {
    mayBeMember: Boolean(cached.entryId) && cached.privateBackstageAllowed,
    entryId: cached.entryId,
    needsRevalidate: true,
  };
}

export function snapshotFromDurableState(input: {
  roomId: string;
  userId: string;
  state: DurableQueueResponse;
  isHost?: boolean;
}): GreenRoomMembershipSnapshot {
  const member =
    isDurablePrivateBackstageMember(input.state) || input.isHost === true;
  const status = String(input.state.status ?? "NONE").toUpperCase();
  return {
    roomId: input.roomId,
    userId: input.userId,
    entryId: input.state.entryId ?? null,
    status,
    cameraConsent: input.state.cameraConsent === true,
    privateBackstageAllowed: member,
    serverConfirmed: input.state.ok === true && !input.state.migrationNotApplied,
    migrationNotApplied: input.state.migrationNotApplied === true,
    cypherTurnSeconds:
      typeof input.state.cypherTurnSeconds === "number"
        ? input.state.cypherTurnSeconds
        : null,
    cypherTurnSource:
      input.state.cypherTurnSource === "SAVED" || input.state.cypherTurnSource === "DEFAULT"
        ? input.state.cypherTurnSource
        : typeof input.state.cypherTurnSeconds === "number"
          ? "DEFAULT"
          : null,
    updatedAtMs: Date.now(),
  };
}

/**
 * Revalidate against durable STATE. Cache updated only from server response.
 * Cross-room: always pass the active roomId — never reuse another room's entry.
 */
export async function revalidateGreenRoomMembership(input: {
  roomId: string;
  userId: string;
  isHost?: boolean;
}): Promise<GreenRoomMembershipSnapshot> {
  const state = await fetchDurableQueueState(input.roomId);
  const snap = snapshotFromDurableState({
    roomId: input.roomId,
    userId: input.userId,
    state,
    isHost: input.isHost,
  });
  if (snap.serverConfirmed || snap.migrationNotApplied) {
    writeMembershipCache(snap);
  }
  // ON_STAGE / NONE / FORFEITED → private mosaic denied; clear stale allow flag
  if (!snap.privateBackstageAllowed) {
    writeMembershipCache(snap);
  }
  return snap;
}

/**
 * Transition rules for private backstage media (presentation gate).
 * QUEUED/CALLED → allowed; ON_STAGE → denied (onstage excluded from private mosaic);
 * NONE / missing entry → denied.
 */
export function privateBackstageAllowedForStatus(
  status: string,
  entryId: string | null,
): boolean {
  if (!entryId) return false;
  const st = String(status ?? "").toUpperCase();
  return st === "QUEUED" || st === "CALLED";
}

/**
 * Prevents presenting Room A's entryId as membership in Room B.
 */
export function assertSameRoomMembership(
  snap: GreenRoomMembershipSnapshot | null,
  roomId: string,
): boolean {
  return Boolean(snap && snap.roomId === roomId && CROSS_ROOM_MEMBERSHIP_TRANSFER === 0);
}
