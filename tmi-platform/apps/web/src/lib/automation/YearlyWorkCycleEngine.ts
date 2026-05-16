export type YearlyWorkCycleRecord = {
  cycleId: string;
  architectureEvolutions: number;
  standardsUpgraded: number;
  departmentsRebalanced: number;
  launchReadinessScore: number;
  completionPercent: number;
  startedAt: number;
  endedAt: number;
};

export function runYearlyWorkCycle(input: {
  cycleId: string;
  architectureEvolutions: number;
  standardsUpgraded: number;
  departmentsRebalanced: number;
  launchReadinessScore: number;
}): YearlyWorkCycleRecord {
  const startedAt = Date.now();
  const completionPercent = Math.min(
    100,
    Math.round(
      input.architectureEvolutions * 20 +
        input.standardsUpgraded * 15 +
        input.departmentsRebalanced * 15 +
        input.launchReadinessScore * 0.4
    )
  );

  return {
    ...input,
    completionPercent,
    startedAt,
    endedAt: Date.now(),
  };
}
