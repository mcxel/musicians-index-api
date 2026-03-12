import {
  READYZ_CONTRACT_NAME,
  READYZ_CONTRACT_VERSION,
} from "../src/modules/health/readiness";
import { readFile } from "node:fs/promises";

const READYZ_URL = process.env.READYZ_GATE_URL || "http://localhost:4000/api/readyz";
const HEALTHZ_URL =
  process.env.HEALTHZ_GATE_URL ||
  (READYZ_URL.includes("/readyz") ? READYZ_URL.replace("/readyz", "/healthz") : READYZ_URL);
const MAX_ATTEMPTS = Number(process.env.READYZ_GATE_MAX_ATTEMPTS || 5);
const RETRY_DELAY_MS = Number(process.env.READYZ_GATE_RETRY_DELAY_MS || 1000);
const REQUEST_TIMEOUT_MS = Number(process.env.READYZ_GATE_TIMEOUT_MS || 1500);
const EXPECTED_CONTRACT_NAME = process.env.READYZ_GATE_CONTRACT_NAME || READYZ_CONTRACT_NAME;
const EXPECTED_CONTRACT_VERSION =
  process.env.READYZ_GATE_CONTRACT_VERSION || READYZ_CONTRACT_VERSION;
const CANARY_MIN_SUCCESS_RATE = Number(process.env.PROMOTION_CANARY_MIN_SUCCESS_RATE || 1);
const CANARY_REQUIRED_CONSECUTIVE_SUCCESSES = Number(
  process.env.PROMOTION_CANARY_REQUIRED_CONSECUTIVE_SUCCESSES || 1,
);
const CANARY_MAX_FAILURES = Number(process.env.PROMOTION_CANARY_MAX_FAILURES || 0);
const PROMOTION_METRICS_REQUIRED =
  (process.env.PROMOTION_METRICS_REQUIRED || "false").toLowerCase() === "true";
const PROMOTION_METRICS_URL = process.env.PROMOTION_METRICS_URL || "";
const PROMOTION_METRICS_FILE = process.env.PROMOTION_METRICS_FILE || "";
const PROMOTION_METRICS_JSON = process.env.PROMOTION_METRICS_JSON || "";
const PROMOTION_METRICS_CONTRACT_NAME =
  process.env.PROMOTION_METRICS_CONTRACT_NAME || "tmi-platform-promotion-metrics";
const PROMOTION_METRICS_CONTRACT_VERSION =
  process.env.PROMOTION_METRICS_CONTRACT_VERSION || "1.0";

type HealthzPayload = {
  ok?: boolean;
};

type ReadyzPayload = {
  ok?: boolean;
  blockers?: string[];
  contract?: {
    name?: string;
    version?: string;
  };
};

export type PromotionMetricsPayload = {
  contract: {
    name: string;
    version: string;
  };
  canary: {
    attempts: number;
    successes: number;
    consecutiveSuccesses: number;
    failures: number;
  };
};

type ValidMetricsResult = {
  ok: true;
  payload: PromotionMetricsPayload;
};

type InvalidMetricsResult = {
  ok: false;
  reason: string;
};

type GateDecision = "PASS" | "FAIL" | "ABORT";

type GateDecisionPayload = {
  mode: "metrics" | "legacy";
  decision: GateDecision;
  reason: string;
  readyzUrl: string;
  healthzUrl: string;
  successRate?: number;
  source?: string;
};

export function isValidReadyzGatePayload(payload?: ReadyzPayload) {
  return (
    payload?.ok === true &&
    Array.isArray(payload?.blockers) &&
    payload.blockers.length === 0 &&
    payload?.contract?.name === EXPECTED_CONTRACT_NAME &&
    payload?.contract?.version === EXPECTED_CONTRACT_VERSION
  );
}

export function isAliveHealthzPayload(status: number, payload?: HealthzPayload) {
  return status === 200 && payload?.ok === true;
}

