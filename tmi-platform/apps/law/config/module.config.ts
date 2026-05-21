import type { ModuleConfig } from "@tmi/module-runtime";

export const MODULE_CONFIG: ModuleConfig = {
  id: "law",
  name: "Danika's Law",
  version: "1.0.0",
  domain: "law.berntout.com",
  port: 3001,
  runtime: {
    maxMemoryMb: 512,
    maxQueueDepth: 1000,
    healthCheckIntervalMs: 30_000,
    checkpointIntervalMs: 60_000,
  },
  stimulation: {
    enabled: process.env.STIMULATION_ENABLED === "true",
    defaultMode:
      (process.env.STIMULATION_MODE as ModuleConfig["stimulation"]["defaultMode"]) ??
      "QUIET",
    defaultIntensity: Number(process.env.STIMULATION_INTENSITY ?? 0.3),
  },
  isolation: {
    allowedOrigins: [
      "https://themusiciansindex.com",
      "https://law.berntout.com",
    ],
    requireAuthFor: ["/api/law-bubble/wallet", "/api/admin/*"],
  },
  contracts: {
    emits: [
      "law.referral.received",
      "law.question.answered",
      "law.payment.completed",
      "law.session.started",
      "law.representation.opened",
      "law.breach.review.opened",
      "law.dispute.escalated",
    ],
    consumes: [
      "tmi.artist.referral",
      "tmi.session.active",
      "willdoit.dispatch.completed",
      "admin.control.command",
      "module.status.broadcast",
    ],
  },
};

/** Law-specific logic behaviors for LogicStimulator */
export const LAW_LOGIC_BEHAVIORS = [
  "wallet.balance_check",
  "question.topic_classify",
  "question.high_stakes_detect",
  "payment.intent_create",
  "cache.ttl_expire",
  "session.credit_deduct",
  "compliance.disclaimer_render",
  "business_representation.route",
  "contract_review.analyze",
  "dispute_defense.classify",
  "incident_legal_review.route",
  "legal_risk_score.compute",
  "breach_response.intake",
];
