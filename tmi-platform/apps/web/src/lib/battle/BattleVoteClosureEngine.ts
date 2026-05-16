// BATTLE VOTE CLOSURE ENGINE — Vote Aggregation & Winner Determination
// Purpose: Aggregate audience votes, determine winners, award prizes
// Enforces vote fairness and fraud detection

import { randomUUID } from 'crypto';
import { Analytics } from '@/lib/analytics/PersonaAnalyticsEngine';

export interface Vote {
  id: string;
  battleId: string;
  voterId: string;
  competitorId: string;
  votedAt: string;
  deviceId?: string;
  ipAddress?: string;
  fraudScore: number; // 0-100
}

export interface VoteAggregate {
  competitorId: string;
  competitorName: string;
  voteCount: number;
  percentage: number;
  deviceVariety: number; // unique devices voting for this competitor
}

export interface BattleResult {
  battleId: string;
  winnerId: string;
  winnerName: string;
  voteCount: number;
  totalVotes: number;
  winPercentage: number;
  runners: VoteAggregate[];
  fraud: {
    suspiciousVotes: number;
    botLikeVotes: number;
    deviceFarmVotes: number;
  };
}

// Votes registry
const VOTES = new Map<string, Vote>();

// Vote counters per battle
const BATTLE_VOTE_COUNTS = new Map<string, Map<string, number>>(); // battleId → (competitorId → count)

// Devices per competitor
const COMPETITOR_DEVICES = new Map<string, Set<string>>(); // competitorId → deviceIds

// IP addresses per competitor
const COMPETITOR_IPS = new Map<string, Set<string>>(); // competitorId → IPs

// Vote fraud tracking
const FRAUD_VOTES = new Map<string, Vote[]>(); // battleId → suspicious votes

export class BattleVoteClosureEngine {
  /**
   * Record vote
   */
  static async recordVote(
    battleId: string,
    voterId: string,
    competitorId: string,
    deviceId?: string,
    ipAddress?: string
  ): Promise<Vote | null> {
    // Fraud detection
    const fraudScore = await this.calculateFraudScore(
      competitorId,
      voterId,
      deviceId,
      ipAddress
    );

    // Reject vote if fraud score too high
    if (fraudScore > 80) {
      const suspiciousVote: Vote = {
        id: randomUUID(),
        battleId,
        voterId,
        competitorId,
        votedAt: new Date().toISOString(),
        deviceId,
        ipAddress,
        fraudScore,
      };

      if (!FRAUD_VOTES.has(battleId)) {
        FRAUD_VOTES.set(battleId, []);
      }
      FRAUD_VOTES.get(battleId)!.push(suspiciousVote);

      return null; // Vote rejected
    }

    const vote: Vote = {
      id: randomUUID(),
      battleId,
      voterId,
      competitorId,
      votedAt: new Date().toISOString(),
      deviceId,
      ipAddress,
      fraudScore,
    };

    VOTES.set(vote.id, vote);
    Analytics.vote({ userId: voterId, targetId: competitorId, context: battleId, activePersona: 'fan' });

    // Update counters
    if (!BATTLE_VOTE_COUNTS.has(battleId)) {
      BATTLE_VOTE_COUNTS.set(battleId, new Map());
    }
    const competitors = BATTLE_VOTE_COUNTS.get(battleId)!;
    competitors.set(competitorId, (competitors.get(competitorId) || 0) + 1);

    // Track device
    if (deviceId) {
      const key = `${competitorId}`;
      if (!COMPETITOR_DEVICES.has(key)) {
        COMPETITOR_DEVICES.set(key, new Set());
      }
      COMPETITOR_DEVICES.get(key)!.add(deviceId);
    }

    // Track IP
    if (ipAddress) {
      const key = `${competitorId}`;
      if (!COMPETITOR_IPS.has(key)) {
        COMPETITOR_IPS.set(key, new Set());
      }
      COMPETITOR_IPS.get(key)!.add(ipAddress);
    }

    return vote;
  }

  /**
   * Calculate fraud score for vote
   */
  private static async calculateFraudScore(
    competitorId: string,
    voterId: string,
    deviceId?: string,
    ipAddress?: string
  ): Promise<number> {
    let score = 0;

    // Check if same IP voting multiple times rapidly
    if (ipAddress) {
      const ipKey = `${competitorId}`;
      const ips = COMPETITOR_IPS.get(ipKey) || new Set();

      // Count votes from this IP
      const ipVotes = Array.from(VOTES.values()).filter(
        (v) => v.competitorId === competitorId && v.ipAddress === ipAddress
      );

      if (ipVotes.length > 5) {
        score += 30; // Multiple votes from same IP
      }
    }

    // Check if same device voting multiple times
    if (deviceId) {
      const deviceKey = `${competitorId}`;
      const devices = COMPETITOR_DEVICES.get(deviceKey) || new Set();

      const deviceVotes = Array.from(VOTES.values()).filter(
        (v) => v.competitorId === competitorId && v.deviceId === deviceId
      );

      if (deviceVotes.length > 3) {
        score += 25; // Multiple votes from same device
      }
    }

    // Check for rapid-fire voting pattern
    const recentVotes = Array.from(VOTES.values())
      .filter((v) => v.competitorId === competitorId)
      .sort(
        (a, b) =>
          new Date(b.votedAt).getTime() - new Date(a.votedAt).getTime()
      )
      .slice(0, 10);

    if (recentVotes.length >= 3) {
      const timeSpan =
        new Date(recentVotes[0].votedAt).getTime() -
        new Date(recentVotes[recentVotes.length - 1].votedAt).getTime();

      if (timeSpan < 5000) {
        // 10 votes in 5 seconds
        score += 35;
      }
    }

    return Math.min(score, 100);
  }

