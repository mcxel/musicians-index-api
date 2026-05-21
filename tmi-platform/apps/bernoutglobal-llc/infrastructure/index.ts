import type { InfrastructureConfig } from "@tmi/module-runtime";

/** LLC is internal-only. Not CDN-deployed. VPN or private network required. */
export const INFRASTRUCTURE: InfrastructureConfig = {
  domain: "llc.berntout.internal",
  subdomain: "llc",
  port: 3010,
  deployTarget: "docker",  // never Vercel — internal only
  dockerImage: "berntout-llc-internal",
  cron: [
    { job: "revenue-aggregate",   schedule: "0 1 * * *",   enabled: true },
    { job: "payout-schedule",     schedule: "0 9 1 * *",   enabled: true },
    { job: "tax-projection",      schedule: "0 10 1 1 *",  enabled: true },
    { job: "partner-reconcile",   schedule: "0 2 * * 1",   enabled: true },
    { job: "audit-run",           schedule: "0 3 * * *",   enabled: true },
  ],
  monitoring: {
    healthEndpoint: "/api/health",
    metricsEndpoint: "/api/metrics",
    alertWebhookUrl: process.env.ALERT_WEBHOOK_URL ?? "",
    uptimeCheckIntervalMs: 120_000,
  },
  scaling: { minInstances: 1, maxInstances: 2, scaleOnQueueDepth: 100 },
};
