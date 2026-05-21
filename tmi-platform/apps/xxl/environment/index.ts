import type { ModuleEnvironment } from "@tmi/module-runtime";

export const ENVIRONMENT: ModuleEnvironment = {
  database: { url: "", name: "berntout_xxl", sandboxUrl: "" },
  redis: {
    url: process.env.REDIS_URL ?? "redis://localhost:6379",
    namespace: "xxl:",
    sandboxNamespace: "xxl:sandbox:",
  },
  storage: {
    bucket: "berntout-xxl-assets",
    region: process.env.STORAGE_REGION ?? "us-east-1",
    sandboxBucket: "berntout-xxl-sandbox",
  },
  queues: {
    namespace: "xxl",
    defaultQueue: "xxl-default",
    workerQueue: "xxl-workers",
    simulationQueue: "xxl-simulation",
  },
  sandbox: {
    enabled: process.env.SANDBOX_ENABLED === "true",
    isolatedDatabaseUrl: "",
    isolatedRedisUrl: process.env.SANDBOX_REDIS_URL ?? "redis://localhost:6381",
  },
};
