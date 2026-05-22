/**
 * TMIXPRankingEngine.ts + TMIXPDisplay.tsx
 * XP, ranking, achievement, and season progression engine for TMI.
 *
 * Drop at:
 *   apps/web/src/lib/xp/TMIXPRankingEngine.ts
 *   apps/web/src/components/rewards/TMIXPDisplay.tsx
 *
 * XP Sources (amounts from Marcel's platform design):
 *   READ_ARTICLE      +10–40 XP  (variable reward)
 *   JOIN_STAGE        +30–80 XP
 *   LOGIN_DAILY       +20–35 XP
 *   WIN_BATTLE        +200–500 XP (based on crowd vote %)
 *   WIN_CHALLENGE     +100–300 XP
 *   TIP_RECEIVED      +50 XP per $1 tipped to performer
 *   BEAT_SOLD         +150 XP per sale
 *   NFT_SOLD          +300 XP per NFT
 *   FOLLOW_GAINED     +10 XP per new follower
 *   RARE_DROP (5% chance): 3× multiplier
 *
 * Tier thresholds (XP → Tier):
 *   0         → Free
 *   1,000     → Silver
 *   5,000     → Gold
 *   15,000    → Platinum
 *   50,000    → Diamond
 *
 * Achievement system: 40+ achievements
 * Leaderboard: top 100 users by XP, refreshed every hour
 */

/* ─── Types ─────────────────────────────────────────────────────────────── */
export type XPAction =
  | "READ_ARTICLE" | "JOIN_STAGE" | "LOGIN_DAILY"
  | "WIN_BATTLE" | "WIN_CHALLENGE" | "LOSE_BATTLE"
  | "TIP_RECEIVED" | "TIP_SENT"
  | "BEAT_SOLD" | "NFT_SOLD" | "BEAT_PURCHASED" | "NFT_PURCHASED"
  | "FOLLOW_GAINED" | "FOLLOW_GIVEN"
  | "BATTLE_ENTERED" | "CHALLENGE_ENTERED"
  | "SHOUTOUT_SENT" | "SHOUTOUT_RECEIVED"
  | "ROOM_CREATED" | "ROOM_JOINED"
  | "MAGAZINE_FEATURED" | "SPONSOR_DEAL"
  | "RARE_DROP";

export type SubscriptionTier = "free" | "silver" | "gold" | "platinum" | "diamond";

export interface XPEvent {
  id: string;
  userId: string;
  action: XPAction;
  xpGained: number;
  creditsGained: number;
  multiplier: number;
  isRareDrop: boolean;
  timestamp: string;
  meta?: Record<string, unknown>;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  creditsReward: number;
  rarity: "common" | "rare" | "epic" | "legendary";
  category: "social" | "battle" | "economic" | "exploration" | "creator";
  condition: (stats: UserStats) => boolean;
  isLimited: boolean;   // limited edition — not everyone can get it
  brandId?: string;     // brand-associated achievement
}

export interface UserStats {
  totalXP: number;
  totalCredits: number;
  tier: SubscriptionTier;
  level: number;
  battlesWon: number;
  battlesLost: number;
  challengesWon: number;
  challengesLost: number;
  totalTipsReceived: number;
  totalTipsSent: number;
  beatsSold: number;
  nftsSold: number;
  followersCount: number;
  daysStreak: number;
  roomsCreated: number;
  articlesRead: number;
  achievementIds: string[];
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  tier: SubscriptionTier;
  totalXP: number;
  level: number;
  battlesWon: number;
  avatarColor: string;
  hasCrown: boolean;
  hasBelt: boolean;
  changeFromYesterday: number;  // +/-
}

/* ─── XP values (variable range for excitement) ─────────────────────────── */
const XP_RANGES: Record<XPAction, [number, number]> = {
  READ_ARTICLE:        [10, 40],
  JOIN_STAGE:          [30, 80],
  LOGIN_DAILY:         [20, 35],
  WIN_BATTLE:          [200, 500],
  WIN_CHALLENGE:       [100, 300],
  LOSE_BATTLE:         [25, 50],
  TIP_RECEIVED:        [40, 60],
  TIP_SENT:            [5, 15],
  BEAT_SOLD:           [120, 180],
  NFT_SOLD:            [250, 350],
  BEAT_PURCHASED:      [10, 20],
  NFT_PURCHASED:       [20, 40],
  FOLLOW_GAINED:       [8, 12],
  FOLLOW_GIVEN:        [2, 5],
  BATTLE_ENTERED:      [10, 25],
  CHALLENGE_ENTERED:   [10, 20],
  SHOUTOUT_SENT:       [15, 30],
  SHOUTOUT_RECEIVED:   [50, 100],
  ROOM_CREATED:        [20, 40],
  ROOM_JOINED:         [5, 15],
  MAGAZINE_FEATURED:   [500, 1000],
  SPONSOR_DEAL:        [1000, 2000],
  RARE_DROP:           [0, 0],   // multiplier only
};

