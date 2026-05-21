import type { ModuleEnvironment } from "@tmi/module-runtime";

/**
 * Danika's Law — isolated environment bindings.
 * All resources are namespaced to "law" — no collision with other modules.
 */
export const ENVIRONMENT: ModuleEnvironment = {
  database: {
    url: process.env.DATABASE_URL ?? "",
    name: "berntout_law",
    sandboxUrl: process.env.SANDBOX_DATABASE_URL ?? "",
  },
  redis: {
    url: process.env.REDIS_URL ?? "redis://localhost:6379",
    namespace: "law:",
    sandboxNamespace: "law:sandbox:",
  },
  storage: {
    bucket: process.env.STORAGE_BUCKET ?? "berntout-law-assets",
    region: process.env.STORAGE_REGION ?? "us-east-1",
    sandboxBucket: "berntout-law-sandbox",
  },
  queues: {
    namespace: "law",
    defaultQueue: "law-default",
    workerQueue: "law-workers",
    simulationQueue: "law-simulation",
  },
  sandbox: {
    enabled: process.env.SANDBOX_ENABLED === "true",
    isolatedDatabaseUrl: process.env.SANDBOX_DATABASE_URL ?? "",
    isolatedRedisUrl: process.env.SANDBOX_REDIS_URL ?? "redis://localhost:6380",
  },
};
