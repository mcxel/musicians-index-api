/**
 * Achievement Engine — Client-Side
 * Tracks achievement definitions, unlock logic, progress tracking,
 * and badge display for the TMI Platform frontend.
 *
 * Connects to: GET /api/achievements/* endpoints
 * Fires: effectsEngine.triggerAchievement() on unlock
 */

// ─── Achievement Types ─────────────────────────────────────────────────────────

export type AchievementCategory =
  | 'social'        // Friends, messages, community
  | 'content'       // Articles, reviews, comments
  | 'live'          // Rooms, events, performances
  | 'economy'       // Points, purchases, tips
  | 'julius'        // Julius AI interactions
  | 'contest'       // Competitions, rankings
  | 'loyalty'       // Streaks, milestones
  | 'discovery'     // Exploring platform features
  | 'creator'       // Artist-specific achievements
  | 'legendary';    // Rare, platform-wide

export type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type AchievementTrigger =
  | 'count'         // Triggered when count reaches threshold
  | 'streak'        // Triggered on consecutive days/actions
  | 'milestone'     // One-time milestone
  | 'special'       // Special event or admin-granted
  | 'combination';  // Multiple conditions met

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  trigger: AchievementTrigger;
  icon: string;           // Emoji or icon identifier
  badgeColor: string;     // Hex color for badge
  pointsReward: number;   // Points awarded on unlock
  threshold?: number;     // For count/streak triggers
  secret?: boolean;       // Hidden until unlocked
  tags: string[];
}

