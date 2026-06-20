/**
 * PlaylistArtifactEngine — Core types, state machine, and logic
 * for TMI Playlist Artifacts (collectible animated playlist objects).
 *
 * Architecture: RoomContainer → MediaMonitor → PlaylistArtifact → Skin
 *
 * Songs are NEVER stored here — they are URL pointers to external sources.
 * The engine manages playback state, points, presence, and sharing.
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

// ─── Skins ────────────────────────────────────────────────────────────────────

export type ArtifactSkinId =
  // Free starters
  | "tmi_classic"
  | "tmi_dark"
  | "tmi_neon"
  // Tier-reward prestige skins
  | "chrome"
  | "vice_neon"
  | "broadcast"
  | "signature"
  // Points tier (common)
  | "tree"
  | "baby"
  | "house"
  | "hand"
  | "train"
  | "car"
  // Premium tier (real money)
  | "submarine"
  | "rocket"
  | "shark"
  | "dj_face"
  | "helicopter"
  | "ufo"
  | "robot";

export type PlaylistSkinTier = "SILVER" | "GOLD" | "PLATINUM" | "DIAMOND";

/**
 * Skin Economy — locked 2026-06-19 by Marcel Dickens: every cosmetic must be
 * obtainable through at least one of four paths. "free" and "tier" are
 * obtained without spending anything (signup default / membership reward —
 * tier ones can ALSO be bot-gifted or awarded as tournament prizes, which is
 * a fulfillment path handled by whatever engine grants the skin, not a
 * registry field). "points" and "premium" are the two purchasable tiers —
 * premium is real money via Stripe, points is platform activity currency.
 */
export type SkinUnlockMethod = "free" | "points" | "premium" | "tier";

export const SKIN_REGISTRY: Record<ArtifactSkinId, {
  label:       string;
  icon:        string;
  theme:       string;    // Background color for the card
  accent:      string;    // Neon accent
  visualizerStyle: "sonar" | "bars" | "stars" | "leaves" | "fire" | "circuit" | "bubbles" | "radar" | "broadcast" | "chrome" | "signature";
  unlockMethod: SkinUnlockMethod;
  pointsCost?: number;     // set when unlockMethod === "points"
  priceUsd?:   number;     // set when unlockMethod === "premium"
  tierRequired?: PlaylistSkinTier; // set when unlockMethod === "tier"
  animated?:   boolean;
}> = {
  // ── Free starters — every account gets these on signup, no unlock needed ──
  tmi_classic: { label: "TMI Classic", icon: "🎵", theme: "#0a0614", accent: "#00FFFF", visualizerStyle: "bars",   unlockMethod: "free" },
  tmi_dark:    { label: "TMI Dark",    icon: "🌑", theme: "#050505", accent: "#888888", visualizerStyle: "bars",   unlockMethod: "free" },
  tmi_neon:    { label: "TMI Neon",    icon: "✨", theme: "#0a0614", accent: "#FF2DAA", visualizerStyle: "stars",  unlockMethod: "free" },

  // ── Tier-reward prestige skins — Silver→Chrome, Gold→Vice Neon, ───────────
  // Platinum→Broadcast, Diamond→Signature. Also obtainable via bot gifts /
  // tournament prizes per the Skin Economy rule above.
  chrome:      { label: "Chrome",      icon: "⚙️", theme: "#1a1a1f", accent: "#C0C0C0", visualizerStyle: "chrome",    unlockMethod: "tier", tierRequired: "SILVER" },
  vice_neon:   { label: "Vice Neon",   icon: "🌴", theme: "#1a0a2e", accent: "#FF2DAA", visualizerStyle: "bars",      unlockMethod: "tier", tierRequired: "GOLD" },
  broadcast:   { label: "Broadcast",   icon: "📡", theme: "#0a1424", accent: "#00E5FF", visualizerStyle: "broadcast", unlockMethod: "tier", tierRequired: "PLATINUM" },
  signature:   { label: "Signature",   icon: "👑", theme: "#14060a", accent: "#FFD700", visualizerStyle: "signature", unlockMethod: "tier", tierRequired: "DIAMOND", animated: true },

  // ── Points tier (common — 250-500 points via platform activity) ──────────
  tree:        { label: "Tree",        icon: "🌳", theme: "#0a1a08", accent: "#FFD700", visualizerStyle: "leaves",  unlockMethod: "points", pointsCost: 250 },
  baby:        { label: "Baby",        icon: "👶", theme: "#0a0a14", accent: "#FF88AA", visualizerStyle: "bubbles", unlockMethod: "points", pointsCost: 250 },
  house:       { label: "House",       icon: "🏠", theme: "#0c0a06", accent: "#FFB84A", visualizerStyle: "bars",    unlockMethod: "points", pointsCost: 350 },
  hand:        { label: "Hand",        icon: "✋", theme: "#100810", accent: "#FF9500", visualizerStyle: "bars",    unlockMethod: "points", pointsCost: 350 },
  train:       { label: "Train",       icon: "🚂", theme: "#100808", accent: "#FF4422", visualizerStyle: "bars",    unlockMethod: "points", pointsCost: 500 },
  car:         { label: "Car",         icon: "🚗", theme: "#0a0810", accent: "#FF2DAA", visualizerStyle: "bars",    unlockMethod: "points", pointsCost: 500 },

  // ── Premium tier (real money — $0.99 to $3.99 by rarity) ──────────────────
  submarine:   { label: "Submarine",   icon: "🚢", theme: "#0a1a0a", accent: "#FFD700", visualizerStyle: "sonar",   unlockMethod: "premium", priceUsd: 0.99 },
  rocket:      { label: "Rocket",      icon: "🚀", theme: "#050818", accent: "#FF9500", visualizerStyle: "stars",   unlockMethod: "premium", priceUsd: 0.99 },
  shark:       { label: "Shark",       icon: "🦈", theme: "#040c18", accent: "#00FFFF", visualizerStyle: "bubbles", unlockMethod: "premium", priceUsd: 1.99 },
  dj_face:     { label: "DJ",          icon: "🎧", theme: "#080510", accent: "#FF2DAA", visualizerStyle: "bars",    unlockMethod: "premium", priceUsd: 1.99 },
  helicopter:  { label: "Helicopter",  icon: "🚁", theme: "#080810", accent: "#00FF88", visualizerStyle: "radar",   unlockMethod: "premium", priceUsd: 2.99 },
  ufo:         { label: "UFO",         icon: "🛸", theme: "#05050e", accent: "#AA2DFF", visualizerStyle: "radar",   unlockMethod: "premium", priceUsd: 2.99 },
  robot:       { label: "Robot",       icon: "🤖", theme: "#050a10", accent: "#00FFFF", visualizerStyle: "circuit", unlockMethod: "premium", priceUsd: 3.99 },
};

