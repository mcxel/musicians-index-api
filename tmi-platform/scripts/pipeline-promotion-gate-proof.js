const { mkdtempSync, readFileSync, rmSync } = require("node:fs");
const { join } = require("node:path");
const { tmpdir } = require("node:os");
const { spawnSync } = require("node:child_process");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function parseDecision(output) {
  const lines = output.split(/\r?\n/);
  const decisionLines = lines.filter((line) => line.startsWith("[pipeline-gate][decision] "));
  assert(decisionLines.length === 1, "expected exactly one pipeline decision output line");
  const decisionLine = decisionLines[0];
  return JSON.parse(decisionLine.replace("[pipeline-gate][decision] ", ""));
}

function runScenario(name, overrides) {
  const scenarioDir = mkdtempSync(join(tmpdir(), "pipeline-gate-proof-"));
  const recordFile = join(scenarioDir, "stages.log");

  const env = {
    ...process.env,
    PIPELINE_RECORD_FILE: recordFile,
    ...overrides,
  };

  const result = spawnSync("node", ["scripts/pipeline-promotion-gate.js"], {
    cwd: process.cwd(),
    env,
    encoding: "utf8",
  });

  const combinedOutput = `${result.stdout || ""}${result.stderr || ""}`;
  const stagesRaw = readFileSync(recordFile, "utf8");
  const stages = stagesRaw.split(/\r?\n/).filter(Boolean);

  rmSync(scenarioDir, { recursive: true, force: true });

  return {
    name,
    exitCode: result.status ?? 1,
    decision: parseDecision(combinedOutput),
    stages,
  };
}

function run() {
  const buildFail = runScenario("build failure blocks promotion", {
    PIPELINE_BUILD_RESULT: "2",
    PIPELINE_READINESS_RESULT: "0",
    PIPELINE_PROMOTION_RESULT: "0",
  });
  assert(buildFail.exitCode === 1, "expected build-fail scenario exit=1");
  assert(buildFail.decision.decision === "BLOCKED", "expected build-fail decision=BLOCKED");
  assert(buildFail.decision.rollbackTrigger === "build_failed", "expected build rollback trigger");
  assert(buildFail.decision.rollbackAttempted === false, "expected no rollback attempt by default");
  assert(buildFail.decision.rollbackExitCode === null, "expected null rollback exit when not attempted");
  assert(buildFail.stages.join(",") === "build", "expected only build stage to execute");

  const readinessFail = runScenario("readiness failure blocks promotion", {
    PIPELINE_BUILD_RESULT: "0",
    PIPELINE_READINESS_RESULT: "3",
    PIPELINE_PROMOTION_RESULT: "0",
  });
  assert(readinessFail.exitCode === 1, "expected readiness-fail scenario exit=1");
  assert(readinessFail.decision.decision === "BLOCKED", "expected readiness-fail decision=BLOCKED");
  assert(
    readinessFail.decision.rollbackTrigger === "readiness_failed",
    "expected readiness rollback trigger",
  );
  assert(readinessFail.decision.rollbackAttempted === false, "expected no rollback attempt by default");
  assert(readinessFail.decision.rollbackExitCode === null, "expected null rollback exit when not attempted");
  assert(
    readinessFail.stages.join(",") === "build,readiness",
    "expected build then readiness stages only",
  );

  const validPath = runScenario("valid path allows promotion", {
    PIPELINE_BUILD_RESULT: "0",
    PIPELINE_READINESS_RESULT: "0",
    PIPELINE_PROMOTION_RESULT: "0",
  });
  assert(validPath.exitCode === 0, "expected valid-path scenario exit=0");
  assert(validPath.decision.decision === "PROMOTE", "expected valid-path decision=PROMOTE");
  assert(validPath.decision.rollbackTrigger === null, "expected no rollback trigger on promote");
  assert(validPath.decision.rollbackAttempted === false, "expected no rollback on promote");
  assert(validPath.decision.rollbackExitCode === null, "expected null rollback exit on promote");
  assert(
    validPath.stages.join(",") === "build,readiness,promotion",
    "expected ordered stage execution for valid path",
  );

  const abortPath = runScenario("abort condition triggers non-zero", {
    PIPELINE_BUILD_RESULT: "0",
    PIPELINE_READINESS_RESULT: "0",
    PIPELINE_PROMOTION_RESULT: "5",
  });
  assert(abortPath.exitCode === 1, "expected abort-path scenario exit=1");
  assert(abortPath.decision.decision === "ABORT", "expected abort decision");
  assert(
    abortPath.decision.rollbackTrigger === "promotion_gate_failed",
    "expected explicit abort rollback trigger",
  );
  assert(abortPath.decision.rollbackAttempted === false, "expected no rollback attempt by default");
  assert(abortPath.decision.rollbackExitCode === null, "expected null rollback exit when not attempted");
  assert(
    abortPath.stages.join(",") === "build,readiness,promotion",
    "expected ordered stage execution for abort path",
  );

  const abortWithRollback = runScenario("abort executes rollback when configured", {
    PIPELINE_BUILD_RESULT: "0",
    PIPELINE_READINESS_RESULT: "0",
    PIPELINE_PROMOTION_RESULT: "5",
    PIPELINE_ROLLBACK_RESULT: "0",
  });
  assert(abortWithRollback.exitCode === 1, "expected abort-with-rollback scenario exit=1");
  assert(abortWithRollback.decision.decision === "ABORT", "expected abort-with-rollback decision");
  assert(abortWithRollback.decision.rollbackAttempted === true, "expected rollback execution when configured");
  assert(abortWithRollback.decision.rollbackExitCode === 0, "expected rollback exit=0");
  assert(
    abortWithRollback.stages.join(",") === "build,readiness,promotion,rollback",
    "expected rollback stage after promotion failure",
  );

  const abortWithRollbackCommand = runScenario("abort executes rollback command when configured", {
    PIPELINE_BUILD_RESULT: "0",
    PIPELINE_READINESS_RESULT: "0",
    PIPELINE_PROMOTION_RESULT: "5",
    PIPELINE_ROLLBACK_CMD: "node -e \"process.exit(7)\"",
  });
  assert(abortWithRollbackCommand.exitCode === 1, "expected abort-with-rollback-command scenario exit=1");
  assert(
    abortWithRollbackCommand.decision.decision === "ABORT",
    "expected abort-with-rollback-command decision",
  );
  assert(
    abortWithRollbackCommand.decision.rollbackAttempted === true,
    "expected rollback execution when rollback command is configured",
  );
  assert(
    abortWithRollbackCommand.decision.rollbackExitCode === 7,
    "expected rollback command exit code to be surfaced",
  );
  assert(
    abortWithRollbackCommand.stages.join(",") === "build,readiness,promotion,rollback",
    "expected rollback stage after promotion failure with rollback command",
  );

  console.log("pipeline promotion gate proof passed");
}

run();
