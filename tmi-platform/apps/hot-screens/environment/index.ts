import type { ModuleEnvironment } from '@tmi/module-runtime';
export const ENVIRONMENT: ModuleEnvironment = {
  database: { url: process.env.DATABASE_URL ?? '', name: 'berntout_hotscreens', sandboxUrl: process.env.SANDBOX_DATABASE_URL ?? '' },
  redis: { url: process.env.REDIS_URL ?? 'redis://localhost:6379', namespace: 'hot-screens:', sandboxNamespace: 'hot-screens:sandbox:' },
  storage: { bucket: 'berntout-hot-screens-assets', region: process.env.STORAGE_REGION ?? 'us-east-1', sandboxBucket: 'berntout-hot-screens-sandbox' },
  queues: { namespace: 'hot-screens', defaultQueue: 'hot-screens-default', workerQueue: 'hot-screens-workers', simulationQueue: 'hot-screens-simulation' },
  sandbox: { enabled: process.env.SANDBOX_ENABLED === 'true', isolatedDatabaseUrl: process.env.SANDBOX_DATABASE_URL ?? '', isolatedRedisUrl: process.env.SANDBOX_REDIS_URL ?? 'redis://localhost:6379' },
};
