import type { ModuleId, StimulationConfig, StimulationMode } from "./types.js";

export abstract class BaseStimulator {
  protected moduleId: ModuleId;
  protected isRunning = false;
  protected intensity = 0.5;
  protected timer: ReturnType<typeof setInterval> | null = null;

  constructor(moduleId: ModuleId) {
    this.moduleId = moduleId;
  }

  abstract get name(): string;
  protected abstract tick(): Promise<void>;

  start(intensity: number): void {
    if (this.isRunning) return;
    this.intensity = Math.max(0, Math.min(1, intensity));
    this.isRunning = true;
    const intervalMs = Math.round(1000 / (0.1 + this.intensity * 9));
    this.timer = setInterval(() => void this.tick(), intervalMs);
    console.log(
      `[${this.moduleId}/${this.name}] Started at intensity ${this.intensity}`
    );
  }

  stop(): void {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    console.log(`[${this.moduleId}/${this.name}] Stopped`);
  }

  setIntensity(intensity: number): void {
    const wasRunning = this.isRunning;
    if (wasRunning) this.stop();
    this.intensity = Math.max(0, Math.min(1, intensity));
    if (wasRunning) this.start(this.intensity);
  }
}

// ─── Traffic Stimulator ───────────────────────────────────────────────────────

export class TrafficStimulator extends BaseStimulator {
  get name() {
    return "TrafficStimulator";
  }

  protected async tick(): Promise<void> {
    const events = [
      "user.arrived",
      "user.clicked",
      "session.started",
      "session.ended",
      "user.reconnected",
    ];
    const type = events[Math.floor(Math.random() * events.length)];
    if (Math.random() < this.intensity) {
      console.debug(`[${this.moduleId}/traffic] simulate: ${type}`);
    }
  }
}

// ─── Logic Stimulator ─────────────────────────────────────────────────────────

export class LogicStimulator extends BaseStimulator {
  private logicBehaviors: string[];

  constructor(moduleId: ModuleId, behaviors: string[] = []) {
    super(moduleId);
    this.logicBehaviors =
      behaviors.length > 0 ? behaviors : ["state.validate", "flow.traverse"];
  }

  get name() {
    return "LogicStimulator";
  }

  protected async tick(): Promise<void> {
    const behavior =
      this.logicBehaviors[
        Math.floor(Math.random() * this.logicBehaviors.length)
      ];
    if (Math.random() < this.intensity * 0.5) {
      console.debug(`[${this.moduleId}/logic] exercise: ${behavior}`);
    }
  }
}

// ─── Failure Stimulator ───────────────────────────────────────────────────────

export class FailureStimulator extends BaseStimulator {
  get name() {
    return "FailureStimulator";
  }

  protected async tick(): Promise<void> {
    const scenarios = [
      "api.timeout",
      "db.disconnect",
      "payment.fail",
      "media.load_fail",
      "auth.expire",
    ];
    // Only inject failures at lower probability even at high intensity
    if (Math.random() < this.intensity * 0.1) {
      const scenario =
        scenarios[Math.floor(Math.random() * scenarios.length)];
      console.warn(`[${this.moduleId}/failure] injecting: ${scenario}`);
    }
  }
}

// ─── Bot Stimulator ───────────────────────────────────────────────────────────

export class BotStimulator extends BaseStimulator {
  get name() {
    return "BotStimulator";
  }

  protected async tick(): Promise<void> {
    const bots = [
      "watcher.heartbeat",
      "repair.scan",
      "sentinel.check",
      "audit.run",
      "support.poll",
    ];
    const action = bots[Math.floor(Math.random() * bots.length)];
    if (Math.random() < this.intensity * 0.3) {
      console.debug(`[${this.moduleId}/bots] exercising: ${action}`);
    }
  }
}

// ─── Security Stimulator ──────────────────────────────────────────────────────

export class SecurityStimulator extends BaseStimulator {
  get name() {
    return "SecurityStimulator";
  }

  protected async tick(): Promise<void> {
    const attacks = [
      "auth.bypass_attempt",
      "token.invalid",
      "role.abuse",
      "endpoint.flood",
      "payload.oversize",
    ];
    // Very low probability — security tests are infrequent
    if (Math.random() < this.intensity * 0.05) {
      const attack = attacks[Math.floor(Math.random() * attacks.length)];
      console.warn(`[${this.moduleId}/security] probing: ${attack}`);
    }
  }
}

// ─── Stimulation Engine ───────────────────────────────────────────────────────

export class StimulationEngine {
  private moduleId: ModuleId;
  private config: StimulationConfig;
  readonly traffic: TrafficStimulator;
  readonly logic: LogicStimulator;
  readonly failure: FailureStimulator;
  readonly bot: BotStimulator;
  readonly security: SecurityStimulator;

  constructor(
    moduleId: ModuleId,
    config: StimulationConfig,
    logicBehaviors?: string[]
  ) {
    this.moduleId = moduleId;
    this.config = config;
    this.traffic = new TrafficStimulator(moduleId);
    this.logic = new LogicStimulator(moduleId, logicBehaviors);
    this.failure = new FailureStimulator(moduleId);
    this.bot = new BotStimulator(moduleId);
    this.security = new SecurityStimulator(moduleId);
  }

  start(): void {
    const { intensity } = this.config;
    if (this.config.traffic) this.traffic.start(intensity);
    if (this.config.logic) this.logic.start(intensity);
    if (this.config.failures) this.failure.start(intensity);
    if (this.config.bots) this.bot.start(intensity);
    if (this.config.security) this.security.start(intensity);
    console.log(
      `[${this.moduleId}/stim] Engine started — mode: ${this.config.mode}, intensity: ${intensity}`
    );
  }

  stop(): void {
    this.traffic.stop();
    this.logic.stop();
    this.failure.stop();
    this.bot.stop();
    this.security.stop();
    console.log(`[${this.moduleId}/stim] Engine stopped`);
  }

  setMode(mode: StimulationMode): void {
    this.config.mode = mode;
    const intensityMap: Record<StimulationMode, number> = {
      QUIET: 0.1,
      NORMAL: 0.4,
      STRESS: 0.75,
      CHAOS: 1.0,
    };
    const newIntensity = intensityMap[mode];
    this.config.intensity = newIntensity;
    [this.traffic, this.logic, this.failure, this.bot, this.security].forEach(
      (s) => s.setIntensity(newIntensity)
    );
    console.log(
      `[${this.moduleId}/stim] Mode → ${mode}, intensity → ${newIntensity}`
    );
  }

  getConfig(): Readonly<StimulationConfig> {
    return { ...this.config };
  }
}
