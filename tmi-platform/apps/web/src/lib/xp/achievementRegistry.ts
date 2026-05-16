import type { XPSource } from "./xpEngine";

export type AchievementCategory = "activity" | "social" | "commerce" | "milestone" | "exclusive";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpBonus: number;
  category: AchievementCategory;
  color: string;
  trigger: XPSource | "manual";
  triggerCount?: number;
  secret?: boolean;
}

export const ACHIEVEMENT_REGISTRY: Achievement[] = [
  // Activity
  { id: "first_login",      title: "First Steps",         description: "Log in for the first time",                   icon: "👣", xpBonus: 100,  category: "activity",  color: "#00FFFF", trigger: "login_daily",      triggerCount: 1  },
  { id: "streak_7",         title: "Week Warrior",        description: "Log in 7 days in a row",                      icon: "🔥", xpBonus: 250,  category: "activity",  color: "#FF2DAA", trigger: "login_daily",      triggerCount: 7  },
  { id: "streak_30",        title: "Month Loyalist",      description: "Log in 30 days in a row",                     icon: "📅", xpBonus: 1000, category: "milestone", color: "#FFD700", trigger: "login_daily",      triggerCount: 30 },
  { id: "first_room",       title: "Room Explorer",       description: "Attend your first live room",                 icon: "🚪", xpBonus: 75,   category: "activity",  color: "#00FF88", trigger: "room_attend",      triggerCount: 1  },
  { id: "rooms_10",         title: "Regular",             description: "Attend 10 different rooms",                   icon: "🎭", xpBonus: 200,  category: "activity",  color: "#00FF88", trigger: "room_attend",      triggerCount: 10 },
  { id: "first_vote",       title: "Voice Heard",         description: "Cast your first vote",                        icon: "🗳️", xpBonus: 50,   category: "activity",  color: "#00FFFF", trigger: "vote_cast",        triggerCount: 1  },
  { id: "votes_50",         title: "Judge",               description: "Cast 50 votes",                               icon: "⚖️", xpBonus: 300,  category: "activity",  color: "#00FFFF", trigger: "vote_cast",        triggerCount: 50 },
  // Social
  { id: "first_comment",    title: "Heard You",           description: "Post your first comment",                     icon: "💬", xpBonus: 25,   category: "social",    color: "#AA2DFF", trigger: "comment_posted",   triggerCount: 1  },
  { id: "referral_1",       title: "Recruiter",           description: "Refer your first friend to TMI",              icon: "🤝", xpBonus: 300,  category: "social",    color: "#00FF88", trigger: "referral_success", triggerCount: 1  },
  { id: "referral_10",      title: "Ambassador",          description: "Successfully refer 10 friends",               icon: "📣", xpBonus: 1500, category: "milestone", color: "#FF2DAA", trigger: "referral_success", triggerCount: 10 },
  { id: "cypher_debut",     title: "Spitter",             description: "Drop your first Cypher freestyle",            icon: "🎤", xpBonus: 200,  category: "social",    color: "#FF2DAA", trigger: "cypher_freestyle", triggerCount: 1  },
  // Commerce
  { id: "first_tip",        title: "Big Tipper",          description: "Send your first tip to an artist",            icon: "💸", xpBonus: 150,  category: "commerce",  color: "#FFD700", trigger: "tip_sent",         triggerCount: 1  },
  { id: "fan_club_member",  title: "Day One Fan",         description: "Join your first fan club",                    icon: "👑", xpBonus: 200,  category: "commerce",  color: "#FF2DAA", trigger: "fan_club_join",    triggerCount: 1  },
  { id: "beat_buyer",       title: "Plug",                description: "Purchase your first beat license",            icon: "🎵", xpBonus: 150,  category: "commerce",  color: "#AA2DFF", trigger: "beat_purchase",    triggerCount: 1  },
  { id: "meet_greet",       title: "Backstage Pass",      description: "Book a meet & greet with an artist",          icon: "🤜", xpBonus: 250,  category: "commerce",  color: "#00FFFF", trigger: "meet_greet",       triggerCount: 1  },
  // Milestone
  { id: "profile_complete", title: "Fully Loaded",        description: "Complete 100% of your profile",               icon: "✅", xpBonus: 500,  category: "milestone", color: "#00FF88", trigger: "profile_complete", triggerCount: 1  },
  { id: "xp_1000",          title: "XP Climber",          description: "Earn 1,000 total XP",                         icon: "⭐", xpBonus: 100,  category: "milestone", color: "#FFD700", trigger: "manual" },
  { id: "xp_5000",          title: "Rising Star",         description: "Earn 5,000 total XP",                         icon: "🌟", xpBonus: 500,  category: "milestone", color: "#FFD700", trigger: "manual" },
  { id: "xp_10000",         title: "Platform Elite",      description: "Earn 10,000 total XP",                        icon: "💎", xpBonus: 1000, category: "milestone", color: "#AA2DFF", trigger: "manual" },
  // Exclusive
  { id: "contest_entrant",  title: "In It to Win It",     description: "Enter your first grand contest",              icon: "🏆", xpBonus: 150,  category: "exclusive", color: "#FF2DAA", trigger: "contest_entry",    triggerCount: 1, secret: false },
  { id: "og_member",        title: "OG Member",           description: "Join TMI in the first 1,000 accounts",        icon: "🏅", xpBonus: 2000, category: "exclusive", color: "#FFD700", trigger: "manual", secret: true },
];

const UNLOCKED_STORE: Map<string, Set<string>> = new Map();

export function unlockAchievement(userId: string, achievementId: string): Achievement | null {
  const achievement = ACHIEVEMENT_REGISTRY.find(a => a.id === achievementId);
  if (!achievement) return null;

  let unlocked = UNLOCKED_STORE.get(userId);
  if (!unlocked) {
    unlocked = new Set();
    UNLOCKED_STORE.set(userId, unlocked);
  }
  if (unlocked.has(achievementId)) return null;

  unlocked.add(achievementId);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("tmi:achievement", { detail: { userId, achievement } }));
  }
  return achievement;
}

export function getUnlockedAchievements(userId: string): Achievement[] {
  const ids = UNLOCKED_STORE.get(userId) ?? new Set<string>();
  return ACHIEVEMENT_REGISTRY.filter(a => ids.has(a.id));
}

export function isUnlocked(userId: string, achievementId: string): boolean {
  return UNLOCKED_STORE.get(userId)?.has(achievementId) ?? false;
}

export function getAchievementsByCategory(category: AchievementCategory): Achievement[] {
  return ACHIEVEMENT_REGISTRY.filter(a => a.category === category && !a.secret);
}
