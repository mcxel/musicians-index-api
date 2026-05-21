/**
 * Program Bridge — connects the XXL HUD to the internal runtime status API.
 *
 * The BerntoutGlobal_XXL_HUD component polls /api/internal/runtime/status.
 * This bridge provides that endpoint's shape and adapts it to the module runtime.
 */

export interface XXLRuntimeStatus {
  redis_connected: boolean;
  uptime_seconds: number;
  memory_rss: number;   // MB
  memory_total: number; // MB
  queue_depth: number;
  commit: string;
  version: string;
  module_state: string;
  timestamp: number;
}

export function buildRuntimeStatus(overrides?: Partial<XXLRuntimeStatus>): XXLRuntimeStatus {
  const mem = process.memoryUsage();
  return {
    redis_connected: false,        // Set to true when Redis is provisioned
    uptime_seconds: Math.round(process.uptime()),
    memory_rss: Math.round(mem.rss / 1024 / 1024),
    memory_total: Math.round((mem.heapTotal + mem.external) / 1024 / 1024),
    queue_depth: 0,
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local",
    version: process.env.npm_package_version ?? "1.0.0",
    module_state: "RUNNING",
    timestamp: Date.now(),
    ...overrides,
  };
}
