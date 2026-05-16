/**
 * AudienceParticipationXPEngine.ts
 *
 * Rewards fans for participating: attending, voting, commenting, watching, sharing, joining cyphers.
 * Purpose: Make fan time valuable and engaging.
 */

export interface ParticipationActivity {
  activityId: string;
  fanId: string;
  activityType:
    | 'attend-event'
    | 'vote'
    | 'comment'
    | 'watch-premiere'
    | 'watch-concert'
    | 'share-content'
    | 'join-cypher'
    | 'tip-artist'
    | 'buy-ticket'
    | 'claim-nft';
  entityId: string; // event/premiere/concert/cypher/artist/content/ticket/nft id
  xpEarned: number;
  completedAt: number;
}

export interface FanParticipationStats {
  fanId: string;
  totalActivities: number;
  totalXPEarned: number;
  activitiesByType: Record<string, number>;
  xpByType: Record<string, number>;
}

// In-memory registry
const participationActivities = new Map<string, ParticipationActivity>();
const participationStats = new Map<string, FanParticipationStats>();
let activityCounter = 0;

const PARTICIPATION_XP: Record<ParticipationActivity['activityType'], number> = {
  'attend-event': 25,
  vote: 10,
  comment: 5,
  'watch-premiere': 15,
  'watch-concert': 20,
  'share-content': 10,
  'join-cypher': 30,
  'tip-artist': 25,
  'buy-ticket': 40,
  'claim-nft': 50,
};

/**
 * Records participation activity.
 */
export function recordParticipationActivity(input: {
  fanId: string;
  activityType: ParticipationActivity['activityType'];
  entityId: string;
}): ParticipationActivity {
  const activityId = `activity-${activityCounter++}`;
  const xpEarned = PARTICIPATION_XP[input.activityType];

  const activity: ParticipationActivity = {
    activityId,
    fanId: input.fanId,
    activityType: input.activityType,
    entityId: input.entityId,
    xpEarned,
    completedAt: Date.now(),
  };

  participationActivities.set(activityId, activity);

  // Update stats
  let stats = participationStats.get(input.fanId);
  if (!stats) {
    stats = {
      fanId: input.fanId,
      totalActivities: 0,
      totalXPEarned: 0,
      activitiesByType: {},
      xpByType: {},
    };
    participationStats.set(input.fanId, stats);
  }

  stats.totalActivities += 1;
  stats.totalXPEarned += xpEarned;
  stats.activitiesByType[input.activityType] =
    (stats.activitiesByType[input.activityType] ?? 0) + 1;
  stats.xpByType[input.activityType] = (stats.xpByType[input.activityType] ?? 0) + xpEarned;

  return activity;
}

/**
 * Gets participation stats for fan.
 */
export function getParticipationStats(fanId: string): FanParticipationStats | null {
  return participationStats.get(fanId) ?? null;
}

/**
 * Gets participation activity.
 */
export function getParticipationActivity(activityId: string): ParticipationActivity | null {
  return participationActivities.get(activityId) ?? null;
}

/**
 * Lists all activities by fan.
 */
export function listActivitiesByFan(fanId: string): ParticipationActivity[] {
  return Array.from(participationActivities.values()).filter((a) => a.fanId === fanId);
}

/**
 * Gets top participating fans.
 */
export function getTopParticipatingFans(limit: number = 10): FanParticipationStats[] {
  return Array.from(participationStats.values())
    .sort((a, b) => b.totalXPEarned - a.totalXPEarned)
    .slice(0, limit);
}

/**
 * Gets participation report (admin).
 */
export function getParticipationReport(): {
  totalFans: number;
  totalActivities: number;
  totalXPAwarded: number;
  mostCommonActivity: string | null;
} {
  const stats = Array.from(participationStats.values());
  const activities = Array.from(participationActivities.values());

  const activityTypeCounts: Record<string, number> = {};
  activities.forEach((a) => {
    activityTypeCounts[a.activityType] = (activityTypeCounts[a.activityType] ?? 0) + 1;
  });

  const mostCommon = Object.entries(activityTypeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return {
    totalFans: stats.length,
    totalActivities: activities.length,
    totalXPAwarded: stats.reduce((sum, s) => sum + s.totalXPEarned, 0),
    mostCommonActivity: mostCommon,
  };
}
