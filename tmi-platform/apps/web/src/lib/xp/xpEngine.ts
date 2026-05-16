import { Analytics } from '@/lib/analytics/PersonaAnalyticsEngine';

export type XPSource =
  | "login_daily"
  | "room_attend"
  | "vote_cast"
  | "tip_sent"
  | "fan_club_join"
  | "comment_posted"
  | "article_read"
  | "beat_purchase"
  | "meet_greet"
  | "giveaway_enter"
  | "profile_complete"
  | "referral_success"
  | "cypher_freestyle"
  | "contest_entry"
  | "achievement_unlock";

export interface XPGrant {
  source: XPSource;
  amount: number;
  userId: string;
  meta?: Record<string, string | number>;
}

export interface XPLevel {
  level: number;
  title: string;
  minXP: number;
  maxXP: number;
  color: string;
  icon: string;
}

export const XP_VALUES: Record<XPSource, number> = {
  login_daily:      25,
  room_attend:      50,
  vote_cast:        15,
  tip_sent:         100,
  fan_club_join:    200,
  comment_posted:   10,
  article_read:     20,
  beat_purchase:    150,
  meet_greet:       250,
  giveaway_enter:   30,
  profile_complete: 500,
  referral_success: 300,
  cypher_freestyle: 200,
  contest_entry:    150,
  achievement_unlock: 0, // bonus set per achievement
};

export const XP_LEVELS: XPLevel[] = [
  { level: 1,  title: "Newcomer",    minXP: 0,     maxXP: 499,   color: "#888",    icon: "🌱" },
  { level: 2,  title: "Fan",         minXP: 500,   maxXP: 1499,  color: "#00FFFF", icon: "🎧" },
  { level: 3,  title: "Supporter",   minXP: 1500,  maxXP: 2999,  color: "#00FF88", icon: "🎵" },
  { level: 4,  title: "Enthusiast",  minXP: 3000,  maxXP: 5999,  color: "#FFD700", icon: "🔥" },
  { level: 5,  title: "Superfan",    minXP: 6000,  maxXP: 9999,  color: "#FF2DAA", icon: "⭐" },
  { level: 6,  title: "VIP",         minXP: 10000, maxXP: 14999, color: "#AA2DFF", icon: "💎" },
  { level: 7,  title: "Legend",      minXP: 15000, maxXP: 24999, color: "#FFD700", icon: "👑" },
  { level: 8,  title: "Icon",        minXP: 25000, maxXP: 49999, color: "#FF2DAA", icon: "🏆" },
  { level: 9,  title: "Immortal",    minXP: 50000, maxXP: 99999, color: "#00FFFF", icon: "✨" },
  { level: 10, title: "TMI Hall",    minXP: 100000, maxXP: Infinity, color: "#FFD700", icon: "🌟" },
];

export function getLevelForXP(totalXP: number): XPLevel {
  for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
    if (totalXP >= XP_LEVELS[i].minXP) return XP_LEVELS[i];
  }
  return XP_LEVELS[0];
}

export function getProgressToNextLevel(totalXP: number): { current: number; needed: number; pct: number; nextLevel: XPLevel | null } {
  const currentLevel = getLevelForXP(totalXP);
  const idx = XP_LEVELS.indexOf(currentLevel);
  if (idx === XP_LEVELS.length - 1) {
    return { current: totalXP - currentLevel.minXP, needed: 0, pct: 100, nextLevel: null };
  }
  const nextLevel = XP_LEVELS[idx + 1];
  const rangeSize = nextLevel.minXP - currentLevel.minXP;
  const progress  = totalXP - currentLevel.minXP;
  return {
    current: progress,
    needed:  rangeSize,
    pct:     Math.min(100, Math.floor((progress / rangeSize) * 100)),
    nextLevel,
  };
}

const XP_STORE: Map<string, number> = new Map();

export function grantXP(grant: XPGrant): number {
  const current = XP_STORE.get(grant.userId) ?? 0;
  const amount  = grant.amount > 0 ? grant.amount : XP_VALUES[grant.source];
  const newTotal = current + amount;
  XP_STORE.set(grant.userId, newTotal);

  Analytics.xp({ userId: grant.userId, delta: amount, source: grant.source });

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("tmi:xp", { detail: { ...grant, amount, total: newTotal } }));
  }
  return newTotal;
}

export function getUserXP(userId: string): number {
  return XP_STORE.get(userId) ?? 0;
}
