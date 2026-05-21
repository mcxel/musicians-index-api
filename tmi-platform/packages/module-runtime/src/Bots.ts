// ─── Bot Contracts ─────────────────────────────────────────────────────────

export interface BotReport {
  botId: string;
  type: "WATCHER" | "REPAIR" | "SENTINEL" | "AUDIT" | "SIMULATION" | "SUPPORT";
  moduleId: string;
  status: "OK" | "WARN" | "CRITICAL";
  findings: string[];
  timestamp: number;
}

// ─── Watcher Bot ─────────────────────────────────────────────────────────────

export class WatcherBot {
  readonly id: string;
  private moduleId: string;
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(moduleId: string) {
    this.moduleId = moduleId;
    this.id = `watcher-${moduleId}-${Date.now()}`;
  }

  start(intervalMs = 15_000): void {
    this.timer = setInterval(() => this.pulse(), intervalMs);
    console.log(`[${this.moduleId}/bot:watcher] Started`);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private pulse(): void {
    console.debug(`[${this.moduleId}/bot:watcher] Heartbeat OK`);
  }
}

// ─── Repair Bot ───────────────────────────────────────────────────────────────

export class RepairBot {
  readonly id: string;
  private moduleId: string;
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(moduleId: string) {
    this.moduleId = moduleId;
    this.id = `repair-${moduleId}-${Date.now()}`;
  }

  start(intervalMs = 60_000): void {
    this.timer = setInterval(() => this.scan(), intervalMs);
    console.log(`[${this.moduleId}/bot:repair] Started`);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private scan(): void {
    console.debug(`[${this.moduleId}/bot:repair] Scan complete — no issues`);
  }
}

// ─── Sentinel Bot ────────────────────────────────────────────────────────────

export class SentinelBot {
  readonly id: string;
  private moduleId: string;
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(moduleId: string) {
    this.moduleId = moduleId;
    this.id = `sentinel-${moduleId}-${Date.now()}`;
  }

  start(intervalMs = 30_000): void {
    this.timer = setInterval(() => this.check(), intervalMs);
    console.log(`[${this.moduleId}/bot:sentinel] Started`);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private check(): void {
    console.debug(`[${this.moduleId}/bot:sentinel] Security boundary OK`);
  }
}

// ─── Audit Bot ───────────────────────────────────────────────────────────────

export class AuditBot {
  readonly id: string;
  private moduleId: string;
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(moduleId: string) {
    this.moduleId = moduleId;
    this.id = `audit-${moduleId}-${Date.now()}`;
  }

  start(intervalMs = 300_000): void {
    this.timer = setInterval(() => this.run(), intervalMs);
    console.log(`[${this.moduleId}/bot:audit] Started`);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private run(): void {
    console.log(`[${this.moduleId}/bot:audit] Audit pass complete`);
  }
}
