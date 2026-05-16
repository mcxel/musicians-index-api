// DEV ONLY — in-memory session delta store. Resets on server restart.
// Action stats (reactions, tips) are derived from ProfileSessionStore — no duplicate counters.
import { getProfileLoopSession } from '@/lib/profile/ProfileSessionStore';

export interface PerformerSessionDelta {
  sessionId: string;
  performerSlug: string;
  roomId: string;
  startMs: number;
  endMs: number;
  durationMs: number;
  fansSeated: number;
  reactions: number;
  tips: number;
  tipAmountCents: number;
  heatScore: number;
}

interface SessionRecord {
  sessionId: string;
  performerSlug: string;
  roomId: string;
  startMs: number;
  endMs: number;
  fansSeated: number;
  fanSessionIds: string[]; // ProfileSessionStore session IDs attributed to this broadcast
}

const store = new Map<string, SessionRecord>();
const activeByRoom = new Map<string, string>(); // roomId → performerSessionId

export function startPerformerSession(sessionId: string, performerSlug: string, roomId: string): void {
  const record: SessionRecord = {
    sessionId,
    performerSlug,
    roomId,
    startMs: Date.now(),
    endMs: 0,
    fansSeated: 0,
    fanSessionIds: [],
  };
  store.set(sessionId, record);
  activeByRoom.set(roomId, sessionId);
  console.log(`[PerformerAnalyticsEngine] session started sid=${sessionId} room=${roomId}`);
}

export function recordFanEntry(roomId: string, fanSessionId?: string): void {
  const sessionId = activeByRoom.get(roomId);
  if (!sessionId) return;
  const d = store.get(sessionId);
  if (!d) return;
  const fanSessionIds =
    fanSessionId && !d.fanSessionIds.includes(fanSessionId)
      ? [...d.fanSessionIds, fanSessionId]
      : d.fanSessionIds;
  store.set(sessionId, { ...d, fansSeated: d.fansSeated + 1, fanSessionIds });
}

export function endPerformerSession(sessionId: string): void {
  const d = store.get(sessionId);
  if (!d || d.endMs) return;
  store.set(sessionId, { ...d, endMs: Date.now() });
  activeByRoom.delete(d.roomId);
}

export function getSessionDelta(sessionId: string): PerformerSessionDelta | null {
  const d = store.get(sessionId);
  if (!d) return null;

  const endMs = d.endMs || Date.now();
  const durationMs = endMs - d.startMs;

  // Derive action counts from the unified fan session store
  let reactions = 0;
  let tips = 0;
  for (const fanSid of d.fanSessionIds) {
    const session = getProfileLoopSession(fanSid);
    if (!session) continue;
    reactions += session.actionStats.reaction;
    tips += session.actionStats.tip;
  }

  // 100 cents per tip is the V1 default unit; replace with actual tip values once wired
  const tipAmountCents = tips * 100;
  const heatScore = d.fansSeated * 5 + reactions + tips * 10;

  return {
    sessionId: d.sessionId,
    performerSlug: d.performerSlug,
    roomId: d.roomId,
    startMs: d.startMs,
    endMs,
    durationMs,
    fansSeated: d.fansSeated,
    reactions,
    tips,
    tipAmountCents,
    heatScore,
  };
}

export function clearSessionDelta(sessionId: string): void {
  const d = store.get(sessionId);
  if (d) activeByRoom.delete(d.roomId);
  store.delete(sessionId);
}

export function getActiveSessionForRoom(roomId: string): string | null {
  return activeByRoom.get(roomId) ?? null;
}

export function getFanSessionIds(performerSessionId: string): string[] {
  return [...(store.get(performerSessionId)?.fanSessionIds ?? [])];
}
