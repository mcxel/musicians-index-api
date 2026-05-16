export type RetryTrigger = "manual" | "auto" | "scheduled" | "escalation";

export interface TaskRetryRecord {
  retryId: string;
  taskId: string;
  trigger: RetryTrigger;
  attempt: number;
  maxAttempts: number;
  retryAt: string;
  completedAt?: string;
  succeeded: boolean | null;
  failureReason?: string;
}

const retries = new Map<string, TaskRetryRecord[]>();

function gen(): string {
  return `retry_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function backoffMs(attempt: number): number {
  return Math.min(attempt * 30_000, 5 * 60 * 1000);
}

export function scheduleRetry(
  taskId: string,
  trigger: RetryTrigger = "auto",
  maxAttempts = 3,
): TaskRetryRecord | null {
  const taskRetries = retries.get(taskId) ?? [];
  const attempt = taskRetries.length + 1;
  if (attempt > maxAttempts) return null;

  const record: TaskRetryRecord = {
    retryId: gen(),
    taskId,
    trigger,
    attempt,
    maxAttempts,
    retryAt: new Date(Date.now() + backoffMs(attempt)).toISOString(),
    succeeded: null,
  };

  taskRetries.push(record);
  retries.set(taskId, taskRetries);
  return record;
}

export function markRetryResult(retryId: string, taskId: string, succeeded: boolean, failureReason?: string): TaskRetryRecord | null {
  const taskRetries = retries.get(taskId) ?? [];
  const idx = taskRetries.findIndex((r) => r.retryId === retryId);
  if (idx < 0) return null;
  taskRetries[idx] = {
    ...taskRetries[idx],
    succeeded,
    failureReason,
    completedAt: new Date().toISOString(),
  };
  retries.set(taskId, taskRetries);
  return taskRetries[idx];
}

export function getTaskRetries(taskId: string): TaskRetryRecord[] {
  return retries.get(taskId) ?? [];
}

export function getRetryCount(taskId: string): number {
  return (retries.get(taskId) ?? []).length;
}

export function canRetry(taskId: string, maxAttempts = 3): boolean {
  return getRetryCount(taskId) < maxAttempts;
}

export function getDueRetries(): Array<{ taskId: string; record: TaskRetryRecord }> {
  const now = new Date().toISOString();
  const due: Array<{ taskId: string; record: TaskRetryRecord }> = [];
  for (const [taskId, taskRetries] of retries.entries()) {
    const pending = taskRetries.find((r) => r.succeeded === null && r.retryAt <= now);
    if (pending) due.push({ taskId, record: pending });
  }
  return due;
}
