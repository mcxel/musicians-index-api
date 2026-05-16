/**
 * BotTaskOrchestratorEngine
 * Task queue + dispatch for bot automation — NFT minting, ticket gen, chat pumping.
 */

export type BotTaskType =
  | "mint_nft_ticket"
  | "generate_batch_tickets"
  | "send_welcome_message"
  | "moderate_room"
  | "fill_seats"
  | "announce_giveaway"
  | "process_refund"
  | "send_reminder"
  | "custom";

export type BotTaskStatus = "queued" | "in_progress" | "completed" | "failed" | "cancelled";

export type BotTask = {
  taskId: string;
  taskType: BotTaskType;
  botId: string;
  payload: Record<string, unknown>;
  status: BotTaskStatus;
  priority: number;
  createdAtMs: number;
  startedAtMs: number | null;
  completedAtMs: number | null;
  retryCount: number;
  maxRetries: number;
  errorMessage?: string;
  result?: unknown;
};

let _taskSeq = 0;

export class BotTaskOrchestratorEngine {
  private readonly queue: BotTask[] = [];
  private readonly completed: BotTask[] = [];
  private readonly botWorkloads: Map<string, number> = new Map(); // botId -> active task count
  private readonly MAX_BOT_CONCURRENT = 3;

  enqueue(
    taskType: BotTaskType,
    botId: string,
    payload: Record<string, unknown>,
    priority: number = 50,
    maxRetries: number = 2,
  ): BotTask {
    const task: BotTask = {
      taskId: `task-${Date.now()}-${++_taskSeq}`,
      taskType,
      botId,
      payload,
      status: "queued",
      priority,
      createdAtMs: Date.now(),
      startedAtMs: null,
      completedAtMs: null,
      retryCount: 0,
      maxRetries,
    };

    this.queue.push(task);
    this.queue.sort((a, b) => b.priority - a.priority);
    return task;
  }

  dequeueNext(botId?: string): BotTask | null {
    const available = this.queue.filter((t) => {
      if (t.status !== "queued") return false;
      if (botId && t.botId !== botId) return false;

      const workload = this.botWorkloads.get(t.botId) ?? 0;
      return workload < this.MAX_BOT_CONCURRENT;
    });

    if (available.length === 0) return null;
    const task = available[0];
    task.status = "in_progress";
    task.startedAtMs = Date.now();

    const workload = this.botWorkloads.get(task.botId) ?? 0;
    this.botWorkloads.set(task.botId, workload + 1);

    return task;
  }

  complete(taskId: string, result?: unknown): void {
    const task = this.queue.find((t) => t.taskId === taskId);
    if (!task) return;

    task.status = "completed";
    task.completedAtMs = Date.now();
    task.result = result;

    this.decrementWorkload(task.botId);
    this.queue.splice(this.queue.indexOf(task), 1);
    this.completed.push(task);
  }

  fail(taskId: string, errorMessage: string): void {
    const task = this.queue.find((t) => t.taskId === taskId);
    if (!task) return;

    this.decrementWorkload(task.botId);

    if (task.retryCount < task.maxRetries) {
      task.retryCount += 1;
      task.status = "queued";
      task.startedAtMs = null;
    } else {
      task.status = "failed";
      task.errorMessage = errorMessage;
      task.completedAtMs = Date.now();
      this.queue.splice(this.queue.indexOf(task), 1);
      this.completed.push(task);
    }
  }

  cancel(taskId: string): void {
    const idx = this.queue.findIndex((t) => t.taskId === taskId);
    if (idx === -1) return;
    const [task] = this.queue.splice(idx, 1);
    task.status = "cancelled";
    this.decrementWorkload(task.botId);
    this.completed.push(task);
  }

  private decrementWorkload(botId: string): void {
    const workload = this.botWorkloads.get(botId) ?? 0;
    this.botWorkloads.set(botId, Math.max(0, workload - 1));
  }

  getQueueLength(): number {
    return this.queue.filter((t) => t.status === "queued").length;
  }

  getInProgress(): BotTask[] {
    return this.queue.filter((t) => t.status === "in_progress");
  }

  getRecentCompleted(n: number = 10): BotTask[] {
    return [...this.completed].slice(-n).reverse();
  }

  getBotWorkload(botId: string): number {
    return this.botWorkloads.get(botId) ?? 0;
  }

  clearCompleted(): void {
    this.completed.length = 0;
  }
}

export const botTaskOrchestratorEngine = new BotTaskOrchestratorEngine();
