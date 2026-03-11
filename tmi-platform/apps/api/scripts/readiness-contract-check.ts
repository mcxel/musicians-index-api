import {
  buildReadinessResponse,
  isReadinessDegradedForAlert,
  parseOptionalUpstreamTimeoutOverrides,
  probeOptionalUpstreams,
  OPTIONAL_UPSTREAM_TIMEOUT_MS,
  shouldEmitReadinessAlert,
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
  assert(
    degradedAlertView.reasons.includes("upstream_degraded"),
    "expected upstream_degraded normalized reason",
  );
  assert(
    degradedAlertView.reasons.includes("upstream_timeout"),
    "expected upstream_timeout normalized reason",
  );

  const envInvalidChecks = healthyChecks();
  envInvalidChecks.env = { ok: false, missing: ["DATABASE_URL"] };
  const envInvalidAlertView = isReadinessDegradedForAlert(
    envInvalidChecks,
    buildReadinessResponse(envInvalidChecks).ok,
  );
  assert(
    envInvalidAlertView.reasons.includes("env_invalid"),
    "expected env_invalid normalized reason",
  );

  const dbInvalidChecks = healthyChecks();
  dbInvalidChecks.database = { ok: false, error: "db down" };
  const dbInvalidAlertView = isReadinessDegradedForAlert(
    dbInvalidChecks,
    buildReadinessResponse(dbInvalidChecks).ok,
  );
  assert(
    dbInvalidAlertView.reasons.includes("database_unready"),
    "expected database_unready normalized reason",
  );

  const cacheInvalidChecks = healthyChecks();
  cacheInvalidChecks.cache = { ok: false, configured: true, error: "cache down" };
  const cacheInvalidAlertView = isReadinessDegradedForAlert(
    cacheInvalidChecks,
    buildReadinessResponse(cacheInvalidChecks).ok,
  );
  assert(
    cacheInvalidAlertView.reasons.includes("cache_unready"),
    "expected cache_unready normalized reason",
  );

  const firstSetShouldEmit = shouldEmitReadinessAlert({
    degraded: true,
    reasons: ["upstream_degraded"],
    consecutiveDegradedCount: 3,
    alertThreshold: 3,
    alertCooldownMs: 300_000,
    nowMs: 1_000,
    lastAlertAtMs: 0,
    lastAlertReasonSetKey: "",
  });
  assert(firstSetShouldEmit.shouldEmit === true, "expected first degraded reason-set to emit");

  const unchangedSetDuringCooldown = shouldEmitReadinessAlert({
    degraded: true,
    reasons: ["upstream_degraded"],
    consecutiveDegradedCount: 3,
    alertThreshold: 3,
    alertCooldownMs: 300_000,
    nowMs: 1_100,
    lastAlertAtMs: 1_000,
    lastAlertReasonSetKey: firstSetShouldEmit.reasonSetKey,
  });
  assert(
    unchangedSetDuringCooldown.shouldEmit === false,
    "expected identical degraded reason-set to be deduped during cooldown",
  );

  const changedSetDuringCooldown = shouldEmitReadinessAlert({
    degraded: true,
    reasons: ["database_unready"],
    consecutiveDegradedCount: 3,
    alertThreshold: 3,
    alertCooldownMs: 300_000,
    nowMs: 1_200,
    lastAlertAtMs: 1_000,
    lastAlertReasonSetKey: firstSetShouldEmit.reasonSetKey,
  });
  assert(
    changedSetDuringCooldown.shouldEmit === true,
    "expected changed degraded reason-set to emit a fresh alert during cooldown",
  );

  const timeoutOverrides = parseOptionalUpstreamTimeoutOverrides(
    JSON.stringify({
      "https://a.invalid/readyz": { timeoutMs: 1200 },
    }),
  );
  const overrideProbeCalls: Array<{ url: string; timeoutMs: number }> = [];
  await probeOptionalUpstreams(
    "https://a.invalid/readyz,https://b.invalid/readyz",
    async (url, timeoutMs) => {
      overrideProbeCalls.push({ url, timeoutMs });
      return { ok: true, latencyMs: 1 };
    },
    timeoutOverrides,
  );
  assert(
    overrideProbeCalls.some(
      (call) => call.url === "https://a.invalid/readyz" && call.timeoutMs === 1200,
    ),
    "expected per-target timeout override to apply only to configured target",
  );
  assert(
    overrideProbeCalls.some(
      (call) =>
        call.url === "https://b.invalid/readyz" &&
        call.timeoutMs === OPTIONAL_UPSTREAM_TIMEOUT_MS,
    ),
    "expected global default timeout to remain unchanged for non-overridden targets",
  );
  assert(
    !overrideProbeCalls.some(
      (call) =>
        call.url !== "https://a.invalid/readyz" &&
        call.timeoutMs === 1200,
    ),
    "expected per-target override to not leak to other upstream targets",
  );

  // eslint-disable-next-line no-console
  console.log("readiness contract check passed");
}

void run();
