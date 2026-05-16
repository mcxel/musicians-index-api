import { buildIssueSnapshot } from "@/lib/issues/IssueIntelligenceEngine";
import { getTopCrownRuntime } from "./CrownRankRuntime";

export interface WinnerEntityRuntime {
  artistId: string;
  name: string;
  rank: number;
  genre: string;
  liveScore: number;
  movement: "rising" | "falling" | "holding";
  route: string;
  articleRoute: string;
  voteRoute: string;
  summary: string;
  badgeLabel: string;
  issueNumber: number;
  weekInSeason: number;
  media: ReturnType<typeof getTopCrownRuntime> extends infer T
    ? T extends { media: infer M }
      ? M
      : never
    : never;
}

export function getWinnerEntityRuntime(): WinnerEntityRuntime | null {
  const winner = getTopCrownRuntime();
  if (!winner) return null;

  const issue = buildIssueSnapshot();

  return {
    artistId: winner.artistId,
    name: winner.name,
    rank: winner.rank,
    genre: winner.genre,
    liveScore: winner.score,
    movement: winner.movement,
    route: winner.route,
    articleRoute: winner.articleRoute,
    voteRoute: winner.voteRoute,
    summary: `Ranked #${winner.rank} this week for vote velocity, crown score, and discovery lift across ${winner.genre}.`,
    badgeLabel: `${winner.badge} · WEEK ${issue.weekInSeason}`,
    issueNumber: issue.issueNumber,
    weekInSeason: issue.weekInSeason,
    media: winner.media,
  };
}