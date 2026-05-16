/**
 * RewardDropEngine.ts
 * Manages reward distribution: points, XP, store items, and NFT rewards.
 * Used across battles, cyphers, contests, and Monday Night Stage.
 */

export interface RewardDrop {
  id: string;
  recipient: string;
  source: "battle" | "cypher" | "contest" | "monday-night-stage";
  timestamp: Date;
  points: number;
  xp: number;
  storeItems: string[];
  nftRewards: NFTReward[];
  multiplier: number; // subscription/tier multiplier
}

export interface NFTReward {
  tokenId?: string;
  name: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  metadata: {
    source: string;
    contest?: string;
    rank?: number;
  };
}

export interface RewardConfig {
  basePoints: number;
  baseXP: number;
  baseStoreItems: string[];
  baseNFTs: NFTReward[];
  multipliers: {
    free: number;
    pro: number;
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
    diamond: number;
  };
}

export class RewardDropEngine {
  private drops: Map<string, RewardDrop> = new Map();
  private configs: Map<string, RewardConfig> = new Map();
  private totalPointsDistributed: number = 0;
  private totalXPDistributed: number = 0;

  /**
   * Creates a new reward configuration.
   */
  createConfig(configId: string, config: RewardConfig): boolean {
    if (this.configs.has(configId)) {
      return false;
    }

    this.configs.set(configId, config);
    return true;
  }

  /**
   * Gets a reward configuration.
   */
  getConfig(configId: string): RewardConfig | null {
    return this.configs.get(configId) || null;
  }

