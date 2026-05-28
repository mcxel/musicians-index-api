/**
 * RuntimeGlitchSentinel
 * Watches the heartbeat for anomalies: pulse gaps, drift spikes, delivery failures.
 * Emits structured alerts to admin and optionally auto-pauses the heartbeat.
 */

import { getHeartbeatStats, pauseHeartbeat } from './GlobalEventSyncHeartbeat';
import { getClockState } from './UniversalClockRuntime';

export type GlitchSeverity = 'warn' | 'critical';

export type GlitchCode =
  | 'PULSE_GAP'           // heartbeat stopped firing beats
  | 'CLOCK_DRIFT'         // client/server offset exceeds threshold
  | 'HIGH_JITTER'         // RTT jitter too high for reliable sync
  | 'NO_ROOMS'            // zero rooms connected for too long
  | 'HIGH_RTT'            // average RTT above safe threshold
  | 'DELIVERY_BACKLOG';   // distributor falling behind

export interface GlitchAlert {
  id: string;
  code: GlitchCode;
  severity: GlitchSeverity;
  message: string;
  value: number;
  threshold: number;
  detectedAt: number;
  autoActed: boolean;    // true if sentinel took automatic action
}

export type GlitchHandler = (alert: GlitchAlert) => void;

interface SentinelThresholds {
  maxPulseGapMs: number;      // max ms between pulses before PULSE_GAP fires
  maxClockDriftMs: number;    // max abs(offset) before CLOCK_DRIFT fires
  maxJitterMs: number;        // max RTT stddev before HIGH_JITTER fires
  maxAvgRttMs: number;        // max average RTT before HIGH_RTT fires
  emptyRoomWindowMs: number;  // ms with zero rooms before NO_ROOMS fires
  autoActionOnCritical: boolean; // pause heartbeat on critical glitch
}

const DEFAULT_THRESHOLDS: SentinelThresholds = {
  maxPulseGapMs: 5_000,
  maxClockDriftMs: 500,
  maxJitterMs: 80,
  maxAvgRttMs: 400,
  emptyRoomWindowMs: 60_000,
  autoActionOnCritical: false,
};

const alertLog: GlitchAlert[] = [];
const MAX_ALERTS = 100;
const handlers = new Set<GlitchHandler>();
let thresholds = { ...DEFAULT_THRESHOLDS };
let watchHandle: ReturnType<typeof setInterval> | null = null;
let emptyRoomSince: number | null = null;

function generateId(): string {
  return `glitch-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function emitAlert(
  code: GlitchCode,
  severity: GlitchSeverity,
  message: string,
  value: number,
  threshold: number,
  autoActed = false,
): GlitchAlert {
  const alert: GlitchAlert = {
    id: generateId(), code, severity, message, value, threshold,
    detectedAt: Date.now(), autoActed,
  };
  alertLog.push(alert);
  if (alertLog.length > MAX_ALERTS) alertLog.shift();
  for (const h of handlers) {
    try { h(alert); } catch { /* handler errors must not disrupt sentinel */ }
  }
  return alert;
}

function runChecks(): void {
  const stats = getHeartbeatStats();
  const clock = getClockState();

  // PULSE_GAP — heartbeat running but last pulse was too long ago
  if (stats.status === 'running' && stats.lastPulseAt !== null) {
    const gap = Date.now() - stats.lastPulseAt;
    if (gap > thresholds.maxPulseGapMs) {
      const sev: GlitchSeverity = gap > thresholds.maxPulseGapMs * 2 ? 'critical' : 'warn';
      let acted = false;
      if (sev === 'critical' && thresholds.autoActionOnCritical) {
        pauseHeartbeat();
        acted = true;
      }
      emitAlert('PULSE_GAP', sev, `Heartbeat pulse gap: ${gap}ms (max ${thresholds.maxPulseGapMs}ms)`, gap, thresholds.maxPulseGapMs, acted);
    }
  }

  // CLOCK_DRIFT
  if (Math.abs(clock.offset) > thresholds.maxClockDriftMs) {
    emitAlert('CLOCK_DRIFT', 'warn', `Clock drift ${clock.offset.toFixed(0)}ms exceeds ${thresholds.maxClockDriftMs}ms`, Math.abs(clock.offset), thresholds.maxClockDriftMs);
  }

  // HIGH_JITTER
  if (clock.jitter > thresholds.maxJitterMs) {
    emitAlert('HIGH_JITTER', 'warn', `RTT jitter ${clock.jitter.toFixed(0)}ms exceeds ${thresholds.maxJitterMs}ms`, clock.jitter, thresholds.maxJitterMs);
  }

  // HIGH_RTT
  if (stats.avgRttMs > thresholds.maxAvgRttMs) {
    const sev: GlitchSeverity = stats.avgRttMs > thresholds.maxAvgRttMs * 2 ? 'critical' : 'warn';
    emitAlert('HIGH_RTT', sev, `Avg RTT ${stats.avgRttMs.toFixed(0)}ms exceeds ${thresholds.maxAvgRttMs}ms`, stats.avgRttMs, thresholds.maxAvgRttMs);
  }

  // NO_ROOMS
  if (stats.status === 'running' && stats.connectedRooms === 0) {
    if (emptyRoomSince === null) emptyRoomSince = Date.now();
    const emptyFor = Date.now() - emptyRoomSince;
    if (emptyFor > thresholds.emptyRoomWindowMs) {
      emitAlert('NO_ROOMS', 'warn', `No rooms connected for ${Math.round(emptyFor / 1000)}s`, emptyFor, thresholds.emptyRoomWindowMs);
    }
  } else {
    emptyRoomSince = null;
  }
}

export function startSentinel(
  intervalMs = 2_000,
  overrides: Partial<SentinelThresholds> = {},
): void {
  if (watchHandle) return;
  thresholds = { ...DEFAULT_THRESHOLDS, ...overrides };
  watchHandle = setInterval(runChecks, intervalMs);
}

export function stopSentinel(): void {
  if (watchHandle) clearInterval(watchHandle);
  watchHandle = null;
}

export function onGlitch(handler: GlitchHandler): () => void {
  handlers.add(handler);
  return () => handlers.delete(handler);
}

export function getAlertLog(limit = 20): GlitchAlert[] {
  return alertLog.slice(-limit);
}

export function clearAlertLog(): void {
  alertLog.length = 0;
}

export function getSentinelStatus(): { active: boolean; alertCount: number; criticalCount: number } {
  const criticals = alertLog.filter((a) => a.severity === 'critical').length;
  return { active: watchHandle !== null, alertCount: alertLog.length, criticalCount: criticals };
}
