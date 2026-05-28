/**
 * VenueFailoverCoordinator
 * Detects primary node failure, coordinates recovery, and restores
 * world state from the most recent valid checkpoint.
 *
 * Failover sequence:
 *   1. Detect heartbeat gap > failover threshold
 *   2. Acquire coordination lock via pub/sub
 *   3. Load latest checkpoint
 *   4. Restore world state
 *   5. Restart heartbeat
 *   6. Capture failover snapshot for mythology log
 *   7. Notify all rooms — they rejoin from known-good state
 */

import { getHeartbeatStats, startHeartbeat, getHeartbeatStatus } from './GlobalEventSyncHeartbeat';
import { getLatestCheckpoint, getLatestRemoteCheckpoint, validateCheckpoint } from './DistributedStateCheckpoint';
import { setVibe, setCrowdEnergyOverride } from './WorldStateReplicator';
import { captureSnapshot } from './PersistentWorldSnapshotEngine';
import { recoverFromLatestSnapshot } from './EventReplayRecovery';
import { dispatch } from './EventPulseDistributor';
import { pubSubPublish, pubSubSubscribe, CHANNELS } from './RedisWorldPubSub';
import type { VibePreset } from './WorldStateReplicator';

export type FailoverStatus = 'monitoring' | 'failover-detected' | 'recovering' | 'recovered' | 'failed';

export interface FailoverEvent {
  id: string;
  detectedAt: number;
  resolvedAt: number | null;
  status: FailoverStatus;
  restoredFromCheckpointId: string | null;
  restoredFromSnapshotId: string | null;
  durationMs: number | null;
  notes: string[];
}

type FailoverListener = (event: FailoverEvent) => void;

const NODE_ID = `fov-${Date.now().toString(36)}`;
const FAILOVER_THRESHOLD_MS = 10_000;  // gap before declaring primary down
const failoverLog: FailoverEvent[] = [];
const listeners = new Set<FailoverListener>();

let monitorHandle: ReturnType<typeof setInterval> | null = null;
let lastKnownPulseAt: number | null = null;
let currentStatus: FailoverStatus = 'monitoring';
let isCoordinating = false;

let unsubscribeFailoverChannel: (() => void) | null = null;

