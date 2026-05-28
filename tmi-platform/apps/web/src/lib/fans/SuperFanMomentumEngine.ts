/**
 * SuperFanMomentumEngine
 * In-memory live-session tracker for fan activity per performer room.
 * Lives alongside GlobalLiveSessionRegistry — no persistence required.
 * Evicted when the session ends or the server restarts.
 */

export interface FanMomentum {
  fanId: string;
  displayName: string;
  performerId: string;
  roomId: string;
  tipTotalUsd: number;
  sessionCount: number;
  messageCount: number;
  legendaryMoments: number;
  firstSeenAt: number;
  lastSeenAt: number;
  isFoundingFan: boolean;
}

// key: `${performerId}::${fanId}`
const store = new Map<string, FanMomentum>();

const FOUNDING_WINDOW_MS = 30 * 24 * 60 * 60 * 1000; // 30 days from platform epoch
const PLATFORM_EPOCH = new Date('2026-01-01').getTime();

function key(performerId: string, fanId: string) {
  return `${performerId}::${fanId}`;
}

function getOrCreate(performerId: string, roomId: string, fanId: string, displayName: string): FanMomentum {
  const k = key(performerId, fanId);
  if (!store.has(k)) {
    store.set(k, {
      fanId,
      displayName,
      performerId,
      roomId,
      tipTotalUsd: 0,
      sessionCount: 0,
      messageCount: 0,
      legendaryMoments: 0,
      firstSeenAt: Date.now(),
      lastSeenAt: Date.now(),
      isFoundingFan: Date.now() < PLATFORM_EPOCH + FOUNDING_WINDOW_MS,
    });
  }
  return store.get(k)!;
}

export function recordFanJoin(performerId: string, roomId: string, fanId: string, displayName: string): FanMomentum {
  const m = getOrCreate(performerId, roomId, fanId, displayName);
  m.sessionCount += 1;
  m.lastSeenAt = Date.now();
  return m;
}

export function recordFanMessage(performerId: string, fanId: string, displayName: string): void {
  const m = getOrCreate(performerId, '', fanId, displayName);
  m.messageCount += 1;
  m.lastSeenAt = Date.now();
}

export function recordFanTip(performerId: string, fanId: string, displayName: string, amountUsd: number): void {
  const m = getOrCreate(performerId, '', fanId, displayName);
  m.tipTotalUsd += amountUsd;
  m.lastSeenAt = Date.now();
  // A tip ≥ $10 or 10-session streak counts as a legendary moment
  if (amountUsd >= 10) {
    m.legendaryMoments += 1;
  }
}

export function getTopFansByTips(performerId: string, limit = 5): FanMomentum[] {
  return Array.from(store.values())
    .filter((m) => m.performerId === performerId)
    .sort((a, b) => b.tipTotalUsd - a.tipTotalUsd)
    .slice(0, limit);
}

export function getTopFansByPresence(performerId: string, limit = 5): FanMomentum[] {
  return Array.from(store.values())
    .filter((m) => m.performerId === performerId)
    .sort((a, b) => (b.sessionCount + b.messageCount) - (a.sessionCount + a.messageCount))
    .slice(0, limit);
}

export function getFanMomentum(performerId: string, fanId: string): FanMomentum | null {
  return store.get(key(performerId, fanId)) ?? null;
}

export function clearRoomMomentum(performerId: string): void {
  for (const [k] of store) {
    if (k.startsWith(`${performerId}::`)) store.delete(k);
  }
}
