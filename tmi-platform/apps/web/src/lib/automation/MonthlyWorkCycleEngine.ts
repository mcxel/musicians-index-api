export type MonthlyWorkCycleRecord = {
  cycleId: string;
  magazineIssuesProduced: number;
  sponsorSpreadsRefreshed: number;
  venueSystemsRefreshed: number;
  strategicImprovements: number;
  completionPercent: number;
  startedAt: number;
  endedAt: number;
};

export function runMonthlyWorkCycle(input: {
  cycleId: string;
  magazineIssuesProduced: number;
  sponsorSpreadsRefreshed: number;
  venueSystemsRefreshed: number;
  strategicImprovements: number;
}): MonthlyWorkCycleRecord {
  const startedAt = Date.now();
  const completionPercent = Math.min(
    100,
    Math.round(
      (input.magazineIssuesProduced * 25 +
        input.sponsorSpreadsRefreshed * 20 +
        input.venueSystemsRefreshed * 20 +
        input.strategicImprovements * 15) /
        2
    )
  );

  return {
    ...input,
    completionPercent,
    startedAt,
    endedAt: Date.now(),
  };
}
