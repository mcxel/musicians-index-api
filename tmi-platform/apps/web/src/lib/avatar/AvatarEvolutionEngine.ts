// Re-export facade for components that expect these from AvatarEvolutionEngine.
// New components use CharacterEvolutionEngine's numeric EvolutionTier (0-6).
// TIER_XP_THRESHOLDS is re-exported as TIER_THRESHOLDS for component compatibility.
export {
  DANCE_MOVES,
  TIER_COLORS,
  TIER_NAMES,
  TIER_UNLOCKS,
  getOrCreateEvolution,
  awardXP,
} from './CharacterEvolutionEngine';

export { TIER_XP_THRESHOLDS as TIER_THRESHOLDS } from './CharacterEvolutionEngine';

export type {
  CharacterEvolutionState,
  DanceMove,
  EvolutionTier,
  TierUnlock,
  XPEventType,
} from './CharacterEvolutionEngine';

/**
 * AvatarEvolutionEngine — XP progression for TMI users and hero characters
 *
 * XP is earned by:
 *   Watch event        +5 XP
 *   Tip an artist      +15 XP
 *   Vote in battle     +10 XP
 *   Upload media       +25 XP
 *   Win battle         +100 XP
 *   Win challenge      +80 XP
 *   Share mixtape      +30 XP
 *   Create memory      +10 XP
 *   Subscribe          +50 XP (one-time per tier)
 *   Daily login        +3 XP
 *
 * Evolution tiers: Rookie → Rising → Established → Star → Legend → Icon
 *
 * P10B: In-memory store for soft launch. Replace with Neon DB writes post-launch.
 */

import { resolveEvolutionTier, getXpToNextTier, HERO_REGISTRY, type EvolutionTier } from "./HeroRegistry";

export type XpEvent =
  | "watch_event"
  | "tip_artist"
  | "vote_battle"
  | "upload_media"
  | "win_battle"
  | "win_challenge"
  | "share_mixtape"
  | "create_memory"
  | "subscribe"
  | "daily_login"
  | "enter_venue"
  | "join_cypher"
  | "capture_moment";

export const XP_VALUES: Record<XpEvent, number> = {
  watch_event:      5,
  tip_artist:       15,
  vote_battle:      10,
  upload_media:     25,
  win_battle:       100,
  win_challenge:    80,
  share_mixtape:    30,
  create_memory:    10,
  subscribe:        50,
  daily_login:      3,
  enter_venue:      2,
  join_cypher:      12,
  capture_moment:   8,
};

export interface UserEvolutionState {
  userId:          string;
  displayName:     string;
  totalXp:         number;
  tier:            EvolutionTier;
  heroId?:         string;   // linked hero character (if any)
  achievements:    string[];
  history:         XpHistoryEntry[];
  lastLoginDate?:  string;
  createdAt:       string;
  updatedAt:       string;
}

export interface XpHistoryEntry {
  event:     XpEvent;
  xp:        number;
  entityId?: string;
  ts:        string;
}

export interface XpAwardResult {
  userId:        string;
  event:         XpEvent;
  xpAwarded:     number;
  totalXp:       number;
  tier:          EvolutionTier;
  tierChanged:   boolean;
  newTier?:      EvolutionTier;
  achievement?:  string;
}

// ── In-memory store ──────────────────────────────────────────────────────────
const EVOLUTION_STORE = new Map<string, UserEvolutionState>();

// ── Achievements (unlocked at XP milestones) ─────────────────────────────────
const ACHIEVEMENTS: { xp: number; id: string; label: string }[] = [
  { xp: 50,      id: "first_steps",       label: "First Steps"       },
  { xp: 500,     id: "fan_level",         label: "Fan Level"         },
  { xp: 1_000,   id: "rising_star",       label: "Rising Star"       },
  { xp: 5_000,   id: "established",       label: "Established"       },
  { xp: 10_000,  id: "crowd_favorite",    label: "Crowd Favorite"    },
  { xp: 15_000,  id: "on_the_map",        label: "On The Map"        },
  { xp: 40_000,  id: "legend_status",     label: "Legend Status"     },
  { xp: 100_000, id: "icon_ascension",    label: "Icon Ascension"    },
];

function checkAchievements(prevXp: number, newXp: number): string | undefined {
  for (const ach of ACHIEVEMENTS) {
    if (prevXp < ach.xp && newXp >= ach.xp) return ach.label;
  }
  return undefined;
}

// ── Core engine ───────────────────────────────────────────────────────────────
export class AvatarEvolutionEngineClass {
  private static instance: AvatarEvolutionEngineClass | null = null;
  static getInstance(): AvatarEvolutionEngineClass {
    if (!this.instance) this.instance = new AvatarEvolutionEngineClass();
    return this.instance;
  }

