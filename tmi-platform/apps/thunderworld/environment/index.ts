import type { ModuleEnvironment } from '@tmi/module-runtime';
export const ENVIRONMENT: ModuleEnvironment = {
  database: { url: process.env.DATABASE_URL ?? '', name: 'berntout_thunderworld', sandboxUrl: process.env.SANDBOX_DATABASE_URL ?? '' },
  redis: { url: process.env.REDIS_URL ?? 'redis://localhost:6379', namespace: 'thunderworld:', sandboxNamespace: 'thunderworld:sandbox:' },
  storage: { bucket: 'berntout-thunderworld-assets', region: process.env.STORAGE_REGION ?? 'us-east-1', sandboxBucket: 'berntout-thunderworld-sandbox' },
  queues: { namespace: 'thunderworld', defaultQueue: 'thunderworld-default', workerQueue: 'thunderworld-workers', simulationQueue: 'thunderworld-simulation' },
  sandbox: { enabled: process.env.SANDBOX_ENABLED === 'true', isolatedDatabaseUrl: process.env.SANDBOX_DATABASE_URL ?? '', isolatedRedisUrl: process.env.SANDBOX_REDIS_URL ?? 'redis://localhost:6379' },
};