function generateId(): string {
  return `fov-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function notifyListeners(event: FailoverEvent): void {
  for (const l of listeners) { try { l(event); } catch { /* ignore */ } }
}

async function executeFailover(): Promise<FailoverEvent> {
  if (isCoordinating) {
    return {
      id: generateId(), detectedAt: Date.now(), resolvedAt: null,
      status: 'failover-detected', restoredFromCheckpointId: null,
      restoredFromSnapshotId: null, durationMs: null,
      notes: ['Another node is already coordinating — standing by'],
    };
  }

  isCoordinating = true;
  const event: FailoverEvent = {
    id: generateId(), detectedAt: Date.now(), resolvedAt: null,
    status: 'recovering', restoredFromCheckpointId: null,
    restoredFromSnapshotId: null, durationMs: null, notes: [],
  };
  failoverLog.push(event);
  currentStatus = 'recovering';

  // Announce coordination claim
  await pubSubPublish(CHANNELS.CHECKPOINT, {
    type: 'failover-claim', nodeId: NODE_ID, eventId: event.id,
  });

  try {
    // Try checkpoint restore first
    const localCp = getLatestCheckpoint();
    const remoteCp = getLatestRemoteCheckpoint();
    const bestCp = remoteCp && (!localCp || remoteCp.capturedAt > localCp.capturedAt) ? remoteCp : localCp;

    if (bestCp && validateCheckpoint(bestCp)) {
      setVibe(bestCp.worldState.vibe as VibePreset, 'failover');
      setCrowdEnergyOverride(
        bestCp.worldState.crowdEnergyOverride ?? bestCp.worldState.vibeConfig.crowdEnergy,
        'failover',
      );
      event.restoredFromCheckpointId = bestCp.id;
      event.notes.push(`Restored from checkpoint ${bestCp.id} (age: ${Date.now() - bestCp.capturedAt}ms)`);
    } else {
      // Fall back to snapshot replay
      const snapId = await recoverFromLatestSnapshot();
      event.restoredFromSnapshotId = snapId;
      event.notes.push(snapId ? `Restored from snapshot ${snapId}` : 'No snapshot available — starting fresh');
    }

    // Restart heartbeat if stopped
    if (getHeartbeatStatus() !== 'running') {
      startHeartbeat();
      event.notes.push('Heartbeat restarted');
    }

    // Dispatch recovery notification to all rooms
    dispatch('admin', {
      type: 'failover-recovery',
      nodeId: NODE_ID,
      eventId: event.id,
      message: 'Platform recovered — world state restored',
    });

    // Capture failover in mythology log
    void captureSnapshot({
      trigger: 'failover',
      label: `Failover Recovery — ${new Date().toISOString()}`,
      metadata: { eventId: event.id, checkpointId: event.restoredFromCheckpointId },
    });

    event.status = 'recovered';
    event.resolvedAt = Date.now();
    event.durationMs = event.resolvedAt - event.detectedAt;
    currentStatus = 'monitoring';
    event.notes.push(`Recovery completed in ${event.durationMs}ms`);

  } catch (err) {
    event.status = 'failed';
    event.notes.push(`Recovery error: ${err instanceof Error ? err.message : String(err)}`);
    currentStatus = 'failed';
  } finally {
    isCoordinating = false;
  }

  notifyListeners(event);
  return event;
}

function checkForFailure(): void {
  const stats = getHeartbeatStats();

  if (stats.status === 'running' && stats.lastPulseAt !== null) {
    lastKnownPulseAt = stats.lastPulseAt;
  }

  if (stats.status !== 'running') return;

  if (lastKnownPulseAt && (Date.now() - lastKnownPulseAt) > FAILOVER_THRESHOLD_MS) {
    currentStatus = 'failover-detected';
    void executeFailover();
  }
}

export async function startFailoverMonitor(): Promise<void> {
  if (monitorHandle) return;

  // Listen for coordination claims from other nodes
  unsubscribeFailoverChannel = await pubSubSubscribe(CHANNELS.CHECKPOINT, (msg) => {
    const data = msg.data as Record<string, unknown>;
    if (data['type'] === 'failover-claim' && data['nodeId'] !== NODE_ID) {
      isCoordinating = true;  // back off — another node took the lead
      setTimeout(() => { isCoordinating = false; }, 15_000);
    }
  });

  monitorHandle = setInterval(checkForFailure, 2_000);
}

export function stopFailoverMonitor(): void {
  if (monitorHandle) clearInterval(monitorHandle);
  monitorHandle = null;
  if (unsubscribeFailoverChannel) { unsubscribeFailoverChannel(); unsubscribeFailoverChannel = null; }
  currentStatus = 'monitoring';
}

export function getFailoverStatus(): FailoverStatus {
  return currentStatus;
}

export function getFailoverLog(): FailoverEvent[] {
  return [...failoverLog];
}

export function onFailover(listener: FailoverListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getFailoverStats(): {
  status: FailoverStatus;
  totalFailovers: number;
  lastFailoverAt: number | null;
  isCoordinating: boolean;
  nodeId: string;
} {
  return {
    status: currentStatus,
    totalFailovers: failoverLog.filter((e) => e.status === 'recovered').length,
    lastFailoverAt: failoverLog[failoverLog.length - 1]?.detectedAt ?? null,
    isCoordinating,
    nodeId: NODE_ID,
  };
}

export async function triggerFailoverRecovery(reason = 'manual-trigger'): Promise<FailoverEvent> {
  lastKnownPulseAt = Date.now() - FAILOVER_THRESHOLD_MS - 1;
  const event = await executeFailover();
  event.notes.push(`Triggered by: ${reason}`);
  return event;
}
