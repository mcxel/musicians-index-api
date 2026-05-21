import type { ModuleConfig } from "@tmi/module-runtime";

export const MODULE_CONFIG: ModuleConfig = {
  id: "need-a-charge",
  name: "Need-A-Charge",
  version: "1.0.0",
  domain: "rentacharge.berntout.com",
  port: 3008,
  runtime: { maxMemoryMb: 512, maxQueueDepth: 500, healthCheckIntervalMs: 15_000, checkpointIntervalMs: 30_000 },
  stimulation: {
    enabled: process.env.STIMULATION_ENABLED === "true",
    defaultMode: (process.env.STIMULATION_MODE as ModuleConfig["stimulation"]["defaultMode"]) ?? "QUIET",
    defaultIntensity: Number(process.env.STIMULATION_INTENSITY ?? 0.4),
  },
  isolation: {
    allowedOrigins: ["https://rentacharge.berntout.com", "https://themusiciansindex.com"],
    requireAuthFor: ["/api/kiosk/*", "/api/admin/*"],
  },
  contracts: {
    emits: [
      "charge.session.started",
      "charge.session.ended",
      "charge.payment.completed",
      "charge.locker.opened",
      "needacharge.parts.requested",
    ],
    consumes: ["admin.control.command", "tmi.venue.event", "transistorhut.stock.updated", "transistorhut.parts.reserved"],
  },
};

export const CHARGE_LOGIC_BEHAVIORS = [
  "kiosk.status_poll",
  "locker.unlock",
  "charge.session_start",
  "charge.session_end",
  "payment.process",
  "inventory.check",
  "inventory.parts.request",
];
