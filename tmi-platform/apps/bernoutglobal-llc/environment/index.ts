import type { ModuleEnvironment } from "@tmi/module-runtime";

/** LLC uses a separate, isolated internal database — never shared with public apps */
export const ENVIRONMENT: ModuleEnvironment = {
  database: {
    url: process.env.LLC_DATABASE_URL ?? "",
    name: "berntout_llc_internal",
    sandboxUrl: process.env.SANDBOX_LLC_DATABASE_URL ?? "",
  },
  redis: { url: process.env.REDIS_URL ?? "redis://localhost:6379", namespace: "llc:", sandboxNamespace: "llc:sandbox:" },
  storage: { bucket: "berntout-llc-private", region: process.env.STORAGE_REGION ?? "us-east-1", sandboxBucket: "berntout-llc-sandbox" },
  queues: { namespace: "llc", defaultQueue: "llc-default", workerQueue: "llc-workers", simulationQueue: "llc-simulation" },
  sandbox: { enabled: process.env.SANDBOX_ENABLED === "true", isolatedDatabaseUrl: process.env.SANDBOX_LLC_DATABASE_URL ?? "", isolatedRedisUrl: process.env.SANDBOX_REDIS_URL ?? "redis://localhost:6383" },
};
