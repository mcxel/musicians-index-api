import type { InfrastructureConfig } from '@tmi/module-runtime';
export const INFRASTRUCTURE: InfrastructureConfig = {
  domain: 'miniace.berntout.com',
  subdomain: 'mini-ace',
  port: 3003,
  deployTarget: (process.env.DEPLOY_TARGET as InfrastructureConfig['deployTarget']) ?? 'vercel',
  dockerImage: 'berntout-mini-ace-app',
  cron: [
    { job: 'checkpoint', schedule: '*/10 * * * *', enabled: true },
    { job: 'audit-run',  schedule: '0 3 * * *',   enabled: true },
  ],
  monitoring: { healthEndpoint: '/api/health', metricsEndpoint: '/api/metrics', alertWebhookUrl: process.env.ALERT_WEBHOOK_URL ?? '', uptimeCheckIntervalMs: 60_000 },
  scaling: { minInstances: 1, maxInstances: 5, scaleOnQueueDepth: 300 },
};
