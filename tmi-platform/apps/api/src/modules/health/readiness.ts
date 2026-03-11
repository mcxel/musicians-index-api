type CheckResult = {
  ok: boolean;
  latencyMs?: number;
  error?: string;
  configured?: boolean;
  skipped?: boolean;
};

export type ReadinessChecks = {
  env: {
    ok: boolean;
    missing: string[];
  };
  database: CheckResult;
  cache: CheckResult;
  upstreams: {
    ok: boolean;
    targets: Array<{ url: string; ok: boolean; latencyMs?: number; error?: string }>;
  };
};

export type ReadinessResponse = {
  ok: boolean;
  service: "tmi-platform-api";
  checks: ReadinessChecks;
  blockers: string[];
  timestamp: string;
};

export const REQUIRED_BOOT_ENV = ["DATABASE_URL"] as const;

export function findMissingEnv(required: readonly string[]): string[] {
  return required.filter((name) => !process.env[name]?.trim());
}

export function validateBootEnvOrThrow() {
  const missing = findMissingEnv(REQUIRED_BOOT_ENV);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variable(s): ${missing.join(", ")}`);
  }
}

export function buildReadinessResponse(checks: ReadinessChecks): ReadinessResponse {
  const blockers: string[] = [];

  if (!checks.env.ok) blockers.push(`missing env: ${checks.env.missing.join(", ")}`);
  if (!checks.database.ok) blockers.push("database check failed");
  if (checks.cache.configured && !checks.cache.ok) blockers.push("cache check failed");

  const ok = blockers.length === 0;

  return {
    ok,
    service: "tmi-platform-api",
    checks,
    blockers,
    timestamp: new Date().toISOString(),
  };
}
