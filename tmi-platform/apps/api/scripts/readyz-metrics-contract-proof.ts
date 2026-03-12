import {
  evaluateMetricsPolicy,
  parsePromotionMetricsPayload,
  type PromotionMetricsPayload,
} from "./readyz-rollout-gate";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function validPayload(): PromotionMetricsPayload {
  return {
    contract: {
      name: "tmi-platform-promotion-metrics",
      version: "1.0",
    },
    canary: {
      attempts: 3,
      successes: 3,
      consecutiveSuccesses: 3,
      failures: 0,
    },
  };
}

async function run() {
  const valid = parsePromotionMetricsPayload(validPayload());
  assert(valid.ok === true, "expected valid payload to parse");
  if (!valid.ok) {
    throw new Error("expected valid payload");
  }

  const pass = evaluateMetricsPolicy(valid.payload);
  assert(pass.decision === "PASS", "expected valid metrics pass path");

  const thresholdMiss = evaluateMetricsPolicy({
    contract: {
      name: "tmi-platform-promotion-metrics",
      version: "1.0",
    },
    canary: {
      attempts: 3,
      successes: 0,
      consecutiveSuccesses: 0,
      failures: 0,
    },
  });
  assert(thresholdMiss.decision === "FAIL", "expected threshold miss fail path");

  const abort = evaluateMetricsPolicy({
    contract: {
      name: "tmi-platform-promotion-metrics",
      version: "1.0",
    },
    canary: {
      attempts: 3,
      successes: 0,
      consecutiveSuccesses: 0,
      failures: 1,
    },
  });
  assert(abort.decision === "ABORT", "expected abort path");

  const missing = parsePromotionMetricsPayload({
    contract: {
      name: "tmi-platform-promotion-metrics",
      version: "1.0",
    },
  });
  assert(missing.ok === false, "expected missing required fields to fail closed");

  const malformed = parsePromotionMetricsPayload("not-an-object");
  assert(malformed.ok === false, "expected malformed payload to fail closed");

  const invalidRange = parsePromotionMetricsPayload({
    contract: {
      name: "tmi-platform-promotion-metrics",
      version: "1.0",
    },
    canary: {
      attempts: 0,
      successes: 0,
      consecutiveSuccesses: 0,
      failures: 0,
    },
  });
  assert(invalidRange.ok === false, "expected invalid range attempts=0 to fail closed");

  const invalidRelation = parsePromotionMetricsPayload({
    contract: {
      name: "tmi-platform-promotion-metrics",
      version: "1.0",
    },
    canary: {
      attempts: 3,
      successes: 2,
      consecutiveSuccesses: 3,
      failures: 1,
    },
  });
  assert(
    invalidRelation.ok === false,
    "expected consecutiveSuccesses > successes to fail closed",
  );

  // eslint-disable-next-line no-console
  console.log("readyz metrics contract proof passed");
}

void run();
