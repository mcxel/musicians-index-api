import type { ModuleEnvironment } from "@tmi/module-runtime";

export const ENVIRONMENT: ModuleEnvironment = {
  database: {
    url: process.env.DATABASE_URL ?? "",
    name: "berntout_tmi",
    sandboxUrl: process.env.SANDBOX_DATABASE_URL ?? "",
  },
  redis: {
    url: process.env.REDIS_URL ?? "redis://localhost:6379",
    namespace: "web:",
    sandboxNamespace: "web:sandbox:",
  },
  storage: {
    bucket: process.env.STORAGE_BUCKET ?? "berntout-tmi-assets",
    region: process.env.STORAGE_REGION ?? "us-east-1",
    sandboxBucket: "berntout-tmi-sandbox",
  },
  queues: {
    namespace: "web",
    defaultQueue: "web-default",
    workerQueue: "web-workers",
    simulationQueue: "web-simulation",
  },
  sandbox: {
    enabled: process.env.SANDBOX_ENABLED === "true",
    isolatedDatabaseUrl: process.env.SANDBOX_DATABASE_URL ?? "",
    isolatedRedisUrl: process.env.SANDBOX_REDIS_URL ?? "redis://localhost:6380",
  },
};
