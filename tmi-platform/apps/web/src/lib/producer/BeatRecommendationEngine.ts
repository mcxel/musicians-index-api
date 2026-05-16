export type BeatGenre =
  | "trap" | "rnb" | "afrobeats" | "drill" | "pop" | "gospel" | "jazz-hop"
  | "lo-fi" | "grime" | "dancehall" | "soul" | "boom-bap";

export type BeatMood = "hype" | "smooth" | "dark" | "uplifting" | "aggressive" | "chill" | "romantic";

export interface BeatProfile {
  beatId: string;
  producerId: string;
  title: string;
  genre: BeatGenre;
  mood: BeatMood;
  bpm: number;
  tags: string[];
  plays: number;
  licenses: number;
  rating: number;
}

export interface BeatRecommendation {
  beatId: string;
  score: number;
  reason: string;
}

const profiles = new Map<string, BeatProfile>();

export function registerBeat(profile: BeatProfile): void {
  profiles.set(profile.beatId, profile);
}

export function getRecommendationsForArtist(opts: {
  preferredGenres?: BeatGenre[];
  preferredMoods?: BeatMood[];
  bpmRange?: [number, number];
  excludeProducerId?: string;
  limit?: number;
}): BeatRecommendation[] {
  const limit = opts.limit ?? 8;
  const scored: BeatRecommendation[] = [];

  for (const profile of profiles.values()) {
    if (opts.excludeProducerId && profile.producerId === opts.excludeProducerId) continue;

    let score = profile.rating * 10 + profile.licenses * 2 + profile.plays * 0.1;

    if (opts.preferredGenres?.includes(profile.genre)) score += 30;
    if (opts.preferredMoods?.includes(profile.mood)) score += 20;

    if (opts.bpmRange) {
      const [min, max] = opts.bpmRange;
      if (profile.bpm >= min && profile.bpm <= max) score += 15;
    }

    scored.push({ beatId: profile.beatId, score: Math.round(score), reason: buildReason(profile, opts) });
  }

  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

function buildReason(profile: BeatProfile, opts: { preferredGenres?: BeatGenre[]; preferredMoods?: BeatMood[] }): string {
  if (opts.preferredGenres?.includes(profile.genre)) return `Matches your ${profile.genre} preference`;
  if (opts.preferredMoods?.includes(profile.mood)) return `${profile.mood} mood fit`;
  if (profile.licenses > 10) return `Popular — ${profile.licenses} licenses`;
  return "Trending this week";
}

export function getSimilarBeats(beatId: string, limit = 5): BeatRecommendation[] {
  const source = profiles.get(beatId);
  if (!source) return [];
  return getRecommendationsForArtist({
    preferredGenres: [source.genre],
    preferredMoods: [source.mood],
    bpmRange: [source.bpm - 10, source.bpm + 10],
    excludeProducerId: undefined,
    limit: limit + 1,
  }).filter((r) => r.beatId !== beatId).slice(0, limit);
}

export function getTopBeatsByGenre(genre: BeatGenre, limit = 5): BeatProfile[] {
  return [...profiles.values()]
    .filter((p) => p.genre === genre)
    .sort((a, b) => b.licenses - a.licenses)
    .slice(0, limit);
}
