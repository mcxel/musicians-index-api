/**
 * LiveRetentionXPBonusEngine.ts
 *
 * Calculates XP bonus based on audience retention metrics.
 * Purpose: Reward sessions that keep people engaged longer.
 */

export interface RetentionMetric {
  sessionId: string;
  three5MinRetention: number; // % of audience staying 3+ min
  fiveMinRetention: number; // % of audience staying 5+ min
  tenMinRetention: number; // % of audience staying 10+ min
  averageWatchTimeSeconds: number;
  retentionScore: number; // 0-100
  bonusXP: number;
}

// In-memory registry
const retentionMetrics = new Map<string, RetentionMetric>();

/**
 * Calculates retention bonus for session.
 */
export function calculateRetentionBonus(input: {
  sessionId: string;
  initialAudienceCount: number;
  audienceCountAt3min: number;
  audienceCountAt5min: number;
  audienceCountAt10min: number;
  averageWatchTimeSeconds: number;
}): RetentionMetric {
  const retention3min =
    input.initialAudienceCount > 0
      ? (input.audienceCountAt3min / input.initialAudienceCount) * 100
      : 0;

  const retention5min =
    input.initialAudienceCount > 0
      ? (input.audienceCountAt5min / input.initialAudienceCount) * 100
      : 0;

  const retention10min =
    input.initialAudienceCount > 0
      ? (input.audienceCountAt10min / input.initialAudienceCount) * 100
      : 0;

  // Retention score: weighted average
  const retentionScore = retention3min * 0.2 + retention5min * 0.35 + retention10min * 0.45;

  // Bonus XP: higher retention = more XP (up to 500)
  const bonusXP = Math.round((retentionScore / 100) * 500);

  const metric: RetentionMetric = {
    sessionId: input.sessionId,
    three5MinRetention: retention3min,
    fiveMinRetention: retention5min,
    tenMinRetention: retention10min,
    averageWatchTimeSeconds: input.averageWatchTimeSeconds,
    retentionScore,
    bonusXP,
  };

  retentionMetrics.set(input.sessionId, metric);
  return metric;
}

/**
 * Gets retention metrics for session.
 */
export function getRetentionMetrics(sessionId: string): RetentionMetric | null {
  return retentionMetrics.get(sessionId) ?? null;
}

/**
 * Gets best performing sessions by retention.
 */
export function getBestRetentionSessions(limit: number = 10): RetentionMetric[] {
  return Array.from(retentionMetrics.values())
    .sort((a, b) => b.retentionScore - a.retentionScore)
    .slice(0, limit);
}
