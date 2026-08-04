/**
 * PlaylistArtifactEngine — Core types, state machine, and logic
 * for TMI Playlist Artifacts + Media Player chassis.
 *
 * Terminology (Marcel 2026-08-03):
 *   Media Player  = collectible playback chassis (evolved from "playlist skins")
 *   Playlist Artifact = signed music package (tracks + owner + permissions)
 *   YoPho Card / Album Cover = separate identity layers — do NOT merge
 *
 * Architecture: RoomContainer → MediaMonitor → MediaPlayerChassis + PlaylistArtifact
 *
 * Songs are NEVER stored here — they are URL pointers to external sources.
 * The engine manages playback state, points, presence, and sharing.
 *
 * Rule 19: SKIN_REGISTRY evolves/aliases toward Media Player chassis — no second store.
 */

// ─── Track Source ─────────────────────────────────────────────────────────────

export type TrackSource =
  | "spotify"
  | "apple_music"
  | "youtube"
  | "soundcloud"
  | "tidal"
  | "bandcamp"
  | "tmi"           // TMI-native upload (stored in TMI CDN)
  | "usa_stream"    // USA Stream Team feed
  | "external";     // Generic external link

export interface ArtifactTrack {
  id:           string;
  title:        string;
  artist:       string;
  duration:     number;    // seconds
  source:       TrackSource;
  uri:          string;    // Full URL or platform URI (spotify:track:xxx)
  albumArt?:    string;    // Album cover URL
  artistId?:    string;    // TMI artist ID (for presence badge)
  isExplicit?:  boolean;
  genre?:       string;
  isTMICore?:   boolean;   // Marks Berntout Perductions / BJM / Big Kazhdog tracks
  tmiArtistKey?: "berntout" | "bjm" | "big_kazhdog";
}

// ─── Media Player Chassis (evolved from Playlist Skins — Rule 19) ─────────────

export type MediaPlayerRarity = "free" | "common" | "rare" | "tier" | "legendary";

export type MediaPlayerChassisId =
  // Free default + free starters
  | "standard"       // Standard TMI Player — free default for every user
  | "tmi_classic"    // alias path → maps to standard visually
  | "tmi_dark"
  | "tmi_neon"
  // Tier-reward prestige
  | "chrome"
  | "vice_neon"
  | "broadcast"
  | "signature"
  // Store / points (common + rare chassis)
  | "tree"
  | "baby"
  | "house"
  | "hand"
  | "train"
  | "car"
  | "fish"           // Aquarium Fish — purchaseable Rare (NOT free default)
  | "steampunk"
  | "face_ai"        // Original TMI face/AI-inspired chassis — not copyrighted Sonique IP
  // Premium / rare chassis (also listable for points)
  | "submarine"
  | "rocket"
  | "shark"
  | "dj_face"
  | "helicopter"
  | "ufo"
  | "robot";

/** @deprecated Use MediaPlayerChassisId — kept for legacy import sites. */
export type ArtifactSkinId = MediaPlayerChassisId;

export type PlaylistSkinTier = "SILVER" | "GOLD" | "PLATINUM" | "DIAMOND";

/**
 * Unlock paths (Rule 19 Skin Economy → Media Player Economy):
 * free | points | premium (Stripe) | tier. Bot auto-design = COMING_SOON stub only.
 */
export type SkinUnlockMethod = "free" | "points" | "premium" | "tier";
export type ChassisUnlockMethod = SkinUnlockMethod;

export type ChassisAnimationPack =
  | "none"
  | "bars"
  | "stars"
  | "leaves"
  | "sonar"
  | "bubbles"
  | "radar"
  | "circuit"
  | "chrome"
  | "broadcast"
  | "signature"
  | "fire"
  | "gears"
  | "face_pulse";

/** Canonical Media Player chassis record. */
export interface MediaPlayerChassis {
  id: MediaPlayerChassisId;
  label: string;
  icon: string;
  theme: string;
  accent: string;
  rarity: MediaPlayerRarity;
  /** Spendable TMI Points price (store). */
  pricePoints?: number;
  /** Optional Stripe stub price in cents. */
  priceUsdCents?: number;
  animationPack: ChassisAnimationPack;
  /** True when every new account receives this chassis. */
  freeDefault: boolean;
  unlockMethod: ChassisUnlockMethod;
  tierRequired?: PlaylistSkinTier;
  animated?: boolean;
  /** Legacy visualizer key (SKIN_REGISTRY compat). */
  visualizerStyle: ChassisAnimationPack;
  /** @deprecated alias — use pricePoints */
  pointsCost?: number;
  /** @deprecated alias — use priceUsdCents / 100 */
  priceUsd?: number;
  storeSku?: string;
  storeListed?: boolean;
}

