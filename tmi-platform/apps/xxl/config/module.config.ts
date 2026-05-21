import type { ModuleConfig } from "@tmi/module-runtime";

export const MODULE_CONFIG: ModuleConfig = {
  id: "xxl",
  name: "BerntoutGlobal XXL",
  version: "1.0.0",
  domain: "xxl.berntout.com",
  port: 3002,
  runtime: {
    maxMemoryMb: 768,
    maxQueueDepth: 500,
    healthCheckIntervalMs: 10_000,  // More frequent — HUD is real-time
    checkpointIntervalMs: 30_000,
  },
  stimulation: {
    enabled: process.env.STIMULATION_ENABLED === "true",
    defaultMode:
      (process.env.STIMULATION_MODE as ModuleConfig["stimulation"]["defaultMode"]) ??
      "QUIET",
    defaultIntensity: Number(process.env.STIMULATION_INTENSITY ?? 0.4),
  },
  isolation: {
    allowedOrigins: [
      "https://berntout.com",
      "https://xxl.berntout.com",
      "https://themusiciansindex.com",
    ],
    requireAuthFor: ["/api/internal/*", "/api/admin/*"],
  },
  contracts: {
    emits: [
      "xxl.runtime.status",
      "xxl.module.online",
      "xxl.module.offline",
      "xxl.kiosk.mode_changed",
    ],
    consumes: [
      "admin.control.command",
    ],
  },
};

export const XXL_LOGIC_BEHAVIORS = [
  "hud.runtime_poll",
  "hud.module_rotate",
  "kiosk.mode_switch",
  "redis.connection_check",
  "queue.depth_read",
  "wallboard.transition",
];
