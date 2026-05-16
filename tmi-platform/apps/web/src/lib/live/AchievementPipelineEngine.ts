// ─── Types ────────────────────────────────────────────────────────────────────

export type AchievementCategory =
  | "performance"
  | "social"
  | "commerce"
  | "attendance"
  | "contest"
  | "platform";

export type AchievementRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export type Achievement = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  pointValue: number;
  iconEmoji: string;
  condition: (stats: UserStats) => boolean;
};

export type UserStats = {
  userId: string;
  tipsGiven: number;
  tipsReceived: number;
  votescast: number;
  liveEventsAttended: number;
  ticketsPurchased: number;
  beatsPurchased: number;
  nftsPurchased: number;
  contestsEntered: number;
  contestsWon: number;
  messagesPosted: number;
  hypeReactionsFired: number;
  totalPointsEarned: number;
  bookingsMade: number;
  articulesPublished: number;
};

export type UserAchievementRecord = {
  userId: string;
  unlockedIds: Set<string>;
  totalPoints: number;
  lastCheckedMs: number;
};

export type AchievementUnlock = {
  userId: string;
  achievement: Achievement;
  unlockedAtMs: number;
  pointsAwarded: number;
};

// ─── Achievement catalog ──────────────────────────────────────────────────────

export const ACHIEVEMENT_CATALOG: Achievement[] = [
  // Attendance
  { id:"a1", slug:"first-show", title:"First Show", description:"Attend your first live event", category:"attendance", rarity:"common", pointValue:50, iconEmoji:"🎟️", condition: s => s.liveEventsAttended >= 1 },
  { id:"a2", slug:"regular-fan", title:"Regular Fan", description:"Attend 10 live events", category:"attendance", rarity:"uncommon", pointValue:200, iconEmoji:"🎪", condition: s => s.liveEventsAttended >= 10 },
  { id:"a3", slug:"venue-veteran", title:"Venue Veteran", description:"Attend 50 live events", category:"attendance", rarity:"rare", pointValue:750, iconEmoji:"🏟️", condition: s => s.liveEventsAttended >= 50 },
  // Commerce
  { id:"a4", slug:"first-tip", title:"Big Tipper", description:"Send your first tip", category:"commerce", rarity:"common", pointValue:75, iconEmoji:"💰", condition: s => s.tipsGiven >= 1 },
  { id:"a5", slug:"beat-buyer", title:"Beat Buyer", description:"Purchase your first beat", category:"commerce", rarity:"common", pointValue:100, iconEmoji:"🎵", condition: s => s.beatsPurchased >= 1 },
  { id:"a6", slug:"nft-collector", title:"NFT Collector", description:"Own your first TMI NFT", category:"commerce", rarity:"uncommon", pointValue:300, iconEmoji:"🖼️", condition: s => s.nftsPurchased >= 1 },
  { id:"a7", slug:"power-spender", title:"Power Spender", description:"Purchase 5+ beats or NFTs", category:"commerce", rarity:"rare", pointValue:500, iconEmoji:"💎", condition: s => (s.beatsPurchased + s.nftsPurchased) >= 5 },
  // Social
  { id:"a8", slug:"hype-machine", title:"Hype Machine", description:"Fire 100 hype reactions", category:"social", rarity:"common", pointValue:100, iconEmoji:"🔥", condition: s => s.hypeReactionsFired >= 100 },
  { id:"a9", slug:"voice-of-crowd", title:"Voice of the Crowd", description:"Post 500 messages", category:"social", rarity:"uncommon", pointValue:250, iconEmoji:"📣", condition: s => s.messagesPosted >= 500 },
  { id:"a10", slug:"voter", title:"Democracy Now", description:"Cast 50 votes", category:"social", rarity:"common", pointValue:150, iconEmoji:"🗳️", condition: s => s.votescast >= 50 },
  // Contest
  { id:"a11", slug:"contestant", title:"Contestant", description:"Enter your first contest", category:"contest", rarity:"common", pointValue:75, iconEmoji:"🏆", condition: s => s.contestsEntered >= 1 },
  { id:"a12", slug:"champion", title:"Champion", description:"Win a contest", category:"contest", rarity:"epic", pointValue:1500, iconEmoji:"👑", condition: s => s.contestsWon >= 1 },
  // Performance
  { id:"a13", slug:"booker", title:"Booker", description:"Book your first venue", category:"performance", rarity:"uncommon", pointValue:400, iconEmoji:"📅", condition: s => s.bookingsMade >= 1 },
  { id:"a14", slug:"published", title:"Published", description:"Publish your first article", category:"performance", rarity:"rare", pointValue:600, iconEmoji:"📰", condition: s => s.articulesPublished >= 1 },
  // Platform
  { id:"a15", slug:"tmi-legend", title:"TMI Legend", description:"Earn 10,000 total points", category:"platform", rarity:"legendary", pointValue:5000, iconEmoji:"⭐", condition: s => s.totalPointsEarned >= 10000 },
];

const CATALOG_MAP = new Map(ACHIEVEMENT_CATALOG.map(a => [a.id, a]));

// ─── Registry ─────────────────────────────────────────────────────────────────

const userRecords = new Map<string, UserAchievementRecord>();
const unlockLog: AchievementUnlock[] = [];

function getOrInitRecord(userId: string): UserAchievementRecord {
  if (!userRecords.has(userId)) {
    userRecords.set(userId, { userId, unlockedIds: new Set(), totalPoints: 0, lastCheckedMs: 0 });
  }
  return userRecords.get(userId)!;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function checkAchievements(stats: UserStats): AchievementUnlock[] {
  const record = getOrInitRecord(stats.userId);
  const newUnlocks: AchievementUnlock[] = [];

  for (const achievement of ACHIEVEMENT_CATALOG) {
    if (record.unlockedIds.has(achievement.id)) continue;
    if (achievement.condition(stats)) {
      record.unlockedIds.add(achievement.id);
      record.totalPoints += achievement.pointValue;
      const unlock: AchievementUnlock = {
        userId: stats.userId,
        achievement,
        unlockedAtMs: Date.now(),
        pointsAwarded: achievement.pointValue,
      };
      newUnlocks.push(unlock);
      unlockLog.push(unlock);
    }
  }

  record.lastCheckedMs = Date.now();
  return newUnlocks;
}

export function getUserAchievements(userId: string): Achievement[] {
  const record = getOrInitRecord(userId);
  return Array.from(record.unlockedIds).map(id => CATALOG_MAP.get(id)!).filter(Boolean);
}

export function getUserPoints(userId: string): number {
  return getOrInitRecord(userId).totalPoints;
}

export function getRecentUnlocks(userId: string, limit: number = 10): AchievementUnlock[] {
  return unlockLog.filter(u => u.userId === userId).slice(-limit);
}

export function getAchievementProgress(
  stats: UserStats,
): Array<{ achievement: Achievement; unlocked: boolean }> {
  const record = getOrInitRecord(stats.userId);
  return ACHIEVEMENT_CATALOG.map(a => ({
    achievement: a,
    unlocked: record.unlockedIds.has(a.id),
  }));
}