/** Thin optional listener theme (colors / EQ tint) — not a chassis. */
export interface ListenerTheme {
  id: string;
  label: string;
  primary: string;
  secondary: string;
  eqTint?: string;
}

/** Free default chassis id — Standard TMI Player. */
export const FREE_DEFAULT_CHASSIS_ID: MediaPlayerChassisId = "standard";

/**
 * Bot chassis generation pipeline — registry stub only (Phase 1).
 * Do not claim live auto-design; Rule 20 honest empty / coming soon.
 */
export const BOT_CHASSIS_GENERATION_PIPELINE = {
  status: "COMING_SOON" as const,
  label: "Bot Media Player Design Pipeline",
  note: "Automated chassis generation is not live. Manual registry SKUs only.",
};

type ChassisRegistryEntry = Omit<MediaPlayerChassis, "id">;

function chassis(
  partial: ChassisRegistryEntry & { visualizerStyle: ChassisAnimationPack },
): ChassisRegistryEntry {
  return {
    ...partial,
    animationPack: partial.animationPack ?? partial.visualizerStyle,
    pointsCost: partial.pricePoints ?? partial.pointsCost,
    priceUsd:
      partial.priceUsd ??
      (partial.priceUsdCents != null ? partial.priceUsdCents / 100 : undefined),
  };
}

/**
 * Canonical chassis registry (also exported as SKIN_REGISTRY for Rule 19 compat).
 * Store Rare SKUs (~299 pts / $2.99): submarine, rocket, tree, fish, steampunk, face_ai.
 */
