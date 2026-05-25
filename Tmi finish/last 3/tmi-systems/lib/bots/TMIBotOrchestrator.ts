/**
 * TMIBotOrchestrator.ts
 * Autonomous bot management system for The Musician's Index.
 *
 * Bot tiers:
 *  - Hyper (200):    High-frequency engagement bots — voting, reactions, social activity
 *  - Regular (200):  Standard content bots — catalog updates, feed population, stats refresh
 *  - Sentinel (50):  Safety/moderation bots — flagging, fraud detection, rate-limit enforcement
 *
 * Architecture:
 *  - Each bot has a role, skill set, task queue, and cooldown tracker
 *  - Orchestrator distributes tasks via a priority queue
 *  - Bots report back status; Sentinel bots can pause/quarantine other bots
 *  - All bots respect platform rate limits and Big Ace approval gate for payouts
 */

/* ─── Types ─────────────────────────────────────────────────────────────── */
export type BotTier = "hyper" | "regular" | "sentinel";
export type BotStatus = "idle" | "busy" | "cooldown" | "paused" | "error";
export type TaskType =
  | "vote"            // cast vote in battle/challenge
  | "react"           // add emoji reaction
  | "follow"          // follow a performer
  | "catalog_update"  // refresh artist catalog metadata
  | "feed_populate"   // add activity items to feeds
  | "stats_refresh"   // recalculate XP / ranking
  | "flag_content"    // sentinel: flag rule violation
  | "check_duplicate" // sentinel: duplicate submission detection
  | "rate_limit_check"// sentinel: enforce API rate limits
  | "payout_queue"    // queue payout for Big Ace approval
  | "nft_mint"        // trigger NFT mint workflow
  | "ticket_validate" // validate ticket HMAC at door
  | "ad_rotate"       // rotate ad slot inventory
  | "email_dispatch"  // send transactional email
  | "leaderboard_sync"; // sync ranked leaderboard

export type TaskPriority = "critical" | "high" | "normal" | "low";

export interface BotTask {
  id: string;
  type: TaskType;
  priority: TaskPriority;
  payload: Record<string, unknown>;
  createdAt: number;
  attempts: number;
  maxAttempts: number;
  assignedBotId?: string;
  result?: unknown;
  error?: string;
  completedAt?: number;
}

export interface Bot {
  id: string;
  tier: BotTier;
  name: string;
  status: BotStatus;
  skills: TaskType[];
  taskHistory: string[];  // task IDs
  cooldownUntil: number;
  createdAt: number;
  errorCount: number;
  completedCount: number;
  activeTaskId?: string;
}

export interface OrchestratorStats {
  total: number;
  idle: number;
  busy: number;
  cooldown: number;
  paused: number;
  error: number;
  queueDepth: number;
  tasksCompleted: number;
  tasksFailed: number;
}

/* ─── Bot skill sets by tier ─────────────────────────────────────────────── */
const HYPER_SKILLS: TaskType[] = ["vote", "react", "follow", "ad_rotate"];
const REGULAR_SKILLS: TaskType[] = [
  "catalog_update", "feed_populate", "stats_refresh", "leaderboard_sync",
  "nft_mint", "ticket_validate", "email_dispatch",
];
const SENTINEL_SKILLS: TaskType[] = [
  "flag_content", "check_duplicate", "rate_limit_check", "payout_queue",
];

const HYPER_COOLDOWN_MS = 500;
const REGULAR_COOLDOWN_MS = 2000;
const SENTINEL_COOLDOWN_MS = 5000;

const COOLDOWN_BY_TIER: Record<BotTier, number> = {
  hyper: HYPER_COOLDOWN_MS,
  regular: REGULAR_COOLDOWN_MS,
  sentinel: SENTINEL_COOLDOWN_MS,
};

/* ─── Factory ─────────────────────────────────────────────────────────────── */
function createBot(tier: BotTier, index: number): Bot {
  const prefixes: Record<BotTier, string> = {
    hyper: "HYP",
    regular: "REG",
    sentinel: "SEN",
  };
  const skills: Record<BotTier, TaskType[]> = {
    hyper: HYPER_SKILLS,
    regular: REGULAR_SKILLS,
    sentinel: SENTINEL_SKILLS,
  };
  return {
    id: `${prefixes[tier]}-${String(index).padStart(4, "0")}`,
    tier,
    name: `${tier.charAt(0).toUpperCase() + tier.slice(1)} Bot ${index}`,
    status: "idle",
    skills: skills[tier],
    taskHistory: [],
    cooldownUntil: 0,
    createdAt: Date.now(),
    errorCount: 0,
    completedCount: 0,
  };
}

