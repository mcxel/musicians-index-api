/**
 * RoomRejoinRecovery
 * When a user re-enters a room after disconnect, delivers the current
 * world state + most recent snapshot so they see the correct lighting,
 * vibe, crowd energy, and beat phase — not a blank start.
 *
 * This is what makes the world feel continuous, not ephemeral.
 */

import { getWorldState } from './WorldStateReplicator';
import { getSnapshotsByRoom, getRecentSnapshots } from './PersistentWorldSnapshotEngine';
import { getEntranceStats } from './VenueEntranceStateMachine';
import type { WorldStateSnapshot } from './PersistentWorldSnapshotEngine';
import type { WorldState } from './WorldStateReplicator';

export interface RejoinPayload {
  userId: string;
  roomId: string;
  worldState: WorldState;
  lastSnapshot: WorldStateSnapshot | null;
  beatPhaseEstimate: number;   // best estimate of current beat phase
  suggestedDelayMs: number;    // how long to wait before entering stream
  continuityScore: number;     // 0–1: how faithfully we restored their experience
  message: string;             // human-readable status for debugging
}

const USER_LAST_SEEN = new Map<string, { roomId: string; leftAt: number; snapshot: WorldStateSnapshot | null }>();
const MAX_HISTORY = 5_000;

export function recordUserLeave(userId: string, roomId: string): void {
  const roomSnaps = getSnapshotsByRoom(roomId, 1);
  USER_LAST_SEEN.set(userId, {
    roomId,
    leftAt: Date.now(),
    snapshot: roomSnaps[0] ?? null,
  });

  if (USER_LAST_SEEN.size > MAX_HISTORY) {
    const firstKey = USER_LAST_SEEN.keys().next().value;
    if (firstKey) USER_LAST_SEEN.delete(firstKey);
  }
}

export function buildRejoinPayload(userId: string, roomId: string): RejoinPayload {
  const world = getWorldState();
  const lastRecord = USER_LAST_SEEN.get(userId);

  // Find best snapshot for this room
  const roomSnaps = getSnapshotsByRoom(roomId, 1);
  const globalRecent = getRecentSnapshots(1);
  const lastSnapshot = roomSnaps[0] ?? globalRecent[0] ?? null;

  // Estimate how far into the beat cycle we are now
  const bpmMs = (60 / world.vibeConfig.bpm) * 1000;
  const beatPhaseEstimate = ((Date.now() % bpmMs) / bpmMs);

  // How long was the user gone?
  const goneMs = lastRecord ? Date.now() - lastRecord.leftAt : 0;
  const wasInThisRoom = lastRecord?.roomId === roomId;

  // Continuity score: decreases with absence time and room mismatch
  let continuityScore = 1.0;
  if (goneMs > 5 * 60 * 1000) continuityScore -= 0.4;  // >5min
  else if (goneMs > 60 * 1000) continuityScore -= 0.2;  // >1min
  if (!wasInThisRoom) continuityScore -= 0.2;
  continuityScore = Math.max(0, Math.min(1, continuityScore));

  // Suggest a short buffer delay so the client calibrates before joining the stream
  const suggestedDelayMs = continuityScore > 0.8 ? 200 : continuityScore > 0.5 ? 500 : 1000;

  let message = 'World state restored from live runtime.';
  if (lastSnapshot && goneMs < 5 * 60 * 1000) {
    message = `Restored from snapshot: "${lastSnapshot.label}"`;
  } else if (!lastSnapshot) {
    message = 'No snapshot available — connected to live runtime directly.';
  } else {
    message = 'Gap too large for snapshot recovery — connected to current live state.';
  }

  return {
    userId, roomId, worldState: world,
    lastSnapshot: lastSnapshot ?? null,
    beatPhaseEstimate,
    suggestedDelayMs,
    continuityScore,
    message,
  };
}

export function getUserHistory(userId: string) {
  return USER_LAST_SEEN.get(userId) ?? null;
}

export function getRejoinStats(): {
  trackedUsers: number;
  entranceStats: ReturnType<typeof getEntranceStats>;
} {
  return {
    trackedUsers: USER_LAST_SEEN.size,
    entranceStats: getEntranceStats(),
  };
}
