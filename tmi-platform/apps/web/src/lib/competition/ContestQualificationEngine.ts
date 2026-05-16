/**
 * ContestQualificationEngine.ts
 * Manages contest entry qualification: battle wins, cypher entries, wildcard logic, sponsor entries.
 * Controls who can enter monthly and yearly contests.
 */

export interface QualificationPath {
  type: "battle-win" | "cypher-entry" | "wildcard" | "sponsor-invite";
  count: number;
  threshold: number;
  contested?: boolean; // for wildcard entries
}

export interface QualificationStatus {
  contestantId: string;
  contestantName: string;
  genre: string;
  pathsQualified: QualificationPath[];
  totalQualifications: number;
  isQualified: boolean;
  sponsorInvites: string[]; // sponsor IDs
  wildcardEligible: boolean;
}

export class ContestQualificationEngine {
  private qualificationCache: Map<string, QualificationStatus> = new Map();
  private monthlyQualificationThresholds = {
    battleWins: 5, // Need 5 battle wins
    cypherEntries: 10, // Need 10 cypher entries
    wildcardSlots: 5, // 5 wildcard slots per contest
    sponsorSlots: 3, // 3 sponsor-invite slots
  };

  private yearlyQualificationThresholds = {
    monthlyWinners: true, // All monthly winners auto-qualify
    rankedEntries: 20, // Top 20 from monthly rankings
    sponsorPicks: 5, // Sponsors can pick 5 total
    wildcards: 3, // 3 wildcard slots
  };

  /**
   * Checks if a contestant qualifies for a monthly contest via battle wins.
   */
  hasMonthlyBattleWinQualification(
    contestantId: string,
    battleWinCount: number
  ): boolean {
    return battleWinCount >= this.monthlyQualificationThresholds.battleWins;
  }

  /**
   * Checks if a contestant qualifies for a monthly contest via cypher entries.
   */
  hasMonthlyClypherQualification(
    contestantId: string,
    cypherEntryCount: number
  ): boolean {
    return cypherEntryCount >= this.monthlyQualificationThresholds.cypherEntries;
  }

  /**
   * Checks if a contestant qualifies via fan votes.
   */
  hasMonthlyFanVoteQualification(
    contestantId: string,
    voteCount: number
  ): boolean {
    // Fan vote qualification threshold: 1000 votes
    return voteCount >= 1000;
  }

  /**
   * Checks if a contestant qualifies via sponsor invite.
   */
  hasMonthlySponsOrInviteQualification(
    contestantId: string,
    sponsorIds: string[]
  ): boolean {
    return sponsorIds && sponsorIds.length > 0;
  }

  /**
   * Gets full qualification status for monthly contest.
   */
  getMonthlyQualificationStatus(
    contestantId: string,
    contestantName: string,
    genre: string,
    battleWins: number,
    cypherEntries: number,
    voteCount: number,
    sponsorInvites: string[]
  ): QualificationStatus {
    const paths: QualificationPath[] = [];

    if (this.hasMonthlyBattleWinQualification(contestantId, battleWins)) {
      paths.push({
        type: "battle-win",
        count: battleWins,
        threshold: this.monthlyQualificationThresholds.battleWins,
      });
    }

    if (this.hasMonthlyClypherQualification(contestantId, cypherEntries)) {
      paths.push({
        type: "cypher-entry",
        count: cypherEntries,
        threshold: this.monthlyQualificationThresholds.cypherEntries,
      });
    }

    if (this.hasMonthlyFanVoteQualification(contestantId, voteCount)) {
      paths.push({
        type: "battle-win",
        count: voteCount,
        threshold: 1000,
      });
    }

    if (this.hasMonthlySponsOrInviteQualification(contestantId, sponsorInvites)) {
      paths.push({
        type: "sponsor-invite",
        count: sponsorInvites.length,
        threshold: 1,
      });
    }

    const status: QualificationStatus = {
      contestantId,
      contestantName,
      genre,
      pathsQualified: paths,
      totalQualifications: paths.length,
      isQualified: paths.length > 0,
      sponsorInvites,
      wildcardEligible: false,
    };

    this.qualificationCache.set(contestantId, status);
    return status;
  }

  /**
   * Gets full qualification status for yearly contest.
   * Uses: monthly winners + ranked entries + sponsor picks + wildcards
   */
  getYearlyQualificationStatus(
    contestantId: string,
    contestantName: string,
    genre: string,
    isMonthlyWinner: boolean,
    yearlyRanking: number,
    sponsorPicks: string[],
    wildcardEntry: boolean
  ): QualificationStatus {
    const paths: QualificationPath[] = [];

    if (isMonthlyWinner) {
      paths.push({
        type: "battle-win",
        count: 1,
        threshold: 1,
      });
    }

    if (yearlyRanking <= this.yearlyQualificationThresholds.rankedEntries && yearlyRanking > 0) {
      paths.push({
        type: "cypher-entry",
        count: yearlyRanking,
        threshold: this.yearlyQualificationThresholds.rankedEntries,
      });
    }

    if (sponsorPicks && sponsorPicks.length > 0) {
      paths.push({
        type: "sponsor-invite",
        count: sponsorPicks.length,
        threshold: 1,
      });
    }

    if (wildcardEntry) {
      paths.push({
        type: "wildcard",
        count: 1,
        threshold: 1,
        contested: true,
      });
    }

    const status: QualificationStatus = {
      contestantId,
      contestantName,
      genre,
      pathsQualified: paths,
      totalQualifications: paths.length,
      isQualified: paths.length > 0,
      sponsorInvites: sponsorPicks,
      wildcardEligible: false,
    };

    this.qualificationCache.set(contestantId, status);
    return status;
  }

