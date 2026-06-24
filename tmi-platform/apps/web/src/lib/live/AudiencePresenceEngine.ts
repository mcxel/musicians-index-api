/**
 * AudiencePresenceEngine — client-side global entity store.
 *
 * This is the piece that makes audience membership feel like Fortnite / Roblox:
 * the user's seat, room, and identity persist through Mode A→B→C transitions,
 * canister opens/closes, and dashboard overlays.
 *
 * The server-side seat/occupancy tracking lives in audienceRuntimeEngine.ts.
 * This file is the CLIENT-SIDE mirror — a module-level singleton so React
 * component unmounts never lose the user's place in the room.
 *
 * Flow:
 *   User joins room → setAudienceEntity() → entity lives here
 *   User opens Inventory canister → entity unchanged
 *   User switches to Dashboard overlay → entity unchanged
 *   User leaves room → clearAudienceEntity()
 *   User navigates back → recoverSeat() re-registers with same seatId
 */

export type AudienceEntity = {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  tier: string;
  seatId: string;
  roomId: string;
  groupId: string | null;
  joinedAt: number;
  isActive: boolean;
  /** Viewpoint within the venue — updated as user looks around */
  viewpoint: {
    yaw: number;
    pitch: number;
    updatedAt: number;
  };
};

// ─── Module-level singleton ───────────────────────────────────────────────────
// Lives outside React — survives component unmounts and mode switches.

let _entity: AudienceEntity | null = null;
const _listeners = new Set<(entity: AudienceEntity | null) => void>();

function _emit(): void {
  _listeners.forEach(fn => fn(_entity));
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Set the current user's audience entity when they join a room. */
export function setAudienceEntity(entity: AudienceEntity): void {
  _entity = { ...entity, isActive: true };
  _emit();
}

/** Update viewpoint without re-triggering a full join. */
export function updateAudienceViewpoint(yaw: number, pitch: number): void {
  if (!_entity) return;
  _entity = {
    ..._entity,
    viewpoint: { yaw, pitch, updatedAt: Date.now() },
  };
  _emit();
}

/** Mark the entity inactive when user leaves a room. Does not clear the entity
 * so seat recovery is possible on return. */
export function deactivateAudienceEntity(): void {
  if (!_entity) return;
  _entity = { ..._entity, isActive: false };
  _emit();
}

/** Fully clear the entity — used when show ends or user explicitly exits. */
export function clearAudienceEntity(): void {
  _entity = null;
  _emit();
}

/** Read the current entity without subscribing. */
export function getAudienceEntity(): AudienceEntity | null {
  return _entity;
}

/**
 * Recover seat — re-activates the entity with the same seatId when a user
 * returns to the same room after navigating away.
 * Returns the entity if recovery was possible, null otherwise.
 */
export function recoverSeat(roomId: string): AudienceEntity | null {
  if (!_entity || _entity.roomId !== roomId) return null;
  _entity = { ..._entity, isActive: true };
  _emit();
  return _entity;
}

/**
 * Subscribe to entity changes.
 * Returns an unsubscribe function — call it in useEffect cleanup.
 */
export function onAudienceEntityChange(
  callback: (entity: AudienceEntity | null) => void,
): () => void {
  _listeners.add(callback);
  return () => { _listeners.delete(callback); };
}
