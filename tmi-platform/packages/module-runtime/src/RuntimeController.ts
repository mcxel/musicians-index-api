import type {
  ModuleConfig,
  ModuleState,
  RuntimeSnapshot,
  StimulationMode,
} from "./types.js";

export class RuntimeController {
  private state: ModuleState = "STOPPED";
  private bootTime: number | null = null;
  private config: ModuleConfig;
  private healthCheckTimer: ReturnType<typeof setInterval> | null = null;
  private readonly reloadDelays = [1000, 2000, 5000, 10000, 20000, 30000];

  constructor(config: ModuleConfig) {
    this.config = config;
  }

  // ─── Lifecycle ──────────────────────────────────────────────────────────────

  async boot(): Promise<void> {
    if (this.state !== "STOPPED") {
      throw new Error(
        `Cannot boot: module ${this.config.id} is in state ${this.state}`
      );
    }
    this.state = "BOOTING";
    this.bootTime = Date.now();
    this.startHealthCheck();
    this.state = "RUNNING";
    console.log(`[${this.config.id}] Module booted`);
  }

  async stop(): Promise<void> {
    this.stopHealthCheck();
    this.state = "STOPPED";
    this.bootTime = null;
    console.log(`[${this.config.id}] Module stopped`);
  }

  async restart(): Promise<void> {
    await this.stop();
    await this.boot();
  }

  /** Pause processing, preserve in-memory state. */
  freeze(): void {
    if (this.state !== "RUNNING") return;
    this.stopHealthCheck();
    this.state = "FROZEN";
    console.warn(`[${this.config.id}] Module FROZEN`);
  }

  /** Unfreeze back to running. */
  thaw(): void {
    if (this.state !== "FROZEN") return;
    this.startHealthCheck();
    this.state = "RUNNING";
    console.log(`[${this.config.id}] Module thawed`);
  }

  /**
   * Block all external API calls while keeping internal processing alive.
   * Useful for security incidents requiring containment.
   */
  isolate(): void {
    this.state = "ISOLATED";
    console.warn(`[${this.config.id}] Module ISOLATED — external calls blocked`);
  }

  /**
   * Immediate halt. Preserves logs. Requires manual restart.
   * Use only for critical security or data integrity failures.
   */
  emergencyLock(reason: string): void {
    this.stopHealthCheck();
    this.state = "EMERGENCY_LOCK";
    console.error(
      `[${this.config.id}] EMERGENCY LOCK — ${reason}. Manual restart required.`
    );
  }

  // ─── Accessors ──────────────────────────────────────────────────────────────

  getState(): ModuleState {
    return this.state;
  }

  isRunning(): boolean {
    return this.state === "RUNNING";
  }

  getUptimeMs(): number {
    return this.bootTime ? Date.now() - this.bootTime : 0;
  }

  getSnapshot(stimMode: StimulationMode = "QUIET"): RuntimeSnapshot {
    const mem = process.memoryUsage();
    return {
      moduleId: this.config.id,
      state: this.state,
      uptimeMs: this.getUptimeMs(),
      memoryRssMb: Math.round(mem.rss / 1024 / 1024),
      memoryHeapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
      queueDepth: 0, // overridden by subclasses via getQueueDepth()
      stimulationMode: stimMode,
      healthScore: this.state === "RUNNING" ? 100 : 0,
      lastCheckpointId: null,
      timestamp: Date.now(),
    };
  }

  // ─── Internal ───────────────────────────────────────────────────────────────

  private startHealthCheck(): void {
    this.healthCheckTimer = setInterval(() => {
      const snap = this.getSnapshot();
      if (snap.memoryRssMb > this.config.runtime.maxMemoryMb) {
        console.warn(
          `[${this.config.id}] Memory threshold exceeded: ${snap.memoryRssMb}MB`
        );
      }
    }, this.config.runtime.healthCheckIntervalMs);
  }

  private stopHealthCheck(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
  }
}
