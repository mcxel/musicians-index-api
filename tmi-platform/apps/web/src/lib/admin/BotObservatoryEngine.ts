/**
 * BotObservatoryEngine
 * Live monitoring of all TMI bots: activity, health, message volume, error states.
 */

export type BotStatus = "active" | "idle" | "error" | "cooldown" | "offline" | "banned";
export type BotRole = "audience" | "hype" | "moderator" | "judge" | "contestant" | "musician" | "host-support" | "vote";

export interface BotActivityEvent {
  botId: string;
  type: "message" | "vote" | "reaction" | "join" | "leave" | "error" | "restart";
  detail?: string;
  showId?: string;
  timestamp: number;
}

export interface BotMetrics {
  botId: string;
  name: string;
  role: BotRole;
  status: BotStatus;
  messagesLast1h: number;
  messagesLast24h: number;
  votesLast1h: number;
  reactionsLast1h: number;
  errorCount: number;
  lastActiveAt: number;
  currentShowId?: string;
  cooldownUntil: number;
}

export interface ObservatorySnapshot {
  timestamp: string;
  totalBots: number;
  activeBots: number;
  idleBots: number;
  errorBots: number;
  offlineBots: number;
  messagesPerMinute: number;
  votesPerMinute: number;
  botsByRole: Record<BotRole, number>;
  recentEvents: BotActivityEvent[];
  errorBotIds: string[];
}

export class BotObservatoryEngine {
  private static _instance: BotObservatoryEngine | null = null;

  private _bots: Map<string, BotMetrics> = new Map();
  private _eventLog: BotActivityEvent[] = [];
  private _listeners: Set<(snapshot: ObservatorySnapshot) => void> = new Set();
  private _snapshotInterval: ReturnType<typeof setInterval> | null = null;

  static getInstance(): BotObservatoryEngine {
    if (!BotObservatoryEngine._instance) {
      BotObservatoryEngine._instance = new BotObservatoryEngine();
    }
    return BotObservatoryEngine._instance;
  }

  // ── Bot registration ───────────────────────────────────────────────────────

  registerBot(botId: string, name: string, role: BotRole): BotMetrics {
    const metrics: BotMetrics = {
      botId,
      name,
      role,
      status: "idle",
      messagesLast1h: 0,
      messagesLast24h: 0,
      votesLast1h: 0,
      reactionsLast1h: 0,
      errorCount: 0,
      lastActiveAt: Date.now(),
      cooldownUntil: 0,
    };
    this._bots.set(botId, metrics);
    return metrics;
  }

  registerBots(bots: { botId: string; name: string; role: BotRole }[]): void {
    for (const b of bots) this.registerBot(b.botId, b.name, b.role);
  }

  // ── Activity recording ─────────────────────────────────────────────────────

  recordEvent(event: Omit<BotActivityEvent, "timestamp">): void {
    const full: BotActivityEvent = { ...event, timestamp: Date.now() };
    this._eventLog.push(full);
    if (this._eventLog.length > 1000) this._eventLog.shift();

    const bot = this._bots.get(event.botId);
    if (!bot) return;

    bot.lastActiveAt = Date.now();

    switch (event.type) {
      case "message":
        bot.messagesLast1h++;
        bot.messagesLast24h++;
        bot.status = "active";
        break;
      case "vote":
        bot.votesLast1h++;
        bot.status = "active";
        break;
      case "reaction":
        bot.reactionsLast1h++;
        break;
      case "error":
        bot.errorCount++;
        bot.status = "error";
        break;
      case "join":
        bot.status = "active";
        bot.currentShowId = event.showId;
        break;
      case "leave":
        bot.status = "idle";
        bot.currentShowId = undefined;
        break;
      case "restart":
        bot.status = "idle";
        bot.errorCount = 0;
        break;
    }

    this._broadcastSnapshot();
  }

  setBotStatus(botId: string, status: BotStatus, cooldownMs = 0): void {
    const bot = this._bots.get(botId);
    if (!bot) return;
    bot.status = status;
    if (cooldownMs > 0) {
      bot.cooldownUntil = Date.now() + cooldownMs;
      setTimeout(() => {
        const b = this._bots.get(botId);
        if (b && b.status === "cooldown") b.status = "idle";
      }, cooldownMs);
    }
    this._broadcastSnapshot();
  }

  // ── Snapshot ──────────────────────────────────────────────────────────────

  getSnapshot(): ObservatorySnapshot {
    const bots = [...this._bots.values()];
    const now = Date.now();
    const recentMs = 60_000;
    const recentEvents = this._eventLog.filter((e) => now - e.timestamp < recentMs);

    const messagesPerMinute = recentEvents.filter((e) => e.type === "message").length;
    const votesPerMinute = recentEvents.filter((e) => e.type === "vote").length;

    const botsByRole = {} as Record<BotRole, number>;
    for (const bot of bots) {
      botsByRole[bot.role] = (botsByRole[bot.role] ?? 0) + 1;
    }

    return {
      timestamp: new Date().toISOString(),
      totalBots: bots.length,
      activeBots: bots.filter((b) => b.status === "active").length,
      idleBots: bots.filter((b) => b.status === "idle").length,
      errorBots: bots.filter((b) => b.status === "error").length,
      offlineBots: bots.filter((b) => b.status === "offline").length,
      messagesPerMinute,
      votesPerMinute,
      botsByRole,
      recentEvents: this._eventLog.slice(-50),
      errorBotIds: bots.filter((b) => b.status === "error").map((b) => b.botId),
    };
  }

  getBotMetrics(botId: string): BotMetrics | null {
    return this._bots.get(botId) ?? null;
  }

  getAllMetrics(): BotMetrics[] {
    return [...this._bots.values()];
  }

  getErrorBots(): BotMetrics[] {
    return [...this._bots.values()].filter((b) => b.status === "error");
  }

  // ── Auto-snapshot broadcast ────────────────────────────────────────────────

  startAutoSnapshot(intervalMs = 10_000): void {
    if (this._snapshotInterval) return;
    this._snapshotInterval = setInterval(() => this._broadcastSnapshot(), intervalMs);
  }

  stopAutoSnapshot(): void {
    if (this._snapshotInterval) {
      clearInterval(this._snapshotInterval);
      this._snapshotInterval = null;
    }
  }

  // ── Subscription ──────────────────────────────────────────────────────────

  onSnapshot(cb: (snapshot: ObservatorySnapshot) => void): () => void {
    this._listeners.add(cb);
    return () => this._listeners.delete(cb);
  }

  private _broadcastSnapshot(): void {
    const snap = this.getSnapshot();
    for (const cb of this._listeners) cb(snap);
  }
}

export const botObservatoryEngine = BotObservatoryEngine.getInstance();
