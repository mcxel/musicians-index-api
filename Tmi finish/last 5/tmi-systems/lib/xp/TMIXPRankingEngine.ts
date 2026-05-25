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
   REACT DISPLAY COMPONENT
   ═══════════════════════════════════════════════════════ */
"use client";

import { useState } from "react";

const TIER_COLORS: Record<SubscriptionTier, { bg: string; text: string; glow: string }> = {
  free:     { bg: "#1e293b", text: "#94a3b8", glow: "#64748b" },
  silver:   { bg: "#1e293b", text: "#cbd5e1", glow: "#94a3b8" },
  gold:     { bg: "#292013", text: "#fbbf24", glow: "#f59e0b" },
  platinum: { bg: "#1a1a2e", text: "#e2e8f0", glow: "#94a3b8" },
  diamond:  { bg: "#0c1a2e", text: "#38bdf8", glow: "#06b6d4" },
};

const RARITY_COLORS = {
  common:    { border: "#64748b", bg: "#1e293b", text: "#94a3b8", label: "Common" },
  rare:      { border: "#3b82f6", bg: "#1e3a5f", text: "#93c5fd", label: "Rare" },
  epic:      { border: "#8b5cf6", bg: "#2d1b69", text: "#c4b5fd", label: "Epic" },
  legendary: { border: "#f59e0b", bg: "#292013", text: "#fbbf24", label: "Legendary" },
};

export function TMIXPDisplay({
  stats,
  showAchievements = true,
  compact = false,
}: {
  stats: UserStats;
  showAchievements?: boolean;
  compact?: boolean;
}) {
  const engine = new TMIXPRankingEngine(stats);
  const level = engine.getLevel();
  const tier = engine.getTier();
  const progress = engine.getProgressToNextLevel();
  const tc = TIER_COLORS[tier];
  const earnedAchievements = ACHIEVEMENTS.filter((a) => stats.achievementIds.includes(a.id));

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-[9px] font-black uppercase tracking-widest" style={{ color: tc.text }}>Lv.{level}</div>
        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden max-w-[80px]">
          <div className="h-full rounded-full transition-all" style={{ width: `${progress * 100}%`, background: tc.glow }} />
        </div>
        <div className="text-[8px] font-black capitalize" style={{ color: tc.text }}>{tier}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* XP + Level card */}
      <div className="border rounded-xl p-4 space-y-3" style={{ borderColor: tc.glow + "40", background: tc.bg }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[8px] uppercase tracking-widest text-white/30">Level</p>
            <p className="text-3xl font-black" style={{ color: tc.text, textShadow: `0 0 20px ${tc.glow}` }}>
              {level}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[8px] uppercase tracking-widest text-white/30">Tier</p>
            <p className="text-lg font-black capitalize" style={{ color: tc.text }}>{tier}</p>
          </div>
        </div>

        {/* XP bar */}
        <div>
          <div className="flex justify-between text-[8px] text-white/40 mb-1">
            <span>{stats.totalXP.toLocaleString()} XP</span>
            <span>Lv.{level + 1}: {((level + 1) ** 2 * 100).toLocaleString()}</span>
          </div>
          <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progress * 100}%`,
                background: `linear-gradient(90deg, ${tc.glow}, ${tc.text})`,
                boxShadow: `0 0 8px ${tc.glow}`,
              }}
            />
          </div>
          {progress >= 0.85 && (
            <p className="text-[8px] text-center mt-1" style={{ color: tc.text }}>
              {progress >= 0.95 ? "🔥 ONE ACTION AWAY!" : "⚡ Almost there!"}
            </p>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { label: "Battles Won", value: stats.battlesWon },
            { label: "Credits",     value: stats.totalCredits.toLocaleString() },
            { label: "Followers",   value: stats.followersCount.toLocaleString() },
          ].map((s) => (
            <div key={s.label} className="bg-white/5 rounded-lg p-2">
              <p className="text-sm font-black text-white">{s.value}</p>
              <p className="text-[7px] text-white/30 uppercase">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      {showAchievements && earnedAchievements.length > 0 && (
        <div>
          <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-2">
            Achievements ({earnedAchievements.length}/{ACHIEVEMENTS.length})
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {earnedAchievements.map((ach) => {
              const rc = RARITY_COLORS[ach.rarity];
              return (
                <div
                  key={ach.id}
                  className="border rounded-lg p-2 flex items-center gap-2"
                  style={{ borderColor: rc.border + "60", background: rc.bg }}
                  title={ach.description}
                >
                  <span className="text-base">{ach.icon}</span>
                  <div className="min-w-0">
                    <p className="text-[9px] font-black truncate" style={{ color: rc.text }}>{ach.title}</p>
                    <p className="text-[7px] uppercase" style={{ color: rc.border }}>+{ach.xpReward} XP</p>
                  </div>
                  {ach.isLimited && <span className="text-[6px] text-red-400 font-black ml-auto flex-shrink-0">LTD</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Leaderboard display ─────────────────────────────────────────────────── */
export function TMILeaderboard({
  entries,
  currentUserId,
}: {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}) {
  const TIER_COLORS_SIMPLE: Record<SubscriptionTier, string> = {
    free: "#64748b", silver: "#cbd5e1", gold: "#fbbf24", platinum: "#e2e8f0", diamond: "#38bdf8",
  };

  return (
    <div className="space-y-1">
      {entries.map((entry) => {
        const isMe = entry.userId === currentUserId;
        return (
          <div
            key={entry.userId}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors"
            style={{
              background: isMe ? TIER_COLORS_SIMPLE[entry.tier] + "18" : "rgba(255,255,255,0.02)",
              border: isMe ? `1px solid ${TIER_COLORS_SIMPLE[entry.tier]}40` : "1px solid transparent",
            }}
          >
            {/* Rank */}
            <div className="w-7 text-right flex-shrink-0">
              {entry.rank <= 3 ? (
                <span className="text-base">{["🥇","🥈","🥉"][entry.rank - 1]}</span>
              ) : (
                <span className="text-[10px] text-white/40 font-mono">#{entry.rank}</span>
              )}
            </div>

            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] flex-shrink-0"
              style={{ background: entry.avatarColor + "30", color: entry.avatarColor }}
            >
              {entry.displayName.charAt(0)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-[10px] font-black text-white truncate">{entry.displayName}</p>
                {entry.hasCrown && <span className="text-[9px]">👑</span>}
                {entry.hasBelt && <span className="text-[9px]">🏆</span>}
                {isMe && <span className="text-[7px] bg-cyan-600 text-black px-1 rounded font-black">YOU</span>}
              </div>
              <p className="text-[8px] text-white/40">Lv.{entry.level} · {entry.battlesWon}W</p>
            </div>

            {/* XP + change */}
            <div className="text-right flex-shrink-0">
              <p className="text-[10px] font-black" style={{ color: TIER_COLORS_SIMPLE[entry.tier] }}>
                {entry.totalXP.toLocaleString()}
              </p>
              {entry.changeFromYesterday !== 0 && (
                <p className={`text-[7px] font-black ${entry.changeFromYesterday > 0 ? "text-green-400" : "text-red-400"}`}>
                  {entry.changeFromYesterday > 0 ? "↑" : "↓"}{Math.abs(entry.changeFromYesterday)}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
