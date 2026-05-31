/**
 * PlaylistArtifact Engine
 * Treats each playlist as a collectable digital character object.
 * Songs are stored as URL pointers — never uploaded directly.
 * TMI interleaving rule: Big Kazhdog / BJM / Berntout Perductions
 * distributed naturally, never back-to-back.
 */

export type ArtifactSkin =
  | "submarine" | "ufo" | "rocket" | "tree"
  | "house"     | "car" | "train";

export type TrackSource = "spotify" | "youtube" | "soundcloud" | "tmi" | "apple" | "link";

export interface ArtifactTrack {
  id: string;
  title: string;
  artist: string;
  duration: string;   // "3:28"
  sourceUrl: string;  // Spotify/YouTube/SoundCloud/TMI URL — not a file
  source: TrackSource;
  liked?: boolean;
}

export interface PlaylistArtifactData {
  artifactId: string;
  ownerId: string;
  skin: ArtifactSkin;
  title: string;
  createdAt: number;
  tracks: ArtifactTrack[];
  points: number;
  likes: number;
  listeners: number;
  isPublic: boolean;
  sponsors?: string[];
}

export interface EQState {
  bass:    number; // 0-100
  mid:     number;
  treble:  number;
  volume:  number;
}

export const DEFAULT_EQ: EQState = { bass: 65, mid: 70, treble: 60, volume: 80 };

export const SKIN_META: Record<ArtifactSkin, {
  name: string; icon: string;
  primary: string; accent: string; bg: string;
  unlockPoints: number; description: string;
}> = {
  submarine: { name: "Submarine",  icon: "🚢", primary: "#FFD700", accent: "#FF8C00", bg: "#003366", unlockPoints: 0,    description: "Classic deep-sea artifact. Starter skin." },
  ufo:       { name: "UFO",        icon: "🛸", primary: "#00FFFF", accent: "#AA2DFF", bg: "#010118", unlockPoints: 500,  description: "Space-age neon saucer. 500 points to unlock." },
  rocket:    { name: "Rocket",     icon: "🚀", primary: "#FF6B35", accent: "#FFD700", bg: "#010115", unlockPoints: 750,  description: "Deep space rocket. 750 points to unlock." },
  tree:      { name: "Tree",       icon: "🌳", primary: "#FFD700", accent: "#FF8C00", bg: "#0a0a20", unlockPoints: 250,  description: "Living light tree. 250 points to unlock." },
  house:     { name: "House",      icon: "🏠", primary: "#FFD700", accent: "#CC6600", bg: "#0a0815", unlockPoints: 300,  description: "Warm broadcast house. 300 points to unlock." },
  car:       { name: "Car",        icon: "🚗", primary: "#FFD700", accent: "#FFD700", bg: "#000000", unlockPoints: 600,  description: "Neon outline cruiser. 600 points to unlock." },
  train:     { name: "Train",      icon: "🚂", primary: "#FF6B35", accent: "#FFD700", bg: "#010115", unlockPoints: 400,  description: "Steam locomotive. 400 points to unlock." },
};

// TMI seed tracks — distributed naturally, never back-to-back
const TMI_SEED: ArtifactTrack[] = [
  { id: "tmi-kaz", title: "I'm So Handsome",      artist: "Big Kazhdog",         duration: "3:45", sourceUrl: "#", source: "tmi" },
  { id: "tmi-bjm", title: "Love 4 Da Block",       artist: "BJM The Rapper",      duration: "3:58", sourceUrl: "#", source: "tmi" },
  { id: "tmi-bnt", title: "On the Beat",           artist: "Berntout Perductions",duration: "3:22", sourceUrl: "#", source: "tmi" },
];

export function interleaveTMI(tracks: ArtifactTrack[]): ArtifactTrack[] {
  if (tracks.length === 0) return [...TMI_SEED];
  const result: ArtifactTrack[] = [];
  let tmiCursor = 0;
  tracks.forEach((track, i) => {
    result.push(track);
    // Inject one TMI track every 3 user tracks, never after another TMI
    if ((i + 1) % 3 === 0) {
      const seed = TMI_SEED[tmiCursor % TMI_SEED.length]!;
      const prev = result[result.length - 1];
      if (prev?.artist !== seed.artist) {
        result.push({ ...seed, id: `${seed.id}-${i}` });
        tmiCursor++;
      }
    }
  });
  return result;
}

export function parseSourceLabel(url: string): TrackSource {
  if (url.includes("spotify.com"))   return "spotify";
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("soundcloud.com")) return "soundcloud";
  if (url.includes("music.apple.com")) return "apple";
  if (url === "#" || url === "") return "tmi";
  return "link";
}

export const SOURCE_COLORS: Record<TrackSource, string> = {
  spotify:    "#1DB954",
  youtube:    "#FF0000",
  soundcloud: "#FF5500",
  apple:      "#FC3C44",
  tmi:        "#AA2DFF",
  link:       "#00FFFF",
};

export function fmtPoints(p: number): string {
  return p >= 1000 ? `${(p / 1000).toFixed(1)}k` : String(p);
}

export function parseDurationSecs(dur: string): number {
  const parts = dur.split(":").map(Number);
  return (parts[0]! * 60) + (parts[1] ?? 0);
}
