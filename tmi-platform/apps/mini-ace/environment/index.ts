import type { ModuleEnvironment } from '@tmi/module-runtime';
export const ENVIRONMENT: ModuleEnvironment = {
  database: { url: process.env.DATABASE_URL ?? '', name: 'berntout_miniace', sandboxUrl: process.env.SANDBOX_DATABASE_URL ?? '' },
  redis: { url: process.env.REDIS_URL ?? 'redis://localhost:6379', namespace: 'mini-ace:', sandboxNamespace: 'mini-ace:sandbox:' },
  storage: { bucket: 'berntout-mini-ace-assets', region: process.env.STORAGE_REGION ?? 'us-east-1', sandboxBucket: 'berntout-mini-ace-sandbox' },
  queues: { namespace: 'mini-ace', defaultQueue: 'mini-ace-default', workerQueue: 'mini-ace-workers', simulationQueue: 'mini-ace-simulation' },
  sandbox: { enabled: process.env.SANDBOX_ENABLED === 'true', isolatedDatabaseUrl: process.env.SANDBOX_DATABASE_URL ?? '', isolatedRedisUrl: process.env.SANDBOX_REDIS_URL ?? 'redis://localhost:6379' },
};
