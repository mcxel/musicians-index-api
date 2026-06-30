'use client';

/**
 * UniversalClockRuntime
 * Server-authoritative shared clock with client drift compensation.
 * All rooms read from this to stay synchronized within <100ms globally.
 */

export interface ClockSample {
  serverTime: number;    // UTC ms from server
  clientSentAt: number;  // performance.now() when request was sent
  clientRecvAt: number;  // performance.now() when response was received
}

export interface ClockState {
  offset: number;        // ms to add to Date.now() to match server time
  rtt: number;           // last round-trip time ms
  jitter: number;        // rolling stddev of RTT samples
  syncCount: number;     // how many syncs completed
  lastSyncAt: number;    // performance.now() of last sync
}

const MAX_SAMPLES = 8;
const samples: ClockSample[] = [];
let state: ClockState = {
  offset: 0,
  rtt: 0,
  jitter: 0,
  syncCount: 0,
  lastSyncAt: 0,
};

function computeOffset(s: ClockSample): number {
  if (typeof performance === 'undefined') return 0; // SSR-safe fallback
  const rtt = s.clientRecvAt - s.clientSentAt;
  const serverNowAtMidpoint = s.serverTime + rtt / 2;
  const clientNowAtMidpoint = s.clientSentAt + rtt / 2;
  return serverNowAtMidpoint - (Date.now() - (performance.now() - clientNowAtMidpoint));
}

function stddev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

export function ingestClockSample(sample: ClockSample): ClockState {
  samples.push(sample);
  if (samples.length > MAX_SAMPLES) samples.shift();

  const rtts = samples.map((s) => s.clientRecvAt - s.clientSentAt);
  const minRtt = Math.min(...rtts);
  const bestSample = samples[rtts.indexOf(minRtt)]!;

  state = {
    offset: computeOffset(bestSample),
    rtt: sample.clientRecvAt - sample.clientSentAt,
    jitter: stddev(rtts),
    syncCount: state.syncCount + 1,
    lastSyncAt: sample.clientRecvAt,
  };

  return state;
}

/** Returns UTC epoch ms adjusted for server-client drift. */
export function universalNow(): number {
  return Date.now() + state.offset;
}

/** Returns the current clock state for diagnostics. */
export function getClockState(): Readonly<ClockState> {
  return state;
}

/** Reset (useful for tests or re-sync after network change). */
export function resetClock(): void {
  samples.length = 0;
  state = { offset: 0, rtt: 0, jitter: 0, syncCount: 0, lastSyncAt: 0 };
}

// ── Server-side sync endpoint helper ────────────────────────────────────────
// Call from /api/clock/sync route: returns the server timestamp for the client
// to pair with its clientSentAt / clientRecvAt bookends.

export function serverTimestamp(): { t: number } {
  return { t: Date.now() };
}
