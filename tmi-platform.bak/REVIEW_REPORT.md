REVIEW REPORT — tmi-platform

Purpose: Record risky/config files that need explicit owner confirmation before committing. Do NOT stage these yet.

Priority review items

1) tmi-platform/apps/web/package.json
- What changed: Dependencies and/or scripts modified.
- Risk level: HIGH
- Recommended action: Confirm owner intent. If intentional, split into its own commit and run `pnpm -C tmi-platform install` in a clean environment; otherwise revert.
- Reason: Alters install/build behavior and may change CI results.

2) tmi-platform/pnpm-workspace.yaml
- What changed: Workspace layout modified.
- Risk level: HIGH
- Recommended action: Confirm workspace structure with owners; validate with `pnpm -w install` in a controlled environment; split from source commits if possible.
- Reason: Workspace changes affect package resolution and hoisting across the mono-repo.

3) tmi-platform/pnpm-lock.yaml
- What changed: Lockfile updated.
- Risk level: HIGH
- Recommended action: Regenerate/validate in CI-like clean env (`pnpm -C tmi-platform install`) and only commit after owner confirmation; consider committing separately from source changes.
- Reason: Lockfile commits can subtly change the dependency graph and break reproducibility.

4) tmi-platform/apps/web/package-lock.json
- What changed: Large edits present (npm lockfile).
- Risk level: HIGH / CONFLICT
- Recommended action: Confirm package manager strategy (pnpm vs npm). If pnpm is primary, remove/ignore `package-lock.json`. If npm is intended, regenerate and confirm owner.
- Reason: Mixed lockfile formats cause conflicts and unpredictable installs.

5) tmi-platform/apps/web/next.config.js
- What changed: Config edits detected.
- Risk level: MEDIUM-HIGH
- Recommended action: Review changes for runtime/build flags; test `next build` in isolation; split commit if uncertain.
- Reason: Next.js config can change optimization, routing, and runtime behavior.

6) Untracked `tmi-platform/packages/*` (hud-core, hud-runtime, hud-theme, hud-tmi, contracts, db, etc.)
- What changed: New/untracked package folders detected.
- Risk level: MEDIUM
- Recommended action: Confirm these are intended workspace packages. If so, add `package.json` and register in workspace config; if scaffolds, move to a feature branch or DEFER until ready.
- Reason: New packages affect hoisting, linking, and workspace resolution.

7) Untracked `tmi-platform/apps/api/*` (README, env examples, src modules)
- What changed: API scaffolding present but untracked.
- Risk level: MEDIUM
- Recommended action: Confirm owner/intent; if incomplete, keep as DEFER or put in a branch; if ready, add package metadata and owner.
- Reason: Half-baked API code can introduce secrets or incomplete routes.

8) Untracked `tmi-platform/scripts/*`
- What changed: New scripts present.
- Risk level: MEDIUM
- Recommended action: Inspect scripts for side effects; confirm owner; include only when tested.
- Reason: Scripts can change build/publish flows or run destructive actions.

9) api_server.py (root) and tmi-platform/api_server.py
- What changed: Small modifications noted.
- Risk level: MEDIUM
- Recommended action: Verify no secrets/credentials leaked; run basic sanity tests; confirm owner.
- Reason: Server changes affect runtime and deployment.

10) requirements.min.txt
- What changed: Python dependency list changed.
- Risk level: MEDIUM-HIGH
- Recommended action: Validate in a virtualenv (`python -m venv .venv && .venv\Scripts\activate; pip install -r requirements.min.txt`) and confirm owner.
- Reason: Changes can break Python environments and deployments.

Notes / recommended workflow
- Do NOT stage or commit any REVIEW items yet.
- Suggested safe flow:
  1. Save this REVIEW report in the repo (`tmi-platform/REVIEW_REPORT.md`).
  2. Clean REMOVE items (logs, temp, .next, dist) to reduce workspace load.
  3. Update `.gitignore` to prevent recurrence of generated clutter.
  4. Re-run `pnpm -C tmi-platform install` in a clean shell after owners confirm package changes.
  5. For lockfiles, prefer splitting lockfile commits from source commits and run CI to validate.

Prepared by: Automation (triage)
Date: 2026-03-06