/* ─── Task handler registry ───────────────────────────────────────────────── */
type TaskHandler = (
  task: BotTask,
  bot: Bot
) => Promise<{ success: boolean; result?: unknown; error?: string }>;

/* ─── TMIBotOrchestrator ─────────────────────────────────────────────────── */
export class TMIBotOrchestrator {
  private bots = new Map<string, Bot>();
  private taskQueue: BotTask[] = [];
  private handlers = new Map<TaskType, TaskHandler>();
  private running = false;
  private tickInterval: ReturnType<typeof setInterval> | null = null;
  private completedCount = 0;
  private failedCount = 0;

  constructor() {
    this.initializeBots();
    this.registerDefaultHandlers();
  }

  /* ─── Bot initialization ── */
  private initializeBots(): void {
    // 200 Hyper bots
    for (let i = 1; i <= 200; i++) {
      const bot = createBot("hyper", i);
      this.bots.set(bot.id, bot);
    }
    // 200 Regular bots
    for (let i = 1; i <= 200; i++) {
      const bot = createBot("regular", i);
      this.bots.set(bot.id, bot);
    }
    // 50 Sentinel bots
    for (let i = 1; i <= 50; i++) {
      const bot = createBot("sentinel", i);
      this.bots.set(bot.id, bot);
    }
  }

  /* ─── Default task handlers ── */
  private registerDefaultHandlers(): void {
    this.registerHandler("vote", async (task) => {
      // Simulate casting a vote — in production, call POST /api/battles/vote
      await sleep(50 + Math.random() * 100);
      return { success: true, result: { voteCast: true, targetId: task.payload.targetId } };
    });

    this.registerHandler("react", async (task) => {
      await sleep(30 + Math.random() * 80);
      return { success: true, result: { emoji: task.payload.emoji, placed: true } };
    });

    this.registerHandler("follow", async (task) => {
      await sleep(100 + Math.random() * 200);
      return { success: true, result: { followed: task.payload.targetUserId } };
    });

    this.registerHandler("stats_refresh", async (task) => {
      await sleep(200 + Math.random() * 400);
      return { success: true, result: { refreshed: task.payload.userId, newXp: task.payload.xpDelta } };
    });

    this.registerHandler("leaderboard_sync", async (task) => {
      await sleep(500 + Math.random() * 500);
      return { success: true, result: { synced: true } };
    });

    this.registerHandler("flag_content", async (task) => {
      await sleep(200);
      const isFlagged = Math.random() < 0.1; // 10% flag rate in simulation
      return { success: true, result: { flagged: isFlagged, reason: isFlagged ? "policy_violation" : null } };
    });

    this.registerHandler("check_duplicate", async (task) => {
      await sleep(150);
      return { success: true, result: { isDuplicate: false } };
    });

    this.registerHandler("rate_limit_check", async (task) => {
      await sleep(50);
      return { success: true, result: { allowed: true, remaining: 999 } };
    });

    this.registerHandler("payout_queue", async (task) => {
      // Big Ace approval required — queue the payout, do NOT execute automatically
      await sleep(100);
      return {
        success: true,
        result: {
          queued: true,
          requiresApproval: true,
          approver: "Big_Ace",
          payoutId: `PAY-${Date.now()}`,
          amount: task.payload.amount,
        },
      };
    });

    this.registerHandler("email_dispatch", async (task) => {
      await sleep(300);
      return { success: true, result: { emailSent: true, to: task.payload.email } };
    });

    this.registerHandler("nft_mint", async (task) => {
      await sleep(1000 + Math.random() * 500);
      return { success: true, result: { minted: true, tokenId: `TMI-${Date.now()}` } };
    });

    this.registerHandler("ticket_validate", async (task) => {
      await sleep(80);
      return { success: true, result: { valid: true, ticketId: task.payload.ticketId } };
    });

    this.registerHandler("ad_rotate", async (task) => {
      await sleep(100);
      return { success: true, result: { rotated: true, newAdId: `AD-${Date.now()}` } };
    });

    this.registerHandler("catalog_update", async (task) => {
      await sleep(400 + Math.random() * 400);
      return { success: true, result: { updated: true, artistId: task.payload.artistId } };
    });

    this.registerHandler("feed_populate", async (task) => {
      await sleep(300);
      return { success: true, result: { itemsAdded: 5, feedId: task.payload.feedId } };
    });
  }

  /* ─── Public API ── */

  /** Register a custom task handler */
  registerHandler(type: TaskType, handler: TaskHandler): void {
    this.handlers.set(type, handler);
  }

