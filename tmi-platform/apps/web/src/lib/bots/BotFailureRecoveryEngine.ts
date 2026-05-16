export type FailureReason =
  | "timeout" | "api-error" | "validation-failed" | "blocked" | "out-of-scope"
  | "resource-unavailable" | "escalation-required" | "data-missing";

export type RecoveryStrategy = "retry" | "skip" | "escalate" | "abort" | "reassign";

export interface BotFailureRecord {
  failureId: string;
  botId: string;
  taskId: string;
  reason: FailureReason;
  message: string;
  strategy: RecoveryStrategy;
  retryCount: number;
  maxRetries: number;
  nextRetryAt?: string;
  resolvedAt?: string;
  resolved: boolean;
}

const failures = new Map<string, BotFailureRecord>();
const botFailures = new Map<string, string[]>();

function gen(): string {
  return `fail_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

const STRATEGY_MAP: Record<FailureReason, RecoveryStrategy> = {
  "timeout":               "retry",
  "api-error":             "retry",
  "validation-failed":     "skip",
  "blocked":               "escalate",
  "out-of-scope":          "skip",
  "resource-unavailable":  "retry",
  "escalation-required":   "escalate",
  "data-missing":          "abort",
};

export function recordFailure(
  botId: string,
  taskId: string,
  reason: FailureReason,
  message: string,
  opts: { maxRetries?: number; strategy?: RecoveryStrategy } = {},
): BotFailureRecord {
  const strategy = opts.strategy ?? STRATEGY_MAP[reason];
  const maxRetries = opts.maxRetries ?? (strategy === "retry" ? 3 : 0);
  const now = Date.now();

  const record: BotFailureRecord = {
    failureId: gen(),
    botId,
    taskId,
    reason,
    message,
    strategy,
    retryCount: 0,
    maxRetries,
    nextRetryAt: strategy === "retry" ? new Date(now + 30_000).toISOString() : undefined,
    resolved: false,
  };

  failures.set(record.failureId, record);
  const list = botFailures.get(botId) ?? [];
  list.unshift(record.failureId);
  botFailures.set(botId, list.slice(0, 100));
  return record;
}

export function attemptRetry(failureId: string): { ok: boolean; record: BotFailureRecord; canRetry: boolean } {
  const record = failures.get(failureId);
  if (!record) return { ok: false, record: {} as BotFailureRecord, canRetry: false };
  if (record.resolved || record.retryCount >= record.maxRetries) {
    return { ok: false, record, canRetry: false };
  }
  const next: BotFailureRecord = {
    ...record,
    retryCount: record.retryCount + 1,
    nextRetryAt: new Date(Date.now() + 30_000 * (record.retryCount + 1)).toISOString(),
  };
  failures.set(failureId, next);
  return { ok: true, record: next, canRetry: next.retryCount < next.maxRetries };
}

export function resolveFailure(failureId: string): BotFailureRecord | null {
  const record = failures.get(failureId);
  if (!record) return null;
  const resolved: BotFailureRecord = { ...record, resolved: true, resolvedAt: new Date().toISOString() };
  failures.set(failureId, resolved);
  return resolved;
}

export function getFailures(botId: string, unresolvedOnly = false): BotFailureRecord[] {
  const ids = botFailures.get(botId) ?? [];
  return ids
    .map((id) => failures.get(id)!)
    .filter(Boolean)
    .filter((r) => !unresolvedOnly || !r.resolved);
}

export function getFailureCount(botId: string): number {
  return getFailures(botId, true).length;
}

export function getReadyRetries(): BotFailureRecord[] {
  const now = new Date().toISOString();
  return [...failures.values()].filter(
    (r) => !r.resolved && r.strategy === "retry" && r.retryCount < r.maxRetries && (!r.nextRetryAt || r.nextRetryAt <= now),
  );
}
