/**
 * AnchorRoomRegistry — the 12 permanent 24/7 rooms.
 *
 * These rooms are always discoverable. They are never created or destroyed
 * through the temporary live-session teardown path. When the last host ends
 * their session, the anchor resets to RECRUITING — not removed.
 *
 * Occupancy is read from audienceRuntimeEngine at query time; never stored here.
 */

export type AnchorCategory =
  | "FAN_LOBBY"
  | "BATTLE"
  | "CYPHER"
  | "SONG_CHALLENGE"
  | "LOUNGE"
  | "WORLD_DANCE"
  | "GAME_SHOW";

export type EntryPolicy = "OPEN" | "TIERED" | "INVITE" | "ELIGIBILITY";

export type AnchorRoomDefinition = {
  id: string;
  slug: string;               // venueSlug used in audienceRuntimeEngine
  category: AnchorCategory;
  title: string;
  tagline: string;
  venueThemeId: string;
  region: string | null;
  isPermanent: true;
  entryPolicy: EntryPolicy;
  minimumHumans: number;
  recommendedHumans: number;
  maximumHumans: number;      // hard cap before overflow spins up
  overflowThreshold: number;  // % capacity that triggers an overflow room
  overflowTemplateId: string;
  /** Roles allowed on stage; null = audience-only room */
  eligibleStageRoles: string[] | null;
  route: string;
  defaultBeat?: string;
};

// ── 12 canonical anchor rooms ─────────────────────────────────────────────────

