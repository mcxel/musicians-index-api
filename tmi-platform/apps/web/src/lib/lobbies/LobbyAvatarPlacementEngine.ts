/**
 * LobbyAvatarPlacementEngine.ts
 *
 * Manages avatar placement, positioning, and layout in lobbies.
 * Purpose: Create spatial awareness and prevent avatar collisions.
 */

export interface AvatarPlacement {
  placementId: string;
  avatarId: string;
  displayName: string;
  position: { x: number; y: number; z: number };
  facing: number; // 0-360 degrees
  scale: number; // 0.5 to 2.0
  isSeated: boolean;
  seatedSlotId?: string;
  visibility: 'public' | 'friends-only' | 'private';
  placedAt: number;
}

export interface LobbyLayout {
  lobbyId: string;
  gridWidth: number;
  gridHeight: number;
  occupiedSlots: Set<string>;
  seatingSlots: Map<string, AvatarPlacement>;
  standingPlacements: Map<string, AvatarPlacement>;
  spawnPoints: Array<{ x: number; y: number; z: number }>;
}

export interface PlacementSuggestion {
  suggestedPosition: { x: number; y: number; z: number };
  placementType: 'standing' | 'seated';
  distanceToNearestAvatar: number;
  occupancyScore: number;
}

// In-memory layouts
const lobbyLayouts = new Map<string, LobbyLayout>();
const placements = new Map<string, AvatarPlacement>();
let placementCounter = 0;

/**
 * Initializes layout for lobby.
 */
export function initializeLobbyLayout(lobbyId: string): void {
  const layout: LobbyLayout = {
    lobbyId,
    gridWidth: 100,
    gridHeight: 100,
    occupiedSlots: new Set(),
    seatingSlots: new Map(),
    standingPlacements: new Map(),
    spawnPoints: [
      { x: 20, y: 0, z: 20 },
      { x: 80, y: 0, z: 20 },
      { x: 20, y: 0, z: 80 },
      { x: 80, y: 0, z: 80 },
      { x: 50, y: 0, z: 50 },
    ],
  };

  lobbyLayouts.set(lobbyId, layout);
}

/**
 * Suggests safe placement for avatar.
 */
export function suggestAvatarPlacement(lobbyId: string): PlacementSuggestion | null {
  const layout = lobbyLayouts.get(lobbyId);
  if (!layout) return null;

  // Find least crowded area
  const allPlacements = Array.from(placements.values()).filter((p) =>
    p.placementId.includes(lobbyId)
  );

  if (allPlacements.length === 0) {
    const spawn = layout.spawnPoints[0];
    return {
      suggestedPosition: spawn,
      placementType: 'standing',
      distanceToNearestAvatar: 999,
      occupancyScore: 0,
    };
  }

  // Find spawn point farthest from existing avatars
  let bestSpawn = layout.spawnPoints[0];
  let maxMinDistance = 0;

  for (const spawn of layout.spawnPoints) {
    const minDistance = Math.min(
      ...allPlacements.map((p) => {
        const dx = p.position.x - spawn.x;
        const dz = p.position.z - spawn.z;
        return Math.sqrt(dx * dx + dz * dz);
      })
    );

    if (minDistance > maxMinDistance) {
      maxMinDistance = minDistance;
      bestSpawn = spawn;
    }
  }

  return {
    suggestedPosition: bestSpawn,
    placementType: 'standing',
    distanceToNearestAvatar: maxMinDistance,
    occupancyScore: (allPlacements.length / 50) * 100,
  };
}

/**
 * Places avatar at position.
 */
