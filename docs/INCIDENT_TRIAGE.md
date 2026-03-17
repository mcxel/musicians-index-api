# Incident Triage — automated detection + mapping

Purpose
- Make it fast to identify which module/area a failure belongs to and how to respond.

Observability
- Client errors: capture via Sentry (or equivalent) with release tag and feature-flag context.
- Server logs: structured logs with service, module, request id, and correlation id.
- Health endpoints:
  - `/api/health` — overall
  - `/api/health/hud` — HUD runtime
  - `/api/health/auth` — auth
  - `/api/health/db` — DB connectivity

Auto-triage rules (examples)
- If import / render failures hit `HudShell` X times in Y minutes → flag `HUD Runtime` incident.
- If JWT/auth failures spike → flag `Auth` incident.
- If Prisma query errors increase → flag `DB` incident.

Runbook
- On incident trigger:
  1. Record the first-seen time and top error signatures.
  2. Map signatures to module owners (based on CODEOWNERS or package manifest).
  3. Attempt safe rollback (toggle flags or revert deployment) if error matches a single deployment.
  4. Create a postmortem and remediation PR if code fix is needed.

Quick troubleshooting commands
- Smoke test the web UI against the last green tag.
- Run package-scoped tests: `pnpm -w -F @tmi/hud-core test` or `pnpm -C apps/web test`.
