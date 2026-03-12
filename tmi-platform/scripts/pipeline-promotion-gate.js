const { appendFileSync } = require("node:fs");
const { spawnSync } = require("node:child_process");

function recordStage(stageName) {
  const recordFile = process.env.PIPELINE_RECORD_FILE;
  if (!recordFile) return;
  appendFileSync(recordFile, `${stageName}\n`, "utf8");
}

function emitDecision(payload) {
  console.log(`[pipeline-gate][decision] ${JSON.stringify(payload)}`);
}

function stageOutcomeFromOverride(name) {
  const key = `PIPELINE_${name.toUpperCase()}_RESULT`;
  const raw = process.env[key];
  if (raw === undefined || raw === "") return undefined;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed)) {
    throw new Error(`${key} must be an integer when provided`);
  }
  return parsed;
}

function runCommand(command) {
  const result = spawnSync(command, {
    shell: true,
    stdio: "inherit",
    env: process.env,
  });

  if (typeof result.status === "number") {
    return result.status;
  }

  return 1;
}

function runStage(stageName, command) {
  recordStage(stageName);
  const override = stageOutcomeFromOverride(stageName);
  if (override !== undefined) {
    return override;
  }
  return runCommand(command);
}

function runPipelineGate() {
  const buildCommand = process.env.PIPELINE_BUILD_CMD || "pnpm -C apps/api build";
  const readinessCommand =
    process.env.PIPELINE_READINESS_CMD || "pnpm -C apps/api run test:readiness-contract";
  const promotionCommand = process.env.PIPELINE_PROMOTION_CMD || "pnpm -C apps/api run gate:readyz";

  const buildExit = runStage("build", buildCommand);
  if (buildExit !== 0) {
    emitDecision({
      decision: "BLOCKED",
      stage: "build",
      rollbackTrigger: "build_failed",
      exitCode: buildExit,
    });
    return 1;
  }

  const readinessExit = runStage("readiness", readinessCommand);
  if (readinessExit !== 0) {
    emitDecision({
      decision: "BLOCKED",
      stage: "readiness",
      rollbackTrigger: "readiness_failed",
      exitCode: readinessExit,
    });
    return 1;
  }

  const promotionExit = runStage("promotion", promotionCommand);
  if (promotionExit !== 0) {
    emitDecision({
      decision: "ABORT",
      stage: "promotion",
      rollbackTrigger: "promotion_gate_failed",
      exitCode: promotionExit,
    });
    return 1;
  }

  emitDecision({
    decision: "PROMOTE",
    stage: "promotion",
    rollbackTrigger: null,
    exitCode: 0,
  });
  return 0;
}

if (require.main === module) {
  process.exitCode = runPipelineGate();
}

module.exports = {
  runPipelineGate,
};