export function placeAvatar(input: {
  lobbyId: string;
  avatarId: string;
  displayName: string;
  position: { x: number; y: number; z: number };
  facing?: number;
  scale?: number;
  isSeated?: boolean;
  seatedSlotId?: string;
  visibility?: 'public' | 'friends-only' | 'private';
}): string {
  const placementId = `placement-${placementCounter++}-${input.lobbyId}`;

  const placement: AvatarPlacement = {
    placementId,
    avatarId: input.avatarId,
    displayName: input.displayName,
    position: input.position,
    facing: input.facing ?? 0,
    scale: input.scale ?? 1.0,
    isSeated: input.isSeated ?? false,
    seatedSlotId: input.seatedSlotId,
    visibility: input.visibility ?? 'public',
    placedAt: Date.now(),
  };

  placements.set(placementId, placement);

  const layout = lobbyLayouts.get(input.lobbyId);
  if (layout) {
    const slotKey = `${Math.floor(input.position.x)}-${Math.floor(input.position.z)}`;
    layout.occupiedSlots.add(slotKey);

    if (input.isSeated && input.seatedSlotId) {
      layout.seatingSlots.set(input.seatedSlotId, placement);
    } else {
      layout.standingPlacements.set(placementId, placement);
    }
  }

  return placementId;
}

/**
 * Moves avatar to new position.
 */
export function moveAvatar(
  placementId: string,
  newPosition: { x: number; y: number; z: number }
): void {
  const placement = placements.get(placementId);
  if (placement) {
    placement.position = newPosition;
  }
}

/**
 * Updates avatar facing direction.
 */
export function updateAvatarFacing(placementId: string, facing: number): void {
  const placement = placements.get(placementId);
  if (placement) {
    placement.facing = facing % 360;
  }
}

/**
 * Seats avatar.
 */
export function seatAvatar(placementId: string, seatedSlotId: string): void {
  const placement = placements.get(placementId);
  if (placement) {
    placement.isSeated = true;
    placement.seatedSlotId = seatedSlotId;
  }
}

/**
 * Unseats avatar.
 */
export function unseatAvatar(placementId: string): void {
  const placement = placements.get(placementId);
  if (placement) {
    placement.isSeated = false;
    placement.seatedSlotId = undefined;
  }
}

/**
 * Removes avatar from lobby.
 */
export function removeAvatarPlacement(placementId: string): void {
  placements.delete(placementId);
}

/**
 * Lists all placements in lobby (non-mutating).
 */
export function listPlacements(lobbyId: string): AvatarPlacement[] {
  return Array.from(placements.values()).filter((p) => p.placementId.includes(lobbyId));
}

/**
 * Lists seated avatars in lobby.
 */
export function listSeatedAvatars(lobbyId: string): AvatarPlacement[] {
  return listPlacements(lobbyId).filter((p) => p.isSeated);
}

/**
 * Lists standing avatars in lobby.
 */
export function listStandingAvatars(lobbyId: string): AvatarPlacement[] {
  return listPlacements(lobbyId).filter((p) => !p.isSeated);
}

/**
 * Gets layout stats (non-mutating).
 */
export function getLayoutStats(lobbyId: string): {
  totalAvatars: number;
  seatedCount: number;
  standingCount: number;
  occupiedSlots: number;
  gridUtilization: number;
} {
  const layout = lobbyLayouts.get(lobbyId);
  const placements = listPlacements(lobbyId);

  return {
    totalAvatars: placements.length,
    seatedCount: placements.filter((p) => p.isSeated).length,
    standingCount: placements.filter((p) => !p.isSeated).length,
    occupiedSlots: layout?.occupiedSlots.size ?? 0,
    gridUtilization: layout
      ? (layout.occupiedSlots.size / (layout.gridWidth * layout.gridHeight)) * 100
      : 0,
  };
}

/**
 * Gets distance between two avatars.
 */
export function getDistanceBetweenAvatars(
  placementId1: string,
  placementId2: string
): number | null {
  const p1 = placements.get(placementId1);
  const p2 = placements.get(placementId2);

  if (!p1 || !p2) return null;

  const dx = p2.position.x - p1.position.x;
  const dz = p2.position.z - p1.position.z;

  return Math.sqrt(dx * dx + dz * dz);
}
