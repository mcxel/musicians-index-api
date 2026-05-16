import { ensureBotWorkforceProfile } from "@/lib/bots/BotDepartmentEngine";

export type BotAchievement = {
  achievementId: string;
  botId: string;
  department: string;
  title: string;
  description: string;
  threshold: number;
  value: number;
  unlocked: boolean;
  unlockedAt?: number;
  createdAt: number;
};

const achievementMap = new Map<string, BotAchievement[]>();

export function registerBotAchievement(input: {
  botId: string;
  title: string;
  description: string;
  threshold: number;
  value?: number;
}): BotAchievement {
  const profile = ensureBotWorkforceProfile(input.botId);
  const value = input.value ?? 0;
  const now = Date.now();
  const achievement: BotAchievement = {
    achievementId: `achievement-${input.botId}-${now}`,
    botId: input.botId,
    department: profile.department,
    title: input.title,
    description: input.description,
    threshold: input.threshold,
    value,
    unlocked: value >= input.threshold,
    unlockedAt: value >= input.threshold ? now : undefined,
    createdAt: now,
  };

  const list = achievementMap.get(input.botId) ?? [];
  achievementMap.set(input.botId, [...list, achievement]);
  return achievement;
}

export function updateBotAchievementValue(achievementId: string, value: number): BotAchievement | null {
  for (const [botId, achievements] of achievementMap.entries()) {
    const index = achievements.findIndex((entry) => entry.achievementId === achievementId);
    if (index < 0) continue;

    const current = achievements[index];
    const unlocked = value >= current.threshold;
    const next: BotAchievement = {
      ...current,
      value,
      unlocked,
      unlockedAt: unlocked ? current.unlockedAt ?? Date.now() : undefined,
    };

    const copy = [...achievements];
    copy[index] = next;
    achievementMap.set(botId, copy);
    return next;
  }

  return null;
}

export function listBotAchievements(botId?: string): BotAchievement[] {
  if (botId) return achievementMap.get(botId) ?? [];
  return [...achievementMap.values()].flat();
}

export function ensureBotAchievements(botId: string): BotAchievement[] {
  const existing = listBotAchievements(botId);
  if (existing.length > 0) return existing;

  return [
    registerBotAchievement({ botId, title: "No Failure Day", description: "No failed tasks in 24h.", threshold: 1, value: 0 }),
    registerBotAchievement({ botId, title: "Queue Cleared", description: "Queue cleared for assigned route.", threshold: 1, value: 0 }),
    registerBotAchievement({ botId, title: "100 Assets Created", description: "Generated 100 approved assets.", threshold: 100, value: 42 }),
    registerBotAchievement({ botId, title: "Perfect Week", description: "No missed goals all week.", threshold: 1, value: 0 }),
  ];
}
