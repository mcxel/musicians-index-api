export type VisualAchievementType =
  | "all-homepages-complete"
  | "all-battle-posters-complete"
  | "all-venues-complete"
  | "all-artist-cards-complete"
  | "all-ticket-art-complete";

export type VisualAchievement = {
  achievementId: string;
  type: VisualAchievementType;
  unlocked: boolean;
  unlockedAt?: number;
};

const achievements = new Map<VisualAchievementType, VisualAchievement>();

function id(): string {
  return `vach_${Math.random().toString(36).slice(2, 11)}`;
}

export function registerAchievement(type: VisualAchievementType): VisualAchievement {
  const existing = achievements.get(type);
  if (existing) return existing;
  const record: VisualAchievement = { achievementId: id(), type, unlocked: false };
  achievements.set(type, record);
  return record;
}

export function unlockAchievement(type: VisualAchievementType): VisualAchievement {
  const existing = achievements.get(type) ?? registerAchievement(type);
  const unlocked: VisualAchievement = {
    ...existing,
    unlocked: true,
    unlockedAt: Date.now(),
  };
  achievements.set(type, unlocked);
  return unlocked;
}

export function getAchievement(type: VisualAchievementType): VisualAchievement | null {
  return achievements.get(type) ?? null;
}

export function listAchievements(): VisualAchievement[] {
  return [...achievements.values()];
}
