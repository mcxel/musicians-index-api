/**
 * LatencyCompensator
 * Adaptive playback-offset calculator for audio/visual sync across rooms.
 * Each room registers its measured RTT and receives a compensated fire-time
 * so that all rooms experience a beat drop at the same wall-clock moment.
 */

export interface RoomLatencyRecord {
  roomId: string;
  rttMs: number;        // measured round-trip time
  offsetMs: number;     // clock offset vs server (from UniversalClockRuntime)
  updatedAt: number;    // Date.now() when this was last measured
}

export interface CompensatedDelay {
  roomId: string;
  delayMs: number;      // how long this room should wait before playing the event
  confidence: 'high' | 'medium' | 'low';
}

const TTL_MS = 30_000; // records older than 30s are stale
const registry = new Map<string, RoomLatencyRecord>();

export function registerRoomLatency(record: RoomLatencyRecord): void {
  registry.set(record.roomId, record);
}

export function unregisterRoom(roomId: string): void {
  registry.delete(roomId);
}

function isStale(record: RoomLatencyRecord): boolean {
  return Date.now() - record.updatedAt > TTL_MS;
}

function activeRecords(): RoomLatencyRecord[] {
  const out: RoomLatencyRecord[] = [];
  for (const [, r] of registry) {
    if (!isStale(r)) out.push(r);
  }
  return out;
}

/**
 * Given a target fire-time (UTC ms, from server), returns per-room delay values
 * so every room starts at the same global wall-clock instant.
 *
 * Rooms with low latency wait a bit; rooms with high latency fire sooner.
 * The global synchronization deadline is now + maxRtt + BUFFER_MS.
 */
const BUFFER_MS = 50; // safety buffer above worst-case RTT

export function computeCompensatedDelays(targetFireTimeUtc: number): CompensatedDelay[] {
  const records = activeRecords();
  if (!records.length) return [];

  const maxRtt = Math.max(...records.map((r) => r.rttMs));
  const deadline = targetFireTimeUtc + maxRtt + BUFFER_MS;

  return records.map((r): CompensatedDelay => {
    const halfRtt = r.rttMs / 2;
    const clientReceiveTime = targetFireTimeUtc + halfRtt + r.offsetMs;
    const delayMs = Math.max(0, deadline - clientReceiveTime);
    const confidence: CompensatedDelay['confidence'] =
      r.rttMs < 80 ? 'high' : r.rttMs < 200 ? 'medium' : 'low';
    return { roomId: r.roomId, delayMs, confidence };
  });
}

export function getRegisteredRoomCount(): number {
  return activeRecords().length;
}

export function getAverageRtt(): number {
  const records = activeRecords();
  if (!records.length) return 0;
  return records.reduce((a, r) => a + r.rttMs, 0) / records.length;
}

export function getWorstCaseRtt(): number {
  const records = activeRecords();
  if (!records.length) return 0;
  return Math.max(...records.map((r) => r.rttMs));
}
