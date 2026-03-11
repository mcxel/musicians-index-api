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
    skipped?: boolean;
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
export const CACHE_CONNECT_TIMEOUT_MS = 500;
export const OPTIONAL_UPSTREAM_TIMEOUT_MS = 700;

export type UpstreamProbeFn = (
  url: string,
  timeoutMs: number,
) => Promise<{ ok: boolean; latencyMs: number; error?: string }>;

export function findMissingEnv(required: readonly string[]): string[] {
  return required.filter((name) => !process.env[name]?.trim());
}

export function validateBootEnvOrThrow() {
  const missing = findMissingEnv(REQUIRED_BOOT_ENV);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variable(s): ${missing.join(", ")}`);
  }
}

export function parseOptionalUpstreamTargets(raw: string): string[] {
  return raw
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

const defaultUpstreamProbe: UpstreamProbeFn = async (url, timeoutMs) => {
  const started = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return {
      ok: response.ok,
      latencyMs: Date.now() - started,
      error: response.ok ? undefined : `status ${response.status}`,
    };
  } catch (error) {
    clearTimeout(timeout);
    return {
      ok: false,
      latencyMs: Date.now() - started,
      error: error instanceof Error ? error.message : "upstream check failed",
    };
  }
};

export async function probeOptionalUpstreams(
  raw: string,
  probe: UpstreamProbeFn = defaultUpstreamProbe,
) {
  const targets = parseOptionalUpstreamTargets(raw);
  if (targets.length === 0) {
    return {
      ok: true,
      skipped: true,
      targets: [] as Array<{ url: string; ok: boolean; latencyMs?: number; error?: string }>,
    };
  }

  const results = await Promise.all(
    targets.map(async (url) => {
      const result = await probe(url, OPTIONAL_UPSTREAM_TIMEOUT_MS);
      return { url, ...result };
    }),
  );

  return {
    ok: results.every((target) => target.ok),
    skipped: false,
    targets: results,
  };
}

export function isReadinessDegradedForAlert(checks: ReadinessChecks, ok: boolean) {
  const reasons: string[] = [];
  if (!ok) reasons.push("not-ready");
  if (checks.cache.configured && !checks.cache.ok) reasons.push("cache-degraded");
  if (!checks.upstreams.ok) reasons.push("upstreams-degraded");

  return {
    degraded: reasons.length > 0,
    reasons,
  };
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
