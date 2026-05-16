/**
 * Achievement Engine
 * Unlock-based achievement system with XP rewards and condition matching.
 */

export type AchievementCategory =
  | 'PERFORMANCE'
  | 'SOCIAL'
  | 'ECONOMY'
  | 'SHOW'
  | 'LOYALTY'
  | 'MILESTONE';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  xpReward: number;
  iconEmoji: string;
  unlockCondition: string;
}

export interface UserAchievement {
  achievementId: string;
  userId: string;
  unlockedAt: number;
  xpEarned: number;
}

export const ACHIEVEMENT_CATALOG: Achievement[] = [
  { id: 'ach-first-show', name: 'Show Starter', description: 'Attend your first TMI show.', category: 'SHOW', xpReward: 50, iconEmoji: '🎬', unlockCondition: 'first_show_attended' },
  { id: 'ach-first-win', name: 'First W', description: 'Win your first contest.', category: 'PERFORMANCE', xpReward: 100, iconEmoji: '🏆', unlockCondition: 'first_contest_won' },
  { id: 'ach-crowd-yay', name: 'Crowd Pleaser', description: 'Receive 10 crowd yay votes in a single performance.', category: 'PERFORMANCE', xpReward: 75, iconEmoji: '👏', unlockCondition: 'crowd_yay_10' },
  { id: 'ach-survive-bebo', name: 'Bebo Survivor', description: 'Get hooked by Bebo and return to the stage.', category: 'PERFORMANCE', xpReward: 120, iconEmoji: '🎣', unlockCondition: 'survived_bebo_hook' },
  { id: 'ach-idol-finalist', name: 'Idol Finalist', description: 'Reach the Monthly Idol finals.', category: 'SHOW', xpReward: 200, iconEmoji: '⭐', unlockCondition: 'idol_finals_reached' },
  { id: 'ach-monthly-idol', name: 'Monthly Idol', description: 'Crown yourself as a Monthly Idol champion.', category: 'MILESTONE', xpReward: 500, iconEmoji: '👑', unlockCondition: 'monthly_idol_crowned' },
  { id: 'ach-5-shows', name: 'Regulars Only', description: 'Attend 5 different TMI shows.', category: 'LOYALTY', xpReward: 150, iconEmoji: '🎟️', unlockCondition: 'shows_attended_5' },
  { id: 'ach-first-nft', name: 'NFT Collector', description: 'Mint your first TMI NFT.', category: 'ECONOMY', xpReward: 80, iconEmoji: '🖼️', unlockCondition: 'first_nft_minted' },
  { id: 'ach-friend-invite', name: 'Bring A Friend', description: 'Invite a friend to join your seat group.', category: 'SOCIAL', xpReward: 60, iconEmoji: '🤝', unlockCondition: 'friend_invited' },
  { id: 'ach-perfect-score', name: 'Perfect Score', description: 'Score 100% on a Name That Tune round.', category: 'PERFORMANCE', xpReward: 250, iconEmoji: '🎵', unlockCondition: 'name_that_tune_perfect' },
  { id: 'ach-deal-winner', name: 'Deal Maker', description: 'Win the Deal or Feud 1000 grand prize.', category: 'SHOW', xpReward: 300, iconEmoji: '💰', unlockCondition: 'deal_or_feud_won' },
  { id: 'ach-cypher-champ', name: 'Cypher Champion', description: 'Win a Cypher Arena battle.', category: 'PERFORMANCE', xpReward: 350, iconEmoji: '🔥', unlockCondition: 'cypher_arena_won' },
  { id: 'ach-grid-pattern', name: 'Pattern Master', description: 'Achieve a winning pattern in Circle & Squares.', category: 'SHOW', xpReward: 175, iconEmoji: '⬜', unlockCondition: 'circle_squares_pattern' },
  { id: 'ach-season-pass', name: 'Season Ticket Holder', description: 'Hold an active TMI Season Pass.', category: 'LOYALTY', xpReward: 200, iconEmoji: '📋', unlockCondition: 'season_pass_active' },
  { id: 'ach-vip-upgrade', name: 'VIP Status', description: 'Upgrade to a VIP seat for the first time.', category: 'ECONOMY', xpReward: 100, iconEmoji: '💎', unlockCondition: 'vip_seat_upgraded' },
  { id: 'ach-10-wins', name: 'Ten Time Champion', description: 'Win 10 contests across all shows.', category: 'MILESTONE', xpReward: 1000, iconEmoji: '🌟', unlockCondition: 'wins_10' },
  { id: 'ach-hall-of-fame', name: 'Hall of Fame Inductee', description: 'Enter the Monthly Idol Hall of Fame.', category: 'MILESTONE', xpReward: 750, iconEmoji: '🏛️', unlockCondition: 'hall_of_fame_entered' },
  { id: 'ach-sponsor-read', name: 'Sponsor Favorite', description: 'Be named in a sponsor read by a TMI host.', category: 'SOCIAL', xpReward: 90, iconEmoji: '📢', unlockCondition: 'sponsor_featured' },
  { id: 'ach-crowd-connection', name: 'Crowd Connected', description: 'Receive yay votes from 50 unique audience members.', category: 'SOCIAL', xpReward: 180, iconEmoji: '🌐', unlockCondition: 'crowd_unique_50' },
  { id: 'ach-platform-veteran', name: 'Platform Veteran', description: 'Be active on TMI for 6 consecutive months.', category: 'LOYALTY', xpReward: 400, iconEmoji: '🎖️', unlockCondition: 'active_6_months' },
];

export class AchievementEngine {
  private catalog: Achievement[];
  private userAchievements: Map<string, UserAchievement[]>;

  constructor() {
    this.catalog = [...ACHIEVEMENT_CATALOG];
    this.userAchievements = new Map();
  }

  checkAndUnlock(userId: string, condition: string): Achievement[] {
    const eligible = this.catalog.filter((a) => a.unlockCondition === condition);
    const alreadyUnlocked = new Set(
      (this.userAchievements.get(userId) ?? []).map((ua) => ua.achievementId),
    );

    const newlyUnlocked: Achievement[] = [];
    for (const achievement of eligible) {
      if (alreadyUnlocked.has(achievement.id)) continue;

      const userAchievement: UserAchievement = {
        achievementId: achievement.id,
        userId,
        unlockedAt: Date.now(),
        xpEarned: achievement.xpReward,
      };

      const existing = this.userAchievements.get(userId) ?? [];
      existing.push(userAchievement);
      this.userAchievements.set(userId, existing);
      newlyUnlocked.push(achievement);
    }

    return newlyUnlocked;
  }

  getUserAchievements(userId: string): UserAchievement[] {
    return [...(this.userAchievements.get(userId) ?? [])];
  }

  getAchievementById(id: string): Achievement | undefined {
    return this.catalog.find((a) => a.id === id);
  }

  getTotalXP(userId: string): number {
    return (this.userAchievements.get(userId) ?? []).reduce((sum, ua) => sum + ua.xpEarned, 0);
  }
}
