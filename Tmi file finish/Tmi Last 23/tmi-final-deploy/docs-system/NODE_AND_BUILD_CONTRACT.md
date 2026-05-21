# NODE_AND_BUILD_CONTRACT.md
## Exact Node, pnpm, and Build Requirements — No Drift
### BerntoutGlobal XXL / The Musician's Index

---

## EXACT VERSIONS

```json
// package.json (root)
{
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=8.0.0"
  },
  "packageManager": "pnpm@8.15.0"
}
```

**Node:** 20.x LTS — required everywhere (local, CI, Render, Cloudflare Pages, any scripts)
**pnpm:** 8.x — the ONLY package manager. Never npm, never yarn, never bun.
**Lockfile:** `pnpm-lock.yaml` is the truth. `--frozen-lockfile` on all CI/CD installs.

---

## FORBIDDEN COMMANDS

```bash
# NEVER RUN — will break the monorepo
npm install
yarn install
npm run build
yarn build

# CORRECT COMMANDS
pnpm install --frozen-lockfile    # CI/production
pnpm install                       # local dev only
```

---

## BUILD ORDER (Must Follow Dependency Order)

```bash
# Step 1: Install
pnpm install --frozen-lockfile

# Step 2: Build packages in dependency order
pnpm -C packages/db run build              # Prisma client first
pnpm -C packages/hud-theme run build       # Design tokens
pnpm -C packages/hud-runtime run build     # HUD runtime
pnpm -C packages/platform-kernel run build # Feature flags, shared utils

# Step 3: Build apps
pnpm -C apps/api run build                 # NestJS API
pnpm -C apps/web run build                 # Next.js Web

# Or use workspace command:
pnpm run build --recursive
```

---

## MEMORY FLAGS

If Next.js build fails with heap OOM (common on large repos):
```bash
NODE_OPTIONS="--max-old-space-size=4096" pnpm -C apps/web run build
```

Add to Cloudflare Pages build environment as env var if needed.

---

## REPO ROOT ASSUMPTIONS

```
tmi-platform/           ← monorepo root, all commands run from here
  apps/
    web/                ← Next.js app (Cloudflare Pages)
    api/                ← NestJS API (Render)
  packages/
    db/                 ← Prisma schema + client
    hud-theme/          ← Design tokens
    hud-runtime/        ← HUD providers
    platform-kernel/    ← Feature flags, shared config
  docs/
    system/             ← All architecture docs
```
