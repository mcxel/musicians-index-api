/**
 * DistributedStateCheckpoint
 * Periodic durable checkpointing of world state across all runtime nodes.
 * Uses RedisWorldPubSub to broadcast checkpoints so every node stays in sync.
 *
 * On restart/failover: load latest checkpoint to resume cultural continuity.
 */

import { getWorldState } from './WorldStateReplicator';
import { getHeartbeatStats } from './GlobalEventSyncHeartbeat';
import { getRegisteredRoomCount, getAverageRtt } from './LatencyCompensator';
import { getSubscriberCount } from './EventPulseDistributor';
import { pubSubPublish, pubSubSubscribe, CHANNELS } from './RedisWorldPubSub';
import type { WorldState } from './WorldStateReplicator';

export interface StateCheckpoint {
  id: string;
  sequence: number;
  capturedAt: number;
  nodeId: string;
  worldState: WorldState;
  heartbeatStatus: string;
  pulseCount: number;
  connectedRooms: number;
  subscriberCount: number;
  avgRttMs: number;
  isValid: boolean;
  checksum: string;
}

// Simple additive checksum for fast validation (not cryptographic)
function checksum(cp: Omit<StateCheckpoint, 'checksum' | 'isValid'>): string {
  const s = JSON.stringify({ capturedAt: cp.capturedAt, worldState: cp.worldState.syncToken, sequence: cp.sequence });
  return s.split('').reduce((a, c) => (a + c.charCodeAt(0)) & 0xffffffff, 0).toString(16);
}

const NODE_ID = `node-${Date.now().toString(36)}`;
const MAX_CHECKPOINTS = 50;
const checkpoints: StateCheckpoint[] = [];
let sequence = 0;
let checkpointHandle: ReturnType<typeof setInterval> | null = null;
let latestRemoteCheckpoint: StateCheckpoint | null = null;

let unsubscribeRemote: (() => void) | null = null;

export async function startCheckpointing(intervalMs = 60_000): Promise<void> {
  if (checkpointHandle) return;

  // Listen for checkpoints from other nodes
  unsubscribeRemote = await pubSubSubscribe(CHANNELS.CHECKPOINT, (msg) => {
    const remote = msg.data as unknown as StateCheckpoint;
    if (remote.nodeId !== NODE_ID && remote.isValid) {
      latestRemoteCheckpoint = remote;
    }
  });

  checkpointHandle = setInterval(() => { void writeCheckpoint(); }, intervalMs);

  // Write one immediately
  await writeCheckpoint();
}

export function stopCheckpointing(): void {
  if (checkpointHandle) clearInterval(checkpointHandle);
  checkpointHandle = null;
  if (unsubscribeRemote) { unsubscribeRemote(); unsubscribeRemote = null; }
}

async function writeCheckpoint(): Promise<StateCheckpoint> {
  const world = getWorldState();
  const stats = getHeartbeatStats();

  sequence++;
  const partial = {
    id: `cp-${NODE_ID}-${sequence}`,
    sequence,
    capturedAt: Date.now(),
    nodeId: NODE_ID,
    worldState: world,
    heartbeatStatus: stats.status,
    pulseCount: stats.pulseCount,
    connectedRooms: getRegisteredRoomCount(),
    subscriberCount: getSubscriberCount(),
    avgRttMs: getAverageRtt(),
  };

  const cp: StateCheckpoint = {
    ...partial,
    isValid: true,
    checksum: checksum(partial),
  };

  checkpoints.push(cp);
  if (checkpoints.length > MAX_CHECKPOINTS) checkpoints.shift();

  await pubSubPublish(CHANNELS.CHECKPOINT, cp as unknown as Record<string, unknown>);
  return cp;
}

export function getLatestCheckpoint(): StateCheckpoint | null {
  return checkpoints[checkpoints.length - 1] ?? null;
}

export function getLatestRemoteCheckpoint(): StateCheckpoint | null {
  return latestRemoteCheckpoint;
}

export function getAllCheckpoints(): StateCheckpoint[] {
  return [...checkpoints];
}

export function validateCheckpoint(cp: StateCheckpoint): boolean {
  const expected = checksum({ ...cp });
  return cp.checksum === expected;
}

export function getCheckpointStats(): {
  localCount: number;
  sequence: number;
  nodeId: string;
  lastCheckpointAt: number | null;
  hasRemoteCheckpoint: boolean;
} {
  return {
    localCount: checkpoints.length,
    sequence,
    nodeId: NODE_ID,
    lastCheckpointAt: checkpoints[checkpoints.length - 1]?.capturedAt ?? null,
    hasRemoteCheckpoint: latestRemoteCheckpoint !== null,
  };
}
