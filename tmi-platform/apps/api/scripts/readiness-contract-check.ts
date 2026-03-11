import {
  buildReadinessResponse,
  isReadinessDegradedForAlert,
  probeOptionalUpstreams,
  OPTIONAL_UPSTREAM_TIMEOUT_MS,
  type ReadinessChecks,
} from "../src/modules/health/readiness";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function healthyChecks(): ReadinessChecks {
  return {
    env: { ok: true, missing: [] },
    database: { ok: true, latencyMs: 12 },
    cache: { ok: true, configured: false, skipped: true },
    upstreams: { ok: true, targets: [] },
  };
}

async function run() {
  const okPayload = buildReadinessResponse(healthyChecks());
  assert(okPayload.ok === true, "expected healthy payload to be ready");
  assert(okPayload.service === "tmi-platform-api", "expected service identifier");
  assert(typeof okPayload.timestamp === "string", "expected timestamp string");
  assert(okPayload.checks.database.ok === true, "expected database check to be present");
  assert(Array.isArray(okPayload.blockers), "expected blockers array");

  const badDb = healthyChecks();
  badDb.database = { ok: false, error: "db down" };
  const badDbPayload = buildReadinessResponse(badDb);
  assert(badDbPayload.ok === false, "expected database failure to fail closed");

  const missingEnv = healthyChecks();
  missingEnv.env = { ok: false, missing: ["DATABASE_URL"] };
  const missingEnvPayload = buildReadinessResponse(missingEnv);
  assert(missingEnvPayload.ok === false, "expected missing env to fail closed");

  const skippedUpstreams = await probeOptionalUpstreams("");
  assert(skippedUpstreams.ok === true, "expected empty optional upstream list to be skipped/ok");
  assert(skippedUpstreams.skipped === true, "expected empty optional upstream list to be marked skipped");

  const timeoutProbeCalls: Array<{ url: string; timeoutMs: number }> = [];
  const degradedUpstreams = await probeOptionalUpstreams(
    "https://a.invalid/readyz,https://b.invalid/readyz",
    async (url, timeoutMs) => {
      timeoutProbeCalls.push({ url, timeoutMs });
      if (url.includes("a.invalid")) {
        return { ok: false, latencyMs: timeoutMs, error: "timeout" };
      }
      return { ok: true, latencyMs: 5 };
    },
  );
  assert(degradedUpstreams.ok === false, "expected one failed optional upstream to mark upstream checks degraded");
  assert(
    timeoutProbeCalls.every((call) => call.timeoutMs === OPTIONAL_UPSTREAM_TIMEOUT_MS),
    "expected strict optional upstream timeout policy to be applied",
  );

  const degradedChecks = healthyChecks();
  degradedChecks.upstreams = degradedUpstreams;
  const degradedPayload = buildReadinessResponse(degradedChecks);
  assert(degradedPayload.ok === true, "expected optional upstream degradation to not fail readiness");

  const degradedAlertView = isReadinessDegradedForAlert(degradedPayload.checks, degradedPayload.ok);
  assert(degradedAlertView.degraded === true, "expected degraded upstreams to trigger alert classification");

  // eslint-disable-next-line no-console
  console.log("readiness contract check passed");
}

void run();
