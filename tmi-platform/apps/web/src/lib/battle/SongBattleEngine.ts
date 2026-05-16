// SONG BATTLE ENGINE — Battle Orchestration & Competitor Management
// Purpose: Manage song battles, competitor setup, battle lifecycle
// Tracks battle state, performances, and outcome determination

import { randomUUID } from 'crypto';

export type BattleStatus = 'setup' | 'open' | 'active' | 'voting' | 'closed' | 'completed';
export type PerformanceStatus = 'pending' | 'performing' | 'complete' | 'forfeit';

export interface Competitor {
  id: string;
  userId: string;
  userName: string;
  beatId?: string;
  beatTitle?: string;
  status: PerformanceStatus;
  joinedAt: string;
  performanceUrl?: string;
  performanceDuration: number; // seconds
}

export interface Battle {
  id: string;
  title: string;
  description?: string;
  category?: string;
  status: BattleStatus;
  competitors: Competitor[];
  startTime: string;
  endTime?: string;
  votingDeadline?: string;
  venueId?: string;
  venueName?: string;
  maxCompetitors?: number;
  entryFee?: number;
  prizePool?: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface BattlePerformance {
  id: string;
  battleId: string;
  competitorId: string;
  beatId: string;
  performanceUrl: string;
  duration: number;
  startedAt: string;
  completedAt?: string;
  techIssues: string[];
}

export interface BattleWinner {
  battleId: string;
  winnerId: string;
  winnerName: string;
  voteCount: number;
  totalVotes: number;
  winPercentage: number;
  prizeAmount?: number;
  awardedAt: string;
}

// Battles registry
const BATTLES = new Map<string, Battle>();

// Performances tracking
const PERFORMANCES = new Map<string, BattlePerformance>();

// Winners registry
const WINNERS = new Map<string, BattleWinner>();

// Battle history per competitor
const COMPETITOR_BATTLES = new Map<string, string[]>(); // userId → battleIds

export class SongBattleEngine {
  /**
   * Create new battle
   */
  static async createBattle(
    title: string,
    createdBy: string,
    options?: {
      description?: string;
      category?: string;
      maxCompetitors?: number;
      entryFee?: number;
      prizePool?: number;
      venueId?: string;
      venueName?: string;
    }
  ): Promise<Battle> {
    const battleId = randomUUID();

    const battle: Battle = {
      id: battleId,
      title,
      description: options?.description,
      category: options?.category,
      status: 'setup',
      competitors: [],
      startTime: new Date().toISOString(),
      maxCompetitors: options?.maxCompetitors || 10,
      entryFee: options?.entryFee,
      prizePool: options?.prizePool,
      venueId: options?.venueId,
      venueName: options?.venueName,
      createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    BATTLES.set(battleId, battle);

    return battle;
  }

  /**
   * Join battle as competitor
   */
  static async joinBattle(
    battleId: string,
    userId: string,
    userName: string,
    beatId?: string,
    beatTitle?: string
  ): Promise<Competitor | null> {
    const battle = BATTLES.get(battleId);
    if (!battle) return null;

    // Check max competitors
    if (battle.maxCompetitors && battle.competitors.length >= battle.maxCompetitors) {
      return null; // Battle full
    }

    // Check if already joined
    if (battle.competitors.some((c) => c.userId === userId)) {
      return null; // Already competitor
    }

    const competitor: Competitor = {
      id: randomUUID(),
      userId,
      userName,
      beatId,
      beatTitle,
      status: 'pending',
      joinedAt: new Date().toISOString(),
      performanceDuration: 0,
    };

    battle.competitors.push(competitor);
    battle.updatedAt = new Date().toISOString();

    // Track in competitor history
    if (!COMPETITOR_BATTLES.has(userId)) {
      COMPETITOR_BATTLES.set(userId, []);
    }
    COMPETITOR_BATTLES.get(userId)!.push(battleId);

    return competitor;
  }

  /**
   * Remove competitor from battle
   */
  static async removeCompetitor(
    battleId: string,
    competitorId: string
  ): Promise<boolean> {
    const battle = BATTLES.get(battleId);
    if (!battle) return false;

    const index = battle.competitors.findIndex((c) => c.id === competitorId);
    if (index === -1) return false;

    battle.competitors.splice(index, 1);
    battle.updatedAt = new Date().toISOString();

    return true;
  }

  /**
   * Start battle (transition setup → open → active)
   */
  static async startBattle(battleId: string): Promise<Battle | null> {
    const battle = BATTLES.get(battleId);
    if (!battle) return null;

    if (battle.competitors.length < 2) return null; // Need at least 2 competitors

    battle.status = 'active';
    battle.startTime = new Date().toISOString();
    battle.updatedAt = new Date().toISOString();

    return battle;
  }

  /**
   * Submit performance
   */
  static async submitPerformance(
    battleId: string,
    competitorId: string,
    beatId: string,
    performanceUrl: string,
    duration: number
  ): Promise<BattlePerformance | null> {
    const battle = BATTLES.get(battleId);
    if (!battle) return null;

    const competitor = battle.competitors.find((c) => c.id === competitorId);
    if (!competitor) return null;

    const performance: BattlePerformance = {
      id: randomUUID(),
      battleId,
      competitorId,
      beatId,
      performanceUrl,
      duration,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      techIssues: [],
    };

    PERFORMANCES.set(performance.id, performance);

    // Update competitor status
    competitor.status = 'complete';
    competitor.performanceUrl = performanceUrl;
    competitor.performanceDuration = duration;

    return performance;
  }

  /**
   * Transition battle to voting phase
   */
  static async startVoting(battleId: string, votingDurationMinutes: number = 60): Promise<Battle | null> {
    const battle = BATTLES.get(battleId);
    if (!battle) return null;

    battle.status = 'voting';
    battle.votingDeadline = new Date(
      Date.now() + votingDurationMinutes * 60 * 1000
    ).toISOString();
    battle.updatedAt = new Date().toISOString();

    return battle;
  }

  /**
   * Get battle details
   */
  static async getBattle(battleId: string): Promise<Battle | null> {
    return BATTLES.get(battleId) || null;
  }

  /**
   * Get competitor for battle
   */
  static async getCompetitor(battleId: string, competitorId: string): Promise<Competitor | null> {
    const battle = BATTLES.get(battleId);
    if (!battle) return null;

    return battle.competitors.find((c) => c.id === competitorId) || null;
  }

  /**
   * Get all battles
   */
  static async getAllBattles(
    status?: BattleStatus,
    limit: number = 50
  ): Promise<Battle[]> {
    let battles = Array.from(BATTLES.values());

    if (status) {
      battles = battles.filter((b) => b.status === status);
    }

    return battles
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, limit);
  }

