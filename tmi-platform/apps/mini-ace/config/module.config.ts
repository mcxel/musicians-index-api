import type { ModuleConfig } from "@tmi/module-runtime";

export const MODULE_CONFIG: ModuleConfig = {
  id: "mini-ace",
  name: "Mini Ace",
  version: "1.0.0",
  domain: "miniace.berntout.com",
  port: 3003,
  runtime: { maxMemoryMb: 512, maxQueueDepth: 1500, healthCheckIntervalMs: 20_000, checkpointIntervalMs: 60_000 },
  stimulation: {
    enabled: process.env.STIMULATION_ENABLED === "true",
    defaultMode: (process.env.STIMULATION_MODE as ModuleConfig["stimulation"]["defaultMode"]) ?? "QUIET",
    defaultIntensity: Number(process.env.STIMULATION_INTENSITY ?? 0.35),
  },
  isolation: {
    allowedOrigins: ["https://miniace.berntout.com", "https://themusiciansindex.com"],
    requireAuthFor: ["/api/upload", "/api/admin/*"],
  },
  contracts: {
    emits: ["mini-ace.content.uploaded", "mini-ace.user.registered", "mini-ace.post.published"],
    consumes: ["tmi.artist.referral", "admin.control.command"],
  },
};

export const MINI_ACE_LOGIC_BEHAVIORS = [
  "content.upload_validate",
  "content.moderation_check",
  "user.register",
  "post.publish",
  "feed.rank",
  "media.transcode",
];
