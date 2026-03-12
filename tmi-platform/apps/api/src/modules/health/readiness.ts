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
  identity: {
    commitSha: string | null;
    releaseTag: string | null;
    appVersion: string | null;
    revision: string;
  };
  contract: {
    name: string;
    version: string;
  };
  checks: ReadinessChecks;
  blockers: string[];
  timestamp: string;
};

export const READYZ_CONTRACT_NAME = "tmi-platform-readyz";
export const READYZ_CONTRACT_VERSION = "1.0";
export const REQUIRED_BOOT_ENV = ["DATABASE_URL"] as const;
export const OPTIONAL_BOOT_ENV = [
  "NODE_ENV",
  "PORT",
  "CORS_ORIGINS",
  "REDIS_URL",
  "READYZ_OPTIONAL_UPSTREAMS",
  "READYZ_OPTIONAL_UPSTREAM_TIMEOUT_OVERRIDES",
] as const;
export const CACHE_CONNECT_TIMEOUT_MS = 500;
export const OPTIONAL_UPSTREAM_TIMEOUT_MS = 700;
const MAX_OPTIONAL_UPSTREAM_TIMEOUT_MS = 10_000;
const ALLOWED_NODE_ENVS = new Set(["development", "test", "production"]);
const ALLOWED_DB_URL_PREFIXES = [
  "postgresql://",
  "postgres://",
  "prisma://",
  "prisma+postgres://",
] as const;

export type UpstreamProbeFn = (
  url: string,
  timeoutMs: number,
) => Promise<{ ok: boolean; latencyMs: number; error?: string }>;

export type ReadinessReasonKey =
  | "env_invalid"
  | "database_unready"
  | "cache_unready"
  | "upstream_degraded"
  | "upstream_timeout"
  | "unknown_dependency_failure";

function normalizeIdentityValue(value: string | undefined): string | null {
  const normalized = value?.trim() || "";
  return normalized.length > 0 ? normalized : null;
}

export function resolveBuildIdentity(env: NodeJS.ProcessEnv = process.env) {
  const commitSha = normalizeIdentityValue(env.BUILD_COMMIT_SHA);
  const releaseTag = normalizeIdentityValue(env.BUILD_RELEASE_TAG);
  const appVersion = normalizeIdentityValue(env.BUILD_APP_VERSION);
  const revision = commitSha || releaseTag || appVersion || "unknown";

  return {
    commitSha,
    releaseTag,
    appVersion,
    revision,
  };
}

export function findMissingEnv(required: readonly string[]): string[] {
  return required.filter((name) => !process.env[name]?.trim());
}

function isValidIntegerInRange(value: string, min: number, max: number) {
  if (!/^\d+$/.test(value)) return false;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= min && parsed <= max;
}

function validateDatabaseUrl(raw: string | undefined): string | undefined {
  const value = raw?.trim() || "";
  if (!value) {
    return "DATABASE_URL is required";
  }

  const supportedPrefix = ALLOWED_DB_URL_PREFIXES.some((prefix) => value.startsWith(prefix));
  if (!supportedPrefix) {
    return "DATABASE_URL must use a supported PostgreSQL/Prisma URL scheme";
  }

  try {
    // Enforces deterministic malformed-url rejection.
    // eslint-disable-next-line no-new
    new URL(value);
  } catch {
    return "DATABASE_URL must be a valid URL";
  }

  return undefined;
}

function validateCorsOrigins(raw: string | undefined): string | undefined {
  const value = raw?.trim() || "";
  if (!value) return undefined;

  const origins = value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  for (const origin of origins) {
    try {
      const parsed = new URL(origin);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return `CORS_ORIGINS contains unsupported protocol for origin: ${origin}`;
      }
    } catch {
      return `CORS_ORIGINS contains invalid origin URL: ${origin}`;
    }
  }

  return undefined;
}

function validateOptionalUpstreams(raw: string | undefined): string | undefined {
  const value = raw?.trim() || "";
  if (!value) return undefined;

  const targets = parseOptionalUpstreamTargets(value);
  for (const target of targets) {
    try {
      const parsed = new URL(target);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return `READYZ_OPTIONAL_UPSTREAMS contains unsupported protocol: ${target}`;
      }
    } catch {
      return `READYZ_OPTIONAL_UPSTREAMS contains invalid URL: ${target}`;
    }
  }

  return undefined;
}

