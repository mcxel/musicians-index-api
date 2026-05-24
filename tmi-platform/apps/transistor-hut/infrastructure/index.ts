import type { InfrastructureConfig } from '@tmi/module-runtime';

export const INFRASTRUCTURE: InfrastructureConfig = {
  domain: 'transistorhut.berntout.com',
  subdomain: 'transistorhut',
  port: 3011,
  deployTarget: (process.env.DEPLOY_TARGET as InfrastructureConfig['deployTarget']) ?? 'vercel',
  dockerImage: 'berntout-transistor-hut-app',
  cron: [
    { job: 'inventory-sync', schedule: '*/10 * * * *', enabled: true },
    { job: 'checkpoint', schedule: '*/10 * * * *', enabled: true },
  ],
  monitoring: {
    healthEndpoint: '/api/health',
    metricsEndpoint: '/api/metrics',
    alertWebhookUrl: process.env.ALERT_WEBHOOK_URL ?? '',
    uptimeCheckIntervalMs: 60000,
  },
  scaling: {
    minInstances: 1,
    maxInstances: 6,
    scaleOnQueueDepth: 300,
  },
};
