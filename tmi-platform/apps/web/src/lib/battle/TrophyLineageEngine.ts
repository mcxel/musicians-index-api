// TROPHY LINEAGE ENGINE — Winner Tracking & Trophy History
// Purpose: Maintain trophy ownership, seasonal lineage, and ranking updates
// Track producer achievements and battle history

import { randomUUID } from 'crypto';

export type TrophySeason = 'fall-2025' | 'winter-2025' | 'spring-2026' | 'summer-2026';
export type TrophyRarity = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface Trophy {
  id: string;
  battleId: string;
  season: TrophySeason;
  winnerId: string;
  winnerName: string;
  rarity: TrophyRarity;
  prizeAmount: number;
  voteCount: number;
  totalVotes: number;
  awardedAt: string;
  displayName: string;
  description: string;
}

export interface TrophyLineage {
  trophyId: string;
  battleId: string;
  winnerId: string;
  season: TrophySeason;
  rank: number; // 1st, 2nd, 3rd place
  priorWinner?: string; // who held it before
  undefeatableTill?: string; // expiration
}

export interface ProducerRanking {
  producerId: string;
  producerName: string;
  totalTrophies: number;
  totalPrizeAmount: number;
  goldTrophies: number;
  winStreak: number;
  seasonTrophies: Map<TrophySeason, number>;
  lastBattleAt?: string;
  totalBattlesWon: number;
}

export interface SeasonalLadder {
  season: TrophySeason;
  rankings: Array<{
    rank: number;
    producerId: string;
    producerName: string;
    trophyCount: number;
    totalPrize: number;
  }>;
}

// Trophy registry
const TROPHIES = new Map<string, Trophy>();

// Trophy lineage (battleId → lineage info)
const LINEAGE = new Map<string, TrophyLineage>();

// Producer rankings cache
const PRODUCER_RANKINGS = new Map<string, ProducerRanking>();

// Win streaks
const WIN_STREAKS = new Map<string, number>(); // producerId → streak count

// Seasonal ladders
const SEASONAL_LADDERS = new Map<TrophySeason, SeasonalLadder>();

const SEASONS: TrophySeason[] = ['fall-2025', 'winter-2025', 'spring-2026', 'summer-2026'];

const RARITY_TIERS: Record<TrophyRarity, { prizeMultiplier: number; description: string }> = {
  bronze: { prizeMultiplier: 1, description: 'Entry-level battle victory' },
  silver: { prizeMultiplier: 1.5, description: 'Solid performance' },
  gold: { prizeMultiplier: 2, description: 'Strong victory' },
  platinum: { prizeMultiplier: 3, description: 'Exceptional performance' },
  diamond: { prizeMultiplier: 5, description: 'Legendary performance' },
};

export class TrophyLineageEngine {
  /**
   * Determine trophy rarity based on vote percentage
   */
  private static determineTrophyRarity(winPercentage: number): TrophyRarity {
    if (winPercentage >= 85) return 'diamond';
    if (winPercentage >= 70) return 'platinum';
    if (winPercentage >= 55) return 'gold';
    if (winPercentage >= 45) return 'silver';
    return 'bronze';
  }

  /**
   * Award trophy to battle winner
   */
  static async awardTrophy(
    battleId: string,
    winnerId: string,
    winnerName: string,
    voteCount: number,
    totalVotes: number,
    basePrize: number = 100
  ): Promise<Trophy> {
    const winPercentage = (voteCount / totalVotes) * 100;
    const rarity = this.determineTrophyRarity(winPercentage);
    const multiplier = RARITY_TIERS[rarity].prizeMultiplier;
    const prizeAmount = Math.floor(basePrize * multiplier);

    const trophy: Trophy = {
      id: randomUUID(),
      battleId,
      season: this.getCurrentSeason(),
      winnerId,
      winnerName,
      rarity,
      prizeAmount,
      voteCount,
      totalVotes,
      awardedAt: new Date().toISOString(),
      displayName: `${rarity.toUpperCase()} Trophy - ${winnerName}`,
      description: RARITY_TIERS[rarity].description,
    };

    TROPHIES.set(trophy.id, trophy);

    // Create lineage
    const lineage: TrophyLineage = {
      trophyId: trophy.id,
      battleId,
      winnerId,
      season: trophy.season,
      rank: 1,
    };

    LINEAGE.set(battleId, lineage);

    // Update producer ranking
    await this.updateProducerRanking(winnerId, winnerName, trophy);

    // Update win streak
    const currentStreak = WIN_STREAKS.get(winnerId) || 0;
    WIN_STREAKS.set(winnerId, currentStreak + 1);

    // Invalidate seasonal ladder cache
    SEASONAL_LADDERS.delete(trophy.season);

    return trophy;
  }

  /**
   * Update producer ranking
   */
  private static async updateProducerRanking(
    producerId: string,
    producerName: string,
    trophy: Trophy
  ): Promise<void> {
    let ranking = PRODUCER_RANKINGS.get(producerId);

    if (!ranking) {
      ranking = {
        producerId,
        producerName,
        totalTrophies: 0,
        totalPrizeAmount: 0,
        goldTrophies: 0,
        winStreak: 1,
        seasonTrophies: new Map(),
        totalBattlesWon: 0,
      };

      SEASONS.forEach((season) => {
        ranking!.seasonTrophies.set(season, 0);
      });

      PRODUCER_RANKINGS.set(producerId, ranking);
    }

    ranking.totalTrophies += 1;
    ranking.totalPrizeAmount += trophy.prizeAmount;
    ranking.totalBattlesWon += 1;
    ranking.lastBattleAt = trophy.awardedAt;

    if (trophy.rarity === 'gold' || trophy.rarity === 'platinum' || trophy.rarity === 'diamond') {
      ranking.goldTrophies += 1;
    }

    // Update season trophy count
    const currentSeason = this.getCurrentSeason();
    ranking.seasonTrophies.set(
      currentSeason,
      (ranking.seasonTrophies.get(currentSeason) || 0) + 1
    );
  }