const CREDIT_RATIOS: Partial<Record<XPAction, number>> = {
  READ_ARTICLE: 0.25,
  JOIN_STAGE:   0.5,
  LOGIN_DAILY:  0.75,
  TIP_RECEIVED: 1.0,
  WIN_BATTLE:   2.0,
  BEAT_SOLD:    0,   // handled by revenue engine
};

const RARE_DROP_CHANCE = 0.05;   // 5%
const RARE_DROP_MULTIPLIER = 3;

/* ─── Tier thresholds ─────────────────────────────────────────────────────── */
const TIER_XP: Record<SubscriptionTier, number> = {
  free:     0,
  silver:   1_000,
  gold:     5_000,
  platinum: 15_000,
  diamond:  50_000,
};

/* ─── Level calculation (50 levels) ──────────────────────────────────────── */
function calculateLevel(xp: number): number {
  // XP to level: Level N requires N^2 * 100 XP total
  for (let level = 50; level >= 1; level--) {
    if (xp >= level * level * 100) return level;
  }
  return 1;
}

function xpForNextLevel(currentLevel: number): number {
  return (currentLevel + 1) * (currentLevel + 1) * 100;
}

function tierFromXP(xp: number): SubscriptionTier {
  if (xp >= TIER_XP.diamond)  return "diamond";
  if (xp >= TIER_XP.platinum) return "platinum";
  if (xp >= TIER_XP.gold)     return "gold";
  if (xp >= TIER_XP.silver)   return "silver";
  return "free";
}

/* ─── Achievement registry ────────────────────────────────────────────────── */
export const ACHIEVEMENTS: Achievement[] = [
  /* Social */
  { id: "first_follow",   title: "First Fan",         description: "Gain your first follower", icon: "👤", xpReward: 50,   creditsReward: 10,  rarity: "common",    category: "social",      isLimited: false, condition: (s) => s.followersCount >= 1 },
  { id: "100_followers",  title: "Rising Star",       description: "100 followers",            icon: "⭐", xpReward: 500,  creditsReward: 100, rarity: "rare",      category: "social",      isLimited: false, condition: (s) => s.followersCount >= 100 },
  { id: "1k_followers",   title: "TMI Star",          description: "1,000 followers",          icon: "🌟", xpReward: 2000, creditsReward: 500, rarity: "epic",      category: "social",      isLimited: false, condition: (s) => s.followersCount >= 1000 },
  { id: "streak_7",       title: "Week Warrior",      description: "7-day login streak",       icon: "🔥", xpReward: 200,  creditsReward: 50,  rarity: "common",    category: "exploration", isLimited: false, condition: (s) => s.daysStreak >= 7 },
  { id: "streak_30",      title: "Monthly Grinder",   description: "30-day login streak",      icon: "💪", xpReward: 1000, creditsReward: 250, rarity: "rare",      category: "exploration", isLimited: false, condition: (s) => s.daysStreak >= 30 },

  /* Battle */
  { id: "first_battle",   title: "Entered the Arena", description: "Enter your first battle", icon: "⚔️", xpReward: 100,  creditsReward: 25,  rarity: "common",    category: "battle",      isLimited: false, condition: (s) => s.battlesWon + s.battlesLost >= 1 },
  { id: "win_10",         title: "Battle Tested",     description: "Win 10 battles",          icon: "🏆", xpReward: 500,  creditsReward: 150, rarity: "rare",      category: "battle",      isLimited: false, condition: (s) => s.battlesWon >= 10 },
  { id: "win_50",         title: "Champion",          description: "Win 50 battles",          icon: "👑", xpReward: 3000, creditsReward: 750, rarity: "epic",      category: "battle",      isLimited: false, condition: (s) => s.battlesWon >= 50 },
  { id: "undefeated_10",  title: "Unstoppable",       description: "Win 10 in a row",         icon: "⚡", xpReward: 1000, creditsReward: 300, rarity: "epic",      category: "battle",      isLimited: false, condition: (s) => s.battlesWon >= 10 && s.battlesLost === 0 },

  /* Economic */
  { id: "first_sale",     title: "First Dollar",      description: "Make your first sale",     icon: "💰", xpReward: 200,  creditsReward: 50,  rarity: "common",    category: "economic",    isLimited: false, condition: (s) => s.beatsSold + s.nftsSold >= 1 },
  { id: "10k_tips",       title: "Money Magnet",      description: "Receive $100 in tips",     icon: "💎", xpReward: 1000, creditsReward: 500, rarity: "rare",      category: "economic",    isLimited: false, condition: (s) => s.totalTipsReceived >= 100 },

  /* Creator */
  { id: "first_beat",     title: "In the Lab",        description: "Sell your first beat",    icon: "🎵", xpReward: 300,  creditsReward: 75,  rarity: "common",    category: "creator",     isLimited: false, condition: (s) => s.beatsSold >= 1 },
  { id: "100_beats",      title: "Beat Machine",      description: "Sell 100 beats",          icon: "🎛️", xpReward: 5000, creditsReward: 2000,rarity: "legendary", category: "creator",     isLimited: false, condition: (s) => s.beatsSold >= 100 },

  /* Limited edition */
  { id: "season1_winner", title: "Season 1 Champion", description: "Won Season 1 championship", icon: "🥇", xpReward: 10000, creditsReward: 5000, rarity: "legendary", category: "battle", isLimited: true, brandId: "TMI_Season1", condition: (s) => s.battlesWon >= 100 },
];

