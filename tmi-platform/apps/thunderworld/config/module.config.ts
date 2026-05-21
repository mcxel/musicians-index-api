import type { ModuleConfig } from "@tmi/module-runtime";

export const MODULE_CONFIG: ModuleConfig = {
  id: "thunderworld",
  name: "Thunder World",
  version: "1.0.0",
  domain: "thunderworld.berntout.com",
  port: 3004,
  runtime: { maxMemoryMb: 1024, maxQueueDepth: 2000, healthCheckIntervalMs: 10_000, checkpointIntervalMs: 30_000 },
  stimulation: {
    enabled: process.env.STIMULATION_ENABLED === "true",
    defaultMode: (process.env.STIMULATION_MODE as ModuleConfig["stimulation"]["defaultMode"]) ?? "NORMAL",
    defaultIntensity: Number(process.env.STIMULATION_INTENSITY ?? 0.5),
  },
  isolation: {
    allowedOrigins: ["https://thunderworld.berntout.com", "https://themusiciansindex.com"],
    requireAuthFor: ["/api/admin/*", "/api/rooms/create"],
  },
  contracts: {
    emits: [
      "thunderworld.session.started",
      "thunderworld.group.round.started",
      "thunderworld.finale.activated",
      "thunderworld.workforce.dispatch.requested",
    ],
    consumes: ["tmi.artist.referral", "admin.control.command", "willdoit.dispatch.assigned", "willdoit.dispatch.completed"],
  },
};

export const THUNDERWORLD_LOGIC_BEHAVIORS = [
  "session.open",
  "challenge.group.match",
  "group.round.run",
  "audience.vote.capture",
  "finale.activate",
  "winner.resolve",
  "safety.monitor",
  "workforce.hook.dispatch",
];
