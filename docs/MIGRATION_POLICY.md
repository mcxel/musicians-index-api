# Migration Policy — Expand / Contract (Prisma)

Goal
- Make schema changes safe and reversible. Avoid irreversible breaking DB changes during a deploy.

Rules
- Prefer expand/contract approach:
  - Expand step: add nullable columns/tables and deploy code that writes both old and new shapes.
  - Backfill: run backfill jobs to populate new columns while both code paths run.
  - Contract step: in a later deploy, remove the old column/behavior.

Checklist for a migration PR
- Provide the migration SQL and the reasoning for expand/contract.
- Confirm a backup snapshot is available prior to deployment.
- Provide an automated backfill plan or a migration job runnable separately.

CI gates
- `prisma migrate diff` to validate expected changes.
- `prisma validate` and a dry-run against a staging snapshot.

Runbook
- If a migration causes failures, immediately stop the release, revert code (using rollback playbook), and run a restore in staging to triage.

Notes
- Avoid destructive schema changes (dropping columns or shrinking column types) in the same release as code that depends on them.
