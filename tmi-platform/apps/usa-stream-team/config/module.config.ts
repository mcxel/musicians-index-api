import type { ModuleConfig } from "@tmi/module-runtime";

export const MODULE_CONFIG: ModuleConfig = {
  id: "usa-stream-team",
  name: "USA Stream Team",
  version: "1.0.0",
  domain: "usastreamteam.com",
  port: 3005,
  runtime: { maxMemoryMb: 768, maxQueueDepth: 3000, healthCheckIntervalMs: 10_000, checkpointIntervalMs: 30_000 },
  stimulation: {
    enabled: process.env.STIMULATION_ENABLED === "true",
    defaultMode: (process.env.STIMULATION_MODE as ModuleConfig["stimulation"]["defaultMode"]) ?? "NORMAL",
    defaultIntensity: Number(process.env.STIMULATION_INTENSITY ?? 0.5),
  },
  isolation: {
    allowedOrigins: ["https://usastreamteam.com", "https://themusiciansindex.com"],
    requireAuthFor: ["/api/ingest/*", "/api/admin/*"],
  },
  contracts: {
    emits: ["stream.playlist.synced", "stream.station.live", "stream.stats.reported"],
    consumes: ["tmi.media.contract", "admin.control.command"],
  },
};

export const STREAM_LOGIC_BEHAVIORS = [
  "stream.ingest",
  "playlist.sync",
  "station.go_live",
  "listener.connect",
  "stats.aggregate",
  "royalty.track",
];
