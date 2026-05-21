export type OriginalityRating =
  | "NEW_SOUND"
  | "FAMILIAR"
  | "SIMILAR_TO_EXISTING"
  | "UNSURE";

export type FeedbackTag =
  | "FLOW"
  | "BEAT"
  | "HOOK"
  | "VOICE"
  | "MIXING"
  | "ENERGY"
  | "LYRICS"
  | "STAGE_PRESENCE";

export interface SongVote {
  id: string;
  songId: string;
  artistId: string;
  fanId: string;
  liked: boolean;
  originalityRating: OriginalityRating;
  feedbackTags: FeedbackTag[];
  createdAt: number;
  battleId?: string;
  cypherId?: string;
  roomId?: string;
}

export interface SongVoteStats {
  totalVotes: number;
  likeScore: number;            // 0-100
  originalityScore: number;     // 0-100 (higher = more "NEW_SOUND" votes)
  familiarityRisk: number;      // 0-100 (higher = more SIMILAR_TO_EXISTING votes)
  ratingBreakdown: Record<OriginalityRating, number>;
  topTags: { tag: FeedbackTag; count: number; percent: number }[];
  styleEvolutionTrend: "RISING" | "STABLE" | "FALLING";
}

const VOTES = new Map<string, SongVote[]>();

export function castVote(vote: Omit<SongVote, "id" | "createdAt">): SongVote {
  const full: SongVote = {
    ...vote,
    id: `sv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
  };
  const key = vote.songId;
  const existing = VOTES.get(key) ?? [];
  // Dedupe per fanId — replace prior vote
  const filtered = existing.filter((v) => v.fanId !== vote.fanId);
  VOTES.set(key, [...filtered, full]);
  return full;
}

export function getSongStats(songId: string): SongVoteStats {
  const votes = VOTES.get(songId) ?? [];
  const total = votes.length;

  if (total === 0) {
    return {
      totalVotes: 0,
      likeScore: 0,
      originalityScore: 0,
      familiarityRisk: 0,
      ratingBreakdown: { NEW_SOUND: 0, FAMILIAR: 0, SIMILAR_TO_EXISTING: 0, UNSURE: 0 },
      topTags: [],
      styleEvolutionTrend: "STABLE",
    };
  }

  const liked = votes.filter((v) => v.liked).length;
  const likeScore = Math.round((liked / total) * 100);

  const ratingBreakdown: Record<OriginalityRating, number> = {
    NEW_SOUND: 0,
    FAMILIAR: 0,
    SIMILAR_TO_EXISTING: 0,
    UNSURE: 0,
  };
  for (const v of votes) ratingBreakdown[v.originalityRating]++;

  const originalityScore = Math.round((ratingBreakdown.NEW_SOUND / total) * 100);
  const familiarityRisk  = Math.round((ratingBreakdown.SIMILAR_TO_EXISTING / total) * 100);

  const tagCounts = new Map<FeedbackTag, number>();
  for (const v of votes) {
    for (const tag of v.feedbackTags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }
  const topTags = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag, count]) => ({ tag, count, percent: Math.round((count / total) * 100) }));

  // Trend: compare last 10 votes to the 10 before that
  const sorted = [...votes].sort((a, b) => a.createdAt - b.createdAt);
  const recent = sorted.slice(-10);
  const prior  = sorted.slice(-20, -10);
  const recentLike = recent.length ? recent.filter(v => v.liked).length / recent.length : 0;
  const priorLike  = prior.length  ? prior.filter(v => v.liked).length  / prior.length  : recentLike;
  const styleEvolutionTrend: SongVoteStats["styleEvolutionTrend"] =
    recentLike > priorLike + 0.1 ? "RISING" :
    recentLike < priorLike - 0.1 ? "FALLING" : "STABLE";

  return {
    totalVotes: total,
    likeScore,
    originalityScore,
    familiarityRisk,
    ratingBreakdown,
    topTags,
    styleEvolutionTrend,
  };
}

export function hasFanVoted(songId: string, fanId: string): boolean {
  return (VOTES.get(songId) ?? []).some((v) => v.fanId === fanId);
}

export function getFanVote(songId: string, fanId: string): SongVote | undefined {
  return (VOTES.get(songId) ?? []).find((v) => v.fanId === fanId);
}