  /**
   * Adds a contestant to wildcard pool (for potential wildcard entry).
   */
  addToWildcardPool(
    contestantId: string,
    contestantName: string,
    genre: string
  ): boolean {
    const status: QualificationStatus = {
      contestantId,
      contestantName,
      genre,
      pathsQualified: [],
      totalQualifications: 0,
      isQualified: false,
      sponsorInvites: [],
      wildcardEligible: true,
    };

    this.qualificationCache.set(contestantId, status);
    return true;
  }

  /**
   * Registers a sponsor invite for a contestant.
   */
  addSponsorInvite(
    contestantId: string,
    sponsorId: string
  ): QualificationStatus | null {
    const status = this.qualificationCache.get(contestantId);

    if (!status) {
      return null;
    }

    if (!status.sponsorInvites.includes(sponsorId)) {
      status.sponsorInvites.push(sponsorId);
      status.isQualified = true;

      // Add sponsor-invite path if not present
      const hasSponsorPath = status.pathsQualified.some(
        (p) => p.type === "sponsor-invite"
      );
      if (!hasSponsorPath) {
        status.pathsQualified.push({
          type: "sponsor-invite",
          count: 1,
          threshold: 1,
        });
      }

      status.totalQualifications = status.pathsQualified.length;
    }

    return status;
  }

  /**
   * Gets qualification status for a contestant.
   */
  getQualificationStatus(
    contestantId: string
  ): QualificationStatus | null {
    return this.qualificationCache.get(contestantId) || null;
  }

  /**
   * Gets all qualified contestants.
   */
  getAllQualified(): QualificationStatus[] {
    return Array.from(this.qualificationCache.values()).filter(
      (s) => s.isQualified
    );
  }

  /**
   * Gets all wildcard-eligible contestants.
   */
  getWildcardEligible(): QualificationStatus[] {
    return Array.from(this.qualificationCache.values()).filter(
      (s) => s.wildcardEligible && !s.isQualified
    );
  }

  /**
   * Selects wildcard winners (random from eligible pool).
   */
  selectWildcardWinners(count: number = 5): QualificationStatus[] {
    const eligible = this.getWildcardEligible();

    if (eligible.length === 0) {
      return [];
    }

    // Shuffle array
    const shuffled = eligible.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(count, eligible.length));

    // Mark as qualified via wildcard
    selected.forEach((s) => {
      s.isQualified = true;
      s.pathsQualified.push({
        type: "wildcard",
        count: 1,
        threshold: 1,
        contested: true,
      });
      s.totalQualifications += 1;
    });

    return selected;
  }

  /**
   * Gets statistics about qualification distribution.
   */
  getQualificationStats(): {
    totalContestants: number;
    qualifiedContestants: number;
    wildcardEligible: number;
    pathDistribution: Record<string, number>;
  } {
    const allContestants = Array.from(this.qualificationCache.values());
    const qualified = allContestants.filter((s) => s.isQualified);
    const wildcard = allContestants.filter((s) => s.wildcardEligible);

    const pathDistribution: Record<string, number> = {
      "battle-win": 0,
      "cypher-entry": 0,
      "sponsor-invite": 0,
      wildcard: 0,
    };

    allContestants.forEach((s) => {
      s.pathsQualified.forEach((p) => {
        pathDistribution[p.type] = (pathDistribution[p.type] || 0) + 1;
      });
    });

    return {
      totalContestants: allContestants.length,
      qualifiedContestants: qualified.length,
      wildcardEligible: wildcard.length,
      pathDistribution,
    };
  }

  /**
   * Updates qualification thresholds.
   */
  updateMonthlyThresholds(
    thresholds: Partial<typeof this.monthlyQualificationThresholds>
  ): void {
    this.monthlyQualificationThresholds = {
      ...this.monthlyQualificationThresholds,
      ...thresholds,
    };
  }

  /**
   * Updates yearly qualification thresholds.
   */
  updateYearlyThresholds(
    thresholds: Partial<typeof this.yearlyQualificationThresholds>
  ): void {
    this.yearlyQualificationThresholds = {
      ...this.yearlyQualificationThresholds,
      ...thresholds,
    };
  }
}

// Singleton instance
export const contestQualificationEngine = new ContestQualificationEngine();