  /**
   * Get user's battles
   */
  static async getUserBattles(userId: string): Promise<Battle[]> {
    const battleIds = COMPETITOR_BATTLES.get(userId) || [];
    return battleIds
      .map((id) => BATTLES.get(id))
      .filter(Boolean) as Battle[];
  }

  /**
   * Get active battles
   */
  static async getActiveBattles(limit: number = 10): Promise<Battle[]> {
    return Array.from(BATTLES.values())
      .filter((b) => b.status === 'active' || b.status === 'voting')
      .sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      )
      .slice(0, limit);
  }

  /**
   * Close battle (no more voting)
   */
  static async closeBattle(battleId: string): Promise<Battle | null> {
    const battle = BATTLES.get(battleId);
    if (!battle) return null;

    battle.status = 'closed';
    battle.endTime = new Date().toISOString();
    battle.updatedAt = new Date().toISOString();

    return battle;
  }

  /**
   * Get battle performance
   */
  static async getPerformance(performanceId: string): Promise<BattlePerformance | null> {
    return PERFORMANCES.get(performanceId) || null;
  }

  /**
   * Get battle performances
   */
  static async getBattlePerformances(battleId: string): Promise<BattlePerformance[]> {
    return Array.from(PERFORMANCES.values()).filter((p) => p.battleId === battleId);
  }

  /**
   * Log technical issue
   */
  static async logTechIssue(
    performanceId: string,
    issue: string
  ): Promise<boolean> {
    const performance = PERFORMANCES.get(performanceId);
    if (!performance) return false;

    performance.techIssues.push(issue);
    return true;
  }

  /**
   * Get battle statistics
   */
  static async getBattleStats(battleId: string): Promise<{
    totalCompetitors: number;
    completedPerformances: number;
    forfeits: number;
    status: BattleStatus;
  } | null> {
    const battle = BATTLES.get(battleId);
    if (!battle) return null;

    return {
      totalCompetitors: battle.competitors.length,
      completedPerformances: battle.competitors.filter(
        (c) => c.status === 'complete'
      ).length,
      forfeits: battle.competitors.filter((c) => c.status === 'forfeit').length,
      status: battle.status,
    };
  }

  /**
   * Get battle winner (populated by BattleVoteClosureEngine)
   */
  static async getBattleWinner(battleId: string): Promise<BattleWinner | null> {
    return WINNERS.get(battleId) || null;
  }

  /**
   * Record battle winner (called by BattleVoteClosureEngine)
   */
  static async recordWinner(winner: BattleWinner): Promise<void> {
    WINNERS.set(winner.battleId, winner);

    const battle = BATTLES.get(winner.battleId);
    if (battle) {
      battle.status = 'completed';
      battle.updatedAt = new Date().toISOString();
    }
  }

  /**
   * Forfeit performance
   */
  static async forfeitBattle(
    battleId: string,
    competitorId: string
  ): Promise<boolean> {
    const battle = BATTLES.get(battleId);
    if (!battle) return false;

    const competitor = battle.competitors.find((c) => c.id === competitorId);
    if (!competitor) return false;

    competitor.status = 'forfeit';
    battle.updatedAt = new Date().toISOString();

    return true;
  }
}

export default SongBattleEngine;