  /**
   * Drops a reward to a recipient.
   * Applies multiplier based on subscription tier.
   */
  dropReward(
    recipient: string,
    source: "battle" | "cypher" | "contest" | "monday-night-stage",
    configId: string,
    userTier: keyof RewardConfig["multipliers"] = "free"
  ): RewardDrop | null {
    const config = this.configs.get(configId);
    if (!config) {
      return null;
    }

    const multiplier = config.multipliers[userTier];

    const drop: RewardDrop = {
      id: `reward-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      recipient,
      source,
      timestamp: new Date(),
      points: Math.floor(config.basePoints * multiplier),
      xp: Math.floor(config.baseXP * multiplier),
      storeItems: config.baseStoreItems,
      nftRewards: config.baseNFTs,
      multiplier,
    };

    this.drops.set(drop.id, drop);
    this.totalPointsDistributed += drop.points;
    this.totalXPDistributed += drop.xp;

    return drop;
  }

  /**
   * Drops a battle reward (5,000 points, XP boost, store item).
   */
  dropBattleReward(
    winner: string,
    userTier: keyof RewardConfig["multipliers"] = "free"
  ): RewardDrop | null {
    const battleConfig = this.configs.get("battle-of-day");

    if (!battleConfig) {
      return null;
    }

    return this.dropReward(winner, "battle", "battle-of-day", userTier);
  }

  /**
   * Drops a cypher reward (XP, points, unlockables).
   */
  dropCypherReward(
    performer: string,
    userTier: keyof RewardConfig["multipliers"] = "free"
  ): RewardDrop | null {
    return this.dropReward(performer, "cypher", "cypher-of-week", userTier);
  }

  /**
   * Drops a Monday Night Stage reward (5,000 points, store rewards, XP).
   */
  dropMondayNightReward(
    contestant: string,
    userTier: keyof RewardConfig["multipliers"] = "free"
  ): RewardDrop | null {
    return this.dropReward(
      contestant,
      "monday-night-stage",
      "monday-night-stage",
      userTier
    );
  }

  /**
   * Drops a contest reward (large points, premium store items, XP bundles).
   */
  dropContestReward(
    winner: string,
    rank: number,
    contestType: "monthly" | "yearly",
    userTier: keyof RewardConfig["multipliers"] = "free"
  ): RewardDrop | null {
    const configId = contestType === "monthly" ? "monthly-contest" : "yearly-contest";
    return this.dropReward(winner, "contest", configId, userTier);
  }

  /**
   * Gets a specific reward drop.
   */
  getReward(rewardId: string): RewardDrop | null {
    return this.drops.get(rewardId) || null;
  }

  /**
   * Gets all rewards for a recipient.
   */
  getRecipientRewards(recipient: string): RewardDrop[] {
    return Array.from(this.drops.values()).filter(
      (drop) => drop.recipient === recipient
    );
  }

  /**
   * Gets total points earned by a recipient.
   */
  getRecipientTotalPoints(recipient: string): number {
    return this.getRecipientRewards(recipient).reduce(
      (sum, drop) => sum + drop.points,
      0
    );
  }

  /**
   * Gets total XP earned by a recipient.
   */
  getRecipientTotalXP(recipient: string): number {
    return this.getRecipientRewards(recipient).reduce(
      (sum, drop) => sum + drop.xp,
      0
    );
  }

  /**
   * Gets all rewards from a specific source.
   */
  getRewardsBySource(source: string): RewardDrop[] {
    return Array.from(this.drops.values()).filter(
      (drop) => drop.source === source
    );
  }

  /**
   * Gets global distribution stats.
   */
  getDistributionStats(): {
    totalRewards: number;
    totalPointsDistributed: number;
    totalXPDistributed: number;
    averagePointsPerReward: number;
    averageXPPerReward: number;
  } {
    const totalRewards = this.drops.size;
    const avgPoints =
      totalRewards > 0 ? this.totalPointsDistributed / totalRewards : 0;
    const avgXP = totalRewards > 0 ? this.totalXPDistributed / totalRewards : 0;

    return {
      totalRewards,
      totalPointsDistributed: this.totalPointsDistributed,
      totalXPDistributed: this.totalXPDistributed,
      averagePointsPerReward: Math.floor(avgPoints),
      averageXPPerReward: Math.floor(avgXP),
    };
  }

  /**
   * Initializes standard reward configurations.
   */
  initializeStandardConfigs(): void {
    // Battle of Day config
    this.createConfig("battle-of-day", {
      basePoints: 5000,
      baseXP: 500,
      baseStoreItems: ["battle-item-reward"],
      baseNFTs: [],
      multipliers: {
        free: 1,
        pro: 1.1,
        bronze: 1.15,
        silver: 1.2,
        gold: 1.3,
        platinum: 1.4,
        diamond: 1.5,
      },
    });

    // Cypher of Week config
    this.createConfig("cypher-of-week", {
      basePoints: 3000,
      baseXP: 400,
      baseStoreItems: ["cypher-unlockable"],
      baseNFTs: [
        {
          name: "Cypher Badge",
          rarity: "rare",
          metadata: { source: "cypher-of-week" },
        },
      ],
      multipliers: {
        free: 1,
        pro: 1.1,
        bronze: 1.15,
        silver: 1.2,
        gold: 1.3,
        platinum: 1.4,
        diamond: 1.5,
      },
    });

    // Monday Night Stage config
    this.createConfig("monday-night-stage", {
      basePoints: 5000,
      baseXP: 600,
      baseStoreItems: ["monday-night-exclusive"],
      baseNFTs: [
        {
          name: "Monday Night Badge",
          rarity: "epic",
          metadata: { source: "monday-night-stage" },
        },
      ],
      multipliers: {
        free: 1,
        pro: 1.15,
        bronze: 1.2,
        silver: 1.25,
        gold: 1.35,
        platinum: 1.45,
        diamond: 1.6,
      },
    });

    // Monthly Contest config
    this.createConfig("monthly-contest", {
      basePoints: 10000,
      baseXP: 1000,
      baseStoreItems: ["monthly-champion-item"],
      baseNFTs: [
        {
          name: "Monthly Champion",
          rarity: "epic",
          metadata: { source: "monthly-contest" },
        },
      ],
      multipliers: {
        free: 1,
        pro: 1.15,
        bronze: 1.2,
        silver: 1.25,
        gold: 1.35,
        platinum: 1.45,
        diamond: 1.6,
      },
    });

    // Yearly Contest config
    this.createConfig("yearly-contest", {
      basePoints: 25000,
      baseXP: 2500,
      baseStoreItems: ["yearly-crown-item", "premium-bundle"],
      baseNFTs: [
        {
          name: "Yearly Champion Crown",
          rarity: "legendary",
          metadata: { source: "yearly-contest" },
        },
      ],
      multipliers: {
        free: 1,
        pro: 1.2,
        bronze: 1.25,
        silver: 1.3,
        gold: 1.4,
        platinum: 1.5,
        diamond: 1.65,
      },
    });
  }
}

// Singleton instance with standard configs initialized
export const rewardDropEngine = new RewardDropEngine();
rewardDropEngine.initializeStandardConfigs();