export function getBootEnvValidationErrors(env: NodeJS.ProcessEnv = process.env): string[] {
  const errors: string[] = [];

  const databaseUrlError = validateDatabaseUrl(env.DATABASE_URL);
  if (databaseUrlError) {
    errors.push(databaseUrlError);
  }

  const nodeEnv = env.NODE_ENV?.trim();
  if (nodeEnv && !ALLOWED_NODE_ENVS.has(nodeEnv)) {
    errors.push(`NODE_ENV must be one of: ${Array.from(ALLOWED_NODE_ENVS).join(", ")}`);
  }

  const port = env.PORT?.trim();
  if (port && !isValidIntegerInRange(port, 1, 65535)) {
    errors.push("PORT must be an integer between 1 and 65535");
  }

  const corsOriginsError = validateCorsOrigins(env.CORS_ORIGINS);
  if (corsOriginsError) {
    errors.push(corsOriginsError);
  }

  const optionalUpstreamsError = validateOptionalUpstreams(env.READYZ_OPTIONAL_UPSTREAMS);
  if (optionalUpstreamsError) {
    errors.push(optionalUpstreamsError);
  }

  return errors;
}

export function validateBootEnvOrThrow() {
  const errors = getBootEnvValidationErrors(process.env);
  if (errors.length > 0) {
    throw new Error(`Invalid boot environment: ${errors.join("; ")}`);
  }
}

export function parseOptionalUpstreamTargets(raw: string): string[] {
  return raw
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function clampTimeoutMs(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return OPTIONAL_UPSTREAM_TIMEOUT_MS;
  return Math.min(Math.floor(value), MAX_OPTIONAL_UPSTREAM_TIMEOUT_MS);
}

export function parseOptionalUpstreamTimeoutOverrides(raw?: string): Record<string, number> {
  if (!raw?.trim()) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    const overrides: Record<string, number> = {};
    for (const [target, value] of Object.entries(parsed)) {
      if (!target.trim()) continue;

      if (typeof value === "number") {
        overrides[target] = clampTimeoutMs(value);
        continue;
      }

      if (value && typeof value === "object" && "timeoutMs" in value) {
        const timeoutCandidate = (value as { timeoutMs?: unknown }).timeoutMs;
        if (typeof timeoutCandidate === "number") {
          overrides[target] = clampTimeoutMs(timeoutCandidate);
        }
      }
    }

    return overrides;
  } catch {
    return {};
  }
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
  timeoutOverrides: Record<string, number> = {},
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
      const timeoutMs = timeoutOverrides[url] || OPTIONAL_UPSTREAM_TIMEOUT_MS;
      const result = await probe(url, timeoutMs);
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
  const reasons = normalizeReadinessReasons(checks, ok);

  return {
    degraded: reasons.length > 0,
    reasons,
  };
}

export function normalizeReadinessReasons(
  checks: ReadinessChecks,
  ok: boolean,
): ReadinessReasonKey[] {
  const reasons = new Set<ReadinessReasonKey>();

  if (!checks.env.ok) {
    reasons.add("env_invalid");
  }

  if (!checks.database.ok) {
    reasons.add("database_unready");
  }

  if (checks.cache.configured && !checks.cache.ok) {
    reasons.add("cache_unready");
  }

  if (!checks.upstreams.ok) {
    reasons.add("upstream_degraded");
    const hasTimeout = checks.upstreams.targets.some((target) =>
      /timeout|abort/i.test(target.error || ""),
    );
    if (hasTimeout) {
      reasons.add("upstream_timeout");
    }
  }

  if (!ok && reasons.size === 0) {
    reasons.add("unknown_dependency_failure");
  }

  return Array.from(reasons);
}

export function reasonSetKey(reasons: ReadinessReasonKey[]): string {
  return Array.from(new Set(reasons)).sort().join("|");
}

type AlertDedupeInput = {
  degraded: boolean;
  reasons: ReadinessReasonKey[];
  consecutiveDegradedCount: number;
  alertThreshold: number;
  alertCooldownMs: number;
  nowMs: number;
  lastAlertAtMs: number;
  lastAlertReasonSetKey: string;
};

export function shouldEmitReadinessAlert(input: AlertDedupeInput) {
  if (!input.degraded) {
    return {
      shouldEmit: false,
      reasonSetKey: "",
    };
  }

  if (input.consecutiveDegradedCount < input.alertThreshold) {
    return {
      shouldEmit: false,
      reasonSetKey: reasonSetKey(input.reasons),
    };
  }

  const currentReasonSetKey = reasonSetKey(input.reasons);
  const cooldownActive = input.nowMs - input.lastAlertAtMs < input.alertCooldownMs;
  const unchangedReasonSet = currentReasonSetKey === input.lastAlertReasonSetKey;

  return {
    shouldEmit: !(cooldownActive && unchangedReasonSet),
    reasonSetKey: currentReasonSetKey,
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
    identity: resolveBuildIdentity(),
    contract: {
      name: READYZ_CONTRACT_NAME,
      version: READYZ_CONTRACT_VERSION,
    },
    checks,
    blockers,
    timestamp: new Date().toISOString(),
  };
}
