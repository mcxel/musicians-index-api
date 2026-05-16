export type MCWorkCycleRecord = {
  cycleId: string;
  approvalsGreen: number;
  approvalsYellow: number;
  approvalsRed: number;
  escalationsRaised: number;
  correctiveActionsIssued: number;
  commandHealth: 'green' | 'yellow' | 'red';
  updatedAt: number;
};

export function runMCWorkCycle(input: {
  cycleId: string;
  approvalsGreen: number;
  approvalsYellow: number;
  approvalsRed: number;
  escalationsRaised: number;
  correctiveActionsIssued: number;
}): MCWorkCycleRecord {
  const riskScore = input.approvalsRed * 3 + input.escalationsRaised * 2 + input.approvalsYellow;
  const commandHealth: MCWorkCycleRecord['commandHealth'] =
    riskScore <= 4 ? 'green' : riskScore <= 10 ? 'yellow' : 'red';

  return {
    ...input,
    commandHealth,
    updatedAt: Date.now(),
  };
}
