# PLACEMENT.md — TMI Platform Complete Build
## Exact file locations for `tmi-platform/` repository in VS Code

This document maps every file in this bundle to its exact destination path.
Follow the order below when placing files to avoid import errors.

---

## STEP 1 — Create Shared Engines Package

First, ensure `packages/engines/` exists in your monorepo root.

```
tmi-platform/
└── packages/
    └── engines/
        ├── package.json           ← create (see below)
        └── src/
            ├── index.ts           ← packages/engines/src/index.ts
            ├── TierEngine.ts      ← packages/engines/src/TierEngine.ts
            ├── PointsEngine.ts    ← packages/engines/src/PointsEngine.ts
            ├── RevenueEngine.ts   ← packages/engines/src/RevenueEngine.ts
            ├── AdEngine.ts        ← packages/engines/src/AdEngine.ts
            ├── SponsorEngine.ts   ← packages/engines/src/SponsorEngine.ts
            ├── EventOrchestrator.ts  ← packages/engines/src/EventOrchestrator.ts
            ├── InventoryEngine.ts ← packages/engines/src/InventoryEngine.ts
            ├── VotingAntiFraudEngine.ts ← packages/engines/src/VotingAntiFraudEngine.ts
            └── InterviewArticlePipeline.ts ← packages/engines/src/InterviewArticlePipeline.ts
```

**Create `packages/engines/package.json`:**
```json
{
  "name": "@tmi/engines",
  "version": "1.0.0",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "scripts": {}
}
```

**Add to root `package.json` workspaces (if not already):**
```json
{
  "workspaces": ["apps/*", "packages/*"]
}
```

**Add to `apps/api/package.json` dependencies:**
```json
{
  "dependencies": {
    "@tmi/engines": "workspace:*"
  }
}
```

**Add to `apps/web/package.json` dependencies:**
```json
{
  "dependencies": {
    "@tmi/engines": "workspace:*"
  }
}
```

**Run from repo root:**
```bash
pnpm install
```

---

## STEP 2 — Prisma Schema Additions

Append contents of `prisma-additions.prisma` to:
```
tmi-platform/apps/api/prisma/schema.prisma
```

Then run:
```bash
set DATABASE_URL=postgresql://tmi:tmi@localhost:5432/tmi?schema=public
pnpm -C apps/api prisma migrate dev --name add-engines
pnpm -C apps/api prisma generate
```

---

## STEP 3 — Web App UI Components

Place all UI files inside `apps/web/src/`:

```
apps/web/src/
├── components/
│   ├── ui/                          ← existing from previous build
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Tabs.tsx
│   │   ├── Toast.tsx
│   │   ├── Badge.tsx
│   │   ├── Slider.tsx
│   │   ├── Progress.tsx
│   │   ├── DataTable.tsx
│   │   ├── Tooltip.tsx
│   │   ├── AvatarFrame.tsx
│   │   └── index.ts
│   ├── hud/                         ← HUD components
│   │   ├── VideoWithThreeTiles.tsx  ← existing
│   │   ├── PlayWidget.tsx           ← NEW
│   │   └── AuctionWidget.tsx        ← NEW
│   ├── sponsor/
│   │   └── SponsorTile.tsx          ← NEW
│   ├── analytics/
│   │   └── AnalyticsMiniPanel.tsx   ← NEW
│   ├── live/
│   │   └── DealVsFeud1000.tsx       ← NEW
│   ├── magazine/
│   │   └── MagazineLayout.tsx       ← NEW
│   ├── avatar/                      ← existing from previous build
│   │   ├── avatar.types.ts
│   │   └── BobbleheadAvatar.tsx
│   ├── groups/                      ← existing from previous build
│   │   ├── group.types.ts
│   │   └── GroupProfilePage.tsx
│   └── schedule/                    ← existing from previous build
│       ├── ScheduleEngine.ts
│       ├── ScheduleWidget.tsx
│       └── AnnualContests.ts
├── lib/
│   ├── theme/
│   │   └── tokens.ts               ← existing
│   └── motion/
│       └── index.ts                ← existing
└── styles/
    └── tmi-theme.css               ← existing
```

---

## STEP 4 — API Module Files

The API needs service wrappers around the engine pure functions.
Create these files in `apps/api/src/modules/`:

