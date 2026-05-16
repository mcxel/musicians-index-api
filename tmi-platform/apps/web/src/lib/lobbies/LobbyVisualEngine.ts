/**
 * LobbyVisualEngine.ts
 *
 * Generates and manages visual elements in lobbies.
 * Includes wall art, screens, floor skins, stage corners, collectibles, season pass displays.
 * Purpose: Make lobbies visually distinct and thematic.
 */

export interface LobbyWallArt {
  wallArtId: string;
  lobbyId: string;
  wallSide: 'north' | 'south' | 'east' | 'west' | 'floor' | 'ceiling';
  artStyle: 'neon' | 'graffiti' | 'gallery' | 'cinematic' | 'abstract' | 'portrait' | 'sponsor';
  assetUrl: string;
  generatedAt: number;
  replacedAt?: number;
  engagement: number;
}

export interface LobbyScreen {
  screenId: string;
  lobbyId: string;
  screenPosition:
    | 'center-wall'
    | 'side-left'
    | 'side-right'
    | 'corner-nw'
    | 'corner-ne'
    | 'corner-sw'
    | 'corner-se';
  contentType:
    | 'memory-wall'
    | 'leaderboard'
    | 'sponsor'
    | 'advertisement'
    | 'artist-highlight'
    | 'event-feed'
    | 'battle-replay';
  contentId?: string;
  activeAt: number;
  rotateIntervalMs: number; // 0 = static
}

export interface LobbyFloorSkin {
  floorSkinId: string;
  lobbyId: string;
  skinTheme: string;
  assetUrl: string;
  appliedAt: number;
  engagement: number;
}

