import type { ModuleEnvironment } from "@tmi/module-runtime";

export const ENVIRONMENT: ModuleEnvironment = {
  database: {
    url: process.env.DATABASE_URL ?? "",
    name: "berntout_site",
    sandboxUrl: process.env.SANDBOX_DATABASE_URL ?? "",
  },
  redis: { url: process.env.REDIS_URL ?? "redis://localhost:6379", namespace: "site:", sandboxNamespace: "site:sandbox:" },
  storage: { bucket: "berntout-site-assets", region: process.env.STORAGE_REGION ?? "us-east-1", sandboxBucket: "berntout-site-sandbox" },
  queues: { namespace: "site", defaultQueue: "site-default", workerQueue: "site-workers", simulationQueue: "site-simulation" },
  sandbox: { enabled: process.env.SANDBOX_ENABLED === "true", isolatedDatabaseUrl: process.env.SANDBOX_DATABASE_URL ?? "", isolatedRedisUrl: process.env.SANDBOX_REDIS_URL ?? "redis://localhost:6382" },
};