  /**
   * Get vote count for competitor in battle
   */
  static async getVoteCount(battleId: string, competitorId: string): Promise<number> {
    const competitors = BATTLE_VOTE_COUNTS.get(battleId);
    return competitors?.get(competitorId) || 0;
  }

  /**
   * Get all votes for battle
   */
  static async getBattleVotes(battleId: string): Promise<Vote[]> {
    return Array.from(VOTES.values()).filter((v) => v.battleId === battleId);
  }

  /**
   * Get vote aggregates for battle
   */
  static async getVoteAggregates(battleId: string): Promise<VoteAggregate[]> {
    const competitors = BATTLE_VOTE_COUNTS.get(battleId);
    if (!competitors) return [];

    const allVotes = Array.from(VOTES.values()).filter((v) => v.battleId === battleId);
    const totalVotes = allVotes.length;

    const aggregates: VoteAggregate[] = Array.from(competitors.entries()).map(
      ([competitorId, voteCount]) => {
        const deviceCount = COMPETITOR_DEVICES.get(competitorId)?.size || 0;

        return {
          competitorId,
          competitorName: `Competitor ${competitorId.substring(0, 8)}`,
          voteCount,
          percentage: totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0,
          deviceVariety: deviceCount,
        };
      }
    );

    // Sort by votes descending
    return aggregates.sort((a, b) => b.voteCount - a.voteCount);
  }

  /**
   * Close voting and determine winner
   */
  static async closeVotingAndDetermineWinner(
    battleId: string
  ): Promise<BattleResult | null> {
    const competitors = BATTLE_VOTE_COUNTS.get(battleId);
    if (!competitors || competitors.size === 0) return null;

    const aggregates = await this.getVoteAggregates(battleId);
    const suspiciousVotes = FRAUD_VOTES.get(battleId) || [];

    if (aggregates.length === 0) return null;

    // Winner is competitor with most votes
    const winner = aggregates[0];
    const totalVotes = Array.from(competitors.values()).reduce(
      (sum, count) => sum + count,
      0
    );

    const result: BattleResult = {
      battleId,
      winnerId: winner.competitorId,
      winnerName: winner.competitorName,
      voteCount: winner.voteCount,
      totalVotes,
      winPercentage:
        totalVotes > 0 ? (winner.voteCount / totalVotes) * 100 : 0,
      runners: aggregates.slice(1),
      fraud: {
        suspiciousVotes: suspiciousVotes.length,
        botLikeVotes: suspiciousVotes.filter((v) => v.fraudScore > 70)
          .length,
        deviceFarmVotes: suspiciousVotes.filter(
          (v) => v.fraudScore > 50 && v.fraudScore <= 70
        ).length,
      },
    };

    return result;
  }

  /**
   * Check for vote manipulation
   */
  static async flagVoteManipulation(battleId: string): Promise<{
    isManipulated: boolean;
    reason?: string;
    flagCount: number;
  }> {
    const aggregates = await this.getVoteAggregates(battleId);
    const suspiciousVotes = FRAUD_VOTES.get(battleId) || [];

    // Flag if high percentage of suspicious votes
    if (suspiciousVotes.length > 10) {
      return {
        isManipulated: true,
        reason: 'High number of suspicious votes detected',
        flagCount: suspiciousVotes.length,
      };
    }

    // Flag if one competitor has extreme vote concentration (>90%)
    if (aggregates.length > 0 && aggregates[0].percentage > 90) {
      return {
        isManipulated: true,
        reason: 'Extreme vote concentration detected',
        flagCount: aggregates[0].voteCount,
      };
    }

    return {
      isManipulated: false,
      flagCount: 0,
    };
  }

  /**
   * Get suspicious votes for battle
   */
  static async getSuspiciousVotes(battleId: string): Promise<Vote[]> {
    return FRAUD_VOTES.get(battleId) || [];
  }

  /**
   * Invalidate votes from source (admin action)
   */
  static async invalidateVotesFromSource(
    battleId: string,
    source: 'device' | 'ip',
    sourceId: string
  ): Promise<number> {
    const votes = Array.from(VOTES.values()).filter((v) => v.battleId === battleId);

    let removed = 0;
    votes.forEach((vote) => {
      if (source === 'device' && vote.deviceId === sourceId) {
        VOTES.delete(vote.id);
        removed++;
      } else if (source === 'ip' && vote.ipAddress === sourceId) {
        VOTES.delete(vote.id);
        removed++;
      }
    });

    // Rebuild vote counters
    const competitors = new Map<string, number>();
    Array.from(VOTES.values())
      .filter((v) => v.battleId === battleId)
      .forEach((vote) => {
        competitors.set(
          vote.competitorId,
          (competitors.get(vote.competitorId) || 0) + 1
        );
      });

    BATTLE_VOTE_COUNTS.set(battleId, competitors);

    return removed;
  }

  /**
   * Get voting statistics
   */
  static async getVotingStats(battleId: string): Promise<{
    totalVotes: number;
    totalCompetitors: number;
    suspiciousVotes: number;
    manipulationFlagged: boolean;
  }> {
    const competitors = BATTLE_VOTE_COUNTS.get(battleId) || new Map();
    const votes = Array.from(VOTES.values()).filter((v) => v.battleId === battleId);
    const suspicious = FRAUD_VOTES.get(battleId) || [];

    const manipulation = await this.flagVoteManipulation(battleId);

    return {
      totalVotes: votes.length,
      totalCompetitors: competitors.size,
      suspiciousVotes: suspicious.length,
      manipulationFlagged: manipulation.isManipulated,
    };
  }
}

export default BattleVoteClosureEngine;
