import type { ModuleConfig } from "@tmi/module-runtime";

/**
 * BerntoutGlobal LLC — Internal company operating system.
 * Private. Not public-facing. Auth-gated.
 */
export const MODULE_CONFIG: ModuleConfig = {
  id: "bernoutglobal-llc",
  name: "BerntoutGlobal LLC",
  version: "1.0.0",
  domain: "llc.berntout.internal",  // not public
  port: 3010,
  runtime: {
    maxMemoryMb: 768,
    maxQueueDepth: 500,
    healthCheckIntervalMs: 60_000,
    checkpointIntervalMs: 300_000,  // 5 min — financial data
  },
  stimulation: {
    enabled: process.env.STIMULATION_ENABLED === "true",
    defaultMode:
      (process.env.STIMULATION_MODE as ModuleConfig["stimulation"]["defaultMode"]) ?? "QUIET",
    defaultIntensity: Number(process.env.STIMULATION_INTENSITY ?? 0.2),
  },
  isolation: {
    allowedOrigins: [],  // No external origins — internal only
    requireAuthFor: ["/*"], // All routes require auth
  },
  contracts: {
    emits: [
      "llc.company.updated",
      "llc.payout.issued",
      "llc.contract.signed",
      "llc.partner.onboarded",
      "llc.public.company.published",
      "llc.module.registry.updated",
    ],
    consumes: [
      "web.billing.event",
      "law.payment.completed",
      "thunderworld.revenue.event",
      "need-a-charge.billing.event",
      "xxl.runtime.status",
    ],
  },
};

export const LLC_LOGIC_BEHAVIORS = [
  "public.branding_publish",
  "public.investor_page_refresh",
  "revenue.aggregate",
  "payout.schedule",
  "tax.projection",
  "contract.status_check",
  "partner.balance_reconcile",
  "ownership.validate",
  "registry.module_health_rollup",
  "operations.audit_dispatch",
];
