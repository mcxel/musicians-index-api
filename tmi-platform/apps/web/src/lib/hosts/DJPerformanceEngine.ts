export type DJPerformanceRecord = {
  sessionId: string;
  djId: string;
  scratchIntensity: number;
  mixPrecision: number;
  crowdInteractionRate: number;
  energyScore: number;
  status: 'cold' | 'warming' | 'live';
  updatedAt: number;
};

const djPerformanceMap = new Map<string, DJPerformanceRecord>();

export function evaluateDJPerformance(input: {
  sessionId: string;
  djId: string;
  scratchIntensity: number;
  mixPrecision: number;
  crowdInteractionRate: number;
}): DJPerformanceRecord {
  const energyScore = Math.round(
    input.scratchIntensity * 0.3 + input.mixPrecision * 0.4 + input.crowdInteractionRate * 0.3
  );

  const status: DJPerformanceRecord['status'] =
    energyScore >= 80 ? 'live' : energyScore >= 55 ? 'warming' : 'cold';

  const next: DJPerformanceRecord = {
    ...input,
    energyScore,
    status,
    updatedAt: Date.now(),
  };

  djPerformanceMap.set(next.sessionId, next);
  return next;
}

export function listDJPerformanceRecords(): DJPerformanceRecord[] {
  return [...djPerformanceMap.values()].sort((a, b) => b.updatedAt - a.updatedAt);
}
