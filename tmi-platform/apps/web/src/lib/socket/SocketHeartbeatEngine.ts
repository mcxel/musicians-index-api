export interface HeartbeatRecord {
  sessionId: string;
  roomId: string;
  lastPingAt: string;
  lastPongAt?: string;
  latencyMs?: number;
  missedBeats: number;
  isAlive: boolean;
}

const heartbeats = new Map<string, HeartbeatRecord>();

const MAX_MISSED_BEATS = 3;
const HEARTBEAT_INTERVAL_MS = 15_000;

export function registerHeartbeat(sessionId: string, roomId: string): HeartbeatRecord {
  const record: HeartbeatRecord = {
    sessionId,
    roomId,
    lastPingAt: new Date().toISOString(),
    missedBeats: 0,
    isAlive: true,
  };
  heartbeats.set(sessionId, record);
  return record;
}

export function recordPing(sessionId: string): HeartbeatRecord | null {
  const record = heartbeats.get(sessionId);
  if (!record) return null;
  const next: HeartbeatRecord = { ...record, lastPingAt: new Date().toISOString() };
  heartbeats.set(sessionId, next);
  return next;
}

export function recordPong(sessionId: string): HeartbeatRecord | null {
  const record = heartbeats.get(sessionId);
  if (!record) return null;
  const now = Date.now();
  const pingTime = new Date(record.lastPingAt).getTime();
  const latencyMs = now - pingTime;
  const next: HeartbeatRecord = {
    ...record,
    lastPongAt: new Date().toISOString(),
    latencyMs,
    missedBeats: 0,
    isAlive: true,
  };
  heartbeats.set(sessionId, next);
  return next;
}

export function checkHeartbeat(sessionId: string): { alive: boolean; shouldReconnect: boolean } {
  const record = heartbeats.get(sessionId);
  if (!record) return { alive: false, shouldReconnect: true };

  const now = Date.now();
  const lastPing = new Date(record.lastPingAt).getTime();
  const elapsed = now - lastPing;

  if (elapsed > HEARTBEAT_INTERVAL_MS * (record.missedBeats + 1)) {
    const missed = record.missedBeats + 1;
    const isAlive = missed < MAX_MISSED_BEATS;
    heartbeats.set(sessionId, { ...record, missedBeats: missed, isAlive });
    return { alive: isAlive, shouldReconnect: !isAlive };
  }

  return { alive: record.isAlive, shouldReconnect: false };
}

export function getDeadSessions(): HeartbeatRecord[] {
  return [...heartbeats.values()].filter((r) => !r.isAlive);
}

export function getAverageLatency(): number {
  const records = [...heartbeats.values()].filter((r) => r.latencyMs !== undefined);
  if (!records.length) return 0;
  return Math.round(records.reduce((s, r) => s + (r.latencyMs ?? 0), 0) / records.length);
}

export function removeHeartbeat(sessionId: string): void {
  heartbeats.delete(sessionId);
}
