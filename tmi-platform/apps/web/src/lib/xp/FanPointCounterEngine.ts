/**
 * FanPointCounterEngine.ts
 *
 * Tracks how many points are earned per activity type.
 * Counters help admins understand point distribution and engagement drivers.
 * Purpose: Observable metrics for point earning.
 */

export interface PointsEarningCounter {
  counterType:
    | 'attend-event'
    | 'vote'
    | 'comment'
    | 'watch-premiere'
    | 'tip-artist'
    | 'buy-ticket'
    | 'share-content'
    | 'join-cypher'
    | 'first-time-bonus'
    | 'streak-bonus'
    | 'achievement-bonus';
  pointsPerActivity: number;
  totalActivitiesCount: number;
  totalPointsAwarded: number;
}

// In-memory registry
const pointsCounters = new Map<string, PointsEarningCounter>();

const POINTS_PER_ACTIVITY: Record<PointsEarningCounter['counterType'], number> = {
  'attend-event': 50,
  vote: 5,
  comment: 3,
  'watch-premiere': 15,
  'tip-artist': 25,
  'buy-ticket': 40,
  'share-content': 10,
  'join-cypher': 30,
  'first-time-bonus': 100,
  'streak-bonus': 50,
  'achievement-bonus': 75,
};

/**
 * Initialize all counters.
 */
export function initializePointsCounters(): void {
  Object.entries(POINTS_PER_ACTIVITY).forEach(([type, points]) => {
    if (!pointsCounters.has(type)) {
      pointsCounters.set(type, {
        counterType: type as PointsEarningCounter['counterType'],
        pointsPerActivity: points,
        totalActivitiesCount: 0,
        totalPointsAwarded: 0,
      });
    }
  });
}

/**
 * Increments counter for activity.
 */
export function recordPointsEarning(counterType: PointsEarningCounter['counterType']): void {
  let counter = pointsCounters.get(counterType);
  if (!counter) {
    counter = {
      counterType,
      pointsPerActivity: POINTS_PER_ACTIVITY[counterType] ?? 10,
      totalActivitiesCount: 0,
      totalPointsAwarded: 0,
    };
    pointsCounters.set(counterType, counter);
  }

  counter.totalActivitiesCount += 1;
  counter.totalPointsAwarded += counter.pointsPerActivity;
}

/**
 * Gets counter for type.
 */
export function getPointsCounter(
  counterType: PointsEarningCounter['counterType']
): PointsEarningCounter | null {
  return pointsCounters.get(counterType) ?? null;
}

/**
 * Gets all counters.
 */
export function getAllPointsCounters(): PointsEarningCounter[] {
  return Array.from(pointsCounters.values());
}

/**
 * Gets top earning activity types.
 */
export function getTopPointsEarningActivities(limit: number = 5): PointsEarningCounter[] {
  return Array.from(pointsCounters.values())
    .sort((a, b) => b.totalPointsAwarded - a.totalPointsAwarded)
    .slice(0, limit);
}

/**
 * Gets points counter report.
 */
export function getPointsCounterReport(): {
  totalActivityTypes: number;
  totalActivitiesRecorded: number;
  totalPointsAwarded: number;
  averagePointsPerActivity: number;
  mostActivatedType: string | null;
} {
  const counters = Array.from(pointsCounters.values());
  const totalActivities = counters.reduce((sum, c) => sum + c.totalActivitiesCount, 0);
  const totalPoints = counters.reduce((sum, c) => sum + c.totalPointsAwarded, 0);

  const mostActivated =
    counters.length > 0
      ? counters.reduce((a, b) => (b.totalActivitiesCount > a.totalActivitiesCount ? b : a))
      : null;

  return {
    totalActivityTypes: counters.length,
    totalActivitiesRecorded: totalActivities,
    totalPointsAwarded: totalPoints,
    averagePointsPerActivity: totalActivities > 0 ? Math.round(totalPoints / totalActivities) : 0,
    mostActivatedType: mostActivated?.counterType ?? null,
  };
}
