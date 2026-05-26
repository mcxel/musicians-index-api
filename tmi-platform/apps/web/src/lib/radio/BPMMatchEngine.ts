import type { StreamWinSong } from "@/lib/economy/StreamAndWinEngine";

export type TransitionType = "fade" | "quick-cut" | "hype-drop" | "slow-blend" | "genre-bridge";

export interface TransitionResult {
  type: TransitionType;
  label: string;
  score: number; // 0–1, higher = smoother
}

// Genre → estimated midpoint BPM
const GENRE_BPM: Record<string, number> = {
  "hip-hop":   90,
  "trap":      138,
  "r&b":       75,
  "edm":       134,
  "afrobeats": 97,
  "afrobeat":  97,
  "gospel":    80,
  "pop":       110,
  "dance":     127,
  "reggae":    80,
  "jazz":      120,
  "soul":      90,
  "funk":      105,
  "country":   95,
  "rock":      120,
  "latin":     100,
  "drill":     140,
  "spoken word": 70,
  "comedy":    90,
  "variety":   100,
};

const DEFAULT_BPM = 100;

// Per-song BPM overrides (set by artists or admin)
const bpmOverrides: Map<string, number> = new Map();

function normalize(genre: string): string {
  return genre.toLowerCase().trim();
}

export const BPMMatchEngine = {
  getEstimatedBPM(genre: string): number {
    return GENRE_BPM[normalize(genre)] ?? DEFAULT_BPM;
  },

  storeBPM(songId: string, bpm: number): void {
    bpmOverrides.set(songId, bpm);
  },

  getSongBPM(song: StreamWinSong): number {
    return bpmOverrides.get(song.id) ?? this.getEstimatedBPM(song.genre);
  },

  getTransition(fromGenre: string, toGenre: string): TransitionResult {
    const fromBPM = this.getEstimatedBPM(fromGenre);
    const toBPM   = this.getEstimatedBPM(toGenre);
    const diff    = Math.abs(fromBPM - toBPM);

    if (diff < 10) {
      return { type: "fade",         label: "blending smooth…",             score: 1.0 };
    }
    if (diff < 25) {
      return { type: "slow-blend",   label: "easing into the next one…",    score: 0.8 };
    }
    if (diff < 40) {
      return { type: "genre-bridge", label: "switching the vibe…",          score: 0.6 };
    }
    // High diff — alternate between quick-cut and hype-drop for variety
    const useHype = Math.random() < 0.5;
    return useHype
      ? { type: "hype-drop",  label: "hard flip incoming 🔥",              score: 0.4 }
      : { type: "quick-cut",  label: "cutting to the next one 🎧",         score: 0.35 };
  },

  // Returns candidates sorted by BPM compatibility with fromGenre (closest BPM first)
  sortByBPMCompatibility(fromGenre: string, candidates: StreamWinSong[]): StreamWinSong[] {
    const fromBPM = this.getEstimatedBPM(fromGenre);
    return [...candidates].sort((a, b) => {
      const aDiff = Math.abs(this.getSongBPM(a) - fromBPM);
      const bDiff = Math.abs(this.getSongBPM(b) - fromBPM);
      return aDiff - bDiff;
    });
  },
};