const TIER_RANK: Record<PlaylistSkinTier | "FREE" | "PRO" | "RUBY", number> = {
  FREE: 0, PRO: 1, RUBY: 2, SILVER: 3, GOLD: 4, PLATINUM: 5, DIAMOND: 6,
};

/**
 * Can this account equip the given skin? "free" skins always pass. "tier"
 * skins need the account's membership tier to be at or above tierRequired
 * (or the skin to already be in ownedSkinIds, e.g. from a bot gift /
 * tournament prize). "points"/"premium" skins need prior purchase, tracked
 * the same way regardless of which currency paid for them.
 */
export function canEquipSkin(
  skinId: ArtifactSkinId,
  accountTier: keyof typeof TIER_RANK,
  ownedSkinIds: ArtifactSkinId[],
): boolean {
  const skin = SKIN_REGISTRY[skinId];
  if (skin.unlockMethod === "free") return true;
  if (ownedSkinIds.includes(skinId)) return true;
  if (skin.unlockMethod === "tier" && skin.tierRequired) {
    return TIER_RANK[accountTier] >= TIER_RANK[skin.tierRequired];
  }
  return false;
}

// ─── Artifact ─────────────────────────────────────────────────────────────────

export interface PlaylistArtifact {
  id:          string;
  ownerId:     string;
  ownerName:   string;
  skinId:      ArtifactSkinId;
  title:       string;
  category:    string;    // "Top Charts - Pop", "My Mixtape", etc.
  tracks:      ArtifactTrack[];
  createdAt:   string;    // ISO
  updatedAt:   string;
  isPublic:    boolean;
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
  skinId: ArtifactSkinId = "tmi_classic",
  category  = "Top Charts — Pop",
): PlaylistArtifact {
  const id = `artifact_${skinId}_${Date.now()}`;
  return {
    id,
    ownerId:   "user_local",
    ownerName: "You",
    skinId,
    title:     `${SKIN_REGISTRY[skinId].label} Playlist`,
    category,
    isPublic:  true,
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
    stats:    { listeners: 128, xpAvailable: 10, likes: 1241, rating: 4.9, plays: 3850 },
    presence: { artistId: "kazhdog_01", isOnline: true, isLive: false },
  };
}