export interface LobbyCollectible {
  collectibleId: string;
  lobbyId: string;
  collectibleType:
    | 'season-pass-item'
    | 'achievement-unlock'
    | 'limited-edition'
    | 'artist-merch'
    | 'nft-display'
    | 'battle-trophy';
  displayName: string;
  assetUrl: string;
  placedAt: number;
  unlockedBy?: string; // entity ID
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface LobbyVisualConfig {
  lobbyId: string;
  wallArtStyle: 'neon' | 'graffiti' | 'gallery' | 'cinematic' | 'abstract' | 'portrait';
  screenRotationMode: 'static' | 'timed' | 'engagement-driven';
  floorSkinId?: string;
  collectiblesEnabled: boolean;
  sponsorDisplayEnabled: boolean;
  maxWallArt: number;
  maxScreens: number;
  maxCollectibles: number;
}

// In-memory registries
const wallArt = new Map<string, LobbyWallArt>();
const screens = new Map<string, LobbyScreen>();
const floorSkins = new Map<string, LobbyFloorSkin>();
const collectibles = new Map<string, LobbyCollectible>();
const visualConfigs = new Map<string, LobbyVisualConfig>();

/**
 * Configures visual setup for lobby.
 */
export function configureVisuals(input: {
  lobbyId: string;
  wallArtStyle?: 'neon' | 'graffiti' | 'gallery' | 'cinematic' | 'abstract' | 'portrait';
  screenRotationMode?: 'static' | 'timed' | 'engagement-driven';
  collectiblesEnabled?: boolean;
  sponsorDisplayEnabled?: boolean;
}): void {
  const config: LobbyVisualConfig = {
    lobbyId: input.lobbyId,
    wallArtStyle: input.wallArtStyle ?? 'neon',
    screenRotationMode: input.screenRotationMode ?? 'timed',
    collectiblesEnabled: input.collectiblesEnabled ?? true,
    sponsorDisplayEnabled: input.sponsorDisplayEnabled ?? true,
    maxWallArt: 4,
    maxScreens: 2,
    maxCollectibles: 12,
  };

  visualConfigs.set(input.lobbyId, config);
}

/**
 * Adds wall art to lobby.
 */
export function placeWallArt(input: {
  lobbyId: string;
  wallSide: 'north' | 'south' | 'east' | 'west' | 'floor' | 'ceiling';
  artStyle: 'neon' | 'graffiti' | 'gallery' | 'cinematic' | 'abstract' | 'portrait' | 'sponsor';
  assetUrl: string;
}): string {
  const wallArtId = `wall-${Date.now()}-${Math.random()}`;

  const art: LobbyWallArt = {
    wallArtId,
    lobbyId: input.lobbyId,
    wallSide: input.wallSide,
    artStyle: input.artStyle,
    assetUrl: input.assetUrl,
    generatedAt: Date.now(),
    engagement: 0,
  };

  wallArt.set(wallArtId, art);
  return wallArtId;
}

/**
 * Replaces wall art.
 */
export function replaceWallArt(wallArtId: string, newAssetUrl: string): void {
  const art = wallArt.get(wallArtId);
  if (art) {
    art.assetUrl = newAssetUrl;
    art.replacedAt = Date.now();
  }
}

/**
 * Adds screen to lobby.
 */
export function placeScreen(input: {
  lobbyId: string;
  screenPosition:
    | 'center-wall'
    | 'side-left'
    | 'side-right'
    | 'corner-nw'
    | 'corner-ne'
    | 'corner-sw'
    | 'corner-se';
  contentType:
    | 'memory-wall'
    | 'leaderboard'
    | 'sponsor'
    | 'advertisement'
    | 'artist-highlight'
    | 'event-feed'
    | 'battle-replay';
  contentId?: string;
  rotateIntervalMs?: number;
}): string {
  const screenId = `screen-${Date.now()}-${Math.random()}`;

  const screen: LobbyScreen = {
    screenId,
    lobbyId: input.lobbyId,
    screenPosition: input.screenPosition,
    contentType: input.contentType,
    contentId: input.contentId,
    activeAt: Date.now(),
    rotateIntervalMs: input.rotateIntervalMs ?? 0,
  };

  screens.set(screenId, screen);
  return screenId;
}

/**
 * Updates screen content.
 */
export function updateScreenContent(
  screenId: string,
  contentType: LobbyScreen['contentType'],
  contentId?: string
): void {
  const screen = screens.get(screenId);
  if (screen) {
    screen.contentType = contentType;
    screen.contentId = contentId;
  }
}

/**
 * Applies floor skin to lobby.
 */
export function applyFloorSkin(input: {
  lobbyId: string;
  skinTheme: string;
  assetUrl: string;
}): string {
  const skinId = `floor-${Date.now()}-${Math.random()}`;

  const skin: LobbyFloorSkin = {
    floorSkinId: skinId,
    lobbyId: input.lobbyId,
    skinTheme: input.skinTheme,
    assetUrl: input.assetUrl,
    appliedAt: Date.now(),
    engagement: 0,
  };

  floorSkins.set(skinId, skin);
  return skinId;
}

/**
 * Places collectible in lobby.
 */
export function placeCollectible(input: {
  lobbyId: string;
  collectibleType:
    | 'season-pass-item'
    | 'achievement-unlock'
    | 'limited-edition'
    | 'artist-merch'
    | 'nft-display'
    | 'battle-trophy';
  displayName: string;
  assetUrl: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedBy?: string;
}): string {
  const collectibleId = `collectible-${Date.now()}-${Math.random()}`;

  const collectible: LobbyCollectible = {
    collectibleId,
    lobbyId: input.lobbyId,
    collectibleType: input.collectibleType,
    displayName: input.displayName,
    assetUrl: input.assetUrl,
    placedAt: Date.now(),
    unlockedBy: input.unlockedBy,
    rarity: input.rarity,
  };

  collectibles.set(collectibleId, collectible);
  return collectibleId;
}

/**
 * Lists wall art in lobby (non-mutating).
 */
export function listWallArtInLobby(lobbyId: string): LobbyWallArt[] {
  return Array.from(wallArt.values()).filter((a) => a.lobbyId === lobbyId);
}

/**
 * Lists screens in lobby (non-mutating).
 */
export function listScreensInLobby(lobbyId: string): LobbyScreen[] {
  return Array.from(screens.values()).filter((s) => s.lobbyId === lobbyId);
}

/**
 * Lists collectibles in lobby (non-mutating).
 */
export function listCollectiblesInLobby(lobbyId: string): LobbyCollectible[] {
  return Array.from(collectibles.values()).filter((c) => c.lobbyId === lobbyId);
}

/**
 * Records engagement with visual element.
 */
export function recordVisualEngagement(
  elementId: string,
  elementType: 'wall-art' | 'screen' | 'floor-skin'
): void {
  if (elementType === 'wall-art') {
    const art = wallArt.get(elementId);
    if (art) art.engagement += 1;
  } else if (elementType === 'floor-skin') {
    const skin = floorSkins.get(elementId);
    if (skin) skin.engagement += 1;
  }
}

/**
 * Gets visual report (non-mutating).
 */
export function getVisualReport(lobbyId: string): {
  wallArtCount: number;
  screenCount: number;
  floorSkinActive: string | null;
  collectibleCount: number;
  topEngagementArt: LobbyWallArt | null;
} {
  const lobbyWalls = listWallArtInLobby(lobbyId);
  const lobbyScreens = listScreensInLobby(lobbyId);
  const lobbyCollectibles = listCollectiblesInLobby(lobbyId);

  const activeSkin = Array.from(floorSkins.values()).find((s) => s.lobbyId === lobbyId);
  const topArt =
    lobbyWalls.length > 0
      ? lobbyWalls.reduce((a, b) => (a.engagement > b.engagement ? a : b))
      : null;

  return {
    wallArtCount: lobbyWalls.length,
    screenCount: lobbyScreens.length,
    floorSkinActive: activeSkin?.skinTheme ?? null,
    collectibleCount: lobbyCollectibles.length,
    topEngagementArt: topArt,
  };
}
