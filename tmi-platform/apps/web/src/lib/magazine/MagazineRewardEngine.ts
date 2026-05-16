import { getMagazineArticleBySlug } from "./MagazineArticleResolver";
import { getMagazineReadingSession } from "./MagazineReadingTimer";

export interface MagazineRewardResult {
  awarded: boolean;
  points: number;
  reason: string;
}

const rewardedSessions = new Set<string>();

export function evaluateMagazineReward(sessionId: string): MagazineRewardResult {
  if (rewardedSessions.has(sessionId)) {
    return { awarded: false, points: 0, reason: "already-awarded" };
  }

  const session = getMagazineReadingSession(sessionId);
  if (!session) return { awarded: false, points: 0, reason: "missing-session" };

  const article = getMagazineArticleBySlug(session.slug);
  if (!article) return { awarded: false, points: 0, reason: "missing-article" };

  if (session.elapsedSeconds < article.minimumReadSeconds) {
    return { awarded: false, points: 0, reason: "read-threshold-not-met" };
  }

  if (session.scrollDepth < 60 || session.completionPct < 50) {
    return { awarded: false, points: 0, reason: "engagement-threshold-not-met" };
  }

  const points = Math.max(3, Math.min(10, article.rewardPoints));
  rewardedSessions.add(sessionId);
  return { awarded: true, points, reason: "awarded" };
}
