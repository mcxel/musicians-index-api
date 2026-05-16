// Beat Queue Engine — Genre pool authority + beat selection for rolling sessions
// Controls: genre-matched pools, randomization, producer attribution, royalties, sponsor priority
// SSR-safe — static catalog, pure functions

import type { PerformanceMode } from "./BeatRoutingEngine";

// ── Types ─────────────────────────────────────────────────────────────────────

export type BeatLicense =
  | "platform-owned"
  | "producer-submitted"
  | "sponsored"
  | "creative-commons";

export type BeatEntry = {
  id: string;
  title: string;
  genre: string;
  subGenre?: string;
  energy: "low" | "mid" | "high";
  bpm: number;
  producerId: string;
  producerName: string;
  license: BeatLicense;
  sponsorId?: string;          // if sponsored beat
  votes: number;
  skipCount: number;
  usageCount: number;
  royaltyBps: number;          // basis points — 100 bps = 1%
  isActive: boolean;
  compatibleModes: PerformanceMode[];
  compatibleGenres: string[];  // session genres this beat backs
};

export type BeatQueue = {
  id: string;
  sessionGenre: string;
  entries: BeatEntry[];
  currentIndex: number;
  lockedBeatId: string | null;
};

// ── Genre pool rules ──────────────────────────────────────────────────────────
// Maps session genre → allowed beat subgenres

export const GENRE_POOL_RULES: Record<string, string[]> = {
  "R&B":        ["R&B", "Soul", "Neo Soul"],
  "Trap":       ["Trap", "Drill", "Hip-Hop"],
  "Hip-Hop":    ["Hip-Hop", "Trap", "Boom Bap"],
  "Rock":       ["Rock", "Blues", "Classic Rock"],
  "Country":    ["Country", "Folk", "Americana"],
  "Pop":        ["Pop", "R&B", "Dance Pop"],
  "Afrobeats":  ["Afrobeats", "Afro-Pop", "Dancehall"],
  "Electronic": ["Electronic", "House", "Techno"],
  "Classical":  ["Classical", "Orchestral", "Cinematic"],
  "Jazz":       ["Jazz", "Fusion", "Blues"],
  "Open":       ["R&B", "Hip-Hop", "Pop", "Afrobeats", "Electronic", "Rock"],
  "All Genres": ["R&B", "Hip-Hop", "Pop", "Afrobeats", "Electronic", "Rock", "Jazz", "Country"],
};

// ── Beat catalog (seed — swap for DB when beat marketplace is live) ───────────

const BEAT_CATALOG: BeatEntry[] = [
  // R&B / Soul
  {
    id: "rnb-smooth-1", title: "Silk Drive", genre: "R&B", subGenre: "Neo Soul",
    energy: "mid", bpm: 88, producerId: "prod-kova", producerName: "KOVA",
    license: "producer-submitted", votes: 142, skipCount: 8, usageCount: 34,
    royaltyBps: 500, isActive: true,
    compatibleModes: ["beat-backed", "acapella"],
    compatibleGenres: ["R&B", "Soul", "Neo Soul"],
  },
  {
    id: "soul-rise-2", title: "Crown Groove", genre: "Soul", subGenre: "R&B",
    energy: "high", bpm: 96, producerId: "prod-bass-nero", producerName: "Bass.Nero",
    license: "producer-submitted", votes: 208, skipCount: 4, usageCount: 67,
    royaltyBps: 500, isActive: true,
    compatibleModes: ["beat-backed"],
    compatibleGenres: ["R&B", "Soul"],
  },
  {
    id: "neo-soul-3", title: "Late Light", genre: "Neo Soul", subGenre: "R&B",
    energy: "low", bpm: 76, producerId: "prod-wave", producerName: "WaveForge.T",
    license: "platform-owned", votes: 88, skipCount: 12, usageCount: 22,
    royaltyBps: 200, isActive: true,
    compatibleModes: ["beat-backed", "acapella"],
    compatibleGenres: ["R&B", "Soul", "Neo Soul"],
  },

  // Hip-Hop / Trap
  {
    id: "trap-dark-1", title: "808 Crown", genre: "Trap", subGenre: "Drill",
    energy: "high", bpm: 140, producerId: "prod-808", producerName: "808.King",
    license: "producer-submitted", votes: 312, skipCount: 11, usageCount: 89,
    royaltyBps: 500, isActive: true,
    compatibleModes: ["beat-backed", "instrument-beat"],
    compatibleGenres: ["Trap", "Drill", "Hip-Hop"],
  },
  {
    id: "boom-bap-2", title: "Press Play", genre: "Hip-Hop", subGenre: "Boom Bap",
    energy: "mid", bpm: 92, producerId: "prod-sample", producerName: "SampleLord",
    license: "producer-submitted", votes: 176, skipCount: 6, usageCount: 48,
    royaltyBps: 500, isActive: true,
    compatibleModes: ["beat-backed"],
    compatibleGenres: ["Hip-Hop", "Trap", "Boom Bap"],
  },

  // Rock
  {
    id: "rock-edge-1", title: "Raw Circuit", genre: "Rock", subGenre: "Classic Rock",
    energy: "high", bpm: 128, producerId: "prod-drift", producerName: "Drift Sound",
    license: "platform-owned", votes: 94, skipCount: 3, usageCount: 28,
    royaltyBps: 200, isActive: true,
    compatibleModes: ["instrument-only", "beat-backed", "full-band"],
    compatibleGenres: ["Rock", "Blues", "Classic Rock"],
  },

  // Pop
  {
    id: "pop-gloss-1", title: "Stage Signal", genre: "Pop", subGenre: "Dance Pop",
    energy: "high", bpm: 118, producerId: "prod-wave", producerName: "WaveForge.T",
    license: "producer-submitted", votes: 228, skipCount: 9, usageCount: 61,
    royaltyBps: 500, isActive: true,
    compatibleModes: ["beat-backed"],
    compatibleGenres: ["Pop", "R&B", "Dance Pop"],
  },

  // Afrobeats
  {
    id: "afro-1", title: "Lagos Swing", genre: "Afrobeats", subGenre: "Afro-Pop",
    energy: "high", bpm: 102, producerId: "prod-kova", producerName: "KOVA",
    license: "producer-submitted", votes: 188, skipCount: 7, usageCount: 44,
    royaltyBps: 500, isActive: true,
    compatibleModes: ["beat-backed"],
    compatibleGenres: ["Afrobeats", "Afro-Pop", "Dancehall"],
  },

  // Electronic
  {
    id: "elec-1", title: "Frequency Lock", genre: "Electronic", subGenre: "House",
    energy: "high", bpm: 126, producerId: "prod-freq", producerName: "Freq.Zone",
    license: "producer-submitted", votes: 156, skipCount: 14, usageCount: 39,
    royaltyBps: 500, isActive: true,
    compatibleModes: ["beat-backed", "instrument-beat"],
    compatibleGenres: ["Electronic", "House", "Techno"],
  },

  // Sponsored beats — priority queued, no royalties
  {
    id: "sw-sponsor-1", title: "SoundWave Session", genre: "R&B", subGenre: "Neo Soul",
    energy: "mid", bpm: 90, producerId: "prod-soundwave", producerName: "SoundWave Audio",
    license: "sponsored", sponsorId: "soundwave-audio",
    votes: 88, skipCount: 2, usageCount: 14,
    royaltyBps: 0, isActive: true,
    compatibleModes: ["beat-backed", "acapella"],
    compatibleGenres: ["R&B", "Soul"],
  },
  {
    id: "bv-sponsor-1", title: "BeatVault Drop", genre: "Trap", subGenre: "Drill",
    energy: "high", bpm: 144, producerId: "prod-beatvault", producerName: "BeatVault Pro",
    license: "sponsored", sponsorId: "beatvault-pro",
    votes: 104, skipCount: 5, usageCount: 22,
    royaltyBps: 0, isActive: true,
    compatibleModes: ["beat-backed", "instrument-beat"],
    compatibleGenres: ["Trap", "Hip-Hop"],
  },
];