export const MEDIA_PLAYER_CHASSIS_REGISTRY: Record<MediaPlayerChassisId, MediaPlayerChassis> = {
  // ── Free — Standard TMI Player is the only freeDefault ───────────────────
  standard: {
    id: "standard",
    ...chassis({
      label: "Standard TMI Player",
      icon: "▶",
      theme: "#0a0614",
      accent: "#00FFFF",
      visualizerStyle: "bars",
      animationPack: "bars",
      unlockMethod: "free",
      rarity: "free",
      freeDefault: true,
    }),
  },
  tmi_classic: {
    id: "tmi_classic",
    ...chassis({
      label: "TMI Classic",
      icon: "🎵",
      theme: "#0a0614",
      accent: "#00FFFF",
      visualizerStyle: "bars",
      animationPack: "bars",
      unlockMethod: "free",
      rarity: "free",
      freeDefault: false,
    }),
  },
  tmi_dark: {
    id: "tmi_dark",
    ...chassis({
      label: "TMI Dark",
      icon: "🌑",
      theme: "#050505",
      accent: "#888888",
      visualizerStyle: "bars",
      animationPack: "bars",
      unlockMethod: "free",
      rarity: "free",
      freeDefault: false,
    }),
  },
  tmi_neon: {
    id: "tmi_neon",
    ...chassis({
      label: "TMI Neon",
      icon: "✨",
      theme: "#0a0614",
      accent: "#FF2DAA",
      visualizerStyle: "stars",
      animationPack: "stars",
      unlockMethod: "free",
      rarity: "free",
      freeDefault: false,
    }),
  },

  chrome: {
    id: "chrome",
    ...chassis({
      label: "Chrome",
      icon: "⚙️",
      theme: "#1a1a1f",
      accent: "#C0C0C0",
      visualizerStyle: "chrome",
      animationPack: "chrome",
      unlockMethod: "tier",
      tierRequired: "SILVER",
      rarity: "tier",
      freeDefault: false,
    }),
  },
  vice_neon: {
    id: "vice_neon",
    ...chassis({
      label: "Vice Neon",
      icon: "🌴",
      theme: "#1a0a2e",
      accent: "#FF2DAA",
      visualizerStyle: "bars",
      animationPack: "bars",
      unlockMethod: "tier",
      tierRequired: "GOLD",
      rarity: "tier",
      freeDefault: false,
    }),
  },
  broadcast: {
    id: "broadcast",
    ...chassis({
      label: "Broadcast",
      icon: "📡",
      theme: "#0a1424",
      accent: "#00E5FF",
      visualizerStyle: "broadcast",
      animationPack: "broadcast",
      unlockMethod: "tier",
      tierRequired: "PLATINUM",
      rarity: "tier",
      freeDefault: false,
    }),
  },
  signature: {
    id: "signature",
    ...chassis({
      label: "Signature",
      icon: "👑",
      theme: "#14060a",
      accent: "#FFD700",
      visualizerStyle: "signature",
      animationPack: "signature",
      unlockMethod: "tier",
      tierRequired: "DIAMOND",
      rarity: "tier",
      freeDefault: false,
      animated: true,
    }),
  },

  // ── Store Rare chassis (~299 pts / $2.99) ─────────────────────────────────
  tree: {
    id: "tree",
    ...chassis({
      label: "Tree",
      icon: "🌳",
      theme: "#0a1a08",
      accent: "#FFD700",
      visualizerStyle: "leaves",
      animationPack: "leaves",
      unlockMethod: "points",
      rarity: "rare",
      freeDefault: false,
      pricePoints: 299,
      priceUsdCents: 299,
      storeSku: "mp-chassis-tree",
      storeListed: true,
      animated: true,
    }),
  },
  fish: {
    id: "fish",
    ...chassis({
      label: "Aquarium Fish",
      icon: "🐠",
      theme: "#003366",
      accent: "#FFD700",
      visualizerStyle: "bubbles",
      animationPack: "bubbles",
      unlockMethod: "points",
      rarity: "rare",
      freeDefault: false,
      pricePoints: 299,
      priceUsdCents: 299,
      storeSku: "mp-chassis-fish",
      storeListed: true,
      animated: true,
    }),
  },
  steampunk: {
    id: "steampunk",
    ...chassis({
      label: "Steampunk",
      icon: "🕰️",
      theme: "#1a1008",
      accent: "#D4A017",
      visualizerStyle: "gears",
      animationPack: "gears",
      unlockMethod: "points",
      rarity: "rare",
      freeDefault: false,
      pricePoints: 299,
      priceUsdCents: 299,
      storeSku: "mp-chassis-steampunk",
      storeListed: true,
      animated: true,
    }),
  },
  face_ai: {
    id: "face_ai",
    ...chassis({
      label: "Neon Face",
      icon: "◈",
      theme: "#0a0618",
      accent: "#FF2DAA",
      visualizerStyle: "face_pulse",
      animationPack: "face_pulse",
      unlockMethod: "points",
      rarity: "rare",
      freeDefault: false,
      pricePoints: 299,
      priceUsdCents: 299,
      storeSku: "mp-chassis-face-ai",
      storeListed: true,
      animated: true,
    }),
  },
  submarine: {
    id: "submarine",
    ...chassis({
      label: "Submarine",
      icon: "🚢",
      theme: "#0a1a0a",
      accent: "#FFD700",
      visualizerStyle: "sonar",
      animationPack: "sonar",
      unlockMethod: "points",
      rarity: "rare",
      freeDefault: false,
      pricePoints: 299,
      priceUsdCents: 299,
      storeSku: "mp-chassis-submarine",
      storeListed: true,
      animated: true,
    }),
  },
  rocket: {
    id: "rocket",
    ...chassis({
      label: "Rocket",
      icon: "🚀",
      theme: "#050818",
      accent: "#FF9500",
      visualizerStyle: "stars",
      animationPack: "stars",
      unlockMethod: "points",
      rarity: "rare",
      freeDefault: false,
      pricePoints: 299,
      priceUsdCents: 299,
      storeSku: "mp-chassis-rocket",
      storeListed: true,
      animated: true,
    }),
  },

  // ── Other points / premium (not Stage-1 store Rare set) ───────────────────
  baby: {
    id: "baby",
    ...chassis({
      label: "Baby",
      icon: "👶",
      theme: "#0a0a14",
      accent: "#FF88AA",
      visualizerStyle: "bubbles",
      animationPack: "bubbles",
      unlockMethod: "points",
      rarity: "common",
      freeDefault: false,
      pricePoints: 250,
    }),
  },
  house: {
    id: "house",
    ...chassis({
      label: "House",
      icon: "🏠",
      theme: "#0c0a06",
      accent: "#FFB84A",
      visualizerStyle: "bars",
      animationPack: "bars",
      unlockMethod: "points",
      rarity: "common",
      freeDefault: false,
      pricePoints: 350,
    }),
  },
  hand: {
    id: "hand",
    ...chassis({
      label: "Hand",
      icon: "✋",
      theme: "#100810",
      accent: "#FF9500",
      visualizerStyle: "bars",
      animationPack: "bars",
      unlockMethod: "points",
      rarity: "common",
      freeDefault: false,
      pricePoints: 350,
    }),
  },
  train: {
    id: "train",
    ...chassis({
      label: "Train",
      icon: "🚂",
      theme: "#100808",
      accent: "#FF4422",
      visualizerStyle: "bars",
      animationPack: "bars",
      unlockMethod: "points",
      rarity: "common",
      freeDefault: false,
      pricePoints: 500,
    }),
  },
  car: {
    id: "car",
    ...chassis({
      label: "Car",
      icon: "🚗",
      theme: "#0a0810",
      accent: "#FF2DAA",
      visualizerStyle: "bars",
      animationPack: "bars",
      unlockMethod: "points",
      rarity: "common",
      freeDefault: false,
      pricePoints: 500,
    }),
  },
  shark: {
    id: "shark",
    ...chassis({
      label: "Shark",
      icon: "🦈",
      theme: "#040c18",
      accent: "#00FFFF",
      visualizerStyle: "bubbles",
      animationPack: "bubbles",
      unlockMethod: "premium",
      rarity: "rare",
      freeDefault: false,
      priceUsdCents: 199,
      pricePoints: 199,
    }),
  },
  dj_face: {
    id: "dj_face",
    ...chassis({
      label: "DJ",
      icon: "🎧",
      theme: "#080510",
      accent: "#FF2DAA",
      visualizerStyle: "bars",
      animationPack: "bars",
      unlockMethod: "premium",
      rarity: "rare",
      freeDefault: false,
      priceUsdCents: 199,
      pricePoints: 199,
    }),
  },
  helicopter: {
    id: "helicopter",
    ...chassis({
      label: "Helicopter",
      icon: "🚁",
      theme: "#080810",
      accent: "#00FF88",
      visualizerStyle: "radar",
      animationPack: "radar",
      unlockMethod: "premium",
      rarity: "rare",
      freeDefault: false,
      priceUsdCents: 299,
      pricePoints: 299,
    }),
  },
  ufo: {
    id: "ufo",
    ...chassis({
      label: "UFO",
      icon: "🛸",
      theme: "#05050e",
      accent: "#AA2DFF",
      visualizerStyle: "radar",
      animationPack: "radar",
      unlockMethod: "premium",
      rarity: "rare",
      freeDefault: false,
      priceUsdCents: 299,
      pricePoints: 299,
    }),
  },
  robot: {
    id: "robot",
    ...chassis({
      label: "Robot",
      icon: "🤖",
      theme: "#050a10",
      accent: "#00FFFF",
      visualizerStyle: "circuit",
      animationPack: "circuit",
      unlockMethod: "premium",
      rarity: "legendary",
      freeDefault: false,
      priceUsdCents: 399,
      pricePoints: 399,
    }),
  },
};

