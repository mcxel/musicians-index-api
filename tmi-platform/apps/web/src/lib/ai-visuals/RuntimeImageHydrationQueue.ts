/**
 * RuntimeImageHydrationQueue
 * Priority queue for runtime image slot hydration.
 * Coordinates bulk visual slot filling across routes without blocking the UI thread.
 */

import { routeVisualReplacement, type VisualReplacementRequest, type VisualReplacementOutcome } from "@/lib/ai-visuals/AIVisualReplacementRouter";

export type HydrationPriority = "critical" | "high" | "normal" | "deferred";

export interface HydrationTask {
  taskId: string;
  request: VisualReplacementRequest;
  priority: HydrationPriority;
  enqueuedAt: number;
  processedAt: number | null;
  outcome: VisualReplacementOutcome | null;
  status: "queued" | "processing" | "done" | "failed";
}

const PRIORITY_ORDER: Record<HydrationPriority, number> = {
  critical: 0,
  high:     1,
  normal:   2,
  deferred: 3,
};

const queue: HydrationTask[] = [];
let taskSeq = 0;
let isProcessing = false;

function nextTaskId(): string {
  return `hydrate-${Date.now()}-${(taskSeq++).toString(36)}`;
}

export function enqueueForHydration(
  request: VisualReplacementRequest,
  priority: HydrationPriority = "normal"
): HydrationTask {
  const task: HydrationTask = {
    taskId: nextTaskId(),
    request,
    priority,
    enqueuedAt: Date.now(),
    processedAt: null,
    outcome: null,
    status: "queued",
  };

  queue.push(task);
  queue.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || a.enqueuedAt - b.enqueuedAt);

  return task;
}

export function processNextBatch(batchSize = 5): HydrationTask[] {
  if (isProcessing) return [];
  isProcessing = true;

  const batch = queue.filter(t => t.status === "queued").slice(0, batchSize);

  for (const task of batch) {
    task.status = "processing";
    try {
      task.outcome = routeVisualReplacement(task.request);
      task.status = "done";
    } catch {
      task.status = "failed";
    }
    task.processedAt = Date.now();
  }

  isProcessing = false;
  return batch;
}

export function processAllQueued(): HydrationTask[] {
  const pending = queue.filter(t => t.status === "queued");
  const results: HydrationTask[] = [];
  for (const task of pending) {
    results.push(...processNextBatch(1));
  }
  return results;
}

export function bulkEnqueue(
  requests: VisualReplacementRequest[],
  priority: HydrationPriority = "normal"
): HydrationTask[] {
  return requests.map(r => enqueueForHydration(r, priority));
}

export function getQueueDepth(): { queued: number; processing: number; done: number; failed: number; total: number } {
  let queued = 0, processing = 0, done = 0, failed = 0;
  for (const t of queue) {
    if (t.status === "queued") queued++;
    else if (t.status === "processing") processing++;
    else if (t.status === "done") done++;
    else failed++;
  }
  return { queued, processing, done, failed, total: queue.length };
}

export function getTaskById(taskId: string): HydrationTask | null {
  return queue.find(t => t.taskId === taskId) ?? null;
}

export function clearCompletedTasks(): number {
  const before = queue.length;
  const toRemove = queue.filter(t => t.status === "done" || t.status === "failed");
  toRemove.forEach(t => queue.splice(queue.indexOf(t), 1));
  return before - queue.length;
}
