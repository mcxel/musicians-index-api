import {
  READYZ_CONTRACT_NAME,
  READYZ_CONTRACT_VERSION,
} from "../src/modules/health/readiness";

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

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
    // eslint-disable-next-line no-console
    console.error(
      `[readyz-gate] FAIL healthz status=${health.status} reason=${health.reason} url=${HEALTHZ_URL}`,
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
  // eslint-disable-next-line no-console
  console.error(
    `[readyz-gate] FAIL policy-not-met successRate=${finalSuccessRate.toFixed(2)} consecutive=${consecutiveSuccesses} requiredConsecutive=${CANARY_REQUIRED_CONSECUTIVE_SUCCESSES} minSuccessRate=${CANARY_MIN_SUCCESS_RATE}`,
  );

  process.exitCode = 1;
}

if (require.main === module) {
  run();
}