  /** Enqueue a task */
  enqueue(type: TaskType, payload: Record<string, unknown>, priority: TaskPriority = "normal", maxAttempts = 3): BotTask {
    const task: BotTask = {
      id: `TASK-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type,
      priority,
      payload,
      createdAt: Date.now(),
      attempts: 0,
      maxAttempts,
    };
    this.taskQueue.push(task);
    this.sortQueue();
    return task;
  }

  /** Bulk enqueue */
  enqueueBatch(
    tasks: Array<{ type: TaskType; payload: Record<string, unknown>; priority?: TaskPriority }>
  ): BotTask[] {
    return tasks.map((t) => this.enqueue(t.type, t.payload, t.priority));
  }

  /** Start the orchestrator tick */
  start(): void {
    if (this.running) return;
    this.running = true;
    this.tickInterval = setInterval(() => this.tick(), 100);
  }

  /** Stop the orchestrator */
  stop(): void {
    this.running = false;
    if (this.tickInterval) clearInterval(this.tickInterval);
  }

  /** Get orchestrator stats */
  getStats(): OrchestratorStats {
    const statuses: Record<BotStatus, number> = {
      idle: 0, busy: 0, cooldown: 0, paused: 0, error: 0,
    };
    for (const bot of this.bots.values()) {
      statuses[bot.status]++;
    }
    return {
      total: this.bots.size,
      idle: statuses.idle,
      busy: statuses.busy,
      cooldown: statuses.cooldown,
      paused: statuses.paused,
      error: statuses.error,
      queueDepth: this.taskQueue.length,
      tasksCompleted: this.completedCount,
      tasksFailed: this.failedCount,
    };
  }

  /** Get a bot by ID */
  getBot(id: string): Bot | undefined {
    return this.bots.get(id);
  }

  /** Pause a bot (Sentinel action) */
  pauseBot(botId: string, reason: string): void {
    const bot = this.bots.get(botId);
    if (bot) {
      bot.status = "paused";
      console.warn(`[Sentinel] Paused bot ${botId}: ${reason}`);
    }
  }

  /** Resume a paused bot */
  resumeBot(botId: string): void {
    const bot = this.bots.get(botId);
    if (bot?.status === "paused") {
      bot.status = "idle";
    }
  }

  /** Get all bots in a given tier */
  getBotsByTier(tier: BotTier): Bot[] {
    return Array.from(this.bots.values()).filter((b) => b.tier === tier);
  }

  /* ─── Internal ── */
  private sortQueue(): void {
    const priority: Record<TaskPriority, number> = { critical: 0, high: 1, normal: 2, low: 3 };
    this.taskQueue.sort((a, b) => priority[a.priority] - priority[b.priority]);
  }

  private findAvailableBot(task: BotTask): Bot | undefined {
    const now = Date.now();
    for (const bot of this.bots.values()) {
      if (
        bot.status === "idle" &&
        bot.cooldownUntil <= now &&
        bot.skills.includes(task.type)
      ) {
        return bot;
      }
    }
    return undefined;
  }

  private updateCooldownStatuses(): void {
    const now = Date.now();
    for (const bot of this.bots.values()) {
      if (bot.status === "cooldown" && bot.cooldownUntil <= now) {
        bot.status = "idle";
      }
    }
  }

  private async tick(): Promise<void> {
    this.updateCooldownStatuses();
    if (!this.taskQueue.length) return;

    const task = this.taskQueue[0];
    const bot = this.findAvailableBot(task);
    if (!bot) return;

    // Assign
    this.taskQueue.shift();
    bot.status = "busy";
    bot.activeTaskId = task.id;
    task.assignedBotId = bot.id;
    task.attempts++;

    const handler = this.handlers.get(task.type);
    if (!handler) {
      bot.status = "idle";
      bot.errorCount++;
      return;
    }

    try {
      const result = await handler(task, bot);
      task.result = result.result;
      task.completedAt = Date.now();
      bot.completedCount++;
      this.completedCount++;
    } catch (err) {
      task.error = String(err);
      bot.errorCount++;
      this.failedCount++;
      if (task.attempts < task.maxAttempts) {
        // Re-enqueue with lower priority
        this.taskQueue.push({ ...task, priority: "low" });
        this.sortQueue();
      }
    } finally {
      bot.taskHistory.push(task.id);
      bot.activeTaskId = undefined;
      bot.cooldownUntil = Date.now() + COOLDOWN_BY_TIER[bot.tier];
      bot.status = "cooldown";
    }
  }
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/* ─── Singleton ──────────────────────────────────────────────────────────── */
let _orchestrator: TMIBotOrchestrator | null = null;

export function getBotOrchestrator(): TMIBotOrchestrator {
  if (!_orchestrator) {
    _orchestrator = new TMIBotOrchestrator();
    _orchestrator.start();
  }
  return _orchestrator;
}
