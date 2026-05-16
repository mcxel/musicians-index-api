/**
 * AchievementEngine
 * Defines achievements, tracks progress, fires unlock events.
 */

export type AchievementCategory =
  | "fan"
  | "performer"
  | "host"
  | "judge"
  | "sponsor"
  | "admin"
  | "social"
  | "commerce"
  | "show"
  | "milestone";

export type AchievementRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export type Achievement = {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  xpReward: number;
  badgeIcon: string;
  thresholds?: number[]; // progressive tiers e.g. [1, 10, 50]
};

export type AchievementProgress = {
  achievementId: string;
  userId: string;
  currentCount: number;
  unlockedTiers: number[];
  firstUnlockedAtMs: number | null;
  lastUnlockedAtMs: number | null;
};

export type AchievementUnlockEvent = {
  userId: string;
  achievement: Achievement;
  tier: number | null;
  xpAwarded: number;
  unlockedAtMs: number;
};

export const ACHIEVEMENT_CATALOG: Achievement[] = [
  // Fan
  { id: "fan-first-attend", title: "Show Up", description: "Attend your first TMI show", category: "fan", rarity: "common", xpReward: 100, badgeIcon: "🎟️", thresholds: [1] },
  { id: "fan-superfan-10", title: "Superfan", description: "Attend 10 live shows", category: "fan", rarity: "uncommon", xpReward: 250, badgeIcon: "⭐", thresholds: [10] },
  { id: "fan-legendary-100", title: "TMI Legend", description: "Attend 100 live shows", category: "fan", rarity: "legendary", xpReward: 2000, badgeIcon: "👑", thresholds: [100] },
  { id: "fan-first-tip", title: "Tip It", description: "Send your first tip", category: "fan", rarity: "common", xpReward: 75, badgeIcon: "💰", thresholds: [1] },
  { id: "fan-1000-tip", title: "High Roller", description: "Tip $1000 total", category: "commerce", rarity: "epic", xpReward: 1000, badgeIcon: "💎" },
  { id: "fan-vote-10", title: "Voice of the People", description: "Cast 10 crowd votes", category: "social", rarity: "common", xpReward: 50, badgeIcon: "🗳️", thresholds: [10] },
  { id: "fan-vote-100", title: "Democracy Defender", description: "Cast 100 crowd votes", category: "social", rarity: "rare", xpReward: 500, badgeIcon: "🏛️", thresholds: [100] },
  // Performer
  { id: "perf-first-win", title: "First Victory", description: "Win your first show", category: "performer", rarity: "uncommon", xpReward: 500, badgeIcon: "🥇", thresholds: [1] },
  { id: "perf-idol-winner", title: "Monthly Idol", description: "Win Monthly Idol", category: "show", rarity: "epic", xpReward: 2500, badgeIcon: "🎤" },
  { id: "perf-mns-winner", title: "Monday Night Stage Champion", description: "Win Monday Night Stage", category: "show", rarity: "epic", xpReward: 2500, badgeIcon: "🌙" },
  { id: "perf-5-wins", title: "Champion", description: "Win 5 shows", category: "performer", rarity: "rare", xpReward: 1500, badgeIcon: "🏆", thresholds: [5] },
  // Social
  { id: "social-invite-5", title: "Recruiter", description: "Invite 5 friends who joined", category: "social", rarity: "uncommon", xpReward: 300, badgeIcon: "🤝", thresholds: [5] },
  { id: "social-fan-club", title: "Club Member", description: "Join a fan club", category: "social", rarity: "common", xpReward: 150, badgeIcon: "🎉", thresholds: [1] },
  // Commerce
  { id: "commerce-first-beat", title: "Beat Buyer", description: "Purchase your first beat", category: "commerce", rarity: "common", xpReward: 150, badgeIcon: "🎵", thresholds: [1] },
  { id: "commerce-nft-holder", title: "NFT Holder", description: "Hold an NFT ticket", category: "commerce", rarity: "rare", xpReward: 500, badgeIcon: "🔷" },
  // Milestone
  { id: "milestone-profile", title: "Fully Armed", description: "Complete your profile", category: "milestone", rarity: "common", xpReward: 500, badgeIcon: "✅" },
  { id: "milestone-1-year", title: "Anniversary", description: "1 year on TMI platform", category: "milestone", rarity: "rare", xpReward: 750, badgeIcon: "🎂" },
];

