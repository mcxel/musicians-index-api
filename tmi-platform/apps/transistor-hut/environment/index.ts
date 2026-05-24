import type { ModuleEnvironment } from '@tmi/module-runtime';

export const ENVIRONMENT: ModuleEnvironment = {
  database: {
    url: process.env.DATABASE_URL ?? '',
    name: 'berntout_transistor_hut',
    sandboxUrl: process.env.SANDBOX_DATABASE_URL ?? '',
  },
  redis: {
    url: process.env.REDIS_URL ?? 'redis://localhost:6379',
    namespace: 'transistor-hut:',
    sandboxNamespace: 'transistor-hut:sandbox:',
  },
  storage: {
    bucket: 'berntout-transistor-hut-assets',
    region: process.env.STORAGE_REGION ?? 'us-east-1',
    sandboxBucket: 'berntout-transistor-hut-sandbox',
  },
  queues: {
    namespace: 'transistor-hut',
    defaultQueue: 'transistor-hut-default',
    workerQueue: 'transistor-hut-workers',
    simulationQueue: 'transistor-hut-simulation',
  },
  sandbox: {
    enabled: process.env.SANDBOX_ENABLED === 'true',
    isolatedDatabaseUrl: process.env.SANDBOX_DATABASE_URL ?? '',
    isolatedRedisUrl: process.env.SANDBOX_REDIS_URL ?? 'redis://localhost:6380',
  },
};