function isNonNegativeInteger(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

export function parsePromotionMetricsPayload(payload: unknown):
  | ValidMetricsResult
  | InvalidMetricsResult {
  if (!payload || typeof payload !== "object") {
    return { ok: false, reason: "metrics payload must be an object" };
  }

  const obj = payload as {
    contract?: { name?: unknown; version?: unknown };
    canary?: {
      attempts?: unknown;
      successes?: unknown;
      consecutiveSuccesses?: unknown;
      failures?: unknown;
    };
  };

  if (typeof obj.contract?.name !== "string" || obj.contract.name.trim().length === 0) {
    return {
      ok: false,
      reason: "metrics contract.name must be a non-empty string",
    };
  }

  if (typeof obj.contract?.version !== "string" || obj.contract.version.trim().length === 0) {
    return {
      ok: false,
      reason: "metrics contract.version must be a non-empty string",
    };
  }

  if (obj.contract.name !== PROMOTION_METRICS_CONTRACT_NAME) {
    return {
      ok: false,
      reason: `metrics contract name mismatch expected=${PROMOTION_METRICS_CONTRACT_NAME}`,
    };
  }

  if (obj.contract.version !== PROMOTION_METRICS_CONTRACT_VERSION) {
    return {
      ok: false,
      reason: `metrics contract version mismatch expected=${PROMOTION_METRICS_CONTRACT_VERSION}`,
    };
  }

  if (!isNonNegativeInteger(obj.canary?.attempts)) {
    return { ok: false, reason: "metrics canary.attempts must be a non-negative integer" };
  }
  if (!isNonNegativeInteger(obj.canary?.successes)) {
    return { ok: false, reason: "metrics canary.successes must be a non-negative integer" };
  }
  if (!isNonNegativeInteger(obj.canary?.consecutiveSuccesses)) {
    return {
      ok: false,
      reason: "metrics canary.consecutiveSuccesses must be a non-negative integer",
    };
  }
  if (!isNonNegativeInteger(obj.canary?.failures)) {
    return { ok: false, reason: "metrics canary.failures must be a non-negative integer" };
  }

  const attempts = obj.canary.attempts as number;
  const successes = obj.canary.successes as number;
  const consecutiveSuccesses = obj.canary.consecutiveSuccesses as number;
  const failures = obj.canary.failures as number;

  if (attempts < 1) {
    return {
      ok: false,
      reason: "metrics canary.attempts must be >= 1",
    };
  }

  if (successes + failures > attempts) {
    return {
      ok: false,
      reason: "metrics canary.successes + canary.failures must be <= canary.attempts",
    };
  }

  if (consecutiveSuccesses > successes) {
    return {
      ok: false,
      reason: "metrics canary.consecutiveSuccesses must be <= canary.successes",
    };
  }

  return {
    ok: true,
    payload: {
      contract: {
        name: obj.contract.name,
        version: obj.contract.version,
      },
      canary: {
        attempts,
        successes,
        consecutiveSuccesses,
        failures,
      },
    },
  };
}

export function evaluateMetricsPolicy(metrics: PromotionMetricsPayload) {
  if (metrics.canary.failures > CANARY_MAX_FAILURES) {
    return {
      decision: "ABORT" as const,
      successRate: metrics.canary.attempts > 0 ? metrics.canary.successes / metrics.canary.attempts : 0,
      reason: `failures=${metrics.canary.failures} maxFailures=${CANARY_MAX_FAILURES}`,
    };
  }

  const successRate =
    metrics.canary.attempts > 0 ? metrics.canary.successes / metrics.canary.attempts : 0;

  if (
    metrics.canary.consecutiveSuccesses >= CANARY_REQUIRED_CONSECUTIVE_SUCCESSES &&
    successRate >= CANARY_MIN_SUCCESS_RATE
  ) {
    return {
      decision: "PASS" as const,
      successRate,
      reason: "metrics policy satisfied",
    };
  }

  return {
    decision: "FAIL" as const,
    successRate,
    reason: `policy-not-met consecutive=${metrics.canary.consecutiveSuccesses} requiredConsecutive=${CANARY_REQUIRED_CONSECUTIVE_SUCCESSES} minSuccessRate=${CANARY_MIN_SUCCESS_RATE}`,
  };
}

async function loadPromotionMetricsPayload() {
  if (PROMOTION_METRICS_URL) {
    const response = await fetch(PROMOTION_METRICS_URL, { method: "GET" });
    if (response.status !== 200) {
      return {
        ok: false as const,
        reason: `metrics url non-200 status=${response.status}`,
      };
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      return {
        ok: false as const,
        reason: "metrics url returned invalid JSON",
      };
    }

    const parsed = parsePromotionMetricsPayload(payload);
    if (!parsed.ok) {
      const invalid = parsed as InvalidMetricsResult;
      return { ok: false as const, reason: invalid.reason };
    }

    return { ok: true as const, source: "url", payload: parsed.payload };
  }

  if (PROMOTION_METRICS_FILE) {
    let raw = "";
    try {
      raw = await readFile(PROMOTION_METRICS_FILE, "utf8");
    } catch (error) {
      return {
        ok: false as const,
        reason: error instanceof Error ? error.message : "metrics file read failed",
      };
    }

    let payload: unknown;
    try {
      payload = JSON.parse(raw);
    } catch {
      return {
        ok: false as const,
        reason: "metrics file contains invalid JSON",
      };
    }

    const parsed = parsePromotionMetricsPayload(payload);
    if (!parsed.ok) {
      const invalid = parsed as InvalidMetricsResult;
      return { ok: false as const, reason: invalid.reason };
    }

    return { ok: true as const, source: "file", payload: parsed.payload };
  }

  if (PROMOTION_METRICS_JSON) {
    let payload: unknown;
    try {
      payload = JSON.parse(PROMOTION_METRICS_JSON);
    } catch {
      return {
        ok: false as const,
        reason: "metrics env JSON is invalid",
      };
    }

    const parsed = parsePromotionMetricsPayload(payload);
    if (!parsed.ok) {
      const invalid = parsed as InvalidMetricsResult;
      return { ok: false as const, reason: invalid.reason };
    }

    return { ok: true as const, source: "env", payload: parsed.payload };
  }

  return {
    ok: false as const,
    reason: "no metrics source configured",
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function emitDecision(payload: GateDecisionPayload) {
  // eslint-disable-next-line no-console
  console.log(`[readyz-gate][decision] ${JSON.stringify(payload)}`);
}

async function checkOnce(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeout);

    let payload: ReadyzPayload | undefined;
    try {
      payload = (await response.json()) as ReadyzPayload;
    } catch {
      payload = undefined;
    }

    const ok = response.status === 200 && isValidReadyzGatePayload(payload);
    return {
      ok,
      status: response.status,
      blockers: payload?.blockers || [],
      reason: ok
        ? undefined
        : `non-200 or invalid readiness payload/contract expected=${EXPECTED_CONTRACT_NAME}@${EXPECTED_CONTRACT_VERSION}`,
    };
  } catch (error) {
    clearTimeout(timeout);
    return {
      ok: false,
      status: 0,
      blockers: [] as string[],
      reason: error instanceof Error ? error.message : "readyz request failed",
    };
  }
}

async function checkHealthz(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeout);

    let payload: HealthzPayload | undefined;
    try {
      payload = (await response.json()) as HealthzPayload;
    } catch {
      payload = undefined;
    }

    const ok = isAliveHealthzPayload(response.status, payload);
    return {
      ok,
      status: response.status,
      reason: ok ? undefined : "healthz not alive",
    };
  } catch (error) {
    clearTimeout(timeout);
    return {
      ok: false,
      status: 0,
      reason: error instanceof Error ? error.message : "healthz request failed",
    };
  }
}

