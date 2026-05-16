import type { ChatRoomId } from '@/lib/chat/RoomChatEngine';

export type QuarantineReason =
  | 'generator-corruption'
  | 'overlay-loop'
  | 'hydration-storm'
  | 'asset-conflict'
  | 'orphan-ownership'
  | 'manual';

export interface RoomQuarantineState {
  roomId: ChatRoomId;
  active: boolean;
  reason: QuarantineReason;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enteredAtMs: number;
  expiresAtMs: number;
  degradedVisuals: boolean;
  telemetryOnly: boolean;
  preservedAuthority: boolean;
  notes?: string;
}

const roomQuarantine = new Map<ChatRoomId, RoomQuarantineState>();

export function enterRuntimeQuarantine(input: {
  roomId: ChatRoomId;
  reason: QuarantineReason;
  severity?: RoomQuarantineState['severity'];
  ttlMs?: number;
  notes?: string;
}): RoomQuarantineState {
  const now = Date.now();
  const state: RoomQuarantineState = {
    roomId: input.roomId,
    active: true,
    reason: input.reason,
    severity: input.severity ?? 'high',
    enteredAtMs: now,
    expiresAtMs: now + Math.max(5_000, input.ttlMs ?? 30_000),
    degradedVisuals: true,
    telemetryOnly: false,
    preservedAuthority: true,
    notes: input.notes,
  };

  roomQuarantine.set(input.roomId, state);
  return state;
}

export function exitRuntimeQuarantine(roomId: ChatRoomId): boolean {
  return roomQuarantine.delete(roomId);
}

export function getRuntimeQuarantineState(roomId: ChatRoomId): RoomQuarantineState | null {
  const state = roomQuarantine.get(roomId);
  if (!state) return null;
  if (state.expiresAtMs <= Date.now()) {
    roomQuarantine.delete(roomId);
    return null;
  }
  return { ...state };
}

export function isRoomQuarantined(roomId: ChatRoomId): boolean {
  return Boolean(getRuntimeQuarantineState(roomId));
}

export function runRuntimeQuarantineMaintenance(): {
  expired: number;
  active: number;
} {
  const now = Date.now();
  let expired = 0;
  for (const [roomId, state] of roomQuarantine.entries()) {
    if (state.expiresAtMs <= now) {
      roomQuarantine.delete(roomId);
      expired += 1;
    }
  }

  return {
    expired,
    active: roomQuarantine.size,
  };
}

export function listQuarantinedRooms(): RoomQuarantineState[] {
  return [...roomQuarantine.values()].sort((a, b) => b.enteredAtMs - a.enteredAtMs);
}

export function quarantineRuntimeDecision(input: {
  roomId: ChatRoomId;
  deadlockCount?: number;
  stalledGeneratorCount?: number;
  overlayConflictCount?: number;
  orphanOwnershipCount?: number;
}): RoomQuarantineState | null {
  const score =
    (input.deadlockCount ?? 0) * 3 +
    (input.stalledGeneratorCount ?? 0) * 2 +
    (input.overlayConflictCount ?? 0) * 2 +
    (input.orphanOwnershipCount ?? 0) * 2;

  if (score < 6) {
    return null;
  }

  const severity: RoomQuarantineState['severity'] =
    score >= 14 ? 'critical' : score >= 10 ? 'high' : 'medium';

  const reason: QuarantineReason =
    (input.stalledGeneratorCount ?? 0) > 0
      ? 'generator-corruption'
      : (input.overlayConflictCount ?? 0) > 0
        ? 'overlay-loop'
        : (input.orphanOwnershipCount ?? 0) > 0
          ? 'orphan-ownership'
          : 'asset-conflict';

  return enterRuntimeQuarantine({
    roomId: input.roomId,
    reason,
    severity,
    ttlMs: severity === 'critical' ? 120_000 : 60_000,
    notes: `auto quarantine score=${score}`,
  });
}
