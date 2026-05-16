export type QueuePriority = 1 | 2 | 3 | 4 | 5;

export interface QueuedTask {
  queueId: string;
  botId: string;
  taskRef: string;
  priority: QueuePriority;
  enqueuedAt: string;
  scheduledFor?: string;
  dequeued: boolean;
  dequeuedAt?: string;
}

const queues = new Map<string, QueuedTask[]>();

function gen(): string {
  return `qt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

export function enqueue(
  botId: string,
  taskRef: string,
  priority: QueuePriority = 3,
  scheduledFor?: string,
): QueuedTask {
  const item: QueuedTask = {
    queueId: gen(),
    botId,
    taskRef,
    priority,
    enqueuedAt: new Date().toISOString(),
    scheduledFor,
    dequeued: false,
  };
  const q = queues.get(botId) ?? [];
  q.push(item);
  q.sort((a, b) => a.priority - b.priority);
  queues.set(botId, q);
  return item;
}

export function dequeue(botId: string): QueuedTask | null {
  const q = queues.get(botId) ?? [];
  const now = new Date().toISOString();
  const idx = q.findIndex(
    (t) => !t.dequeued && (!t.scheduledFor || t.scheduledFor <= now),
  );
  if (idx < 0) return null;
  const item = { ...q[idx], dequeued: true, dequeuedAt: new Date().toISOString() };
  q[idx] = item;
  queues.set(botId, q);
  return item;
}

export function peek(botId: string): QueuedTask | null {
  const q = queues.get(botId) ?? [];
  const now = new Date().toISOString();
  return q.find((t) => !t.dequeued && (!t.scheduledFor || t.scheduledFor <= now)) ?? null;
}

export function getQueueLength(botId: string): number {
  return (queues.get(botId) ?? []).filter((t) => !t.dequeued).length;
}

export function clearQueue(botId: string): void {
  queues.delete(botId);
}

export function requeue(botId: string, queueId: string, newPriority?: QueuePriority): boolean {
  const q = queues.get(botId) ?? [];
  const idx = q.findIndex((t) => t.queueId === queueId);
  if (idx < 0) return false;
  q[idx] = { ...q[idx], dequeued: false, dequeuedAt: undefined, priority: newPriority ?? q[idx].priority };
  q.sort((a, b) => a.priority - b.priority);
  queues.set(botId, q);
  return true;
}

export function getFullQueue(botId: string): QueuedTask[] {
  return [...(queues.get(botId) ?? [])];
}
