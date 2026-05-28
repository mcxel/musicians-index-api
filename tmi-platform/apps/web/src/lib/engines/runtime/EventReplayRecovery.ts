/**
 * EventReplayRecovery
 * Reconstructs world state from a snapshot and replays subsequent events.
 * Powers:
 *   - Admin forensic replay ("rewind" a battle or concert)
 *   - Room rejoin recovery (user sees correct state, not a blank start)
 *   - Post-failover state restoration
 */

import type { WorldStateSnapshot } from './PersistentWorldSnapshotEngine';
import { getSnapshotById, getRecentSnapshots } from './PersistentWorldSnapshotEngine';
import { setVibe, setCrowdEnergyOverride } from './WorldStateReplicator';
import { dispatch } from './EventPulseDistributor';
import type { VibePreset } from './WorldStateReplicator';

export type ReplaySpeed = 0.5 | 1 | 2 | 4;
export type ReplayStatus = 'idle' | 'loading' | 'replaying' | 'paused' | 'complete' | 'error';

export interface ReplaySession {
  id: string;
  snapshotId: string;
  startedAt: number;
  completedAt: number | null;
  status: ReplayStatus;
  speed: ReplaySpeed;
  framesTotal: number;
  framesPlayed: number;
  errorMessage: string | null;
}

export interface ReplayFrame {
  offsetMs: number;          // ms from snapshot capture time
  eventType: string;
  payload: Record<string, unknown>;
}

type ReplayListener = (session: ReplaySession) => void;

const activeSessions = new Map<string, ReplaySession>();
const listeners = new Set<ReplayListener>();

function generateId(): string {
  return `replay-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function notifyListeners(session: ReplaySession): void {
  for (const l of listeners) {
    try { l(session); } catch { /* ignore */ }
  }
}

/**
 * Builds a synthetic event sequence from a snapshot.
 * In production, this would be read from the event log database.
 * Right now it reconstructs the key state transitions from snapshot data.
 */
function buildFramesFromSnapshot(snapshot: WorldStateSnapshot): ReplayFrame[] {
  const frames: ReplayFrame[] = [];

  // Frame 0 — restore world vibe
  frames.push({
    offsetMs: 0,
    eventType: 'vibe-restore',
    payload: { vibe: snapshot.vibe, accentColor: snapshot.accentColor, bpm: snapshot.bpm },
  });

  // Frame 1 — restore crowd energy
  frames.push({
    offsetMs: 200,
    eventType: 'energy-restore',
    payload: { crowdEnergy: snapshot.crowdEnergy },
  });

  // Frame 2 — re-announce performers
  if (snapshot.performers.length > 0) {
    frames.push({
      offsetMs: 500,
      eventType: 'performers-announce',
      payload: { performers: snapshot.performers, roomId: snapshot.roomId },
    });
  }

  // Frame 3 — replay the trigger event
  frames.push({
    offsetMs: 800,
    eventType: snapshot.trigger,
    payload: { ...snapshot.metadata, label: snapshot.label, isReplay: true },
  });

  // Frame 4 — pulse at captured beat phase
  frames.push({
    offsetMs: 1200,
    eventType: 'beat',
    payload: { bpm: snapshot.bpm, beatPhase: snapshot.beatPhase, isReplay: true },
  });

  return frames;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function startReplay(
  snapshotId: string,
  speed: ReplaySpeed = 1,
): Promise<ReplaySession> {
  const snapshot = getSnapshotById(snapshotId);
  if (!snapshot) {
    const session: ReplaySession = {
      id: generateId(), snapshotId, startedAt: Date.now(), completedAt: null,
      status: 'error', speed, framesTotal: 0, framesPlayed: 0,
      errorMessage: `Snapshot ${snapshotId} not found`,
    };
    return session;
  }

  const frames = buildFramesFromSnapshot(snapshot);
  const session: ReplaySession = {
    id: generateId(), snapshotId, startedAt: Date.now(), completedAt: null,
    status: 'loading', speed, framesTotal: frames.length, framesPlayed: 0,
    errorMessage: null,
  };
  activeSessions.set(session.id, session);
  notifyListeners(session);

  // Small loading pause
  await sleep(300);

  // Restore snapshot state
  setVibe(snapshot.vibe as VibePreset, 'replay');
  setCrowdEnergyOverride(snapshot.crowdEnergy, 'replay');

  session.status = 'replaying';
  activeSessions.set(session.id, session);
  notifyListeners(session);

  // Play frames
  let lastOffset = 0;
  for (const frame of frames) {
    const waitMs = (frame.offsetMs - lastOffset) / speed;
    await sleep(Math.max(0, waitMs));
    lastOffset = frame.offsetMs;

    dispatch(
      frame.eventType === 'beat' ? 'beat' : 'admin',
      { ...frame.payload, replaySessionId: session.id, isReplay: true },
    );

    session.framesPlayed++;
    activeSessions.set(session.id, session);
    notifyListeners(session);
  }

  session.status = 'complete';
  session.completedAt = Date.now();
  activeSessions.set(session.id, session);
  notifyListeners(session);

  return session;
}

export function getActiveReplays(): ReplaySession[] {
  return [...activeSessions.values()];
}

export function onReplayUpdate(listener: ReplayListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// ── Quick recovery shortcut ───────────────────────────────────────────────────
// Used by VenueFailoverCoordinator and RoomRejoinRecovery.

export async function recoverFromLatestSnapshot(roomId?: string): Promise<string | null> {
  const all = getRecentSnapshots(50);
  const match = roomId
    ? all.find((s) => s.roomId === roomId) ?? all[0]
    : all[0];

  if (!match) return null;

  setVibe(match.vibe as VibePreset, 'recovery');
  setCrowdEnergyOverride(match.crowdEnergy, 'recovery');
  dispatch('admin', { action: 'state-recovery', snapshotId: match.id, fromSnapshot: match.label });

  return match.id;
}
