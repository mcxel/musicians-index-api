import type { InfrastructureConfig } from "@tmi/module-runtime";

export const INFRASTRUCTURE: InfrastructureConfig = {
  domain: "xxl.berntout.com",
  subdomain: "xxl",
  port: 3002,
  deployTarget: (process.env.DEPLOY_TARGET as InfrastructureConfig["deployTarget"]) ?? "vercel",
  dockerImage: "berntout-xxl-app",
  cron: [
    { job: "runtime-status-broadcast", schedule: "*/1 * * * *", enabled: true },
    { job: "checkpoint",               schedule: "*/10 * * * *", enabled: true },
    { job: "redis-health",             schedule: "*/2 * * * *",  enabled: true },
  ],
  monitoring: {
    healthEndpoint: "/api/health",
    metricsEndpoint: "/api/metrics",
    alertWebhookUrl: process.env.ALERT_WEBHOOK_URL ?? "",
    uptimeCheckIntervalMs: 30_000,
  },
  scaling: {
    minInstances: 1,
    maxInstances: 3,
    scaleOnQueueDepth: 100,
  },
};
