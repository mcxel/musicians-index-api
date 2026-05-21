/**
 * Isolated environment config for a module.
 * Every module owns its own database, Redis namespace, storage, and queues.
 * No shared namespaces across modules — collision is prevented by prefix.
 */
export interface ModuleEnvironment {
  database: {
    url: string;
    /** Schema name or DB name — never shared across modules */
    name: string;
    sandboxUrl: string;
  };
  redis: {
    url: string;
    /** Key prefix: "law:", "xxl:", "web:", etc. Prevents cross-module collision. */
    namespace: string;
    sandboxNamespace: string;
  };
  storage: {
    bucket: string;
    region: string;
    sandboxBucket: string;
  };
  queues: {
    namespace: string;
    defaultQueue: string;
    workerQueue: string;
    simulationQueue: string;
  };
  sandbox: {
    /** When true: all writes go to sandbox DB/Redis/storage */
    enabled: boolean;
    isolatedDatabaseUrl: string;
    isolatedRedisUrl: string;
  };
}

export interface InfrastructureConfig {
  domain: string;
  subdomain: string;
  port: number;
  deployTarget: "vercel" | "docker" | "railway" | "render" | "local";
  dockerImage: string;
  cron: Array<{
    job: string;
    schedule: string; // cron expression
    enabled: boolean;
  }>;
  monitoring: {
    healthEndpoint: string;
    metricsEndpoint: string;
    alertWebhookUrl: string;
    uptimeCheckIntervalMs: number;
  };
  scaling: {
    minInstances: number;
    maxInstances: number;
    scaleOnQueueDepth: number;
  };
}
