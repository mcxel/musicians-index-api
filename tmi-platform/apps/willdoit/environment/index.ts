import type { ModuleEnvironment } from '@tmi/module-runtime';
export const ENVIRONMENT: ModuleEnvironment = {
  database: { url: process.env.DATABASE_URL ?? '', name: 'berntout_willdoit', sandboxUrl: process.env.SANDBOX_DATABASE_URL ?? '' },
  redis: { url: process.env.REDIS_URL ?? 'redis://localhost:6379', namespace: 'willdoit:', sandboxNamespace: 'willdoit:sandbox:' },
  storage: { bucket: 'berntout-willdoit-assets', region: process.env.STORAGE_REGION ?? 'us-east-1', sandboxBucket: 'berntout-willdoit-sandbox' },
  queues: { namespace: 'willdoit', defaultQueue: 'willdoit-default', workerQueue: 'willdoit-workers', simulationQueue: 'willdoit-simulation' },
  sandbox: { enabled: process.env.SANDBOX_ENABLED === 'true', isolatedDatabaseUrl: process.env.SANDBOX_DATABASE_URL ?? '', isolatedRedisUrl: process.env.SANDBOX_REDIS_URL ?? 'redis://localhost:6379' },
};
