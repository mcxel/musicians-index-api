export type CompletionState =
  | "not-started" | "in-progress" | "blocked" | "review" | "done" | "archived";

export interface TaskCompletionRecord {
  taskId: string;
  title: string;
  state: CompletionState;
  ownerId: string;
  role: string;
  progress: number;
  checklistTotal: number;
  checklistDone: number;
  revenueImpact: number;
  startedAt?: string;
  completedAt?: string;
  archivedAt?: string;
  nextAction?: string;
  returnRoute?: string;
  signedOff: boolean;
}

const tasks = new Map<string, TaskCompletionRecord>();

export function registerTask(input: Omit<TaskCompletionRecord, "state" | "progress" | "signedOff">): TaskCompletionRecord {
  const record: TaskCompletionRecord = {
    ...input,
    state: "not-started",
    progress: 0,
    signedOff: false,
  };
  tasks.set(record.taskId, record);
  return record;
}

export function startTask(taskId: string): TaskCompletionRecord | null {
  const t = tasks.get(taskId);
  if (!t) return null;
  const next = { ...t, state: "in-progress" as CompletionState, startedAt: new Date().toISOString() };
  tasks.set(taskId, next);
  return next;
}

export function updateProgress(taskId: string, checklistDone: number): TaskCompletionRecord | null {
  const t = tasks.get(taskId);
  if (!t) return null;
  const progress = t.checklistTotal > 0 ? Math.round((checklistDone / t.checklistTotal) * 100) : 0;
  const state: CompletionState = progress >= 100 ? "review" : "in-progress";
  const next = { ...t, checklistDone, progress, state };
  tasks.set(taskId, next);
  return next;
}

export function blockTask(taskId: string, nextAction: string): TaskCompletionRecord | null {
  const t = tasks.get(taskId);
  if (!t) return null;
  const next = { ...t, state: "blocked" as CompletionState, nextAction };
  tasks.set(taskId, next);
  return next;
}

export function completeTask(taskId: string, returnRoute?: string): TaskCompletionRecord | null {
  const t = tasks.get(taskId);
  if (!t) return null;
  const next: TaskCompletionRecord = {
    ...t,
    state: "done",
    progress: 100,
    completedAt: new Date().toISOString(),
    returnRoute: returnRoute ?? t.returnRoute,
    signedOff: true,
  };
  tasks.set(taskId, next);
  return next;
}

export function archiveTask(taskId: string): TaskCompletionRecord | null {
  const t = tasks.get(taskId);
  if (!t) return null;
  const next = { ...t, state: "archived" as CompletionState, archivedAt: new Date().toISOString() };
  tasks.set(taskId, next);
  return next;
}

export function getTask(taskId: string): TaskCompletionRecord | null {
  return tasks.get(taskId) ?? null;
}

export function getTasksByOwner(ownerId: string): TaskCompletionRecord[] {
  return [...tasks.values()].filter((t) => t.ownerId === ownerId);
}

export function getTasksByState(state: CompletionState): TaskCompletionRecord[] {
  return [...tasks.values()].filter((t) => t.state === state);
}

export function getPlatformCompletionStats(): { total: number; done: number; inProgress: number; blocked: number; pct: number } {
  const all = [...tasks.values()];
  const done = all.filter((t) => t.state === "done").length;
  const inProgress = all.filter((t) => t.state === "in-progress").length;
  const blocked = all.filter((t) => t.state === "blocked").length;
  return { total: all.length, done, inProgress, blocked, pct: all.length > 0 ? Math.round((done / all.length) * 100) : 0 };
}
