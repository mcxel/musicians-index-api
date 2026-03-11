import {
  buildReadinessResponse,
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

function run() {
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

  // eslint-disable-next-line no-console
  console.log("readiness contract check passed");
}

run();