export interface AchievementProgress {
  achievementId: string;
  current: number;
  target: number;
  percentage: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface UserAchievementState {
  userId: string;
  unlocked: string[];           // Achievement IDs
  progress: Record<string, AchievementProgress>;
  totalPoints: number;
  lastUnlockedAt?: string;
}

// ─── Achievement Registry ──────────────────────────────────────────────────────

export const ACHIEVEMENT_REGISTRY: Record<string, AchievementDefinition> = {
  // ── Social ─────────────────────────────────────────────────────────────────
  FIRST_FRIEND: {
    id: 'FIRST_FRIEND',
    name: 'First Connection',
    description: 'Add your first friend on TMI',
    category: 'social',
    rarity: 'common',
    trigger: 'milestone',
    icon: '🤝',
    badgeColor: '#3b82f6',
    pointsReward: 15,
    tags: ['social', 'friends', 'starter'],
  },
  SOCIAL_BUTTERFLY: {
    id: 'SOCIAL_BUTTERFLY',
    name: 'Social Butterfly',
    description: 'Add 25 friends',
    category: 'social',
    rarity: 'uncommon',
    trigger: 'count',
    threshold: 25,
    icon: '🦋',
    badgeColor: '#8b5cf6',
    pointsReward: 100,
    tags: ['social', 'friends'],
  },
  CONNECTOR: {
    id: 'CONNECTOR',
    name: 'Connector',
    description: 'Add 100 friends',
    category: 'social',
    rarity: 'rare',
    trigger: 'count',
    threshold: 100,
    icon: '🌐',
    badgeColor: '#06b6d4',
    pointsReward: 500,
    tags: ['social', 'friends', 'network'],
  },
  FIRST_MESSAGE: {
    id: 'FIRST_MESSAGE',
    name: 'Say Hello',
    description: 'Send your first message',
    category: 'social',
    rarity: 'common',
    trigger: 'milestone',
    icon: '💬',
    badgeColor: '#10b981',
    pointsReward: 5,
    tags: ['social', 'messages', 'starter'],
  },

  // ── Content ────────────────────────────────────────────────────────────────
  FIRST_READ: {
    id: 'FIRST_READ',
    name: 'First Read',
    description: 'Read your first article',
    category: 'content',
    rarity: 'common',
    trigger: 'milestone',
    icon: '📖',
    badgeColor: '#f59e0b',
    pointsReward: 2,
    tags: ['content', 'articles', 'starter'],
  },
  BOOKWORM: {
    id: 'BOOKWORM',
    name: 'Bookworm',
    description: 'Read 50 articles',
    category: 'content',
    rarity: 'uncommon',
    trigger: 'count',
    threshold: 50,
    icon: '📚',
    badgeColor: '#f59e0b',
    pointsReward: 100,
    tags: ['content', 'articles'],
  },
  CRITIC: {
    id: 'CRITIC',
    name: 'The Critic',
    description: 'Post 25 comments',
    category: 'content',
    rarity: 'uncommon',
    trigger: 'count',
    threshold: 25,
    icon: '✍️',
    badgeColor: '#6b7280',
    pointsReward: 125,
    tags: ['content', 'comments'],
  },
  SHARE_MASTER: {
    id: 'SHARE_MASTER',
    name: 'Share Master',
    description: 'Share 10 articles',
    category: 'content',
    rarity: 'common',
    trigger: 'count',
    threshold: 10,
    icon: '📤',
    badgeColor: '#3b82f6',
    pointsReward: 100,
    tags: ['content', 'sharing'],
  },

  // ── Live ───────────────────────────────────────────────────────────────────
  FIRST_ROOM: {
    id: 'FIRST_ROOM',
    name: 'Room Debut',
    description: 'Join your first room',
    category: 'live',
    rarity: 'common',
    trigger: 'milestone',
    icon: '🎭',
    badgeColor: '#ef4444',
    pointsReward: 5,
    tags: ['live', 'rooms', 'starter'],
  },
  ROOM_REGULAR: {
    id: 'ROOM_REGULAR',
    name: 'Room Regular',
    description: 'Join 50 rooms',
    category: 'live',
    rarity: 'uncommon',
    trigger: 'count',
    threshold: 50,
    icon: '🎪',
    badgeColor: '#ef4444',
    pointsReward: 250,
    tags: ['live', 'rooms'],
  },
  FIRST_HOST: {
    id: 'FIRST_HOST',
    name: 'First Host',
    description: 'Host your first room',
    category: 'live',
    rarity: 'uncommon',
    trigger: 'milestone',
    icon: '🎙️',
    badgeColor: '#8b5cf6',
    pointsReward: 25,
    tags: ['live', 'hosting', 'creator'],
  },
  EVENT_GOER: {
    id: 'EVENT_GOER',
    name: 'Event Goer',
    description: 'Attend 10 events',
    category: 'live',
    rarity: 'uncommon',
    trigger: 'count',
    threshold: 10,
    icon: '🎟️',
    badgeColor: '#f59e0b',
    pointsReward: 500,
    tags: ['live', 'events'],
  },

  // ── Economy ────────────────────────────────────────────────────────────────
  FIRST_POINTS: {
    id: 'FIRST_POINTS',
    name: 'Point Collector',
    description: 'Earn your first points',
    category: 'economy',
    rarity: 'common',
    trigger: 'milestone',
    icon: '⭐',
    badgeColor: '#f59e0b',
    pointsReward: 10,
    tags: ['economy', 'points', 'starter'],
  },
  HIGH_ROLLER: {
    id: 'HIGH_ROLLER',
    name: 'High Roller',
    description: 'Accumulate 10,000 points',
    category: 'economy',
    rarity: 'rare',
    trigger: 'count',
    threshold: 10000,
    icon: '💰',
    badgeColor: '#f59e0b',
    pointsReward: 1000,
    tags: ['economy', 'points', 'milestone'],
  },
  GENEROUS: {
    id: 'GENEROUS',
    name: 'Generous Soul',
    description: 'Send 10 tips to artists',
    category: 'economy',
    rarity: 'uncommon',
    trigger: 'count',
    threshold: 10,
    icon: '💝',
    badgeColor: '#ec4899',
    pointsReward: 50,
    tags: ['economy', 'tips', 'social'],
  },
  FIRST_PURCHASE: {
    id: 'FIRST_PURCHASE',
    name: 'First Purchase',
    description: 'Make your first store purchase',
    category: 'economy',
    rarity: 'common',
    trigger: 'milestone',
    icon: '🛍️',
    badgeColor: '#10b981',
    pointsReward: 1,
    tags: ['economy', 'store', 'starter'],
  },

  // ── Julius ─────────────────────────────────────────────────────────────────
  JULIUS_HELLO: {
    id: 'JULIUS_HELLO',
    name: 'Julius Says Hi',
    description: 'Interact with Julius for the first time',
    category: 'julius',
    rarity: 'common',
    trigger: 'milestone',
    icon: '🤖',
    badgeColor: '#f59e0b',
    pointsReward: 3,
    tags: ['julius', 'ai', 'starter'],
  },
  JULIUS_FRIEND: {
    id: 'JULIUS_FRIEND',
    name: 'Julius Friend',
    description: 'Interact with Julius 100 times',
    category: 'julius',
    rarity: 'rare',
    trigger: 'count',
    threshold: 100,
    icon: '🤖',
    badgeColor: '#8b5cf6',
    pointsReward: 300,
    tags: ['julius', 'ai'],
  },

  // ── Contest ────────────────────────────────────────────────────────────────
  FIRST_CONTEST: {
    id: 'FIRST_CONTEST',
    name: 'Contestant',
    description: 'Enter your first contest',
    category: 'contest',
    rarity: 'common',
    trigger: 'milestone',
    icon: '🏆',
    badgeColor: '#f59e0b',
    pointsReward: 20,
    tags: ['contest', 'competition', 'starter'],
  },
  CHAMPION: {
    id: 'CHAMPION',
    name: 'Champion',
    description: 'Win a contest',
    category: 'contest',
    rarity: 'epic',
    trigger: 'milestone',
    icon: '🥇',
    badgeColor: '#f59e0b',
    pointsReward: 500,
    tags: ['contest', 'winner', 'elite'],
  },

  // ── Loyalty ────────────────────────────────────────────────────────────────
  DAILY_STREAK_7: {
    id: 'DAILY_STREAK_7',
    name: '7-Day Streak',
    description: 'Log in 7 days in a row',
    category: 'loyalty',
    rarity: 'common',
    trigger: 'streak',
    threshold: 7,
    icon: '🔥',
    badgeColor: '#ef4444',
    pointsReward: 70,
    tags: ['loyalty', 'streak', 'daily'],
  },
  DAILY_STREAK_30: {
    id: 'DAILY_STREAK_30',
    name: '30-Day Streak',
    description: 'Log in 30 days in a row',
    category: 'loyalty',
    rarity: 'rare',
    trigger: 'streak',
    threshold: 30,
    icon: '🔥',
    badgeColor: '#f59e0b',
    pointsReward: 300,
    tags: ['loyalty', 'streak', 'daily'],
  },
  DAILY_STREAK_100: {
    id: 'DAILY_STREAK_100',
    name: 'Century Streak',
    description: 'Log in 100 days in a row',
    category: 'loyalty',
    rarity: 'legendary',
    trigger: 'streak',
    threshold: 100,
    icon: '💯',
    badgeColor: '#8b5cf6',
    pointsReward: 1000,
    tags: ['loyalty', 'streak', 'legendary'],
  },

  // ── Legendary ──────────────────────────────────────────────────────────────
  PLATFORM_PIONEER: {
    id: 'PLATFORM_PIONEER',
    name: 'Platform Pioneer',
    description: 'One of the first 1,000 members on TMI',
    category: 'legendary',
    rarity: 'legendary',
    trigger: 'special',
    icon: '🌟',
    badgeColor: '#f59e0b',
    pointsReward: 2000,
    secret: false,
    tags: ['legendary', 'pioneer', 'founding'],
  },
  COMPLETIONIST: {
    id: 'COMPLETIONIST',
    name: 'Completionist',
    description: 'Unlock 50 achievements',
    category: 'legendary',
    rarity: 'legendary',
    trigger: 'count',
    threshold: 50,
    icon: '🏅',
    badgeColor: '#8b5cf6',
    pointsReward: 5000,
    tags: ['legendary', 'completionist'],
  },
};

// ─── Achievement Engine Class ──────────────────────────────────────────────────

export class AchievementEngine {
  private baseUrl: string;
  private listeners: Set<(achievement: AchievementDefinition) => void> = new Set();

  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
  }