  getOrCreate(userId: string, displayName = "User"): UserEvolutionState {
    if (!EVOLUTION_STORE.has(userId)) {
      EVOLUTION_STORE.set(userId, {
        userId,
        displayName,
        totalXp: 0,
        tier: "Rookie",
        achievements: [],
        history: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    return EVOLUTION_STORE.get(userId)!;
  }

  awardXp(userId: string, event: XpEvent, entityId?: string): XpAwardResult {
    const state = this.getOrCreate(userId);
    const xpAwarded = XP_VALUES[event] ?? 0;
    const prevXp = state.totalXp;
    const prevTier = state.tier;
    const newXp = prevXp + xpAwarded;
    const newTier = resolveEvolutionTier(newXp);
    const tierChanged = newTier !== prevTier;
    const achievement = checkAchievements(prevXp, newXp);

    const entry: XpHistoryEntry = {
      event, xp: xpAwarded,
      entityId,
      ts: new Date().toISOString(),
    };

    const updated: UserEvolutionState = {
      ...state,
      totalXp: newXp,
      tier: newTier,
      achievements: achievement ? [...state.achievements, achievement] : state.achievements,
      history: [entry, ...state.history.slice(0, 99)], // keep last 100
      updatedAt: new Date().toISOString(),
    };

    EVOLUTION_STORE.set(userId, updated);

    return { userId, event, xpAwarded, totalXp: newXp, tier: newTier, tierChanged, newTier: tierChanged ? newTier : undefined, achievement };
  }

  getState(userId: string): UserEvolutionState | null {
    return EVOLUTION_STORE.get(userId) ?? null;
  }

  getTier(userId: string): EvolutionTier {
    return EVOLUTION_STORE.get(userId)?.tier ?? "Rookie";
  }

  getProgress(userId: string): { tier: EvolutionTier; totalXp: number; needed: number; percent: number } {
    const state = EVOLUTION_STORE.get(userId);
    const xp = state?.totalXp ?? 0;
    const { tier, needed, percent } = getXpToNextTier(xp);
    return { tier, totalXp: xp, needed, percent };
  }

  getLeaderboard(limit = 10): { userId: string; displayName: string; totalXp: number; tier: EvolutionTier }[] {
    return [...EVOLUTION_STORE.values()]
      .sort((a, b) => b.totalXp - a.totalXp)
      .slice(0, limit)
      .map(s => ({ userId: s.userId, displayName: s.displayName, totalXp: s.totalXp, tier: s.tier }));
  }

  // Daily login bonus (once per calendar day)
  claimDailyLogin(userId: string): XpAwardResult | null {
    const state = this.getOrCreate(userId);
    const today = new Date().toDateString();
    if (state.lastLoginDate === today) return null;

    EVOLUTION_STORE.set(userId, { ...state, lastLoginDate: today });
    return this.awardXp(userId, "daily_login");
  }

  // Hero linking — connect a user to a named TMI hero
  linkHero(userId: string, heroId: string): boolean {
    const hero = HERO_REGISTRY.find(h => h.id === heroId);
    if (!hero) return false;
    const state = this.getOrCreate(userId);
    EVOLUTION_STORE.set(userId, { ...state, heroId, updatedAt: new Date().toISOString() });
    return true;
  }

  getStats(): { totalUsers: number; icons: number; legends: number; totalXpAwarded: number } {
    const all = [...EVOLUTION_STORE.values()];
    return {
      totalUsers:     all.length,
      icons:          all.filter(s => s.tier === "Icon").length,
      legends:        all.filter(s => s.tier === "Legend").length,
      totalXpAwarded: all.reduce((s, u) => s + u.totalXp, 0),
    };
  }
}

const _engine = AvatarEvolutionEngineClass.getInstance();

// Augment with getCharacterEvolution alias expected by AvatarBuilder and newer components
export const AvatarEvolutionEngine = Object.assign(_engine, {
  getCharacterEvolution: (characterId: string) => _engine.getOrCreate(characterId),
});

// ── Tier visual config (for UI badges, colors, etc.) ─────────────────────────
export const TIER_CONFIG: Record<EvolutionTier, { color: string; bg: string; emoji: string; label: string }> = {
  Rookie:      { color: "rgba(255,255,255,0.5)", bg: "rgba(255,255,255,0.06)", emoji: "🌱", label: "Rookie"      },
  Rising:      { color: "#00FFFF",               bg: "rgba(0,255,255,0.08)",   emoji: "⭐", label: "Rising"      },
  Established: { color: "#00FF88",               bg: "rgba(0,255,136,0.1)",    emoji: "🌟", label: "Established" },
  Star:        { color: "#FFD700",               bg: "rgba(255,215,0,0.12)",   emoji: "💫", label: "Star"        },
  Legend:      { color: "#FF2DAA",               bg: "rgba(255,45,170,0.14)",  emoji: "🔥", label: "Legend"      },
  Icon:        { color: "#AA2DFF",               bg: "rgba(170,45,255,0.18)",  emoji: "👑", label: "Icon"        },
};
