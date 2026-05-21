import type { InfrastructureConfig } from "@tmi/module-runtime";

export const INFRASTRUCTURE: InfrastructureConfig = {
  domain: "berntout.com",
  subdomain: "www",
  port: 3009,
  deployTarget: (process.env.DEPLOY_TARGET as InfrastructureConfig["deployTarget"]) ?? "vercel",
  dockerImage: "berntout-site-app",
  cron: [
    { job: "product-catalog-sync", schedule: "0 * * * *",   enabled: true },
    { job: "sitemap-generate",     schedule: "0 2 * * *",    enabled: true },
    { job: "press-kit-index",      schedule: "0 3 * * 1",    enabled: true },
  ],
  monitoring: {
    healthEndpoint: "/api/health",
    metricsEndpoint: "/api/metrics",
    alertWebhookUrl: process.env.ALERT_WEBHOOK_URL ?? "",
    uptimeCheckIntervalMs: 60_000,
  },
  scaling: { minInstances: 2, maxInstances: 10, scaleOnQueueDepth: 500 },
};
