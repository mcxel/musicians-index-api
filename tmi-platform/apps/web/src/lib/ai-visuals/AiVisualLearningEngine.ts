type VisualLearningSignal = {
  assetId: string;
  clicked: boolean;
  usedInRevenuePath: boolean;
  rejected: boolean;
  timestamp: number;
};

type VisualLearningState = {
  assetId: string;
  engagementScore: number;
  revenueScore: number;
  rejectionScore: number;
  evolutionScore: number;
  updatedAt: number;
};

const signalMap = new Map<string, VisualLearningSignal[]>();
const stateMap = new Map<string, VisualLearningState>();

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function recordVisualLearningSignal(signal: VisualLearningSignal): VisualLearningState {
  const list = signalMap.get(signal.assetId) ?? [];
  list.push(signal);
  signalMap.set(signal.assetId, list.slice(-200));
  return recomputeVisualLearning(signal.assetId);
}

export function recomputeVisualLearning(assetId: string): VisualLearningState {
  const list = signalMap.get(assetId) ?? [];
  const clicks = list.filter((s) => s.clicked).length;
  const revenue = list.filter((s) => s.usedInRevenuePath).length;
  const rejects = list.filter((s) => s.rejected).length;
  const total = Math.max(1, list.length);

  const next: VisualLearningState = {
    assetId,
    engagementScore: clamp((clicks / total) * 100),
    revenueScore: clamp((revenue / total) * 100),
    rejectionScore: clamp((rejects / total) * 100),
    evolutionScore: clamp(((clicks + revenue) / (total + rejects + 1)) * 100),
    updatedAt: Date.now(),
  };

  stateMap.set(assetId, next);
  return next;
}

export function getVisualLearningState(assetId: string): VisualLearningState | null {
  return stateMap.get(assetId) ?? null;
}

export function startVisualLearning(assetId: string): VisualLearningState {
  return stateMap.get(assetId) ?? {
    assetId,
    engagementScore: 0,
    revenueScore: 0,
    rejectionScore: 0,
    evolutionScore: 0,
    updatedAt: Date.now(),
  };
}

export function updateVisualLearning(assetId: string, signal: Omit<VisualLearningSignal, "assetId" | "timestamp">): VisualLearningState {
  return recordVisualLearningSignal({
    assetId,
    clicked: signal.clicked,
    usedInRevenuePath: signal.usedInRevenuePath,
    rejected: signal.rejected,
    timestamp: Date.now(),
  });
}

export function saveVisualLearning(assetId: string): VisualLearningState {
  return startVisualLearning(assetId);
}

export function recoverVisualLearning(assetId: string): VisualLearningState {
  return startVisualLearning(assetId);
}

export function repeatVisualLearning(assetId: string): VisualLearningState {
  return saveVisualLearning(assetId);
}

export function returnVisualLearning(assetId: string): VisualLearningState {
  return saveVisualLearning(assetId);
}
