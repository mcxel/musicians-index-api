export type BigAceWorkCycleRecord = {
  cycleId: string;
  strategicApprovals: number;
  criticalOverrides: number;
  continuityActions: number;
  blockersResolved: number;
  platformHealth: 'green' | 'yellow' | 'red';
  readinessScore: number;
  updatedAt: number;
};

export function runBigAceWorkCycle(input: {
  cycleId: string;
  strategicApprovals: number;
  criticalOverrides: number;
  continuityActions: number;
  blockersResolved: number;
}): BigAceWorkCycleRecord {
  const readinessScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        45 +
          input.strategicApprovals * 8 +
          input.continuityActions * 6 +
          input.blockersResolved * 7 -
          input.criticalOverrides * 5
      )
    )
  );

  const platformHealth: BigAceWorkCycleRecord['platformHealth'] =
    readinessScore >= 85 ? 'green' : readinessScore >= 65 ? 'yellow' : 'red';

  return {
    ...input,
    platformHealth,
    readinessScore,
    updatedAt: Date.now(),
  };
}
