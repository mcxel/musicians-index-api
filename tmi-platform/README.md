# The Musician's Index (TMI) Platform — Soft Launch Alpha

Reality-first documentation for the active monorepo state.

## What this is

TMI is a multi-app monorepo centered on a Next.js web experience (`apps/web`) with supporting apps/services and shared packages.  
This README documents **what works now**, not aspirational architecture.

## Current operational reality (important)

- Primary local product surface: `apps/web`
- Standalone auth fallback exists in current flow and should be treated as the default path unless external API dependencies are explicitly configured.
- External integrations (payments/video/DB-backed flows) may be partially configured by environment.
- Some flows are in active stabilization (example: profile creation/routing polish).

## Monorepo at a glance

- `apps/web` — Main user-facing Next.js app (auth, hub, home flows, live surfaces)
- `apps/api` — API/dev helpers and service logic
- `packages/*` — shared contracts/runtime/db/tooling
- `docs/*` — architecture references, route maps, implementation guides

## Prerequisites

- Node.js `20.x`
- `pnpm` (workspace package manager)

## Quick start (local)

```bash
pnpm install
pnpm -C apps/web run dev
```

Then open:

- `http://localhost:3000`

## Common local commands (root)

```bash
pnpm -r --if-present run build
pnpm -r --if-present run typecheck
pnpm -r --if-present run lint
pnpm run smoke
pnpm run health
```

## Common app-specific commands

### Web app

```bash
pnpm -C apps/web run dev
pnpm -C apps/web build
pnpm -C apps/web exec tsc --noEmit
```

### API helpers

```bash
pnpm -C apps/api run build
```

See `apps/api/README.md` for dev tickets helper server details.

## Critical paths to verify before sharing build

1. Auth entry:
   - `/auth` register/sign-in should complete without 503.
2. Core navigation:
   - `/hub`, `/home/1` … `/home/5` should resolve and remain navigable.
3. Live/video surfaces:
   - live stage and room surfaces should render expected UI and request media permission when needed.
4. Admin surface:
   - overseer/admin routes should load according to current auth/session model.

## Known guardrails

- Do not assume external API/db requirements unless configured in env.
- Treat standalone/auth fallback behavior as valid default for current soft-launch mode.
- Documented “vision” items are separated into `docs/VISION.md`.

## Documentation map

- `docs/ONBOARDING.md` — operator-first, current-flow usage/testing
- `docs/VISION.md` — future-state blueprint and aspirational architecture
- `README_DEPLOYMENT.md` — practical deploy/env/smoke checklist

## Troubleshooting notes

- If build/type mismatch appears after schema changes, regenerate relevant clients/tooling before deeper debugging.
- If route behavior differs from expectation, verify actual route files in `apps/web/src/app/*` and check for role/session gating.
- On Windows, some npm/pnpm config warnings may appear as noise; prioritize real TypeScript/build/runtime errors first.