/**
 * Legacy alias — same object as MEDIA_PLAYER_CHASSIS_REGISTRY (Rule 19: no duplicate store).
 * Shape includes pointsCost / priceUsd for existing ShopDrawerPanel / MembershipRegistry readers.
 */
export const SKIN_REGISTRY = MEDIA_PLAYER_CHASSIS_REGISTRY as Record<
  ArtifactSkinId,
  MediaPlayerChassis & {
    pointsCost?: number;
    priceUsd?: number;
  }
>;

/** Stage-1 store-listed Rare Media Player SKUs. */
export const MEDIA_PLAYER_STORE_SKUS: MediaPlayerChassisId[] = [
  "submarine",
  "rocket",
  "tree",
  "fish",
  "steampunk",
  "face_ai",
];

export function listStoreMediaPlayers(): MediaPlayerChassis[] {
  return MEDIA_PLAYER_STORE_SKUS.map((id) => MEDIA_PLAYER_CHASSIS_REGISTRY[id]);
}

const TIER_RANK: Record<PlaylistSkinTier | "FREE" | "PRO" | "RUBY", number> = {
  FREE: 0, PRO: 1, RUBY: 2, SILVER: 3, GOLD: 4, PLATINUM: 5, DIAMOND: 6,
};

/**
 * Can this account equip the given chassis? "free" always pass. "tier"
 * needs membership tier (or ownership from gift/prize). points/premium need ownership.
 */
