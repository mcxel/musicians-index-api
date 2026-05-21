import type { ModuleConfig } from "@tmi/module-runtime";

export const MODULE_CONFIG: ModuleConfig = {
  id: "hot-screens",
  name: "HotScreens",
  version: "1.0.0",
  domain: "hotscreens.berntout.com",
  port: 3007,
  runtime: { maxMemoryMb: 512, maxQueueDepth: 2000, healthCheckIntervalMs: 20_000, checkpointIntervalMs: 60_000 },
  stimulation: {
    enabled: process.env.STIMULATION_ENABLED === "true",
    defaultMode: (process.env.STIMULATION_MODE as ModuleConfig["stimulation"]["defaultMode"]) ?? "QUIET",
    defaultIntensity: Number(process.env.STIMULATION_INTENSITY ?? 0.35),
  },
  isolation: {
    allowedOrigins: ["https://hotscreens.berntout.com"],
    requireAuthFor: ["/api/submit", "/api/admin/*"],
  },
  contracts: {
    emits: ["hot-screens.submission.received", "hot-screens.content.approved", "hot-screens.content.rejected"],
    consumes: ["admin.control.command", "mini-ace.moderation.signal"],
  },
};

export const HOT_SCREENS_LOGIC_BEHAVIORS = [
  "submission.receive",
  "submission.moderate",
  "screen.schedule",
  "content.approve",
  "content.reject",
  "screen.rotate",
];
