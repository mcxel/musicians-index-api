import type { ModuleConfig } from "@tmi/module-runtime";

export const MODULE_CONFIG: ModuleConfig = {
  id: "willdoit",
  name: "WillDoIt",
  version: "1.0.0",
  domain: "willdoit.berntout.com",
  port: 3006,
  runtime: { maxMemoryMb: 512, maxQueueDepth: 1000, healthCheckIntervalMs: 30_000, checkpointIntervalMs: 60_000 },
  stimulation: {
    enabled: process.env.STIMULATION_ENABLED === "true",
    defaultMode: (process.env.STIMULATION_MODE as ModuleConfig["stimulation"]["defaultMode"]) ?? "QUIET",
    defaultIntensity: Number(process.env.STIMULATION_INTENSITY ?? 0.3),
  },
  isolation: {
    allowedOrigins: ["https://willdoit.berntout.com"],
    requireAuthFor: ["/api/jobs/post", "/api/bids/*", "/api/admin/*"],
  },
  contracts: {
    emits: [
      "willdoit.job.posted",
      "willdoit.bid.accepted",
      "willdoit.contract.signed",
      "willdoit.dispatch.created",
      "willdoit.dispatch.completed",
      "willdoit.construction.dispatch.created",
      "willdoit.emergency.dispatch.locked",
    ],
    consumes: [
      "tmi.artist.referral",
      "law.contract.event",
      "admin.control.command",
      "llc.company.updated",
      "module.status.broadcast",
    ],
  },
};

export const WILLDOIT_LOGIC_BEHAVIORS = [
  "job.post_validate",
  "bid.submit",
  "bid.accept",
  "contract.generate",
  "payment.escrow",
  "review.submit",
  "universal_dispatch.intake",
  "dispatch.dual_worker_assign",
  "dispatch.crew_assign",
  "construction.permit_check",
  "construction.inspection_check",
  "construction.contractor_verify",
  "safety.check",
  "proof.collect",
  "escalation.recover",
];
