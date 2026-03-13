# Phase 18.4 Controlled Deploy Rehearsal Evidence

Timestamp (capture start): 2026-03-12T17:52:41

## Scope

This rehearsal captures deploy-chain evidence only:

1. Canonical release entrypoint invokes the promotion gate.
2. Promotion gate emits deterministic machine decision output for PROMOTE and ABORT paths.
3. Rollback command path is exercised and surfaced in decision payload.
4. Readiness contract proof passes for API readiness/identity contract invariants.

## Evidence Captures

### 1) Release entrypoint alignment

Source line observed in `tmi-platform/scripts/release-build.ps1`:

```powershell
$pipelineGatePassed = Run-Command "pipeline-promotion-gate" "node scripts/pipeline-promotion-gate.js" (Join-Path $PSScriptRoot "..")
```

Result: PASS (release script invokes canonical gate entrypoint).

### 2) Promotion success decision (PROMOTE)

Command context:

- `PIPELINE_BUILD_RESULT=0`
- `PIPELINE_READINESS_RESULT=0`
- `PIPELINE_PROMOTION_RESULT=0`

Captured output:

```text
[pipeline-gate][decision] {"decision":"PROMOTE","stage":"promotion","rollbackTrigger":null,"exitCode":0,"rollbackAttempted":false,"rollbackExitCode":null}
```

Process exit code: `0`

Result: PASS (single deterministic decision line indicates promotion allowed).

### 3) Promotion failure with rollback command (ABORT)

Command context:

- `PIPELINE_BUILD_RESULT=0`
- `PIPELINE_READINESS_RESULT=0`
- `PIPELINE_PROMOTION_RESULT=5`
- `PIPELINE_ROLLBACK_CMD=node -e "process.exit(7)"`

Captured output:

```text
[pipeline-gate][decision] {"decision":"ABORT","stage":"promotion","rollbackTrigger":"promotion_gate_failed","exitCode":5,"rollbackAttempted":true,"rollbackExitCode":7}
```

Process exit code: `1`

Result: PASS (abort is enforced, rollback attempted, rollback exit code surfaced).

### 4) Runtime endpoint snapshots + readiness contract proof

Observed runtime snapshots during rehearsal:

`/api/healthz`

```json
{"ok":true,"service":"tmi-platform-api","uptimeSeconds":70527,"timestamp":"2026-03-13T00:52:40.552Z"}
```

`/api/readyz`

```json
{"ok":true,"service":"tmi-platform-api","contract":{"name":"tmi-platform-readyz","version":"1.0"},"checks":{"env":{"ok":true,"missing":[]},"database":{"ok":true,"latencyMs":301},"cache":{"ok":true,"configured":false,"skipped":true},"upstreams":{"ok":true,"skipped":true,"targets":[]}},"blockers":[],"timestamp":"2026-03-13T00:52:41.019Z"}
```

Readiness proof command:

```powershell
pnpm -C apps/api run test:readiness-contract
```

Proof output:

```text
readiness contract check passed
```

Result: PASS (runtime endpoints healthy; contract proof validates readiness/identity invariants).

## Rehearsal Verdict

Phase 18.4 controlled deploy rehearsal criteria met.

- Canonical release path binding: PASS
- Deterministic gate decision output (PROMOTE/ABORT): PASS
- Rollback command exercise with surfaced rollback exit code: PASS
- Readiness contract verification: PASS

No additional code changes required for this phase.