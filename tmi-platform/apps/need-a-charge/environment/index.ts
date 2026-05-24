import type { ModuleEnvironment } from '@tmi/module-runtime';
export const ENVIRONMENT: ModuleEnvironment = {
  database: { url: process.env.DATABASE_URL ?? '', name: 'berntout_needacharge', sandboxUrl: process.env.SANDBOX_DATABASE_URL ?? '' },
  redis: { url: process.env.REDIS_URL ?? 'redis://localhost:6379', namespace: 'need-a-charge:', sandboxNamespace: 'need-a-charge:sandbox:' },
  storage: { bucket: 'berntout-need-a-charge-assets', region: process.env.STORAGE_REGION ?? 'us-east-1', sandboxBucket: 'berntout-need-a-charge-sandbox' },
  queues: { namespace: 'need-a-charge', defaultQueue: 'need-a-charge-default', workerQueue: 'need-a-charge-workers', simulationQueue: 'need-a-charge-simulation' },
  sandbox: { enabled: process.env.SANDBOX_ENABLED === 'true', isolatedDatabaseUrl: process.env.SANDBOX_DATABASE_URL ?? '', isolatedRedisUrl: process.env.SANDBOX_REDIS_URL ?? 'redis://localhost:6379' },
};
