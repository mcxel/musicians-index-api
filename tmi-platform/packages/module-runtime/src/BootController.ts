import type { ModuleId, ModuleConfig } from "./types.js";
import { RuntimeController } from "./RuntimeController.js";
import { StimulationEngine } from "./StimulationEngine.js";
import { HealthWatcher } from "./HealthWatcher.js";
import { RecoveryController } from "./RecoveryController.js";
import { EventBus } from "./EventBus.js";

export interface BootOptions {
  logicBehaviors?: string[];
  getQueueDepth?: () => number;
}

/**
 * Orchestrates boot/stop for a module, wiring together all controllers.
 * Each app's runtime/index.ts calls `BootController.create(MODULE_CONFIG)`.
 */
export class BootController {
  readonly runtime: RuntimeController;
  readonly stimulation: StimulationEngine;
  readonly health: HealthWatcher;
  readonly recovery: RecoveryController;
  readonly events: EventBus;
  private config: ModuleConfig;

  constructor(config: ModuleConfig, options: BootOptions = {}) {
    this.config = config;
    this.runtime = new RuntimeController(config);
    this.stimulation = new StimulationEngine(
      config.id,
      {
        mode: config.stimulation.defaultMode,
        intensity: config.stimulation.defaultIntensity,
        traffic: true,
        logic: true,
        failures: false, // disabled by default, enable in STRESS/CHAOS
        bots: true,
        security: false, // disabled by default
      },
      options.logicBehaviors
    );
    this.health = new HealthWatcher(
      config.id,
      {
        memoryMbWarn: config.runtime.maxMemoryMb * 0.75,
        memoryMbCritical: config.runtime.maxMemoryMb,
        queueDepthWarn: config.runtime.maxQueueDepth * 0.5,
        queueDepthCritical: config.runtime.maxQueueDepth * 0.9,
      },
      options.getQueueDepth
    );
    this.recovery = new RecoveryController(config.id);
    this.events = new EventBus(config.id);
  }

  static create(config: ModuleConfig, options?: BootOptions): BootController {
    return new BootController(config, options);
  }

  async start(): Promise<void> {
    await this.runtime.boot();
    this.health.start(this.config.runtime.healthCheckIntervalMs);
    this.recovery.startAuto(
      this.config.runtime.checkpointIntervalMs,
      () => this.runtime.getSnapshot(this.stimulation.getConfig().mode) as unknown as Record<string, unknown>
    );
    if (this.config.stimulation.enabled) {
      this.stimulation.start();
    }
    console.log(`[${this.config.id}] BootController: all systems started`);
  }

  async shutdown(): Promise<void> {
    this.stimulation.stop();
    this.recovery.stopAuto();
    this.health.stop();
    await this.runtime.stop();
    console.log(`[${this.config.id}] BootController: all systems stopped`);
  }
}
