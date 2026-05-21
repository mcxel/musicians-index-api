import type { InfrastructureConfig } from "@tmi/module-runtime";

export const INFRASTRUCTURE: InfrastructureConfig = {
  domain: "law.berntout.com",
  subdomain: "law",
  port: 3001,
  deployTarget: (process.env.DEPLOY_TARGET as InfrastructureConfig["deployTarget"]) ?? "vercel",
  dockerImage: "berntout-law-app",
  cron: [
    { job: "cache-evict",   schedule: "0 * * * *",   enabled: true  },
    { job: "checkpoint",    schedule: "*/10 * * * *", enabled: true  },
    { job: "audit-run",     schedule: "0 2 * * *",    enabled: true  },
    { job: "wallet-recon",  schedule: "0 0 * * *",    enabled: false }, // enable when Stripe is live
  ],
  monitoring: {
    healthEndpoint: "/api/health",
    metricsEndpoint: "/api/metrics",
    alertWebhookUrl: process.env.ALERT_WEBHOOK_URL ?? "",
    uptimeCheckIntervalMs: 60_000,
  },
  scaling: {
    minInstances: 1,
    maxInstances: 5,
    scaleOnQueueDepth: 200,
  },
};