  // ─── Registry ──────────────────────────────────────────────────────────────

  getAchievement(id: string): AchievementDefinition | undefined {
    return ACHIEVEMENT_REGISTRY[id];
  }

  getAllAchievements(): AchievementDefinition[] {
    return Object.values(ACHIEVEMENT_REGISTRY);
  }

  getByCategory(category: AchievementCategory): AchievementDefinition[] {
    return Object.values(ACHIEVEMENT_REGISTRY).filter(a => a.category === category);
  }

  getByRarity(rarity: AchievementRarity): AchievementDefinition[] {
    return Object.values(ACHIEVEMENT_REGISTRY).filter(a => a.rarity === rarity);
  }

  getVisible(): AchievementDefinition[] {
    return Object.values(ACHIEVEMENT_REGISTRY).filter(a => !a.secret);
  }

  // ─── Progress Calculation ───────────────────────────────────────────────────

  calculateProgress(achievementId: string, currentValue: number): AchievementProgress {
    const def = ACHIEVEMENT_REGISTRY[achievementId];
    if (!def) {
      return { achievementId, current: 0, target: 1, percentage: 0, unlocked: false };
    }

    const target = def.threshold ?? 1;
    const current = Math.min(currentValue, target);
    const percentage = Math.round((current / target) * 100);
    const unlocked = current >= target;

    return { achievementId, current, target, percentage, unlocked };
  }