const ANCHORS: AnchorRoomDefinition[] = [
  // ── Fan Lobbies ─────────────────────────────────────────────────────────────
  {
    id: "anchor-fan-lobby-global",
    slug: "fan-lobby-global",
    category: "FAN_LOBBY",
    title: "Global Fan Avatar Lobby",
    tagline: "Meet fans from around the world",
    venueThemeId: "lobby-neon-city",
    region: null,
    isPermanent: true,
    entryPolicy: "OPEN",
    minimumHumans: 0,
    recommendedHumans: 20,
    maximumHumans: 80,
    overflowThreshold: 80,
    overflowTemplateId: "tpl-fan-lobby",
    eligibleStageRoles: null,
    route: "/live/rooms/fan-lobby-global",
  },
  {
    id: "anchor-fan-lobby-chill",
    slug: "fan-lobby-chill",
    category: "FAN_LOBBY",
    title: "Chill Fan Lounge",
    tagline: "Laid-back hangout, no pressure",
    venueThemeId: "lobby-lofi-dusk",
    region: null,
    isPermanent: true,
    entryPolicy: "OPEN",
    minimumHumans: 0,
    recommendedHumans: 12,
    maximumHumans: 40,
    overflowThreshold: 80,
    overflowTemplateId: "tpl-fan-lobby",
    eligibleStageRoles: null,
    route: "/live/rooms/fan-lobby-chill",
  },

  // ── Battles ──────────────────────────────────────────────────────────────────
  {
    id: "anchor-battle-thunder-dome",
    slug: "battle-thunder-dome",
    category: "BATTLE",
    title: "Thunder Dome",
    tagline: "Open-genre battle arena — all styles welcome",
    venueThemeId: "arena-thunder",
    region: null,
    isPermanent: true,
    entryPolicy: "ELIGIBILITY",
    minimumHumans: 2,
    recommendedHumans: 8,
    maximumHumans: 200,
    overflowThreshold: 75,
    overflowTemplateId: "tpl-battle-arena",
    eligibleStageRoles: ["performer", "artist"],
    route: "/live/rooms/battle-thunder-dome",
    defaultBeat: "beat-open-trap-120bpm",
  },
  {
    id: "anchor-battle-open-genre",
    slug: "battle-open-genre",
    category: "BATTLE",
    title: "Open Genre Battle Arena",
    tagline: "Rotating genre — switches every 15 min",
    venueThemeId: "arena-neon-grid",
    region: null,
    isPermanent: true,
    entryPolicy: "ELIGIBILITY",
    minimumHumans: 2,
    recommendedHumans: 6,
    maximumHumans: 200,
    overflowThreshold: 75,
    overflowTemplateId: "tpl-battle-arena",
    eligibleStageRoles: ["performer", "artist"],
    route: "/live/rooms/battle-open-genre",
  },

  // ── Cyphers ──────────────────────────────────────────────────────────────────
  {
    id: "anchor-cypher-freestyle",
    slug: "cypher-freestyle",
    category: "CYPHER",
    title: "Freestyle Cypher",
    tagline: "Open mic — anyone can step in",
    venueThemeId: "cypher-circle-dark",
    region: null,
    isPermanent: true,
    entryPolicy: "OPEN",
    minimumHumans: 1,
    recommendedHumans: 6,
    maximumHumans: 150,
    overflowThreshold: 75,
    overflowTemplateId: "tpl-cypher",
    eligibleStageRoles: ["performer", "artist", "fan"],
    route: "/live/rooms/cypher-freestyle",
  },
  {
    id: "anchor-cypher-rotating-genre",
    slug: "cypher-rotating-genre",
    category: "CYPHER",
    title: "Genre Cypher",
    tagline: "Genre rotates — check the current round",
    venueThemeId: "cypher-circle-neon",
    region: null,
    isPermanent: true,
    entryPolicy: "OPEN",
    minimumHumans: 1,
    recommendedHumans: 8,
    maximumHumans: 150,
    overflowThreshold: 75,
    overflowTemplateId: "tpl-cypher",
    eligibleStageRoles: ["performer", "artist", "fan"],
    route: "/live/rooms/cypher-rotating-genre",
  },

  // ── Song Challenges ──────────────────────────────────────────────────────────
  {
    id: "anchor-challenge-song-lab",
    slug: "challenge-song-lab",
    category: "SONG_CHALLENGE",
    title: "Song Challenge Lab",
    tagline: "Head-to-head track comparison — challenge someone's song",
    venueThemeId: "stage-lab-cyan",
    region: null,
    isPermanent: true,
    entryPolicy: "OPEN",
    minimumHumans: 2,
    recommendedHumans: 2,
    maximumHumans: 150,
    overflowThreshold: 80,
    overflowTemplateId: "tpl-song-challenge",
    eligibleStageRoles: ["performer", "artist", "fan"],
    route: "/live/rooms/challenge-song-lab",
  },
  {
    id: "anchor-challenge-rotating",
    slug: "challenge-rotating",
    category: "SONG_CHALLENGE",
    title: "Creative Challenge",
    tagline: "Rotating creative challenges — join and submit your best",
    venueThemeId: "stage-lab-fuchsia",
    region: null,
    isPermanent: true,
    entryPolicy: "OPEN",
    minimumHumans: 1,
    recommendedHumans: 4,
    maximumHumans: 120,
    overflowThreshold: 80,
    overflowTemplateId: "tpl-song-challenge",
    eligibleStageRoles: ["performer", "artist", "fan"],
    route: "/live/rooms/challenge-rotating",
  },

  // ── Lounges ──────────────────────────────────────────────────────────────────
  {
    id: "anchor-lounge-playlist",
    slug: "lounge-playlist",
    category: "LOUNGE",
    title: "Playlist Listening Lounge",
    tagline: "Curated heavy rotation — always on",
    venueThemeId: "lounge-purple-glow",
    region: null,
    isPermanent: true,
    entryPolicy: "OPEN",
    minimumHumans: 0,
    recommendedHumans: 8,
    maximumHumans: 40,
    overflowThreshold: 90,
    overflowTemplateId: "tpl-lounge",
    eligibleStageRoles: null,
    route: "/live/rooms/lounge-playlist",
  },
  {
    id: "anchor-lounge-conversation",
    slug: "lounge-conversation",
    category: "LOUNGE",
    title: "Open Conversation Lounge",
    tagline: "No agenda — just talk, chill, video chat",
    venueThemeId: "lounge-chill-smoke",
    region: null,
    isPermanent: true,
    entryPolicy: "OPEN",
    minimumHumans: 0,
    recommendedHumans: 8,
    maximumHumans: 32,
    overflowThreshold: 90,
    overflowTemplateId: "tpl-lounge",
    eligibleStageRoles: null,
    route: "/live/rooms/lounge-conversation",
  },

  // ── World Dance ──────────────────────────────────────────────────────────────
  {
    id: "anchor-world-dance-party",
    slug: "world-dance-party",
    category: "WORLD_DANCE",
    title: "World Dance Party",
    tagline: "DJ Record Ralph is live — come dance",
    venueThemeId: "dance-floor-neon",
    region: null,
    isPermanent: true,
    entryPolicy: "OPEN",
    minimumHumans: 0,
    recommendedHumans: 40,
    maximumHumans: 150,
    overflowThreshold: 85,
    overflowTemplateId: "tpl-world-dance",
    eligibleStageRoles: ["performer", "artist", "fan"],
    route: "/live/rooms/world-dance-party",
  },

  // ── Game Show ────────────────────────────────────────────────────────────────
  {
    id: "anchor-game-show-deal-or-feud",
    slug: "game-show-deal-or-feud",
    category: "GAME_SHOW",
    title: "Deal or Feud",
    tagline: "Platform game show — hosted by TMI bots",
    venueThemeId: "stage-game-show-gold",
    region: null,
    isPermanent: true,
    entryPolicy: "OPEN",
    minimumHumans: 0,
    recommendedHumans: 8,
    maximumHumans: 180,
    overflowThreshold: 90,
    overflowTemplateId: "tpl-game-show",
    eligibleStageRoles: ["performer", "artist", "fan"],
    route: "/live/rooms/game-show-deal-or-feud",
  },
];

// ── Public API ────────────────────────────────────────────────────────────────

export function getAllAnchors(): AnchorRoomDefinition[] {
  return ANCHORS;
}

export function getAnchorBySlug(slug: string): AnchorRoomDefinition | undefined {
  return ANCHORS.find((a) => a.slug === slug);
}

export function getAnchorsByCategory(category: AnchorCategory): AnchorRoomDefinition[] {
  return ANCHORS.filter((a) => a.category === category);
}

export function isAnchorSlug(slug: string): boolean {
  return ANCHORS.some((a) => a.slug === slug);
}