/* ─── TMIXPRankingEngine ─────────────────────────────────────────────────── */
export class TMIXPRankingEngine {
  private userStats: UserStats;

  constructor(stats: UserStats) {
    this.userStats = { ...stats };
  }

  /** Calculate XP gained for an action */
  calculateXP(action: XPAction, meta?: Record<string, unknown>): {
    xp: number;
    credits: number;
    isRareDrop: boolean;
    multiplier: number;
  } {
    const [min, max] = XP_RANGES[action] ?? [0, 0];
    const baseXP = min + Math.floor(Math.random() * (max - min + 1));

    const isRareDrop = Math.random() < RARE_DROP_CHANCE;
    const multiplier = isRareDrop ? RARE_DROP_MULTIPLIER : 1;
    const xp = Math.round(baseXP * multiplier);
    const creditRatio = CREDIT_RATIOS[action] ?? 0;
    const credits = Math.round(xp * creditRatio);

    return { xp, credits, isRareDrop, multiplier };
  }

  /** Apply XP to user stats and check for level/tier upgrades + achievements */
  applyXP(
    userId: string,
    action: XPAction,
    meta?: Record<string, unknown>
  ): {
    event: XPEvent;
    newStats: UserStats;
    newAchievements: Achievement[];
    leveledUp: boolean;
    tieredUp: boolean;
    newLevel: number;
    newTier: SubscriptionTier;
  } {
    const { xp, credits, isRareDrop, multiplier } = this.calculateXP(action, meta);
    const oldLevel = calculateLevel(this.userStats.totalXP);
    const oldTier  = tierFromXP(this.userStats.totalXP);

    // Apply
    this.userStats.totalXP += xp;
    this.userStats.totalCredits += credits;

    // Update action-specific stats
    if (action === "WIN_BATTLE")     this.userStats.battlesWon++;
    if (action === "LOSE_BATTLE")    this.userStats.battlesLost++;
    if (action === "WIN_CHALLENGE")  this.userStats.challengesWon++;
    if (action === "BEAT_SOLD")      this.userStats.beatsSold++;
    if (action === "NFT_SOLD")       this.userStats.nftsSold++;
    if (action === "FOLLOW_GAINED")  this.userStats.followersCount++;
    if (action === "READ_ARTICLE")   this.userStats.articlesRead++;
    if (action === "ROOM_CREATED")   this.userStats.roomsCreated++;

    const newLevel = calculateLevel(this.userStats.totalXP);
    const newTier  = tierFromXP(this.userStats.totalXP);

    // Check achievements
    const newAchievements = ACHIEVEMENTS.filter(
      (a) => !this.userStats.achievementIds.includes(a.id) && a.condition(this.userStats)
    );

    // Apply achievement rewards
    for (const ach of newAchievements) {
      this.userStats.totalXP += ach.xpReward;
      this.userStats.totalCredits += ach.creditsReward;
      this.userStats.achievementIds.push(ach.id);
    }

    const event: XPEvent = {
      id: `XP-${Date.now()}`,
      userId,
      action,
      xpGained: xp,
      creditsGained: credits,
      multiplier,
      isRareDrop,
      timestamp: new Date().toISOString(),
      meta,
    };

    return {
      event,
      newStats: { ...this.userStats },
      newAchievements,
      leveledUp: newLevel > oldLevel,
      tieredUp:  newTier !== oldTier,
      newLevel,
      newTier,
    };
  }

  getLevel(): number { return calculateLevel(this.userStats.totalXP); }
  getTier(): SubscriptionTier { return tierFromXP(this.userStats.totalXP); }
  getProgressToNextLevel(): number {
    const level = this.getLevel();
    const current = this.userStats.totalXP;
    const currentLevelXP = level * level * 100;
    const nextLevelXP = xpForNextLevel(level);
    return Math.max(0, Math.min(1, (current - currentLevelXP) / (nextLevelXP - currentLevelXP)));
  }
}

/* ═══════════════════════════════════════════════════════
   React display components live in:
   apps/web/src/components/xp/TMIXPDisplay.tsx
   ═══════════════════════════════════════════════════════ */
