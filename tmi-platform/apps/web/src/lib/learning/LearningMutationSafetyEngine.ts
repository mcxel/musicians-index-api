export type LearningMutationScope =
  | 'avatar'
  | 'lobby'
  | 'editorial'
  | 'commerce'
  | 'bots'
  | 'camera';

export interface LearningMutationRecord<T = unknown> {
  id: string;
  scope: LearningMutationScope;
  key: string;
  confidence: number;
  status: 'applied' | 'blocked' | 'rolled-back';
  reason?: string;
  before: T;
  after: T;
  createdAt: number;
}

export interface LearningSafetyDecision {
  allowed: boolean;
  confidence: number;
  reason?: string;
}

const mutationLog: LearningMutationRecord[] = [];
const rollbackState = new Map<string, unknown>();

function mutationId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function mutationKey(scope: LearningMutationScope, key: string): string {
  return `${scope}:${key}`;
}

const UNSAFE_KEYWORDS = ['self-modify', 'unsafe prompt', 'destructive', 'delete-all', 'silent rewrite'];

export function passLearningSafetyFilter(input: {
  scope: LearningMutationScope;
  key: string;
  confidence: number;
  reason?: string;
}): LearningSafetyDecision {
  if (input.confidence < 0.2) {
    return { allowed: false, confidence: input.confidence, reason: 'confidence below minimum threshold' };
  }

  const reason = (input.reason || '').toLowerCase();
  if (UNSAFE_KEYWORDS.some((keyword) => reason.includes(keyword))) {
    return { allowed: false, confidence: input.confidence, reason: 'blocked unsafe mutation reason' };
  }

  return { allowed: true, confidence: Math.min(1, Math.max(0, input.confidence)) };
}

export function applyLearningMutation<T>(params: {
  scope: LearningMutationScope;
  key: string;
  before: T;
  proposed: T;
  confidence: number;
  reason?: string;
  fallback: T;
}): T {
  const decision = passLearningSafetyFilter({
    scope: params.scope,
    key: params.key,
    confidence: params.confidence,
    reason: params.reason,
  });

  if (!decision.allowed) {
    mutationLog.unshift({
      id: mutationId('learn_mut'),
      scope: params.scope,
      key: params.key,
      confidence: params.confidence,
      status: 'blocked',
      reason: decision.reason,
      before: params.before,
      after: params.fallback,
      createdAt: Date.now(),
    });
    return params.fallback;
  }

  rollbackState.set(mutationKey(params.scope, params.key), params.before as unknown);
  mutationLog.unshift({
    id: mutationId('learn_mut'),
    scope: params.scope,
    key: params.key,
    confidence: decision.confidence,
    status: 'applied',
    reason: params.reason,
    before: params.before,
    after: params.proposed,
    createdAt: Date.now(),
  });

  return params.proposed;
}

export function rollbackLearningMutation(scope: LearningMutationScope, key: string): unknown | null {
  const rollback = rollbackState.get(mutationKey(scope, key));
  if (typeof rollback === 'undefined') return null;

  mutationLog.unshift({
    id: mutationId('learn_mut'),
    scope,
    key,
    confidence: 1,
    status: 'rolled-back',
    reason: 'manual rollback trigger',
    before: rollback,
    after: rollback,
    createdAt: Date.now(),
  });

  return rollback;
}

export function listLearningMutationAudit(limit = 200): LearningMutationRecord[] {
  return mutationLog.slice(0, Math.max(1, limit));
}

export function getLearningMutationStats() {
  const rows = listLearningMutationAudit(500);
  const applied = rows.filter((row) => row.status === 'applied').length;
  const blocked = rows.filter((row) => row.status === 'blocked').length;
  const rolledBack = rows.filter((row) => row.status === 'rolled-back').length;

  const confidenceChart = rows
    .filter((row) => row.status === 'applied')
    .slice(0, 20)
    .map((row) => ({ id: row.id, confidence: Number(row.confidence.toFixed(2)), scope: row.scope }));

  const heatmap = rows.reduce<Record<string, number>>((acc, row) => {
    const k = `${row.scope}:${row.status}`;
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});

  const unstableFlags = rows
    .filter((row) => row.status === 'blocked' || row.confidence < 0.35)
    .slice(0, 20)
    .map((row) => ({ id: row.id, scope: row.scope, key: row.key, confidence: row.confidence, reason: row.reason }));

  return {
    applied,
    blocked,
    rolledBack,
    confidenceChart,
    heatmap,
    unstableFlags,
  };
}
