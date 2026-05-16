/**
 * OverlaySyncRepairEngine.ts
 *
 * Detects and repairs overlay desync — when the overlay's rendered state
 * has drifted from the canonical room authority state.
 *
 * Overlay desync causes:
 *   - Stale scoreboard showing wrong crown rankings
 *   - Avatar positions that don't match room state
 *   - Seating overlays showing occupied seats that were freed
 *   - Video monitor playing wrong content after sync loss
 *   - HUD showing wrong persona/role after a switch
 *   - Timer overlays drifting from server time
 *
 * Repair strategies (in escalating order):
 *   soft-patch    — update just the stale fields without unmounting
 *   hard-remount  — force full overlay remount with fresh props
 *   source-reset  — close + reopen the authority subscription
 *   evict         — remove the overlay from the surface entirely
 *
 * This engine does NOT know about specific overlay content.
 * It works via desync signals emitted by overlay consumers,
 * and fires repair actions that those consumers listen for.
 */

import type { ChatRoomId } from '@/lib/chat/RoomChatEngine';

// ── Types ─────────────────────────────────────────────────────────────────────

export type OverlayType =
  | 'scoreboard'
  | 'avatar-grid'
  | 'seating-map'
  | 'video-monitor'
  | 'hud-persona'
  | 'timer'
  | 'crown-rail'
  | 'live-stats'
  | 'chat-overlay'
  | 'performer-stage'
  | 'lobby-billboard';

export type DesyncCause =
  | 'missed-event'        // a bus event was skipped or dropped
  | 'stale-subscription'  // subscription stopped receiving events
  | 'prop-mismatch'       // rendered props don't match authority state
  | 'authority-conflict'  // two authority signals contradict each other
  | 'hydration-drift'     // SSR hydration mismatch persisted
  | 'timer-skew'          // server/client time diverged > threshold
  | 'manual-report';      // operator flagged this overlay

export type RepairAction =
  | 'soft-patch'
  | 'hard-remount'
  | 'source-reset'
  | 'evict';

export type OverlayHealthStatus =
  | 'synced'
  | 'drifted'     // minor desync, soft-patch eligible
  | 'desynced'    // significant desync, remount likely needed
  | 'repairing'
  | 'evicted';

export interface OverlaySyncState {
  overlayId:      string;          // `${roomId}::${overlayType}`
  roomId:         ChatRoomId;
  overlayType:    OverlayType;
  status:         OverlayHealthStatus;
  lastSyncAt:     number;
  desyncCount:    number;
  repairCount:    number;
  lastCause?:     DesyncCause;
  lastRepair?:    RepairAction;
  lastRepairAt?:  number;
  driftMs:        number;          // measured timer skew if applicable
}

export interface OverlayRepairRecord {
  overlayId:   string;
  action:      RepairAction;
  cause:       DesyncCause;
  triggeredAt: number;
  resolved:    boolean;
  resolvedAt?: number;
}

// ── Configuration ─────────────────────────────────────────────────────────────

const MAX_DRIFT_MS      = 2_000;   // 2s timer skew → drifted
const MAX_REPAIR_BEFORE_EVICT = 4; // 4 failed repairs → evict

// ── In-Memory State ───────────────────────────────────────────────────────────

const OVERLAY_STATES = new Map<string, OverlaySyncState>();
const REPAIR_LOG:    OverlayRepairRecord[] = [];
const REPAIR_SUBS = new Map<string, Set<(state: OverlaySyncState, action: RepairAction) => void>>();

// ── Core API ──────────────────────────────────────────────────────────────────

export function registerOverlay(roomId: ChatRoomId, overlayType: OverlayType): OverlaySyncState {
  const overlayId = _overlayId(roomId, overlayType);
  if (OVERLAY_STATES.has(overlayId)) return OVERLAY_STATES.get(overlayId)!;

  const state: OverlaySyncState = {
    overlayId,
    roomId,
    overlayType,
    status:    'synced',
    lastSyncAt: Date.now(),
    desyncCount: 0,
    repairCount: 0,
    driftMs:    0,
  };
  OVERLAY_STATES.set(overlayId, state);
  return state;
}

export function confirmSync(roomId: ChatRoomId, overlayType: OverlayType): void {
  const state = OVERLAY_STATES.get(_overlayId(roomId, overlayType));
  if (!state) return;
  state.lastSyncAt = Date.now();
  state.driftMs    = 0;
  if (state.status !== 'synced') {
    _markRepaired(state);
  }
}

