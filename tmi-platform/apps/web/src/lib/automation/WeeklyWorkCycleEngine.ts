export type WeeklyWorkCycleRecord = {
  cycleId: string;
  campaignsRefreshed: number;
  weakAssetsImproved: number;
  topAssetsUpgraded: number;
  workerStabilityScore: number;
  completionPercent: number;
  startedAt: number;
  endedAt: number;
};

export function runWeeklyWorkCycle(input: {
  cycleId: string;
  campaignsRefreshed: number;
  weakAssetsImproved: number;
  topAssetsUpgraded: number;
  workerStabilityScore: number;
}): WeeklyWorkCycleRecord {
  const startedAt = Date.now();
  const completionPercent = Math.min(
    100,
    Math.round((input.campaignsRefreshed + input.weakAssetsImproved + input.topAssetsUpgraded) * 5)
  );

  return {
    ...input,
    completionPercent,
    startedAt,
    endedAt: Date.now(),
  };
}
