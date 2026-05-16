export type LearningMutationStatus = 'applied' | 'blocked' | 'rolled_back';

export interface LearningMutationRecord {
  id: string;
  engine: string;
  targetId: string;
  metric: string;
  beforeValue: number;
  requestedValue: number;
  appliedValue: number;
  confidence: number;
  reason: string;
  status: LearningMutationStatus;
  blockedReason?: string;
  createdAtMs: number;
}

export interface LearningHeatmapCell {
  key: string;
  applied: number;
  blocked: number;
  rolledBack: number;
}

interface RollbackState {
  value: number;
  metric: string;
  engine: string;
  targetId: string;
}

const mutationLog: LearningMutationRecord[] = [];
const rollbackStack = new Map<string, RollbackState[]>();
const frozenTargets = new Set<string>();
const unstableTargets = new Set<string>();

function mutationId(): string {
  return `learn_mut_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function rollbackKey(engine: string, targetId: string): string {
  return `${engine}:${targetId}`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function isUnsafeMetric(metric: string): boolean {
  const m = metric.toLowerCase();
  return m.includes('prompt') || m.includes('system') || m.includes('destructive') || m.includes('delete');
}

export function applySafeLearningMutation(input: {
  engine: string;
  targetId: string;
  metric: string;
  beforeValue: number;
  requestedValue: number;
  minValue: number;
  maxValue: number;
  confidence: number;
  reason: string;
}): LearningMutationRecord {
  const recordBase = {
    id: mutationId(),
    engine: input.engine,
    targetId: input.targetId,
    metric: input.metric,
    beforeValue: input.beforeValue,
    requestedValue: input.requestedValue,
    confidence: input.confidence,
    reason: input.reason,
    createdAtMs: Date.now(),
  };

  if (frozenTargets.has(input.targetId)) {
    const blocked: LearningMutationRecord = {
      ...recordBase,
      appliedValue: input.beforeValue,
      status: 'blocked',
      blockedReason: 'target-frozen',
    };
    mutationLog.push(blocked);
    return blocked;
  }

  if (input.confidence < 0.35) {
    const blocked: LearningMutationRecord = {
      ...recordBase,
      appliedValue: input.beforeValue,
      status: 'blocked',
      blockedReason: 'low-confidence',
    };
    mutationLog.push(blocked);
    return blocked;
  }

  if (isUnsafeMetric(input.metric)) {
    const blocked: LearningMutationRecord = {
      ...recordBase,
      appliedValue: input.beforeValue,
      status: 'blocked',
      blockedReason: 'unsafe-metric',
    };
    mutationLog.push(blocked);
    return blocked;
  }

  const appliedValue = clamp(input.requestedValue, input.minValue, input.maxValue);
  const stackKey = rollbackKey(input.engine, input.targetId);
  const stack = rollbackStack.get(stackKey) ?? [];
  stack.push({
    engine: input.engine,
    targetId: input.targetId,
    metric: input.metric,
    value: input.beforeValue,
  });
  rollbackStack.set(stackKey, stack.slice(-40));

  const applied: LearningMutationRecord = {
    ...recordBase,
    appliedValue,
    status: 'applied',
  };
  mutationLog.push(applied);
  return applied;
}

export function rollbackLatestLearningMutation(engine: string, targetId: string): RollbackState | null {
  const stackKey = rollbackKey(engine, targetId);
  const stack = rollbackStack.get(stackKey) ?? [];
  const previous = stack.pop() ?? null;
  rollbackStack.set(stackKey, stack);

  if (!previous) return null;

  mutationLog.push({
    id: mutationId(),
    engine,
    targetId,
    metric: previous.metric,
    beforeValue: previous.value,
    requestedValue: previous.value,
    appliedValue: previous.value,
    confidence: 1,
    reason: 'manual-rollback',
    status: 'rolled_back',
    createdAtMs: Date.now(),
  });

  return previous;
}

export function freezeLearningTarget(targetId: string): void {
  frozenTargets.add(targetId);
}

export function unfreezeLearningTarget(targetId: string): void {
  frozenTargets.delete(targetId);
}

export function markUnstableLearningTarget(targetId: string): void {
  unstableTargets.add(targetId);
}

export function clearUnstableLearningTarget(targetId: string): void {
  unstableTargets.delete(targetId);
}

export function listLearningMutationLog(limit = 200): LearningMutationRecord[] {
  return mutationLog.slice(-limit).reverse();
}

export function getLearningHeatmap(): LearningHeatmapCell[] {
  const map = new Map<string, LearningHeatmapCell>();
  for (const record of mutationLog) {
    const key = `${record.engine}:${record.metric}`;
    const row = map.get(key) ?? { key, applied: 0, blocked: 0, rolledBack: 0 };
    if (record.status === 'applied') row.applied += 1;
    if (record.status === 'blocked') row.blocked += 1;
    if (record.status === 'rolled_back') row.rolledBack += 1;
    map.set(key, row);
  }
  return [...map.values()].sort((a, b) => b.applied - a.applied);
}

export function getTopPerformingAdaptations(limit = 10): LearningMutationRecord[] {
  return mutationLog
    .filter((record) => record.status === 'applied')
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, limit);
}

export function getFailedAdaptations(limit = 10): LearningMutationRecord[] {
  return mutationLog
    .filter((record) => record.status === 'blocked')
    .slice(-limit)
    .reverse();
}

export function listFrozenLearningTargets(): string[] {
  return [...frozenTargets.values()];
}

export function listUnstableLearningTargets(): string[] {
  return [...unstableTargets.values()];
}
