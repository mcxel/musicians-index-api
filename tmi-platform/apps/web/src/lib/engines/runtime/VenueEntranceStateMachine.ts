/**
 * VenueEntranceStateMachine
 * Manages the lifecycle of a user joining a live room.
 * Ensures new joiners receive current world state before entering the stream.
 *
 * States:
 *   WAITING    → ticket checked, user in pre-entrance queue
 *   SYNCING    → receiving world state from WorldStateReplicator
 *   CALIBRATING → measuring RTT, registering with LatencyCompensator
 *   LIVE       → fully synchronized and in the room
 *   FAILED     → sync failed, offered retry
 */

import { getWorldState } from './WorldStateReplicator';
import { registerRoomLatency } from './LatencyCompensator';
import { subscribeRoom, unsubscribeRoom } from './EventPulseDistributor';
import type { SyncPulse } from './EventPulseDistributor';

export type EntranceState = 'waiting' | 'syncing' | 'calibrating' | 'live' | 'failed';

export interface EntranceSession {
  sessionId: string;
  userId: string;
  roomId: string;
  state: EntranceState;
  startedAt: number;
  liveAt: number | null;
  retryCount: number;
  worldStateSnapshot: ReturnType<typeof getWorldState> | null;
  measuredRttMs: number | null;
  failReason: string | null;
}

export interface EntranceCallbacks {
  onStateChange: (session: EntranceSession) => void;
  onLive: (session: EntranceSession) => void;
  onFailed: (session: EntranceSession, reason: string) => void;
  onPulse: (pulse: SyncPulse) => void;
}

const sessions = new Map<string, EntranceSession>();
const MAX_RETRIES = 3;
const SYNC_TIMEOUT_MS = 8_000;
const CALIBRATION_PINGS = 3;

function generateSessionId(): string {
  return `entry-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function transition(
  session: EntranceSession,
  nextState: EntranceState,
  callbacks: EntranceCallbacks,
  update: Partial<EntranceSession> = {},
): EntranceSession {
  const updated: EntranceSession = { ...session, ...update, state: nextState };
  sessions.set(session.sessionId, updated);
  callbacks.onStateChange(updated);
  return updated;
}

async function measureRtt(): Promise<number> {
  const pings: number[] = [];
  for (let i = 0; i < CALIBRATION_PINGS; i++) {
    const t0 = Date.now();
    await new Promise<void>((resolve) => setTimeout(resolve, 20));
    pings.push(Date.now() - t0);
  }
  return pings.reduce((a, b) => a + b, 0) / pings.length;
}

export async function enterVenue(
  userId: string,
  roomId: string,
  callbacks: EntranceCallbacks,
): Promise<EntranceSession> {
  const sessionId = generateSessionId();

  let session: EntranceSession = {
    sessionId, userId, roomId,
    state: 'waiting',
    startedAt: Date.now(),
    liveAt: null,
    retryCount: 0,
    worldStateSnapshot: null,
    measuredRttMs: null,
    failReason: null,
  };
  sessions.set(sessionId, session);
  callbacks.onStateChange(session);

  // SYNCING — capture world state
  session = transition(session, 'syncing', callbacks);
  const syncTimeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), SYNC_TIMEOUT_MS));
  const syncOp = new Promise<ReturnType<typeof getWorldState>>((resolve) => {
    resolve(getWorldState());
  });

  const worldState = await Promise.race([syncOp, syncTimeout]);
  if (!worldState) {
    session = transition(session, 'failed', callbacks, { failReason: 'World state sync timed out' });
    callbacks.onFailed(session, 'World state sync timed out');
    return session;
  }
  session = transition(session, 'calibrating', callbacks, { worldStateSnapshot: worldState });

  // CALIBRATING — measure RTT and register with LatencyCompensator
  let rttMs: number;
  try {
    rttMs = await measureRtt();
  } catch {
    if (session.retryCount < MAX_RETRIES) {
      return enterVenue(userId, roomId, { ...callbacks });
    }
    session = transition(session, 'failed', callbacks, { failReason: 'RTT calibration failed after retries' });
    callbacks.onFailed(session, 'RTT calibration failed');
    return session;
  }

  registerRoomLatency({ roomId, rttMs, offsetMs: 0, updatedAt: Date.now() });
  session = transition(session, 'calibrating', callbacks, { measuredRttMs: rttMs });

  // LIVE — subscribe to pulse distributor
  const unsubscribe = subscribeRoom(roomId, (pulse: SyncPulse) => {
    callbacks.onPulse(pulse);
  });

  session = transition(session, 'live', callbacks, {
    liveAt: Date.now(),
    measuredRttMs: rttMs,
  });
  callbacks.onLive(session);

  // Store cleanup reference
  const cleanup = () => {
    unsubscribe();
    unsubscribeRoom(roomId);
    sessions.delete(sessionId);
  };

  // Auto-cleanup after 4 hours (session expiry)
  setTimeout(cleanup, 4 * 60 * 60 * 1000);

  return session;
}

export function getEntranceSession(sessionId: string): EntranceSession | undefined {
  return sessions.get(sessionId);
}

export function getAllActiveSessions(): EntranceSession[] {
  return [...sessions.values()].filter((s) => s.state === 'live');
}

export function getEntranceStats(): {
  waiting: number;
  syncing: number;
  calibrating: number;
  live: number;
  failed: number;
} {
  const counts = { waiting: 0, syncing: 0, calibrating: 0, live: 0, failed: 0 };
  for (const s of sessions.values()) counts[s.state]++;
  return counts;
}

export function evictSession(sessionId: string): void {
  const session = sessions.get(sessionId);
  if (session) {
    unsubscribeRoom(session.roomId);
    sessions.delete(sessionId);
  }
}