  isUnlocked(achievementId: string, state: UserAchievementState): boolean {
    return state.unlocked.includes(achievementId);
  }

  getUnlockedCount(state: UserAchievementState): number {
    return state.unlocked.length;
  }

  getTotalCount(): number {
    return Object.keys(ACHIEVEMENT_REGISTRY).length;
  }

  getCompletionPercentage(state: UserAchievementState): number {
    return Math.round((state.unlocked.length / this.getTotalCount()) * 100);
  }

  // ─── Rarity Display ────────────────────────────────────────────────────────

  getRarityLabel(rarity: AchievementRarity): string {
    const labels: Record<AchievementRarity, string> = {
      common:    'Common',
      uncommon:  'Uncommon',
      rare:      'Rare',
      epic:      'Epic',
      legendary: 'Legendary',
    };
    return labels[rarity];
  }

  getRarityColor(rarity: AchievementRarity): string {
    const colors: Record<AchievementRarity, string> = {
      common:    '#6b7280',
      uncommon:  '#10b981',
      rare:      '#3b82f6',
      epic:      '#8b5cf6',
      legendary: '#f59e0b',
    };
    return colors[rarity];
  }

  getRarityGlow(rarity: AchievementRarity): string {
    const glows: Record<AchievementRarity, string> = {
      common:    'none',
      uncommon:  '0 0 8px #10b981',
      rare:      '0 0 12px #3b82f6',
      epic:      '0 0 16px #8b5cf6',
      legendary: '0 0 24px #f59e0b, 0 0 48px #f59e0b40',
    };
    return glows[rarity];
  }

  // ─── Unlock Notification ───────────────────────────────────────────────────

  onUnlock(listener: (achievement: AchievementDefinition) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyUnlock(achievementId: string): void {
    const def = ACHIEVEMENT_REGISTRY[achievementId];
    if (def) {
      this.listeners.forEach(l => l(def));
    }
  }

  // ─── API Calls ──────────────────────────────────────────────────────────────

  async fetchUserAchievements(userId?: string): Promise<UserAchievementState> {
    const url = userId
      ? `${this.baseUrl}/achievements/user/${userId}`
      : `${this.baseUrl}/achievements/me`;
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error(`Failed to fetch achievements: ${res.status}`);
    return res.json();
  }

  async fetchLeaderboard(limit = 20): Promise<Array<{ userId: string; count: number; rank: number }>> {
    const res = await fetch(`${this.baseUrl}/achievements/leaderboard?limit=${limit}`);
    if (!res.ok) throw new Error(`Failed to fetch achievement leaderboard: ${res.status}`);
    return res.json();
  }

  // ─── Sort & Filter Helpers ─────────────────────────────────────────────────

  sortByRarity(achievements: AchievementDefinition[]): AchievementDefinition[] {
    const order: AchievementRarity[] = ['legendary', 'epic', 'rare', 'uncommon', 'common'];
    return [...achievements].sort((a, b) => order.indexOf(a.rarity) - order.indexOf(b.rarity));
  }

  filterUnlocked(
    achievements: AchievementDefinition[],
    state: UserAchievementState,
  ): AchievementDefinition[] {
    return achievements.filter(a => state.unlocked.includes(a.id));
  }

  filterLocked(
    achievements: AchievementDefinition[],
    state: UserAchievementState,
  ): AchievementDefinition[] {
    return achievements.filter(a => !state.unlocked.includes(a.id) && !a.secret);
  }

  getNextToUnlock(state: UserAchievementState): AchievementDefinition[] {
    return Object.values(ACHIEVEMENT_REGISTRY)
      .filter(a => !state.unlocked.includes(a.id) && !a.secret)
      .filter(a => {
        const progress = state.progress[a.id];
        return progress && progress.percentage >= 50;
      })
      .slice(0, 5);
  }
}

// ─── Singleton Export ──────────────────────────────────────────────────────────

export const achievementEngine = new AchievementEngine();

export function useAchievementEngine(): AchievementEngine {
  return achievementEngine;
}