const _catalogMap = new Map<string, Achievement>(ACHIEVEMENT_CATALOG.map((a) => [a.id, a]));

export class AchievementEngine {
  private readonly progress: Map<string, Map<string, AchievementProgress>> = new Map();
  private readonly unlockListeners: Array<(event: AchievementUnlockEvent) => void> = [];

  onUnlock(listener: (event: AchievementUnlockEvent) => void): void {
    this.unlockListeners.push(listener);
  }

  private emit(event: AchievementUnlockEvent): void {
    for (const listener of this.unlockListeners) listener(event);
  }

  private getUserProgress(userId: string): Map<string, AchievementProgress> {
    if (!this.progress.has(userId)) this.progress.set(userId, new Map());
    return this.progress.get(userId)!;
  }

  increment(userId: string, achievementId: string, amount: number = 1): AchievementUnlockEvent[] {
    const achievement = _catalogMap.get(achievementId);
    if (!achievement) return [];

    const userProgress = this.getUserProgress(userId);
    let prog = userProgress.get(achievementId);
    if (!prog) {
      prog = {
        achievementId,
        userId,
        currentCount: 0,
        unlockedTiers: [],
        firstUnlockedAtMs: null,
        lastUnlockedAtMs: null,
      };
      userProgress.set(achievementId, prog);
    }

    prog.currentCount += amount;

    const events: AchievementUnlockEvent[] = [];
    const thresholds = achievement.thresholds ?? [];

    for (let t = 0; t < thresholds.length; t++) {
      if (prog.currentCount >= thresholds[t] && !prog.unlockedTiers.includes(t)) {
        prog.unlockedTiers.push(t);
        const now = Date.now();
        prog.firstUnlockedAtMs = prog.firstUnlockedAtMs ?? now;
        prog.lastUnlockedAtMs = now;

        const event: AchievementUnlockEvent = {
          userId,
          achievement,
          tier: thresholds.length > 1 ? t + 1 : null,
          xpAwarded: achievement.xpReward,
          unlockedAtMs: now,
        };
        events.push(event);
        this.emit(event);
      }
    }

    // Achievements without thresholds (one-shot)
    if (thresholds.length === 0 && prog.currentCount >= 1 && prog.unlockedTiers.length === 0) {
      prog.unlockedTiers.push(0);
      const now = Date.now();
      prog.firstUnlockedAtMs = now;
      prog.lastUnlockedAtMs = now;

      const event: AchievementUnlockEvent = {
        userId,
        achievement,
        tier: null,
        xpAwarded: achievement.xpReward,
        unlockedAtMs: now,
      };
      events.push(event);
      this.emit(event);
    }

    return events;
  }

  isUnlocked(userId: string, achievementId: string): boolean {
    return (this.getUserProgress(userId).get(achievementId)?.unlockedTiers.length ?? 0) > 0;
  }

  getProgress(userId: string, achievementId: string): AchievementProgress | null {
    return this.getUserProgress(userId).get(achievementId) ?? null;
  }

  getAllUnlocked(userId: string): Achievement[] {
    const userProgress = this.getUserProgress(userId);
    const result: Achievement[] = [];
    for (const [id, prog] of userProgress.entries()) {
      if (prog.unlockedTiers.length > 0) {
        const a = _catalogMap.get(id);
        if (a) result.push(a);
      }
    }
    return result;
  }

  lookup(achievementId: string): Achievement | null {
    return _catalogMap.get(achievementId) ?? null;
  }
}

export const achievementEngine = new AchievementEngine();
