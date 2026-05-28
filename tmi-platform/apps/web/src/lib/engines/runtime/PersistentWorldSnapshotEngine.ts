/**
 * PersistentWorldSnapshotEngine
 * Creates lightweight "save states" at significant moments.
 * Snapshots are the raw material for:
 *   - Forensic replay in admin hub
 *   - Room rejoin recovery
 *   - Cultural mythology (Legendary Moments)
 *   - Distributed checkpoint recovery
 */

import { getWorldState } from './WorldStateReplicator';
import { getHeartbeatStats } from './GlobalEventSyncHeartbeat';
import { getAverageRtt, getWorstCaseRtt, getRegisteredRoomCount } from './LatencyCompensator';
import { pubSubPublish, CHANNELS } from './RedisWorldPubSub';

export type SnapshotTrigger =
  | 'legendary-moment'   // major cultural event — battle win, premiere, etc.
  | 'vibe-change'        // world vibe shifted
  | 'drop'               // beat drop / big moment
  | 'crowd-peak'         // crowd energy hit maximum
  | 'period-checkpoint'  // scheduled periodic save
  | 'admin-manual'       // operator triggered
  | 'failover';          // captured before/after failover

export interface PerformerIdentity {
  userId: string;
  displayName: string;
  role: string;
  avatarSeed?: string;
}

export interface WorldStateSnapshot {
  id: string;
  trigger: SnapshotTrigger;
  label: string;               // human-readable, e.g. "Season Zero Finals — Drop Moment"
  capturedAt: number;          // UTC ms
  roomId: string | null;
  vibe: string;
  beatPhase: number;
  crowdEnergy: number;
  accentColor: string;
  bpm: number;
  strobeIntensity: number;
  activeRooms: number;
  avgRttMs: number;
  worstRttMs: number;
  heartbeatStatus: string;
  pulseCount: number;
  performers: PerformerIdentity[];
  metadata: Record<string, unknown>;
  isLegendary: boolean;        // pinned to mythology timeline
}

const MAX_SNAPSHOTS = 1_000;
const snapshots: WorldStateSnapshot[] = [];
const legendarySnapshots: WorldStateSnapshot[] = [];

function generateId(): string {
  return `snap-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function captureSnapshot(opts: {
  trigger: SnapshotTrigger;
  label: string;
  roomId?: string;
  performers?: PerformerIdentity[];
  metadata?: Record<string, unknown>;
  isLegendary?: boolean;
}): Promise<WorldStateSnapshot> {
  const world = getWorldState();
  const stats = getHeartbeatStats();

  const snapshot: WorldStateSnapshot = {
    id: generateId(),
    trigger: opts.trigger,
    label: opts.label,
    capturedAt: Date.now(),
    roomId: opts.roomId ?? null,
    vibe: world.vibe,
    beatPhase: world.beatPhase,
    crowdEnergy: world.crowdEnergyOverride ?? world.vibeConfig.crowdEnergy,
    accentColor: world.vibeConfig.accentColor,
    bpm: world.vibeConfig.bpm,
    strobeIntensity: world.vibeConfig.strobeIntensity,
    activeRooms: getRegisteredRoomCount(),
    avgRttMs: getAverageRtt(),
    worstRttMs: getWorstCaseRtt(),
    heartbeatStatus: stats.status,
    pulseCount: stats.pulseCount,
    performers: opts.performers ?? [],
    metadata: opts.metadata ?? {},
    isLegendary: opts.isLegendary ?? false,
  };

  snapshots.push(snapshot);
  if (snapshots.length > MAX_SNAPSHOTS) snapshots.shift();

  if (snapshot.isLegendary) {
    legendarySnapshots.push(snapshot);
  }

  // Broadcast to all nodes via pub/sub
  await pubSubPublish(CHANNELS.SNAPSHOT, snapshot as unknown as Record<string, unknown>);

  return snapshot;
}

export function getRecentSnapshots(limit = 20): WorldStateSnapshot[] {
  return snapshots.slice(-limit).reverse();
}

export function getLegendarySnapshots(): WorldStateSnapshot[] {
  return [...legendarySnapshots];
}

export function getSnapshotById(id: string): WorldStateSnapshot | undefined {
  return snapshots.find((s) => s.id === id);
}

export function getSnapshotsByRoom(roomId: string, limit = 10): WorldStateSnapshot[] {
  return snapshots.filter((s) => s.roomId === roomId).slice(-limit);
}

export function getSnapshotsByTrigger(trigger: SnapshotTrigger, limit = 20): WorldStateSnapshot[] {
  return snapshots.filter((s) => s.trigger === trigger).slice(-limit).reverse();
}

export function getSnapshotStats(): {
  total: number;
  legendary: number;
  oldestAt: number | null;
  newestAt: number | null;
} {
  return {
    total: snapshots.length,
    legendary: legendarySnapshots.length,
    oldestAt: snapshots[0]?.capturedAt ?? null,
    newestAt: snapshots[snapshots.length - 1]?.capturedAt ?? null,
  };
}

// ── Auto-snapshot wiring — call from heartbeat on significant events ──────────

let checkpointHandle: ReturnType<typeof setInterval> | null = null;

export function startPeriodicSnapshots(intervalMs = 5 * 60 * 1000): void {
  if (checkpointHandle) return;
  checkpointHandle = setInterval(() => {
    void captureSnapshot({ trigger: 'period-checkpoint', label: `Auto checkpoint — ${new Date().toISOString()}` });
  }, intervalMs);
}

export function stopPeriodicSnapshots(): void {
  if (checkpointHandle) clearInterval(checkpointHandle);
  checkpointHandle = null;
}
