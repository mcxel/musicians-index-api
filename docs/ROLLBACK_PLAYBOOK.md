# Rollout and Rollback Operator Runbook — TMI

Purpose
- Provide one deterministic operator path for promotion, verification, rollback, and post-rollback verification.
- Bind runbook steps to the actual scripts, environment names, gate outputs, and health metadata currently implemented.

## 1) Promotion Gate (Deterministic)

Command
- `node scripts/pipeline-promotion-gate.js`

Execution order (fixed)
1. build
2. readiness
3. promotion (`pnpm -C apps/api run gate:readyz` by default)

Expected machine output
- Exactly one decision line:
	- `[pipeline-gate][decision] {"decision":"PROMOTE", ...}`
	- `[pipeline-gate][decision] {"decision":"BLOCKED", ...}`
	- `[pipeline-gate][decision] {"decision":"ABORT", ...}`

Decision fields to consume
- `decision`
- `stage`
- `rollbackTrigger`
- `exitCode`
- `rollbackAttempted`
- `rollbackExitCode`

Exit behavior
- `0` only when decision is `PROMOTE`.
- Non-zero when decision is `BLOCKED` or `ABORT`.

## 2) Promotion Verification (Operator)

Run immediately after a promote decision.

Health endpoints
- `GET /api/healthz`
- `GET /api/readyz`

Required identity fields (both endpoints)
- `identity.commitSha`
- `identity.releaseTag`
- `identity.appVersion`
- `identity.revision`

Identity env inputs (when provided by deployment system)
- `BUILD_COMMIT_SHA`
- `BUILD_RELEASE_TAG`
- `BUILD_APP_VERSION`

Revision precedence
1. `BUILD_COMMIT_SHA`
2. `BUILD_RELEASE_TAG`
3. `BUILD_APP_VERSION`
4. fallback `"unknown"`

Operator rule
- Promotion is considered verified only when observed `identity` matches the intended promoted build identity.

## 3) Rollback Trigger Binding

Pipeline rollback trigger reasons
- `build_failed`
- `readiness_failed`
- `promotion_gate_failed`

Rollback execution binding
- Rollback is executed by the pipeline gate only when configured via:
	- `PIPELINE_ROLLBACK_CMD`, or
	- `PIPELINE_ROLLBACK_RESULT` (proof/override mode)

If not configured
- Decision still includes rollback trigger metadata.
- `rollbackAttempted` is `false` and `rollbackExitCode` is `null`.

## 4) Manual Rollback Command (Canonical)

Command
- `powershell -NoProfile -File ./scripts/rollback-to-tag.ps1 -Tag <known-good-tag> -Branch main`

Behavior
- Fetches tags, checks out target branch, hard-resets to tag, force-pushes with lease.

Preconditions
- Confirm target tag is the last known-good release checkpoint.
- Confirm rollback is schema-safe for current DB state.

## 5) Post-Rollback Verification (Deterministic)

1. Query `GET /api/healthz` and `GET /api/readyz`.
2. Validate identity fields and ensure `identity.revision` matches rollback target identity.
3. Confirm readiness is healthy (`readyz.ok=true`) and no unexpected blockers.
4. Re-run minimal critical smoke/browser checks required by release policy.

Operator outcome criteria
- Rollback is complete only when health identity and readiness status both confirm target state.

## 6) Optional Local Gate Overrides (Proof/Diagnostics)

Supported deterministic overrides
- `PIPELINE_BUILD_RESULT`
- `PIPELINE_READINESS_RESULT`
- `PIPELINE_PROMOTION_RESULT`
- `PIPELINE_ROLLBACK_RESULT`
- `PIPELINE_RECORD_FILE`

Use
- Local proof runs and deterministic incident replay only.
- Do not use override mode for production promotion decisions.
