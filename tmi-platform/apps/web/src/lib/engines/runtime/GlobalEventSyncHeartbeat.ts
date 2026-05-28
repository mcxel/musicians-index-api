/**
 * GlobalEventSyncHeartbeat
 * Master coordinator for synchronized world-wide events across all TMI rooms.
 * Target: <100ms synchronization for 10,000+ concurrent users.
 *
 * Architecture:
 *   UniversalClockRuntime  →  shared server-corrected clock
 *   LatencyCompensator     →  per-room delivery delay calculation
 *   EventPulseDistributor  →  fan-out to all subscriber callbacks
 *   WorldStateReplicator   →  shared vibe/beat/energy state
 */

import { universalNow } from './UniversalClockRuntime';
import { computeCompensatedDelays, getRegisteredRoomCount, getAverageRtt } from './LatencyCompensator';
import { dispatch, getSubscriberCount } from './EventPulseDistributor';
import { getWorldState, setBeatPhase, setVibe, type VibePreset } from './WorldStateReplicator';

export type HeartbeatStatus = 'stopped' | 'running' | 'paused';

export interface HeartbeatStats {
  status: HeartbeatStatus;
  pulseCount: number;
  lastPulseAt: number | null;
  connectedRooms: number;
  subscriberCount: number;
  avgRttMs: number;
  currentVibe: VibePreset;
  currentBpm: number;
  uptimeMs: number;
}

interface HeartbeatConfig {
  bpm: number;           // beats per minute for beat-aligned pulses
  adminPulseMs: number;  // interval for admin/presence heartbeat pulses
}

const DEFAULT_CONFIG: HeartbeatConfig = {
  bpm: 128,
  adminPulseMs: 15_000,
};

let status: HeartbeatStatus = 'stopped';
let pulseCount = 0;
let lastPulseAt: number | null = null;
let startedAt: number | null = null;
let beatIntervalHandle: ReturnType<typeof setInterval> | null = null;
let adminIntervalHandle: ReturnType<typeof setInterval> | null = null;
let config = { ...DEFAULT_CONFIG };

// ── Beat pulse ───────────────────────────────────────────────────────────────

function fireBeatPulse(): void {
  const now = universalNow();
  const world = getWorldState();
  const fireAt = now; // beat fires now; compensated delays handle per-room offset

  const delays = computeCompensatedDelays(fireAt);

  dispatch('beat', {
    bpm: world.vibeConfig.bpm,
    vibe: world.vibe,
    strobeIntensity: world.vibeConfig.strobeIntensity,
    crowdEnergy: world.crowdEnergyOverride ?? world.vibeConfig.crowdEnergy,
    beatPhase: world.beatPhase,
    compensatedDelays: delays,
    syncToken: world.syncToken,
  });

  // Advance beat phase
  setBeatPhase((world.beatPhase + 1 / (world.vibeConfig.bpm / 60 / (1000 / 100))) % 1);
  pulseCount++;
  lastPulseAt = now;
}

// ── Admin presence pulse ──────────────────────────────────────────────────────

function fireAdminPulse(): void {
  const world = getWorldState();
  dispatch('admin', {
    status,
    connectedRooms: getRegisteredRoomCount(),
    subscribers: getSubscriberCount(),
    avgRtt: getAverageRtt(),
    vibe: world.vibe,
    syncToken: world.syncToken,
    ts: universalNow(),
  });
}

// ── Public API ────────────────────────────────────────────────────────────────

export function startHeartbeat(overrides: Partial<HeartbeatConfig> = {}): void {
  if (status === 'running') return;
  config = { ...DEFAULT_CONFIG, ...overrides };

  const world = getWorldState();
  const bpmMs = (60 / world.vibeConfig.bpm) * 1000;

  beatIntervalHandle = setInterval(fireBeatPulse, bpmMs);
  adminIntervalHandle = setInterval(fireAdminPulse, config.adminPulseMs);

  status = 'running';
  startedAt = Date.now();
  pulseCount = 0;
  lastPulseAt = null;
}

export function stopHeartbeat(): void {
  if (beatIntervalHandle) clearInterval(beatIntervalHandle);
  if (adminIntervalHandle) clearInterval(adminIntervalHandle);
  beatIntervalHandle = null;
  adminIntervalHandle = null;
  status = 'stopped';
  startedAt = null;
}

export function pauseHeartbeat(): void {
  if (status !== 'running') return;
  if (beatIntervalHandle) clearInterval(beatIntervalHandle);
  if (adminIntervalHandle) clearInterval(adminIntervalHandle);
  beatIntervalHandle = null;
  adminIntervalHandle = null;
  status = 'paused';
}

export function resumeHeartbeat(): void {
  if (status !== 'paused') return;
  startHeartbeat(config);
}

export function triggerManualDrop(payload: Record<string, unknown> = {}): void {
  const now = universalNow();
  const delays = computeCompensatedDelays(now);
  const world = getWorldState();

  dispatch('drop', {
    ...payload,
    vibe: world.vibe,
    crowdEnergy: 1.0, // drops always max energy
    compensatedDelays: delays,
    syncToken: world.syncToken,
    ts: now,
  });

  pulseCount++;
  lastPulseAt = now;
}

export function triggerVibeChange(preset: VibePreset, by: string = 'admin'): void {
  const newState = setVibe(preset, by);
  const now = universalNow();
  const delays = computeCompensatedDelays(now);

  dispatch('vibe-change', {
    vibe: newState.vibe,
    vibeConfig: newState.vibeConfig,
    compensatedDelays: delays,
    syncToken: newState.syncToken,
    ts: now,
  });

  // Restart beat intervals at new BPM if running
  if (status === 'running') {
    pauseHeartbeat();
    resumeHeartbeat();
  }

  pulseCount++;
  lastPulseAt = now;
}

export function triggerCrowdSurge(energy: number = 1.0): void {
  const now = universalNow();
  const world = getWorldState();

  dispatch('crowd-surge', {
    energy: Math.max(0, Math.min(1, energy)),
    vibe: world.vibe,
    syncToken: world.syncToken,
    ts: now,
  });

  pulseCount++;
  lastPulseAt = now;
}

export function getHeartbeatStats(): HeartbeatStats {
  const world = getWorldState();
  return {
    status,
    pulseCount,
    lastPulseAt,
    connectedRooms: getRegisteredRoomCount(),
    subscriberCount: getSubscriberCount(),
    avgRttMs: getAverageRtt(),
    currentVibe: world.vibe,
    currentBpm: world.vibeConfig.bpm,
    uptimeMs: startedAt ? Date.now() - startedAt : 0,
  };
}

export function getHeartbeatStatus(): HeartbeatStatus {
  return status;
}
