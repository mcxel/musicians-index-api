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
  | "submarine"
  | "tree"
  | "rocket"
  | "ufo"
  | "train"
  | "house"
  | "robot"
  | "shark"
  | "car"
  | "helicopter"
  | "hand"
  | "baby"
  | "dj_face";

export const SKIN_REGISTRY: Record<ArtifactSkinId, {
  label:       string;
  icon:        string;
  theme:       string;    // Background color for the card
  accent:      string;    // Neon accent
  cost:        number;    // Points to unlock (0 = free)
  visualizerStyle: "sonar" | "bars" | "stars" | "leaves" | "fire" | "circuit" | "bubbles" | "radar";
}> = {
  submarine:   { label: "Submarine",   icon: "🚢", theme: "#0a1a0a", accent: "#FFD700", cost: 0,    visualizerStyle: "sonar"   },
  tree:        { label: "Tree",        icon: "🌳", theme: "#0a1a08", accent: "#FFD700", cost: 100,  visualizerStyle: "leaves"  },
  rocket:      { label: "Rocket",      icon: "🚀", theme: "#050818", accent: "#FF9500", cost: 250,  visualizerStyle: "stars"   },
  ufo:         { label: "UFO",         icon: "🛸", theme: "#05050e", accent: "#AA2DFF", cost: 400,  visualizerStyle: "radar"   },
  train:       { label: "Train",       icon: "🚂", theme: "#100808", accent: "#FF4422", cost: 200,  visualizerStyle: "bars"    },
  house:       { label: "House",       icon: "🏠", theme: "#0c0a06", accent: "#FFB84A", cost: 150,  visualizerStyle: "bars"    },
  robot:       { label: "Robot",       icon: "🤖", theme: "#050a10", accent: "#00FFFF", cost: 500,  visualizerStyle: "circuit" },
  shark:       { label: "Shark",       icon: "🦈", theme: "#040c18", accent: "#00FFFF", cost: 300,  visualizerStyle: "bubbles" },
  car:         { label: "Car",         icon: "🚗", theme: "#0a0810", accent: "#FF2DAA", cost: 200,  visualizerStyle: "bars"    },
  helicopter:  { label: "Helicopter",  icon: "🚁", theme: "#080810", accent: "#00FF88", cost: 350,  visualizerStyle: "radar"   },
  hand:        { label: "Hand",        icon: "✋", theme: "#100810", accent: "#FF9500", cost: 150,  visualizerStyle: "bars"    },
  baby:        { label: "Baby",        icon: "👶", theme: "#0a0a14", accent: "#FF88AA", cost: 100,  visualizerStyle: "bubbles" },
  dj_face:     { label: "DJ",          icon: "🎧", theme: "#080510", accent: "#FF2DAA", cost: 300,  visualizerStyle: "bars"    },
};

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
  skinId: ArtifactSkinId = "submarine",
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
