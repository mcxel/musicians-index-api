/**
 * PlaylistArtifact Engine
 * Treats each playlist as a collectable digital character object.
 * Songs are stored as URL pointers — never uploaded directly.
 * TMI interleaving rule: Big Kazhdog / BJM / Berntout Perductions
 * distributed naturally, never back-to-back.
 */

export type ArtifactSkin =
  | "submarine" | "ufo" | "rocket" | "tree"
  | "house"     | "car" | "train"  | "baby";

export type TrackSource = "spotify" | "youtube" | "soundcloud" | "tmi" | "apple" | "pandora" | "tiktok" | "link";

export interface ArtifactTrack {
  id: string;
  title: string;
  artist: string;
  duration: string;   // "3:28"
  sourceUrl: string;  // Spotify/YouTube/SoundCloud/Pandora/Apple/TMI URL
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
  submarine: { name: "Aquarium Fish", icon: "🐠", primary: "#FFD700", accent: "#00E5FF", bg: "#003366", unlockPoints: 0,    description: "Deep sea animated fish with blinking eye & floating bubbles." },
  ufo:       { name: "UFO Saucer",    icon: "🛸", primary: "#00FFFF", accent: "#AA2DFF", bg: "#010118", unlockPoints: 500,  description: "Space-age neon saucer with anti-gravity tractor beam." },
  rocket:    { name: "Rocket Ship",   icon: "🚀", primary: "#FF6B35", accent: "#FFD700", bg: "#010115", unlockPoints: 750,  description: "Deep space rocket with thruster flame & particle liftoff." },
  tree:      { name: "Living Tree",   icon: "🌳", primary: "#00FF88", accent: "#FFD700", bg: "#0a0a20", unlockPoints: 250,  description: "Living light tree with falling leaves on track change." },
  house:     { name: "Venue House",   icon: "🏠", primary: "#FFD700", accent: "#FF6B35", bg: "#0a0815", unlockPoints: 300,  description: "Warm venue house with flickering lights & chimney smoke." },
  car:       { name: "Neon Cruiser",  icon: "🏎️", primary: "#FF2DAA", accent: "#FFD700", bg: "#000000", unlockPoints: 600,  description: "Neon outline cruiser with rolling wheels & headlights." },
  train:     { name: "Locomotive",   icon: "🚂", primary: "#FF6B35", accent: "#FFD700", bg: "#010115", unlockPoints: 400,  description: "Steam locomotive with puffing smoke & track motion." },
  baby:      { name: "Crawling Baby", icon: "👶", primary: "#FF69B4", accent: "#FFD700", bg: "#1a0826", unlockPoints: 350,  description: "Animated crawling baby with interactive rattle & movement." },
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
  const lower = url.toLowerCase();
  if (lower.includes("spotify.com")) return "spotify";
  if (lower.includes("youtube.com") || lower.includes("youtu.be")) return "youtube";
  if (lower.includes("soundcloud.com")) return "soundcloud";
  if (lower.includes("music.apple.com") || lower.includes("apple.com")) return "apple";
  if (lower.includes("pandora.com")) return "pandora";
  if (lower.includes("tiktok.com")) return "tiktok";
  if (url === "#" || url === "") return "tmi";
  return "link";
}

export const SOURCE_COLORS: Record<TrackSource, string> = {
  spotify:    "#1DB954",
  youtube:    "#FF0000",
  soundcloud: "#FF5500",
  apple:      "#FC3C44",
  pandora:    "#3668FF",
  tiktok:     "#00F2FE",
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
