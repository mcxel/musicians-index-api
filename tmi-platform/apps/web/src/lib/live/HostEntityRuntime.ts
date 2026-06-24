/**
 * HostEntityRuntime — host characters as live entities in the world.
 *
 * Takes hosts from HostIdentityRegistry and gives them:
 *   - A state machine (idle / talking / reacting / gesturing / entering / exiting / celebrating)
 *   - Stage vs audience position
 *   - Current dialogue line (for optional subtitle display)
 *   - Motion tag from the registry (drives CSS/framer-motion animation class)
 *
 * Per Rule 18 "Asset Realization Directive" / scope honesty:
 * This is NOT the full face-scan 3D bobblehead pipeline. That's multi-session work.
 * This runtime gives hosts a REAL state machine and world position so they can
 * participate in the audience world — displayed via HostAvatarPortrait (CSS/framer-motion
 * animated portrait cards) until the 3D runtime is built.
 *
 * Architecture:
 *   HostIdentityRegistry (lib/hosts/) → HostEntityRuntime (lib/live/) → HostAvatarPortrait (components/live/)
 *                                              ↓
 *                                       audienceVisibilityEngine
 *                                       (host appears in seat grid)
 */

import { HOST_IDENTITY_REGISTRY, type HostIdentity } from '@/lib/hosts/HostIdentityRegistry';

// ─── Types ────────────────────────────────────────────────────────────────────

export type HostEntityState =
  | 'idle'
  | 'talking'
  | 'reacting'
  | 'gesturing'
  | 'entering'
  | 'exiting'
  | 'celebrating'
  | 'hushing'
  | 'pointing'
  | 'laughing';

export interface HostEntity {
  identity: HostIdentity;
  state: HostEntityState;
  /** Seat ID when in audience. Null when on stage. */
  seatId: string | null;
  /** True when host is in the stage area, false when in audience. */
  onStage: boolean;
  lastStateChangeAt: number;
  /** Current dialogue being "said" — displayed as optional subtitle. Null when silent. */
  currentLine: string | null;
  /** Auto-return-to-idle after this timestamp if state is transient. */
  idleAt: number | null;
}

// ─── Module-level singleton ───────────────────────────────────────────────────

const _entities = new Map<string, HostEntity>();
const _listeners = new Set<(entities: HostEntity[]) => void>();

function _all(): HostEntity[] {
  return Array.from(_entities.values());
}

function _emit(): void {
  const all = _all();
  _listeners.forEach(fn => fn(all));
}

// ─── Transient state auto-revert ─────────────────────────────────────────────

const TRANSIENT_STATES: HostEntityState[] = ['entering', 'exiting', 'gesturing', 'pointing', 'laughing'];

function _scheduleIdle(hostId: string, afterMs: number): void {
  const entity = _entities.get(hostId);
  if (!entity) return;
  const idleAt = Date.now() + afterMs;
  entity.idleAt = idleAt;
  setTimeout(() => {
    const e = _entities.get(hostId);
    if (e && e.idleAt === idleAt) {
      e.state = 'idle';
      e.idleAt = null;
      e.currentLine = null;
      _emit();
    }
  }, afterMs);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Initialize host entities for a given show.
 * First host in the list starts on stage; others start in audience.
 */
export function initHostEntitiesForShow(showId: string): HostEntity[] {
  _entities.clear();

  const hosts = HOST_IDENTITY_REGISTRY.filter(
    h => h.showAssignments.includes(showId) && h.role !== 'PLATFORM_AUTHORITY'
  );

  hosts.forEach((identity, i) => {
    _entities.set(identity.id, {
      identity,
      state: 'idle',
      seatId: null,
      onStage: i === 0,
      lastStateChangeAt: Date.now(),
      currentLine: null,
      idleAt: null,
    });
  });

  _emit();
  return _all();
}

/**
 * Initialize all hosts for a general-purpose room (no specific show).
 * Places first 3 canonical hosts in the world.
 */
export function initDefaultHosts(): HostEntity[] {
  const defaults = ['bobby-stanley', 'julius', 'record-ralph'];
  _entities.clear();

  defaults.forEach((id, i) => {
    const identity = HOST_IDENTITY_REGISTRY.find(h => h.id === id);
    if (!identity) return;
    _entities.set(id, {
      identity,
      state: 'idle',
      seatId: null,
      onStage: i === 0,
      lastStateChangeAt: Date.now(),
      currentLine: null,
      idleAt: null,
    });
  });

  _emit();
  return _all();
}

/** Transition a host to a new state. Transient states auto-revert to idle. */
export function setHostState(
  hostId: string,
  state: HostEntityState,
  line?: string,
  durationMs?: number,
): void {
  const entity = _entities.get(hostId);
  if (!entity) return;

  entity.state = state;
  entity.lastStateChangeAt = Date.now();
  entity.currentLine = line ?? null;

  if (TRANSIENT_STATES.includes(state)) {
    _scheduleIdle(hostId, durationMs ?? 1_500);
  } else if (state === 'talking') {
    // Talking auto-reverts after line duration
    _scheduleIdle(hostId, durationMs ?? 4_000);
  } else {
    entity.idleAt = null;
  }

  _emit();
}

/** Move host from audience to stage. */
export function bringHostToStage(hostId: string): void {
  const entity = _entities.get(hostId);
  if (!entity) return;

  entity.onStage = true;
  entity.seatId = null;
  entity.state = 'entering';
  entity.lastStateChangeAt = Date.now();
  _emit();

  // Transition to talking after entry animation
  setTimeout(() => {
    const e = _entities.get(hostId);
    if (e?.state === 'entering') {
      e.state = 'talking';
      e.currentLine = null;
      _emit();
    }
  }, 1_200);
}

/** Move host from stage to a specific seat in the audience. */
export function sendHostToAudience(hostId: string, seatId: string): void {
  const entity = _entities.get(hostId);
  if (!entity) return;

  entity.state = 'exiting';
  entity.lastStateChangeAt = Date.now();
  _emit();

  setTimeout(() => {
    const e = _entities.get(hostId);
    if (e?.state === 'exiting') {
      e.onStage = false;
      e.seatId = seatId;
      e.state = 'idle';
      _emit();
    }
  }, 1_000);
}

/** Trigger a group reaction across all on-stage hosts simultaneously. */
export function triggerGroupReaction(state: HostEntityState, line?: string): void {
  _entities.forEach((entity, id) => {
    if (entity.onStage) {
      setHostState(id, state, line, 2_000);
    }
  });
}

/** Celebrate a winner — all hosts react. */
export function celebrateWinner(winnerName: string): void {
  triggerGroupReaction('celebrating', `🏆 ${winnerName.toUpperCase()}!`);
}

/** Read current host entities. */
export function getHostEntities(): HostEntity[] {
  return _all();
}

export function getHostEntity(hostId: string): HostEntity | undefined {
  return _entities.get(hostId);
}

/** Subscribe to entity changes. Returns unsubscribe function. */
export function onHostEntitiesChange(
  callback: (entities: HostEntity[]) => void,
): () => void {
  _listeners.add(callback);
  callback(_all());
  return () => { _listeners.delete(callback); };
}

export function clearHostEntities(): void {
  _entities.clear();
  _emit();
}