```
apps/api/src/
├── modules/
│   ├── points/
│   │   ├── points.service.ts     ← wraps PointsEngine with DB calls
│   │   └── points.module.ts
│   ├── revenue/
│   │   ├── revenue.service.ts    ← wraps RevenueEngine with DB calls
│   │   └── revenue.module.ts
│   ├── ads/
│   │   ├── ads.service.ts        ← wraps AdEngine with DB calls
│   │   └── ads.module.ts
│   ├── sponsors/
│   │   ├── sponsors.service.ts   ← wraps SponsorEngine with DB calls
│   │   └── sponsors.module.ts
│   ├── events/
│   │   ├── events.service.ts     ← wraps EventOrchestrator with DB calls
│   │   └── events.module.ts
│   ├── inventory/
│   │   ├── inventory.service.ts  ← wraps InventoryEngine with DB calls
│   │   └── inventory.module.ts
│   ├── voting/
│   │   ├── voting.service.ts     ← wraps VotingAntiFraudEngine with DB calls
│   │   └── voting.module.ts
│   └── interviews/
│       ├── interviews.service.ts ← wraps InterviewArticlePipeline with DB calls
│       └── interviews.module.ts
└── engines/                      ← re-export from @tmi/engines for convenience
    └── index.ts
```

---

## STEP 5 — Install Order

Run in this order:
```bash
# 1. Install dependencies
pnpm install

# 2. Migrate database
pnpm -C apps/api prisma migrate dev --name add-engines
pnpm -C apps/api prisma generate

# 3. Build API
pnpm -C apps/api build

# 4. Build Web
pnpm -C apps/web build

# 5. Start everything
pnpm -C apps/api dev
pnpm -C apps/web dev
```

---

## STEP 6 — Environment Variables

Ensure `apps/api/.env` contains:
```env
DATABASE_URL="postgresql://tmi:tmi@localhost:5432/tmi?schema=public"
TMI_API_PORT=3001
PLATFORM_LAUNCH_DATE="2026-01-01"
REDIS_URL="redis://localhost:6379"
MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
```

---

## FILE COUNT SUMMARY

| Location | Files | Status |
|---|---|---|
| `packages/engines/src/` | 10 | ✅ NEW |
| `apps/web/src/components/hud/` | 2 new | ✅ NEW |
| `apps/web/src/components/sponsor/` | 1 | ✅ NEW |
| `apps/web/src/components/analytics/` | 1 | ✅ NEW |
| `apps/web/src/components/live/` | 1 | ✅ NEW |
| `apps/web/src/components/magazine/` | 1 | ✅ NEW |
| `prisma-additions.prisma` | 1 | ✅ ADD TO SCHEMA |
| Previous UI kit (25 files) | 25 | ✅ EXISTING |
| **TOTAL NEW** | **17** | |
| **TOTAL SYSTEM** | **42** | |

---

## TOP 10 RISK ITEMS

1. **`@tmi/engines` package not found** → Run `pnpm install` from repo root after adding workspace
2. **Prisma migration conflict** → If schema already has conflicting models, rename them
3. **Circular import: PointsEngine ↔ TierEngine** → Only TierEngine exports configs; PointsEngine imports from TierEngine (one-way, safe)
4. **Missing `crypto.randomUUID`** → Available in Node 18+. If < 18, polyfill or use `uuid` package
5. **`apps/api/.env` vs root `.env`** → Prisma reads `apps/api/.env` if it exists; always put DB URL there
6. **Redis restarting (255)** → Add `restart: unless-stopped` to docker-compose.yml for tmi-redis
7. **React `children` prop type** → Add `children?: React.ReactNode` to any component accepting children
8. **Magazine touch swipe on desktop** → Touch events won't fire on desktop; keyboard arrows are the fallback
9. **AuctionWidget `endDate` updates** → Pass live `lot` prop updates via WebSocket; stale closures will break countdown
10. **DealVsFeud seed randomness** → `fairRandom()` is deterministic but not cryptographically secure; for production use server-side reveal only

---

## INTEGRATION CHECKLIST

After placing all files:

- [ ] `pnpm install` succeeds
- [ ] `prisma migrate` succeeds with no errors
- [ ] `prisma generate` creates client
- [ ] `apps/api dev` starts and port 3001 shows LISTENING
- [ ] `apps/web dev` compiles with no TypeScript errors
- [ ] Import `@tmi/engines` in a test file confirms it resolves
- [ ] `TierEngine.getTierFromPoints(1000)` returns `'BRONZE'`
- [ ] `PointsEngine.calculateEarnings('VOTE', 'GOLD', 3)` returns `15`
- [ ] `EventOrchestrator.formatCountdown(5000)` returns `'0m 5s'`
- [ ] PlayWidget renders in Storybook or test page
- [ ] AuctionWidget countdown ticks in real-time
- [ ] MagazineLayout swipe/keyboard navigation works
- [ ] DealVsFeud door animation triggers on state change
- [ ] AnalyticsMiniPanel renders all 4 variants
- [ ] SponsorTile renders all 5 variants
