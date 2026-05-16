/**
 * ContestEngine.ts
 * Manages monthly and yearly contest systems, qualification rules, and winner logic.
 * Integrated into Home 5 Competition Economy Layer.
 */

export interface ContestantEntry {
  id: string;
  name: string;
  genre: string;
  battleWins: number;
  cypherEntries: number;
  voteCount: number;
  sponsorInvites: number;
  score: number;
}

export interface ContestConfig {
  type: "monthly" | "yearly";
  name: string;
  startDate: Date;
  endDate: Date;
  entryCap: number;
  sponsorSlots: number;
  prizePool: number;
}

export interface ContestWinner {
  rank: number;
  contestantId: string;
  name: string;
  genre: string;
  score: number;
  pointsReward: number;
  xpReward: number;
  crowns: number;
  premiumStoreItems: string[];
}

export class ContestEngine {
  private activeContests: Map<string, ContestConfig> = new Map();
  private contestants: Map<string, ContestantEntry[]> = new Map();
  private winners: Map<string, ContestWinner[]> = new Map();

  /**
   * Registers a contestant for a contest.
   * Monthly: battle wins, cypher entries, fan votes, sponsor invites
   * Yearly: previous monthly winners only
   */
  registerContestant(
    contestId: string,
    contestant: ContestantEntry
  ): boolean {
    if (!this.activeContests.has(contestId)) {
      return false;
    }

    const config = this.activeContests.get(contestId)!;
    const entries = this.contestants.get(contestId) || [];

    if (entries.length >= config.entryCap) {
      return false;
    }

    entries.push(contestant);
    this.contestants.set(contestId, entries);
    return true;
  }

  /**
   * Calculates qualification score for monthly contest.
   * Factors: battle wins (40%), cypher entries (30%), votes (20%), sponsor invites (10%)
   */
  calculateQualificationScore(contestant: ContestantEntry): number {
    const battleWinScore = contestant.battleWins * 40;
    const cypherScore = contestant.cypherEntries * 30;
    const voteScore = contestant.voteCount * 20;
    const sponsorScore = contestant.sponsorInvites * 10;

    return battleWinScore + cypherScore + voteScore + sponsorScore;
  }

  /**
   * Determines winners for a contest.
   * Monthly: top finishers by score
   * Yearly: monthly winners + ranked entries + sponsor picks + wildcards
   */
  determineWinners(contestId: string, topCount: number = 10): ContestWinner[] {
    const entries = this.contestants.get(contestId) || [];
    const config = this.activeContests.get(contestId);

    if (!config) {
      return [];
    }

    // Calculate scores
    const scored = entries
      .map((e) => ({
        ...e,
        score: this.calculateQualificationScore(e),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topCount);

    // Map to winners with rewards
    const winners: ContestWinner[] = scored.map((contestant, index) => {
      const pointsReward = config.type === "monthly" ? 5000 - index * 100 : 15000 - index * 200;
      const xpReward = config.type === "monthly" ? 500 - index * 10 : 2000 - index * 50;
      const crowns = index === 0 ? 1 : 0;

      return {
        rank: index + 1,
        contestantId: contestant.id,
        name: contestant.name,
        genre: contestant.genre,
        score: contestant.score,
        pointsReward,
        xpReward,
        crowns,
        premiumStoreItems:
          config.type === "yearly" && index < 5
            ? [`premium-item-${index + 1}`, "seasonal-bundle"]
            : [],
      };
    });

    this.winners.set(contestId, winners);
    return winners;
  }

  /**
   * Retrieves current winners for a contest.
   */
  getWinners(contestId: string): ContestWinner[] {
    return this.winners.get(contestId) || [];
  }

  /**
   * Creates a new contest instance.
   */
  createContest(
    contestId: string,
    config: ContestConfig
  ): boolean {
    if (this.activeContests.has(contestId)) {
      return false;
    }

    this.activeContests.set(contestId, config);
    this.contestants.set(contestId, []);
    return true;
  }

  /**
   * Checks if contest is currently active.
   */
  isContestActive(contestId: string): boolean {
    const config = this.activeContests.get(contestId);
    if (!config) return false;

    const now = new Date();
    return now >= config.startDate && now <= config.endDate;
  }

  /**
   * Gets all contestants for a contest.
   */
  getContestants(contestId: string): ContestantEntry[] {
    return this.contestants.get(contestId) || [];
  }

  /**
   * Gets leaderboard for a contest (sorted by score).
   */
  getLeaderboard(contestId: string): ContestantEntry[] {
    const entries = this.contestants.get(contestId) || [];
    return entries
      .map((e) => ({
        ...e,
        score: this.calculateQualificationScore(e),
      }))
      .sort((a, b) => b.score - a.score);
  }
}

// Singleton instance
export const contestEngine = new ContestEngine();