  /**
   * Get current season
   */
  private static getCurrentSeason(): TrophySeason {
    const now = new Date();
    const month = now.getMonth();

    if (month >= 8) return 'fall-2025'; // Sept-Nov
    if (month >= 5) return 'summer-2026'; // June-Aug
    if (month >= 2) return 'spring-2026'; // Mar-May
    return 'winter-2025'; // Dec-Feb
  }

  /**
   * Get trophy
   */
  static async getTrophy(trophyId: string): Promise<Trophy | null> {
    return TROPHIES.get(trophyId) || null;
  }

  /**
   * Get trophy lineage for battle
   */
  static async getLineage(battleId: string): Promise<TrophyLineage | null> {
    return LINEAGE.get(battleId) || null;
  }

  /**
   * Get producer ranking
   */
  static async getProducerRanking(producerId: string): Promise<ProducerRanking | null> {
    return PRODUCER_RANKINGS.get(producerId) || null;
  }

  /**
   * Get seasonal ladder
   */
  static async getSeasonalLadder(season: TrophySeason): Promise<SeasonalLadder> {
    // Check cache
    if (SEASONAL_LADDERS.has(season)) {
      return SEASONAL_LADDERS.get(season)!;
    }

    // Build ladder
    const rankings = Array.from(PRODUCER_RANKINGS.values())
      .map((r) => ({
        rank: 0,
        producerId: r.producerId,
        producerName: r.producerName,
        trophyCount: r.seasonTrophies.get(season) || 0,
        totalPrize: 0,
      }))
      .filter((r) => r.trophyCount > 0)
      .sort((a, b) => b.trophyCount - a.trophyCount);

    // Add ranks
    rankings.forEach((r, index) => {
      r.rank = index + 1;
    });

    const ladder: SeasonalLadder = {
      season,
      rankings: rankings.slice(0, 100), // Top 100
    };

    SEASONAL_LADDERS.set(season, ladder);

    return ladder;
  }

  /**
   * Get all seasonal ladders
   */
  static async getAllSeasonalLadders(): Promise<SeasonalLadder[]> {
    const ladders: SeasonalLadder[] = [];

    for (const season of SEASONS) {
      ladders.push(await this.getSeasonalLadder(season));
    }

    return ladders;
  }

  /**
   * Get producer's trophies
   */
  static async getProducerTrophies(producerId: string): Promise<Trophy[]> {
    return Array.from(TROPHIES.values())
      .filter((t) => t.winnerId === producerId)
      .sort(
        (a, b) =>
          new Date(b.awardedAt).getTime() - new Date(a.awardedAt).getTime()
      );
  }

  /**
   * Get top trophy holders
   */
  static async getTopTrophyHolders(limit: number = 10): Promise<ProducerRanking[]> {
    return Array.from(PRODUCER_RANKINGS.values())
      .sort((a, b) => b.totalTrophies - a.totalTrophies)
      .slice(0, limit);
  }

  /**
   * Get win streak
   */
  static async getWinStreak(producerId: string): Promise<number> {
    return WIN_STREAKS.get(producerId) || 0;
  }

  /**
   * Break win streak (when competitor loses)
   */
  static async breakWinStreak(producerId: string): Promise<void> {
    WIN_STREAKS.delete(producerId);
  }

  /**
   * Get longest win streaks
   */
  static async getLongestWinStreaks(limit: number = 10): Promise<Array<{
    producerId: string;
    streak: number;
  }>> {
    return Array.from(WIN_STREAKS.entries())
      .map(([producerId, streak]) => ({ producerId, streak }))
      .sort((a, b) => b.streak - a.streak)
      .slice(0, limit);
  }

  /**
   * Get trophy statistics
   */
  static async getTrophyStats(): Promise<{
    totalTrophiesAwarded: number;
    totalPrizeDistributed: number;
    uniqueWinners: number;
    avgTrophiesPerWinner: number;
    mostCommonRarity: TrophyRarity;
  }> {
    const trophies = Array.from(TROPHIES.values());
    const winners = new Set(trophies.map((t) => t.winnerId));

    const rarityCount = {
      bronze: 0,
      silver: 0,
      gold: 0,
      platinum: 0,
      diamond: 0,
    };

    let totalPrize = 0;
    trophies.forEach((t) => {
      rarityCount[t.rarity] += 1;
      totalPrize += t.prizeAmount;
    });

    const mostCommonRarity = Object.entries(rarityCount).sort(
      (a, b) => b[1] - a[1]
    )[0][0] as TrophyRarity;

    return {
      totalTrophiesAwarded: trophies.length,
      totalPrizeDistributed: totalPrize,
      uniqueWinners: winners.size,
      avgTrophiesPerWinner:
        winners.size > 0 ? trophies.length / winners.size : 0,
      mostCommonRarity,
    };
  }

  /**
   * Reset season (archive and start new)
   */
  static async resetSeason(newSeason: TrophySeason): Promise<void> {
    // Archive current season data
    SEASONAL_LADDERS.delete(newSeason);

    // Reset streaks
    WIN_STREAKS.clear();

    // Update rankings for new season
    Array.from(PRODUCER_RANKINGS.values()).forEach((ranking) => {
      ranking.seasonTrophies.set(newSeason, 0);
      ranking.winStreak = 0;
    });
  }
}

export default TrophyLineageEngine;
