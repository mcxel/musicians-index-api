export type VisualTaskState = "queued" | "active" | "blocked" | "failed" | "completed" | "approved" | "deployed";
export type VisualTaskType =
  | "homepage-hero"
  | "artist-card"
  | "venue-art"
  | "battle-poster"
  | "ticket-art"
  | "nft-art"
  | "sponsor-ad"
  | "billboard-art"
  | "avatar-clothing"
  | "avatar-prop"
  | "instrument-art"
  | "magazine-cover"
  | "article-art";

export type VisualTask = {
  taskId: string;
  type: VisualTaskType;
  state: VisualTaskState;
  owner: string;
  route: string;
  slotId?: string;
  priority: "critical" | "high" | "medium" | "low";
  createdAt: number;
  updatedAt: number;
  notes?: string;
};

const tasks = new Map<string, VisualTask>();

function id(): string {
  return `vtask_${Math.random().toString(36).slice(2, 11)}`;
}

export function createTask(input: Omit<VisualTask, "taskId" | "createdAt" | "updatedAt">): VisualTask {
  const now = Date.now();
  const task: VisualTask = { ...input, taskId: id(), createdAt: now, updatedAt: now };
  tasks.set(task.taskId, task);
  return task;
}

export function completeTask(taskId: string): VisualTask | null {
  return updateTaskState(taskId, "completed");
}

export function failTask(taskId: string, notes?: string): VisualTask | null {
  const current = tasks.get(taskId);
  if (!current) return null;
  const next: VisualTask = { ...current, state: "failed", notes, updatedAt: Date.now() };
  tasks.set(taskId, next);
  return next;
}

export function retryTask(taskId: string): VisualTask | null {
  return updateTaskState(taskId, "queued");
}

export function approveTask(taskId: string): VisualTask | null {
  return updateTaskState(taskId, "approved");
}

export function deployTask(taskId: string): VisualTask | null {
  return updateTaskState(taskId, "deployed");
}

export function listTasks(): VisualTask[] {
  return [...tasks.values()].sort((a, b) => b.updatedAt - a.updatedAt);
}

function updateTaskState(taskId: string, state: VisualTaskState): VisualTask | null {
  const current = tasks.get(taskId);
  if (!current) return null;
  const next: VisualTask = { ...current, state, updatedAt: Date.now() };
  tasks.set(taskId, next);
  return next;
}
