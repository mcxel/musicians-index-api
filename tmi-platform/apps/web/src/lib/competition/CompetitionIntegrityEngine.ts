/**
 * Competition Integrity Rating (CIR) Engine — Phase 9
 * Separates Skill Rating (ELO) from Competition Integrity Rating (CIR).
 * Tracks reliability, disconnects, timeouts, and awards reliability badges.
 */

export type ReliabilityBadge = 'IRON_PERFORMER' | 'ALWAYS_READY' | 'RELIABLE_COMPETITOR' | 'RESTRICTED';

export interface CompetitorIntegrityProfile {
  userId: string;
  skillRating: number;
  integrityRating: number; // 0 to 100
  totalEventsCompleted: number;
  totalTimeouts: number;
  totalForfeits: number;
  totalDisconnects: number;
  badge: ReliabilityBadge;
  isEligibleForHighStakes: boolean;
  cooldownUntil?: number;
}

export function calculateReliabilityBadge(integrityRating: number): ReliabilityBadge {
  if (integrityRating >= 95) return 'IRON_PERFORMER';
  if (integrityRating >= 85) return 'ALWAYS_READY';
  if (integrityRating >= 75) return 'RELIABLE_COMPETITOR';
  return 'RESTRICTED';
}

export function processEventOutcome(
  current: CompetitorIntegrityProfile,
  outcome: 'COMPLETED' | 'TIMEOUT' | 'FORFEIT' | 'CONNECTION_DROP_UNRESOLVED' | string,
  eventId?: any,
  roomType?: any,
  extra?: any
): CompetitorIntegrityProfile {
  let integrity = current.integrityRating;
  let timeouts = current.totalTimeouts;
  let forfeits = current.totalForfeits;
  let disconnects = current.totalDisconnects;
  let completed = current.totalEventsCompleted;

  switch (outcome) {
    case 'COMPLETED':
      integrity = Math.min(100, integrity + 3);
      completed += 1;
      break;
    case 'TIMEOUT':
      integrity = Math.max(0, integrity - 5);
      timeouts += 1;
      break;
    case 'FORFEIT':
      integrity = Math.max(0, integrity - 15);
      forfeits += 1;
      break;
    case 'CONNECTION_DROP_UNRESOLVED':
      integrity = Math.max(0, integrity - 2);
      disconnects += 1;
      break;
    /** AI work presented as human in a normal challenge — see AiMusicChallengeIntegrity. */
    case 'AI_WORK_AS_HUMAN':
      integrity = Math.max(0, integrity - 20);
      forfeits += 1;
      break;
  }

  const badge = calculateReliabilityBadge(integrity);

  return {
    ...current,
    integrityRating: integrity,
    totalEventsCompleted: completed,
    totalTimeouts: timeouts,
    totalForfeits: forfeits,
    totalDisconnects: disconnects,
    badge,
    isEligibleForHighStakes: integrity >= 75,
  };
}

export function createDefaultIntegrityProfile(userId: string): CompetitorIntegrityProfile {
  return {
    userId,
    skillRating: 1200,
    integrityRating: 100,
    totalEventsCompleted: 0,
    totalTimeouts: 0,
    totalForfeits: 0,
    totalDisconnects: 0,
    badge: 'IRON_PERFORMER',
    isEligibleForHighStakes: true,
  };
}

export const competitionIntegrityEngine = {
  calculateReliabilityBadge,
  processEventOutcome,
  createDefaultIntegrityProfile,
  fetchRatings: async (userId: string) => createDefaultIntegrityProfile(userId),
  getMatchmakingDistance: (ratingA: any, ratingB: any) => {
    const valA = typeof ratingA === 'number' ? ratingA : ratingA?.skillRating ?? 1200;
    const valB = typeof ratingB === 'number' ? ratingB : ratingB?.skillRating ?? 1200;
    return Math.abs(valA - valB);
  },
  getMatchRecord: (userId: any) => ({ userId, matches: [] }),
  recordMatchOutcome: (challengerId: string, opponentId: string, outcome?: any, options?: any, extra1?: any, extra2?: any) => {
    const challenger = processEventOutcome(createDefaultIntegrityProfile(challengerId), outcome || 'COMPLETED');
    const opponent = processEventOutcome(createDefaultIntegrityProfile(opponentId), outcome || 'COMPLETED');
    return {
      challenger,
      opponent,
      winner: challenger,
      loser: opponent,
      historyRecord: { id: `hist-${Date.now()}`, challengerId, opponentId, outcome },
    };
  },
  recordSuccessfulCompletion: (userId: string, eventId?: any, roomType?: any, extra?: any) =>
    processEventOutcome(createDefaultIntegrityProfile(userId), 'COMPLETED', eventId, roomType),
  recordTimeout: (userId: string, eventId?: any, roomType?: any, extra?: any) =>
    processEventOutcome(createDefaultIntegrityProfile(userId), 'TIMEOUT', eventId, roomType),
};
