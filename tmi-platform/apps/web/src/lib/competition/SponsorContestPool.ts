/**
 * SponsorContestPool.ts
 * Manages sponsor slots (10 local + 10 major) and reward allocation.
 * Sponsors can offer: rewards, merch, giveaways, products.
 */

export interface Sponsor {
  id: string;
  name: string;
  category: "local" | "major";
  logo?: string;
  offerings: SponsorOffering[];
  prizePool: number;
  activeContests: string[];
}

export interface SponsorOffering {
  type: "rewards" | "merch" | "giveaway" | "product";
  name: string;
  value: number;
  quantity: number;
  description: string;
}

export interface SponsorReward {
  sponsorId: string;
  sponsorName: string;
  offering: SponsorOffering;
  awardedTo: string; // contestant ID
  claimedAt?: Date;
}

export class SponsorContestPool {
  private localSponsors: Map<string, Sponsor> = new Map();
  private majorSponsors: Map<string, Sponsor> = new Map();
  private rewards: SponsorReward[] = [];

  /**
   * Adds a local sponsor (max 10).
   */
  addLocalSponsor(sponsor: Sponsor): boolean {
    if (this.localSponsors.size >= 10) {
      return false;
    }

    sponsor.category = "local";
    this.localSponsors.set(sponsor.id, sponsor);
    return true;
  }

  /**
   * Adds a major sponsor (max 10).
   */
  addMajorSponsor(sponsor: Sponsor): boolean {
    if (this.majorSponsors.size >= 10) {
      return false;
    }

    sponsor.category = "major";
    this.majorSponsors.set(sponsor.id, sponsor);
    return true;
  }

  /**
   * Removes a sponsor from the pool.
   */
  removeSponsor(sponsorId: string): boolean {
    const removed1 = this.localSponsors.delete(sponsorId);
    const removed2 = this.majorSponsors.delete(sponsorId);
    return removed1 || removed2;
  }

  /**
   * Gets all active sponsors.
   */
  getAllSponsors(): Sponsor[] {
    return [
      ...Array.from(this.localSponsors.values()),
      ...Array.from(this.majorSponsors.values()),
    ];
  }

  /**
   * Gets local sponsors (max 10).
   */
  getLocalSponsors(): Sponsor[] {
    return Array.from(this.localSponsors.values());
  }

  /**
   * Gets major sponsors (max 10).
   */
  getMajorSponsors(): Sponsor[] {
    return Array.from(this.majorSponsors.values());
  }

  /**
   * Allocates reward from sponsor to contestant.
   */
  allocateReward(
    sponsorId: string,
    contestantId: string,
    offering: SponsorOffering
  ): SponsorReward | null {
    const sponsor =
      this.localSponsors.get(sponsorId) || this.majorSponsors.get(sponsorId);

    if (!sponsor || offering.quantity <= 0) {
      return null;
    }

    const reward: SponsorReward = {
      sponsorId,
      sponsorName: sponsor.name,
      offering,
      awardedTo: contestantId,
    };

    this.rewards.push(reward);

    // Decrement available quantity
    offering.quantity -= 1;

    return reward;
  }

  /**
   * Claims a reward (marks as claimed at current time).
   */
  claimReward(rewardIndex: number): boolean {
    if (rewardIndex < 0 || rewardIndex >= this.rewards.length) {
      return false;
    }

    this.rewards[rewardIndex].claimedAt = new Date();
    return true;
  }

  /**
   * Gets all rewards for a contestant.
   */
  getContestantRewards(contestantId: string): SponsorReward[] {
    return this.rewards.filter((r) => r.awardedTo === contestantId);
  }

  /**
   * Gets all rewards allocated by a sponsor.
   */
  getSponsorRewards(sponsorId: string): SponsorReward[] {
    return this.rewards.filter((r) => r.sponsorId === sponsorId);
  }

  /**
   * Gets total prize pool across all sponsors.
   */
  getTotalPrizePool(): number {
    return this.getAllSponsors().reduce((sum, s) => sum + s.prizePool, 0);
  }

  /**
   * Gets sponsor capacity stats.
   */
  getCapacityStats(): {
    localCount: number;
    majorCount: number;
    totalSponsors: number;
    maxCapacity: number;
  } {
    return {
      localCount: this.localSponsors.size,
      majorCount: this.majorSponsors.size,
      totalSponsors: this.localSponsors.size + this.majorSponsors.size,
      maxCapacity: 20,
    };
  }

  /**
   * Registers a sponsor for a contest.
   */
  registerForContest(sponsorId: string, contestId: string): boolean {
    const sponsor =
      this.localSponsors.get(sponsorId) || this.majorSponsors.get(sponsorId);

    if (!sponsor) {
      return false;
    }

    if (!sponsor.activeContests.includes(contestId)) {
      sponsor.activeContests.push(contestId);
    }

    return true;
  }

  /**
   * Gets all sponsors active in a contest.
   */
  getContestSponsors(contestId: string): Sponsor[] {
    return this.getAllSponsors().filter((s) =>
      s.activeContests.includes(contestId)
    );
  }
}

// Singleton instance
export const sponsorContestPool = new SponsorContestPool();
