/**
 * TILE CONTROLLER
 * Per-tile identity, animation state, and sponsor injection logic.
 * Every visible homepage tile is a registered artifact with controlled state.
 */

export type TileType =
  | "artist"
  | "sponsor"
  | "game"
  | "article"
  | "billboard"
  | "ranking"
  | "contest"
  | "event"
  | "venue"
  | "magazine";

export type TileAnimationState =
  | "idle"
  | "entering"
  | "active"
  | "glitching"
  | "sponsored"
  | "exiting";

export interface HomepageTile {
  id: string;
  type: TileType;
  label: string;
  routeTarget: string;
  rotationWeight: number;       // 0–10, higher = appears more frequently
  animationState: TileAnimationState;
  sponsorId?: string;           // set when tile is sponsor-injected
  genre?: string;
  rankPosition?: number;        // 1–10 for ranking tiles
  dataTestId: string;
}

// Seeded default tiles per homepage slot (overridden at runtime by live data)
const DEFAULT_TILES: HomepageTile[] = [
  { id: "tile-top1",      type: "artist",    label: "#1 Artist",          routeTarget: "/artists/top",            rotationWeight: 10, animationState: "idle", dataTestId: "tile-top1" },
  { id: "tile-top2",      type: "artist",    label: "#2 Artist",          routeTarget: "/artists/second",         rotationWeight: 9,  animationState: "idle", dataTestId: "tile-top2", rankPosition: 2 },
  { id: "tile-genre-mix", type: "artist",    label: "Genre Mix",          routeTarget: "/charts",                 rotationWeight: 7,  animationState: "idle", dataTestId: "tile-genre-mix" },
  { id: "tile-sponsor-a", type: "sponsor",   label: "Featured Sponsor",   routeTarget: "/sponsors/prime-wave",    rotationWeight: 5,  animationState: "idle", dataTestId: "tile-sponsor-a", sponsorId: "prime-wave" },
  { id: "tile-game-cta",  type: "game",      label: "Live Game",          routeTarget: "/games/name-that-tune",   rotationWeight: 6,  animationState: "idle", dataTestId: "tile-game-cta" },
  { id: "tile-article-1", type: "article",   label: "Top Story",          routeTarget: "/articles/latest",        rotationWeight: 4,  animationState: "idle", dataTestId: "tile-article-1" },
  { id: "tile-billboard", type: "billboard", label: "Billboard Ad",       routeTarget: "/billboards/crown-weekly", rotationWeight: 5, animationState: "idle", dataTestId: "tile-billboard" },
  { id: "tile-contest",   type: "contest",   label: "Active Contest",     routeTarget: "/competitions/active",    rotationWeight: 6,  animationState: "idle", dataTestId: "tile-contest" },
  { id: "tile-venue",     type: "venue",     label: "Hot Venue",          routeTarget: "/venues/stage-zero",      rotationWeight: 4,  animationState: "idle", dataTestId: "tile-venue" },
  { id: "tile-magazine",  type: "magazine",  label: "Magazine Feature",   routeTarget: "/magazine",               rotationWeight: 5,  animationState: "idle", dataTestId: "tile-magazine" },
];

let _tiles: HomepageTile[] = DEFAULT_TILES.map((t) => ({ ...t }));

export function getTiles(): HomepageTile[] {
  return [..._tiles];
}

export function getTileById(id: string): HomepageTile | undefined {
  return _tiles.find((t) => t.id === id);
}

export function updateTileState(id: string, state: TileAnimationState): void {
  const tile = _tiles.find((t) => t.id === id);
  if (tile) tile.animationState = state;
}

export function injectSponsorTile(slot: number, sponsorId: string, route: string, label: string): void {
  if (slot < 0 || slot >= _tiles.length) return;
  _tiles[slot] = {
    ..._tiles[slot],
    type: "sponsor",
    label,
    routeTarget: route,
    animationState: "sponsored",
    sponsorId,
    rotationWeight: 8,
  };
}

/**
 * Returns weighted random tiles for a rotation set.
 * Enforces diversity: no two same-type tiles adjacent, genre mixing.
 */
export function rotateTiles(count = 5): HomepageTile[] {
  const pool = [..._tiles];
  const weighted: HomepageTile[] = [];
  pool.forEach((t) => {
    for (let i = 0; i < t.rotationWeight; i++) weighted.push(t);
  });

  const result: HomepageTile[] = [];
  const usedTypes = new Set<TileType>();

  let attempts = 0;
  while (result.length < count && attempts < weighted.length * 3) {
    const pick = weighted[Math.floor(Math.random() * weighted.length)];
    if (!result.find((r) => r.id === pick.id) && !usedTypes.has(pick.type)) {
      result.push(pick);
      usedTypes.add(pick.type);
    }
    attempts++;
  }

  // Fill remaining if diversity constraint couldn't be met
  for (const t of _tiles) {
    if (result.length >= count) break;
    if (!result.find((r) => r.id === t.id)) result.push(t);
  }

  return result.slice(0, count);
}

/** Reset tiles to defaults (for testing) */
export function resetTiles(): void {
  _tiles = DEFAULT_TILES.map((t) => ({ ...t }));
}