export function canEquipChassis(
  chassisId: MediaPlayerChassisId,
  accountTier: keyof typeof TIER_RANK,
  ownedChassisIds: MediaPlayerChassisId[],
): boolean {
  const entry = MEDIA_PLAYER_CHASSIS_REGISTRY[chassisId];
  if (!entry) return false;
  if (entry.unlockMethod === "free") return true;
  if (ownedChassisIds.includes(chassisId)) return true;
  if (entry.unlockMethod === "tier" && entry.tierRequired) {
    return TIER_RANK[accountTier] >= TIER_RANK[entry.tierRequired];
  }
  return false;
}

/** @deprecated Use canEquipChassis */
export function canEquipSkin(
  skinId: ArtifactSkinId,
  accountTier: keyof typeof TIER_RANK,
  ownedSkinIds: ArtifactSkinId[],
): boolean {
  return canEquipChassis(skinId, accountTier, ownedSkinIds);
}

// ─── Artifact (music package — NOT the chassis) ───────────────────────────────

export interface PlaylistArtifactPermissions {
  canPlay: boolean;
  canEdit: boolean;
  canShare: boolean;
}

export interface PlaylistArtifact {
  id:          string;
  ownerId:     string;
  ownerName:   string;
  /** Equipped Media Player chassis id (playback chassis, not package identity). */
  chassisId:   MediaPlayerChassisId;
  /** @deprecated alias of chassisId — kept for legacy readers */
  skinId:      ArtifactSkinId;
  title:       string;
  category:    string;    // "Top Charts - Pop", "My Mixtape", etc.
  tracks:      ArtifactTrack[];
  owner:       { id: string; name: string };
  permissions: PlaylistArtifactPermissions;
  createdAt:   string;    // ISO
  updatedAt:   string;
  isPublic:    boolean;
  /** Optional thin listener theme — separate from chassis / YoPho / album cover. */
  listenerTheme?: ListenerTheme;
  stats: {
    listeners:   number;
    xpAvailable: number;
    likes:       number;
    rating:      number;
    plays:       number;
  };
  presence?: {
    artistId:  string;
    isOnline:  boolean;
    isLive:    boolean;
    liveRoomId?: string;
  };
  sponsors?: {
    name:     string;
    logoUrl?: string;
    url:      string;
  }[];
}

// ─── Playback State ───────────────────────────────────────────────────────────

export interface ArtifactPlaybackState {
  artifactId:       string;
  currentIndex:     number;
  isPlaying:        boolean;
  progress:         number;   // 0–1
  elapsedSecs:      number;
  volume:           number;   // 0–1
  isMuted:          boolean;
  isOpen:           boolean;  // chevron drawer open
  isDetached:       boolean;  // PiP mode
  sessionPoints:    number;
  totalPoints:      number;
  eq: {
    bass:    number;  // -12 to +12 dB
    mid:     number;
    treble:  number;
    balance: number;  // -1 to +1
    volume:  number;  // 0–1
  };
}

export function makeDefaultPlaybackState(artifactId: string): ArtifactPlaybackState {
  return {
    artifactId,
    currentIndex:  0,
    isPlaying:     false,
    progress:      0,
    elapsedSecs:   0,
    volume:        0.8,
    isMuted:       false,
    isOpen:        false,
    isDetached:    false,
    sessionPoints: 0,
    totalPoints:   0,
    eq: { bass: 0, mid: 0, treble: 0, balance: 0, volume: 0.8 },
  };
}

// ─── Interleave Algorithm (TMI Rule) ─────────────────────────────────────────
// Ensures Berntout Perductions / BJM / Big Kazhdog appear but never back-to-back

export function interleaveCoreTracks(tracks: ArtifactTrack[]): ArtifactTrack[] {
  const core    = tracks.filter((t) => t.isTMICore);
  const others  = tracks.filter((t) => !t.isTMICore);
  const result: ArtifactTrack[] = [];
  let coreIdx = 0;
  let otherIdx = 0;
  let lastWasCore = false;
  let streak = 0; // consecutive non-core tracks since last core insertion

  while (otherIdx < others.length || coreIdx < core.length) {
    // Insert a core track after 1–3 non-core tracks (never consecutive core)
    if (!lastWasCore && coreIdx < core.length && streak >= 1 + (coreIdx % 2)) {
      result.push(core[coreIdx++]);
      lastWasCore = true;
      streak = 0;
    } else if (otherIdx < others.length) {
      result.push(others[otherIdx++]);
      lastWasCore = false;
      streak++;
    } else if (coreIdx < core.length) {
      result.push(core[coreIdx++]);
      lastWasCore = true;
      streak = 0;
    } else {
      break;
    }
  }

  return result;
}

