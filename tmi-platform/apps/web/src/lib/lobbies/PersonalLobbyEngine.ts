/**
 * PersonalLobbyEngine.ts
 *
 * Creates and manages personal lobbies for fans, artists, performers.
 * Lobbies support avatar placement, movement, seating, ambient motion, wall displays, memory walls, media playback.
 * Purpose: Give users owned spaces on the platform.
 */

export interface PersonalLobby {
  lobbyId: string;
  entityId: string;
  entityType: 'fan' | 'artist' | 'performer' | 'venue';
  lobbyName: string;
  lobbyType: 'personal' | 'fan-hub' | 'artist-hub' | 'performer-hub' | 'venue-lobby';
  skinTheme: string; // e.g., "neon-club", "desert-sunset", "cyberpunk-arena"
  capacity: number;
  currentOccants: number;
  visitCount: number;
  createdAt: number;
  lastVisitedAt: number;
  isPublic: boolean;
  inviteCode?: string;
  features: {
    hasAmbientMotion: boolean;
    hasWallDisplay: boolean;
    hasMemoryWall: boolean;
    hasSeating: boolean;
    hasStage: boolean;
  };
}

export interface LobbyOccupant {
  occupantId: string;
  avatarId: string;
  displayName: string;
  position: { x: number; y: number; z: number };
  facing: number; // angle in degrees
  animationState: 'idle' | 'walking' | 'sitting' | 'dancing' | 'reacting';
  joinedAt: number;
}

export interface LobbyConfiguration {
  lobbyId: string;
  wallCount: number;
  screenCount: number;
  seatingSlots: number;
  floorSkinId?: string;
  lightingPreset: string;
  ambientSoundTrack?: string;
  maxOccupants: number;
}

// In-memory registries
const personalLobbies = new Map<string, PersonalLobby>();
const lobbyOccupants = new Map<string, LobbyOccupant[]>();
const lobbyConfigs = new Map<string, LobbyConfiguration>();
let lobbyCounter = 0;

/**
 * Creates a personal lobby for entity.
 */
export function createPersonalLobby(input: {
  entityId: string;
  entityType: 'fan' | 'artist' | 'performer' | 'venue';
  lobbyName: string;
  lobbyType: 'personal' | 'fan-hub' | 'artist-hub' | 'performer-hub' | 'venue-lobby';
  skinTheme?: string;
  capacity?: number;
  isPublic?: boolean;
}): string {
  const lobbyId = `lobby-${lobbyCounter++}-${input.entityId}`;

  const lobby: PersonalLobby = {
    lobbyId,
    entityId: input.entityId,
    entityType: input.entityType,
    lobbyName: input.lobbyName,
    lobbyType: input.lobbyType,
    skinTheme: input.skinTheme ?? 'default-lounge',
    capacity: input.capacity ?? 50,
    currentOccants: 0,
    visitCount: 0,
    createdAt: Date.now(),
    lastVisitedAt: Date.now(),
    isPublic: input.isPublic ?? true,
    inviteCode: Math.random().toString(36).substring(7),
    features: {
      hasAmbientMotion: true,
      hasWallDisplay: true,
      hasMemoryWall: true,
      hasSeating: true,
      hasStage: input.entityType !== 'fan',
    },
  };

  personalLobbies.set(lobbyId, lobby);
  lobbyOccupants.set(lobbyId, []);

  // Initialize default config
  const config: LobbyConfiguration = {
    lobbyId,
    wallCount: 4,
    screenCount: 2,
    seatingSlots: 10,
    lightingPreset: 'ambient-warm',
    maxOccupants: input.capacity ?? 50,
  };

  lobbyConfigs.set(lobbyId, config);

  return lobbyId;
}

/**
 * Gets personal lobby (non-mutating).
 */
export function getPersonalLobby(lobbyId: string): PersonalLobby | null {
  return personalLobbies.get(lobbyId) ?? null;
}

/**
 * Lists lobbies by entity (non-mutating).
 */
