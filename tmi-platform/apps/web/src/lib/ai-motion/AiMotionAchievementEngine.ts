export type MotionAchievementType =
  | "all-host-motion-complete"
  | "all-venue-motion-complete"
  | "all-battle-motion-complete"
  | "all-homepage-motion-complete";

export type MotionAchievement = {
  achievementId: string;
  type: MotionAchievementType;
  unlocked: boolean;
  unlockedAt?: number;
};

const achievements = new Map<MotionAchievementType, MotionAchievement>();

function id(): string {
  return `mach_${Math.random().toString(36).slice(2, 11)}`;
}

export function registerMotionAchievement(type: MotionAchievementType): MotionAchievement {
  const existing = achievements.get(type);
  if (existing) return existing;
  const next: MotionAchievement = { achievementId: id(), type, unlocked: false };
  achievements.set(type, next);
  return next;
}

export function unlockMotionAchievement(type: MotionAchievementType): MotionAchievement {
  const current = achievements.get(type) ?? registerMotionAchievement(type);
  const next: MotionAchievement = { ...current, unlocked: true, unlockedAt: Date.now() };
  achievements.set(type, next);
  return next;
}

export function listMotionAchievements(): MotionAchievement[] {
  return [...achievements.values()];
}