// ─── Points Engine ────────────────────────────────────────────────────────────

export const POINTS_PER_FULL_TRACK = 10;
export const POINTS_PER_PARTIAL    = 2;  // earned if > 30 sec listened
export const POINTS_PER_LIKE       = 5;
export const POINTS_PER_SHARE      = 15;
export const POINTS_PER_ADD_LIB    = 20;

export function calculateTrackPoints(elapsedSecs: number, totalSecs: number): number {
  if (totalSecs <= 0) return 0;
  const pct = elapsedSecs / totalSecs;
  if (pct >= 0.9) return POINTS_PER_FULL_TRACK;
  if (elapsedSecs >= 30) return POINTS_PER_PARTIAL;
  return 0;
}

// ─── Share URL ───────────────────────────────────────────────────────────────

export function makeArtifactShareUrl(artifactId: string): string {
  const base = typeof window !== "undefined" ? window.location.origin : "https://themusiciansindex.com";
  return `${base}/artifact/${artifactId}`;
}

// ─── Source resolver ──────────────────────────────────────────────────────────
// Maps a track URI to an embeddable URL for the audio element

export function resolveTrackUrl(track: ArtifactTrack): string | null {
  switch (track.source) {
    case "spotify":
      // Spotify embeds via oEmbed iframe — extract track ID
      if (track.uri.startsWith("spotify:track:")) {
        const id = track.uri.replace("spotify:track:", "");
        return `https://open.spotify.com/embed/track/${id}`;
      }
      if (track.uri.includes("open.spotify.com")) return track.uri;
      return null;

    case "youtube":
      // Extract video ID from various YouTube URL formats
      const ytMatch = track.uri.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
      if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
      return null;

    case "soundcloud":
      return `https://w.soundcloud.com/player/?url=${encodeURIComponent(track.uri)}&auto_play=true`;

    case "tmi":
    case "external":
      return track.uri;  // Direct audio file URL

    default:
      return track.uri;
  }
}

// ─── Mock factory ─────────────────────────────────────────────────────────────

export function makeMockArtifact(
  chassisId: MediaPlayerChassisId = FREE_DEFAULT_CHASSIS_ID,
  category  = "Top Charts — Pop",
): PlaylistArtifact {
  const id = `artifact_${chassisId}_${Date.now()}`;
  return {
    id,
    ownerId:   "user_local",
    ownerName: "You",
    owner:     { id: "user_local", name: "You" },
    chassisId,
    skinId:    chassisId,
    title:     "My Playlist Artifact",
    category,
    isPublic:  true,
    permissions: { canPlay: true, canEdit: true, canShare: true },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tracks: interleaveCoreTracks([
      { id: "t1", title: "I'm So Handsome",   artist: "Big Kazhdog",          duration: 210, source: "tmi",     uri: "", isTMICore: true,  tmiArtistKey: "big_kazhdog" },
      { id: "t2", title: "Love 4 Da Block",   artist: "BJM The Rapper",       duration: 238, source: "tmi",     uri: "", isTMICore: true,  tmiArtistKey: "bjm"         },
      { id: "t3", title: "Frequency",         artist: "Berntout Perductions", duration: 195, source: "tmi",     uri: "", isTMICore: true,  tmiArtistKey: "berntout"    },
      { id: "t4", title: "Neon Sunrise",      artist: "Wave Tek",             duration: 203, source: "spotify", uri: "" },
      { id: "t5", title: "Block Party",       artist: "Cypher Ace",           duration: 187, source: "spotify", uri: "" },
      { id: "t6", title: "Level Up",          artist: "ProducerX",            duration: 220, source: "youtube", uri: "" },
      { id: "t7", title: "Midnight Session",  artist: "Soulwave",             duration: 258, source: "spotify", uri: "" },
    ]),
    // Rule 20: mock factory for local wiring only — stats start at zero, not fabricated engagement.
    stats:    { listeners: 0, xpAvailable: 0, likes: 0, rating: 0, plays: 0 },
    presence: { artistId: "kazhdog_01", isOnline: false, isLive: false },
    listenerTheme: undefined,
  };
}

/** Share URL for a Playlist Artifact (not the chassis). Recipient plays in their equipped Media Player. */
export function makePlaylistArtifactShareUrl(artifactId: string): string {
  return makeArtifactShareUrl(artifactId);
}
