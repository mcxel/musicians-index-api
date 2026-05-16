export type RotationDomain = "artist" | "news" | "performer" | "sponsor" | "advertiser" | "venue";

export type RotationCandidate = {
  id: string;
  domain: RotationDomain;
  weight: number;
  genre?: string;
  region?: string;
};

export type RotationContext = {
  recentIds?: string[];
  preferredGenres?: string[];
  preferredRegion?: string;
};

export function selectRotationCandidates(
  candidates: RotationCandidate[],
  context: RotationContext = {},
): RotationCandidate[] {
  const recent = new Set(context.recentIds ?? []);
  return candidates
    .filter((c) => !recent.has(c.id))
    .sort((a, b) => b.weight - a.weight);
}
