import type { ModuleEnvironment } from '@tmi/module-runtime';
export const ENVIRONMENT: ModuleEnvironment = {
  database: { url: process.env.DATABASE_URL ?? '', name: 'berntout_usastreamteam', sandboxUrl: process.env.SANDBOX_DATABASE_URL ?? '' },
  redis: { url: process.env.REDIS_URL ?? 'redis://localhost:6379', namespace: 'usa-stream-team:', sandboxNamespace: 'usa-stream-team:sandbox:' },
  storage: { bucket: 'berntout-usa-stream-team-assets', region: process.env.STORAGE_REGION ?? 'us-east-1', sandboxBucket: 'berntout-usa-stream-team-sandbox' },
  queues: { namespace: 'usa-stream-team', defaultQueue: 'usa-stream-team-default', workerQueue: 'usa-stream-team-workers', simulationQueue: 'usa-stream-team-simulation' },
  sandbox: { enabled: process.env.SANDBOX_ENABLED === 'true', isolatedDatabaseUrl: process.env.SANDBOX_DATABASE_URL ?? '', isolatedRedisUrl: process.env.SANDBOX_REDIS_URL ?? 'redis://localhost:6379' },
};