export function reportDesync(roomId: ChatRoomId, overlayType: OverlayType, params: {
  cause:     DesyncCause;
  driftMs?:  number;
  severity?: 'minor' | 'major';
}): OverlaySyncState {
  const overlayId = _overlayId(roomId, overlayType);
  const state     = OVERLAY_STATES.get(overlayId);
  if (!state) return registerOverlay(roomId, overlayType);

  state.desyncCount += 1;
  state.lastCause   = params.cause;
  if (params.driftMs !== undefined) state.driftMs = params.driftMs;

  // Determine repair action based on severity and history
  const action = _selectRepairAction(state, params.severity ?? 'minor');
  state.status     = action === 'evict' ? 'evicted' : 'repairing';
  state.lastRepair = action;
  state.lastRepairAt = Date.now();
  state.repairCount += 1;

  OVERLAY_STATES.set(overlayId, state);

  const record: OverlayRepairRecord = {
    overlayId,
    action,
    cause:       params.cause,
    triggeredAt: Date.now(),
    resolved:    false,
  };
  REPAIR_LOG.push(record);

  // Notify subscribers — they execute the actual repair
  REPAIR_SUBS.get(overlayId)?.forEach((l) => l({ ...state }, action));

  return state;
}

export function reportTimerSkew(roomId: ChatRoomId, overlayType: OverlayType, clientMs: number, serverMs: number): void {
  const skew = Math.abs(clientMs - serverMs);
  if (skew > MAX_DRIFT_MS) {
    reportDesync(roomId, overlayType, { cause: 'timer-skew', driftMs: skew, severity: skew > 10_000 ? 'major' : 'minor' });
  }
}

export function subscribeOverlayRepair(
  roomId:      ChatRoomId,
  overlayType: OverlayType,
  listener:    (state: OverlaySyncState, action: RepairAction) => void
): () => void {
  const overlayId = _overlayId(roomId, overlayType);
  if (!REPAIR_SUBS.has(overlayId)) REPAIR_SUBS.set(overlayId, new Set());
  REPAIR_SUBS.get(overlayId)!.add(listener);
  return () => REPAIR_SUBS.get(overlayId)?.delete(listener);
}

export function getOverlayState(roomId: ChatRoomId, overlayType: OverlayType): OverlaySyncState | null {
  return OVERLAY_STATES.get(_overlayId(roomId, overlayType)) ?? null;
}

export function getRoomOverlayStates(roomId: ChatRoomId): OverlaySyncState[] {
  const prefix = `${roomId}::`;
  return [...OVERLAY_STATES.values()].filter((s) => s.overlayId.startsWith(prefix));
}

export function getRepairLog(limit = 50): OverlayRepairRecord[] {
  return REPAIR_LOG.slice(-limit).reverse();
}

export function deregisterOverlay(roomId: ChatRoomId, overlayType: OverlayType): void {
  const overlayId = _overlayId(roomId, overlayType);
  OVERLAY_STATES.delete(overlayId);
  REPAIR_SUBS.delete(overlayId);
}

export function getRoomDesyncScore(roomId: ChatRoomId): number {
  const overlays = getRoomOverlayStates(roomId);
  if (overlays.length === 0) return 100;

  const STATUS_SCORE: Record<OverlayHealthStatus, number> = {
    synced:    100,
    drifted:    70,
    desynced:   30,
    repairing:  50,
    evicted:     0,
  };

  const total = overlays.reduce((sum, o) => sum + STATUS_SCORE[o.status], 0);
  return Math.round(total / overlays.length);
}

// ── Internal ──────────────────────────────────────────────────────────────────

function _overlayId(roomId: ChatRoomId, overlayType: OverlayType): string {
  return `${roomId}::${overlayType}`;
}

function _selectRepairAction(state: OverlaySyncState, severity: 'minor' | 'major'): RepairAction {
  if (state.repairCount >= MAX_REPAIR_BEFORE_EVICT) return 'evict';
  if (severity === 'major' || state.desyncCount > 2)  return 'hard-remount';
  if (state.lastCause === 'stale-subscription')        return 'source-reset';
  return 'soft-patch';
}

function _markRepaired(state: OverlaySyncState): void {
  state.status = 'synced';
  const lastRecord = [...REPAIR_LOG].reverse().find((r) => r.overlayId === state.overlayId && !r.resolved);
  if (lastRecord) {
    lastRecord.resolved   = true;
    lastRecord.resolvedAt = Date.now();
  }
  OVERLAY_STATES.set(state.overlayId, state);
}
