export type RepeatInterval = "hourly" | "every-4h" | "daily" | "weekly" | "monthly";

export interface RepeatTask {
  repeatId: string;
  botId: string;
  taskRef: string;
  interval: RepeatInterval;
  label: string;
  enabled: boolean;
  lastRunAt?: string;
  nextRunAt: string;
  runCount: number;
  failCount: number;
}

const tasks = new Map<string, RepeatTask>();
const botIndex = new Map<string, string[]>();

const INTERVAL_MS: Record<RepeatInterval, number> = {
  "hourly":    60 * 60 * 1000,
  "every-4h":  4 * 60 * 60 * 1000,
  "daily":     24 * 60 * 60 * 1000,
  "weekly":    7 * 24 * 60 * 60 * 1000,
  "monthly":   30 * 24 * 60 * 60 * 1000,
};

function gen(): string {
  return `rep_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function nextRunTime(interval: RepeatInterval, fromNow = true): string {
  const base = fromNow ? Date.now() : Date.now();
  return new Date(base + INTERVAL_MS[interval]).toISOString();
}

export function scheduleRepeatTask(
  botId: string,
  taskRef: string,
  interval: RepeatInterval,
  label: string,
): RepeatTask {
  const task: RepeatTask = {
    repeatId: gen(),
    botId,
    taskRef,
    interval,
    label,
    enabled: true,
    nextRunAt: nextRunTime(interval),
    runCount: 0,
    failCount: 0,
  };
  tasks.set(task.repeatId, task);
  const list = botIndex.get(botId) ?? [];
  list.push(task.repeatId);
  botIndex.set(botId, list);
  return task;
}

export function markRepeatRan(repeatId: string, success = true): RepeatTask | null {
  const task = tasks.get(repeatId);
  if (!task) return null;
  const next: RepeatTask = {
    ...task,
    lastRunAt: new Date().toISOString(),
    nextRunAt: nextRunTime(task.interval),
    runCount: task.runCount + 1,
    failCount: success ? task.failCount : task.failCount + 1,
  };
  tasks.set(repeatId, next);
  return next;
}

export function pauseRepeatTask(repeatId: string): void {
  const task = tasks.get(repeatId);
  if (task) tasks.set(repeatId, { ...task, enabled: false });
}

export function resumeRepeatTask(repeatId: string): void {
  const task = tasks.get(repeatId);
  if (task) tasks.set(repeatId, { ...task, enabled: true, nextRunAt: nextRunTime(task.interval) });
}

export function getDueRepeatTasks(): RepeatTask[] {
  const now = new Date().toISOString();
  return [...tasks.values()].filter((t) => t.enabled && t.nextRunAt <= now);
}

export function getBotRepeatTasks(botId: string): RepeatTask[] {
  const ids = botIndex.get(botId) ?? [];
  return ids.map((id) => tasks.get(id)!).filter(Boolean);
}

export function deleteRepeatTask(repeatId: string): void {
  const task = tasks.get(repeatId);
  if (task) {
    const list = botIndex.get(task.botId) ?? [];
    botIndex.set(task.botId, list.filter((id) => id !== repeatId));
    tasks.delete(repeatId);
  }
}