// ── Queue builder ─────────────────────────────────────────────────────────────

export function buildBeatQueue(sessionGenre: string, sessionId: string): BeatQueue {
  const allowed = GENRE_POOL_RULES[sessionGenre] ?? GENRE_POOL_RULES["Open"] ?? [];

  const eligible = BEAT_CATALOG.filter(
    (b) => b.isActive && b.compatibleGenres.some((g) => allowed.includes(g)),
  );

  // Sponsored beats surface first; community sorted by vote count
  const sponsored = eligible.filter((b) => b.license === "sponsored");
  const community = eligible
    .filter((b) => b.license !== "sponsored")
    .sort((a, b) => b.votes - a.votes);

  return {
    id: `bq-${sessionId}`,
    sessionGenre,
    entries: [...sponsored, ...community].slice(0, 8),
    currentIndex: 0,
    lockedBeatId: null,
  };
}

// ── Queue operations ──────────────────────────────────────────────────────────

export function getCurrentBeat(queue: BeatQueue): BeatEntry | null {
  return queue.entries[queue.currentIndex] ?? null;
}

export function skipBeat(queue: BeatQueue): BeatQueue {
  if (queue.lockedBeatId) return queue;
  const next = (queue.currentIndex + 1) % Math.max(1, queue.entries.length);
  return { ...queue, currentIndex: next };
}

export function lockBeat(queue: BeatQueue): BeatQueue {
  const current = getCurrentBeat(queue);
  if (!current) return queue;
  return { ...queue, lockedBeatId: current.id };
}

export function recordSkipVote(queue: BeatQueue, threshold = 0.5, totalVoters = 6): BeatQueue {
  const current = getCurrentBeat(queue);
  if (!current || queue.lockedBeatId) return queue;

  const updated = {
    ...queue,
    entries: queue.entries.map((e) =>
      e.id === current.id ? { ...e, skipCount: e.skipCount + 1 } : e,
    ),
  };

  const updatedBeat = updated.entries[updated.currentIndex];
  if (updatedBeat && updatedBeat.skipCount / totalVoters >= threshold) {
    return skipBeat(updated);
  }
  return updated;
}

// ── Catalog queries ───────────────────────────────────────────────────────────

export function getBeatsByGenre(genre: string): BeatEntry[] {
  const allowed = GENRE_POOL_RULES[genre] ?? [];
  return BEAT_CATALOG.filter(
    (b) => b.isActive && b.compatibleGenres.some((g) => allowed.includes(g)),
  );
}

export function getBeatById(id: string): BeatEntry | undefined {
  return BEAT_CATALOG.find((b) => b.id === id);
}

export function getAllBeats(): BeatEntry[] {
  return BEAT_CATALOG.filter((b) => b.isActive);
}

export function getSponsoredBeats(sponsorId?: string): BeatEntry[] {
  return BEAT_CATALOG.filter(
    (b) => b.isActive && b.license === "sponsored" && (sponsorId ? b.sponsorId === sponsorId : true),
  );
}

// ── Royalty math ──────────────────────────────────────────────────────────────

export function computeRoyaltyOwed(beat: BeatEntry, revenueAmount: number): number {
  return Math.floor((beat.royaltyBps / 10000) * revenueAmount);
}

export function getBeatLabel(beat: BeatEntry): string {
  return `${beat.title} · ${beat.genre}${beat.subGenre ? ` / ${beat.subGenre}` : ""} · ${beat.bpm} BPM`;
}