export function listLobbiesByEntity(
  entityId: string,
  entityType: 'fan' | 'artist' | 'performer' | 'venue'
): PersonalLobby[] {
  return Array.from(personalLobbies.values()).filter(
    (l) => l.entityId === entityId && l.entityType === entityType
  );
}

/**
 * Records a visit to lobby.
 */
export function recordLobbyVisit(lobbyId: string): void {
  const lobby = personalLobbies.get(lobbyId);
  if (lobby) {
    lobby.visitCount += 1;
    lobby.lastVisitedAt = Date.now();
  }
}

/**
 * Adds occupant to lobby.
 */
export function addOccupantToLobby(lobbyId: string, occupant: LobbyOccupant): boolean {
  const lobby = personalLobbies.get(lobbyId);
  const occupants = lobbyOccupants.get(lobbyId);

  if (!lobby || !occupants) return false;
  if (occupants.length >= lobby.capacity) return false;

  occupants.push(occupant);
  lobby.currentOccants = occupants.length;

  return true;
}

/**
 * Removes occupant from lobby.
 */
export function removeOccupantFromLobby(lobbyId: string, occupantId: string): boolean {
  const occupants = lobbyOccupants.get(lobbyId);
  if (!occupants) return false;

  const index = occupants.findIndex((o) => o.occupantId === occupantId);
  if (index === -1) return false;

  occupants.splice(index, 1);

  const lobby = personalLobbies.get(lobbyId);
  if (lobby) {
    lobby.currentOccants = occupants.length;
  }

  return true;
}

/**
 * Gets occupants in lobby (non-mutating).
 */
export function getOccupantsInLobby(lobbyId: string): LobbyOccupant[] {
  return lobbyOccupants.get(lobbyId) ?? [];
}

/**
 * Updates occupant position/animation.
 */
export function updateOccupantState(
  lobbyId: string,
  occupantId: string,
  update: {
    position?: { x: number; y: number; z: number };
    facing?: number;
    animationState?: 'idle' | 'walking' | 'sitting' | 'dancing' | 'reacting';
  }
): void {
  const occupants = lobbyOccupants.get(lobbyId);
  if (!occupants) return;

  const occupant = occupants.find((o) => o.occupantId === occupantId);
  if (!occupant) return;

  if (update.position) {
    occupant.position = update.position;
  }
  if (update.facing !== undefined) {
    occupant.facing = update.facing;
  }
  if (update.animationState) {
    occupant.animationState = update.animationState;
  }
}

/**
 * Gets lobby stats (non-mutating).
 */
export function getLobbyStats(lobbyId: string): {
  currentOccupancy: number;
  capacity: number;
  occupancyPercent: number;
  visits: number;
  lastVisit: number;
  ageInDays: number;
} {
  const lobby = personalLobbies.get(lobbyId);
  if (!lobby)
    return {
      currentOccupancy: 0,
      capacity: 0,
      occupancyPercent: 0,
      visits: 0,
      lastVisit: 0,
      ageInDays: 0,
    };

  return {
    currentOccupancy: lobby.currentOccants,
    capacity: lobby.capacity,
    occupancyPercent: (lobby.currentOccants / lobby.capacity) * 100,
    visits: lobby.visitCount,
    lastVisit: lobby.lastVisitedAt,
    ageInDays: Math.floor((Date.now() - lobby.createdAt) / (24 * 60 * 60 * 1000)),
  };
}

/**
 * Gets all personal lobbies report (admin).
 */
export function getPersonalLobbiesReport(): {
  totalLobbies: number;
  byType: Record<string, number>;
  totalOccupants: number;
  averageCapacity: number;
} {
  const all = Array.from(personalLobbies.values());

  const byType: Record<string, number> = {};
  let totalOccupants = 0;
  let totalCapacity = 0;

  all.forEach((lobby) => {
    byType[lobby.lobbyType] = (byType[lobby.lobbyType] ?? 0) + 1;
    totalOccupants += lobby.currentOccants;
    totalCapacity += lobby.capacity;
  });

  return {
    totalLobbies: all.length,
    byType,
    totalOccupants,
    averageCapacity: all.length > 0 ? Math.round(totalCapacity / all.length) : 0,
  };
}
