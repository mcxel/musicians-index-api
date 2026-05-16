export type AchievementTier = "bronze" | "silver" | "gold" | "platinum" | "diamond";

export interface BotAchievement {
  achievementId: string;
  botId: string;
  title: string;
  description: string;
  tier: AchievementTier;
  revenueImpact: number;
  earnedAt: string;
  category: "revenue" | "outreach" | "content" | "moderation" | "reliability" | "speed";
}

const ledger = new Map<string, BotAchievement[]>();

const TIER_ORDER: AchievementTier[] = ["bronze", "silver", "gold", "platinum", "diamond"];

function botKey(botId: string) { return `bot:${botId}`; }

function gen(): string {
  return `ach_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

export function awardAchievement(
  botId: string,
  input: Omit<BotAchievement, "achievementId" | "botId" | "earnedAt">,
): BotAchievement {
  const achievement: BotAchievement = {
    achievementId: gen(),
    botId,
    earnedAt: new Date().toISOString(),
    ...input,
  };
  const list = ledger.get(botKey(botId)) ?? [];
  list.unshift(achievement);
  ledger.set(botKey(botId), list.slice(0, 200));
  return achievement;
}

export function getAchievements(botId: string, tier?: AchievementTier): BotAchievement[] {
  const list = ledger.get(botKey(botId)) ?? [];
  return tier ? list.filter((a) => a.tier === tier) : list;
}

export function getAchievementCount(botId: string): number {
  return (ledger.get(botKey(botId)) ?? []).length;
}

export function getTotalRevenueImpact(botId: string): number {
  return (ledger.get(botKey(botId)) ?? []).reduce((s, a) => s + a.revenueImpact, 0);
}

export function getHighestTier(botId: string): AchievementTier | null {
  const list = ledger.get(botKey(botId)) ?? [];
  if (!list.length) return null;
  let best = 0;
  for (const a of list) {
    const idx = TIER_ORDER.indexOf(a.tier);
    if (idx > best) best = idx;
  }
  return TIER_ORDER[best];
}

export function getPlatformLeaderboard(botIds: string[]): Array<{ botId: string; total: number; tier: AchievementTier | null }> {
  return botIds
    .map((botId) => ({
      botId,
      total: getAchievementCount(botId),
      tier: getHighestTier(botId),
    }))
    .sort((a, b) => b.total - a.total);
}
