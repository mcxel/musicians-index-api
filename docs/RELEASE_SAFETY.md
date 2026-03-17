# Release Safety — TMI

Purpose
- Ensure changes in one module cannot silently break other modules or production.

Rules
- Module boundary: every major area must be a package under `@tmi/*` or an app. Do not import another package's `src` directly.
- Public surface only: packages expose UI components, types/contracts, and a minimal runtime API. Keep implementation private.
- Enforce with tooling: ESLint import-boundary rules and TypeScript package `exports` must prevent cross-source imports.
- Semver for contracts: changes to `@tmi/contracts` follow semver. CI must detect breaking d.ts changes and require an explicit major version label for breaking changes.

Process
- Tag each deploy with a unique git tag (example: `web@2026-03-05.1`).
- Build artifacts: every deploy stores build artifacts and the corresponding source/lockfile snapshot.
- CI pre-merge gates:
  - `pnpm -w -r --if-present lint` (workspace-safe)
  - `pnpm -w -r --if-present typecheck` limited to impacted packages
  - Public API / `d.ts` snapshot check for packages that export types

PR checklist
- Keep changes inside package boundary.
- If you change types in `@tmi/contracts`, bump the package per semver and add a changelog entry.
- Add feature flags for unfinished work and provide safe fallback components.

Enforcement
- CI will fail merges that:
  - Import `src` of another package
  - Change the public type surface without a version bump or explicit `major` label

Notes
- Keep lockfile and Node/pnpm pinned in CI to guarantee deterministic builds.