async function run() {
  const health = await checkHealthz(HEALTHZ_URL);
  if (!health.ok) {
    emitDecision({
      mode: "legacy",
      decision: "FAIL",
      reason: `healthz not alive status=${health.status}`,
      readyzUrl: READYZ_URL,
      healthzUrl: HEALTHZ_URL,
    });
    // eslint-disable-next-line no-console
    console.error(
      `[readyz-gate] FAIL healthz status=${health.status} reason=${health.reason} url=${HEALTHZ_URL}`,
    );
    process.exitCode = 1;
    return;
  }

  const metricsResult = await loadPromotionMetricsPayload();
  const hasMetricsSourceConfigured =
    Boolean(PROMOTION_METRICS_URL) ||
    Boolean(PROMOTION_METRICS_FILE) ||
    Boolean(PROMOTION_METRICS_JSON);

  if (PROMOTION_METRICS_REQUIRED || hasMetricsSourceConfigured) {
    if (!metricsResult.ok) {
      emitDecision({
        mode: "metrics",
        decision: "FAIL",
        reason: `metrics-invalid ${metricsResult.reason}`,
        readyzUrl: READYZ_URL,
        healthzUrl: HEALTHZ_URL,
      });
      // eslint-disable-next-line no-console
      console.error(`[readyz-gate] FAIL metrics-invalid reason=${metricsResult.reason}`);
      process.exitCode = 1;
      return;
    }

    const ready = await checkOnce(READYZ_URL);
    if (!ready.ok) {
      emitDecision({
        mode: "metrics",
        decision: "FAIL",
        reason: `readyz-not-ready status=${ready.status}`,
        readyzUrl: READYZ_URL,
        healthzUrl: HEALTHZ_URL,
        source: metricsResult.source,
      });
      // eslint-disable-next-line no-console
      console.error(
        `[readyz-gate] FAIL metrics-mode-readyz status=${ready.status} reason=${ready.reason} blockers=${ready.blockers.join(",")}`,
      );
      process.exitCode = 1;
      return;
    }

    const policy = evaluateMetricsPolicy(metricsResult.payload);

    if (policy.decision === "ABORT") {
      emitDecision({
        mode: "metrics",
        decision: "ABORT",
        reason: policy.reason,
        readyzUrl: READYZ_URL,
        healthzUrl: HEALTHZ_URL,
        source: metricsResult.source,
        successRate: policy.successRate,
      });
      // eslint-disable-next-line no-console
      console.error(
        `[readyz-gate] ABORT metrics-source=${metricsResult.source} successRate=${policy.successRate.toFixed(2)} ${policy.reason}`,
      );
      process.exitCode = 1;
      return;
    }

    if (policy.decision === "PASS") {
      emitDecision({
        mode: "metrics",
        decision: "PASS",
        reason: policy.reason,
        readyzUrl: READYZ_URL,
        healthzUrl: HEALTHZ_URL,
        source: metricsResult.source,
        successRate: policy.successRate,
      });
      // eslint-disable-next-line no-console
      console.log(
        `[readyz-gate] PASS metrics-source=${metricsResult.source} successRate=${policy.successRate.toFixed(2)} ${policy.reason}`,
      );
      return;
    }

    emitDecision({
      mode: "metrics",
      decision: "FAIL",
      reason: policy.reason,
      readyzUrl: READYZ_URL,
      healthzUrl: HEALTHZ_URL,
      source: metricsResult.source,
      successRate: policy.successRate,
    });
    // eslint-disable-next-line no-console
    console.error(
      `[readyz-gate] FAIL metrics-source=${metricsResult.source} successRate=${policy.successRate.toFixed(2)} ${policy.reason}`,
    );
    process.exitCode = 1;
    return;
  }

  let successCount = 0;
  let failureCount = 0;
  let consecutiveSuccesses = 0;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const result = await checkOnce(READYZ_URL);
    if (result.ok) {
      successCount += 1;
      consecutiveSuccesses += 1;
      const successRate = successCount / attempt;

      if (
        consecutiveSuccesses >= CANARY_REQUIRED_CONSECUTIVE_SUCCESSES &&
        successRate >= CANARY_MIN_SUCCESS_RATE
      ) {
        emitDecision({
          mode: "legacy",
          decision: "PASS",
          reason: "legacy policy satisfied",
          readyzUrl: READYZ_URL,
          healthzUrl: HEALTHZ_URL,
          successRate,
        });
        // eslint-disable-next-line no-console
        console.log(
          `[readyz-gate] PASS attempt=${attempt} url=${READYZ_URL} successRate=${successRate.toFixed(2)} consecutive=${consecutiveSuccesses}`,
        );
        return;
      }

      // eslint-disable-next-line no-console
      console.log(
        `[readyz-gate] HOLD attempt=${attempt} url=${READYZ_URL} successRate=${successRate.toFixed(2)} consecutive=${consecutiveSuccesses}`,
      );
    } else {
      failureCount += 1;
      consecutiveSuccesses = 0;

      // eslint-disable-next-line no-console
      console.error(
        `[readyz-gate] FAIL attempt=${attempt}/${MAX_ATTEMPTS} status=${result.status} reason=${result.reason} blockers=${result.blockers.join(",")}`,
      );

      if (failureCount > CANARY_MAX_FAILURES) {
        emitDecision({
          mode: "legacy",
          decision: "ABORT",
          reason: `failures=${failureCount} maxFailures=${CANARY_MAX_FAILURES}`,
          readyzUrl: READYZ_URL,
          healthzUrl: HEALTHZ_URL,
          successRate: successCount / attempt,
        });
        // eslint-disable-next-line no-console
        console.error(
          `[readyz-gate] ABORT failures=${failureCount} maxFailures=${CANARY_MAX_FAILURES} url=${READYZ_URL}`,
        );
        process.exitCode = 1;
        return;
      }
    }

    if (attempt < MAX_ATTEMPTS) {
      await sleep(RETRY_DELAY_MS);
    }
  }

  const finalSuccessRate = MAX_ATTEMPTS > 0 ? successCount / MAX_ATTEMPTS : 0;
  emitDecision({
    mode: "legacy",
    decision: "FAIL",
    reason: `policy-not-met consecutive=${consecutiveSuccesses} requiredConsecutive=${CANARY_REQUIRED_CONSECUTIVE_SUCCESSES} minSuccessRate=${CANARY_MIN_SUCCESS_RATE}`,
    readyzUrl: READYZ_URL,
    healthzUrl: HEALTHZ_URL,
    successRate: finalSuccessRate,
  });
  // eslint-disable-next-line no-console
  console.error(
    `[readyz-gate] FAIL policy-not-met successRate=${finalSuccessRate.toFixed(2)} consecutive=${consecutiveSuccesses} requiredConsecutive=${CANARY_REQUIRED_CONSECUTIVE_SUCCESSES} minSuccessRate=${CANARY_MIN_SUCCESS_RATE}`,
  );

  process.exitCode = 1;
}

if (require.main === module) {
  run();
}
