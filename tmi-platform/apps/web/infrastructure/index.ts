import type { InfrastructureConfig } from "@tmi/module-runtime";

export const INFRASTRUCTURE: InfrastructureConfig = {
  domain: "themusiciansindex.com",
  subdomain: "www",
  port: 3000,
  deployTarget: (process.env.DEPLOY_TARGET as InfrastructureConfig["deployTarget"]) ?? "vercel",
  dockerImage: "berntout-tmi-app",
  cron: [
    { job: "ranking-update",        schedule: "*/15 * * * *", enabled: true },
    { job: "homepage-rotate",       schedule: "*/5 * * * *",  enabled: true },
    { job: "billboard-rotate",      schedule: "*/2 * * * *",  enabled: true },
    { job: "sponsor-impression",    schedule: "*/1 * * * *",  enabled: true },
    { job: "checkpoint",            schedule: "*/10 * * * *", enabled: true },
    { job: "nft-drop-check",        schedule: "0 * * * *",   enabled: true },
    { job: "booking-reminder",      schedule: "0 9 * * *",   enabled: true },
    { job: "audit-run",             schedule: "0 3 * * *",   enabled: true },
  ],
  monitoring: {
    healthEndpoint: "/api/health",
    metricsEndpoint: "/api/metrics",
    alertWebhookUrl: process.env.ALERT_WEBHOOK_URL ?? "",
    uptimeCheckIntervalMs: 30_000,
  },
  scaling: {
    minInstances: 2,
    maxInstances: 20,
    scaleOnQueueDepth: 1000,
  },
};
