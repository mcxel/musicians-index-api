# COPILOT_REPO_MOVE_AND_WIRING_PLAN.md
## Exact Repo Move Instructions for Copilot — Every File, Every Destination
### BerntoutGlobal XXL / The Musician's Index

Copilot: follow this sheet in order. Do not assume. Do not guess.
After each move group, run `pnpm -C apps/web typecheck` before continuing.

---

## STEP 0 — BEFORE ANYTHING ELSE

Fix Cloudflare build blocker first:
```bash
# In apps/web/next.config.js — add to module.exports:
transpilePackages: ['@tmi/hud-runtime','@tmi/hud-theme','@tmi/platform-kernel']

# In apps/web/package.json — add to scripts:
"prebuild": "pnpm -C ../../packages/hud-runtime build && pnpm -C ../../packages/hud-theme build && pnpm -C ../../packages/platform-kernel build"
```
Proof: `pnpm -C apps/web build` exits 0.

---

## STEP 1 — MOVE PACKS 15, 16, FINAL-DEPLOY INTO DOCS/SYSTEM

Source: `Downloads/tmi-pack15-final-completion/`
Action: MERGE (add files, do not overwrite existing)
```
tmi-pack15/master-control/    → tmi-platform/docs/system/
tmi-pack15/world-simulation/  → tmi-platform/docs/system/
tmi-pack15/lifecycle/         → tmi-platform/docs/system/
tmi-pack15/overlay-motion/    → tmi-platform/docs/system/
tmi-pack15/device-distribution/ → tmi-platform/docs/system/
tmi-pack15/monitoring-ops/    → tmi-platform/docs/system/
tmi-pack15/asset-pipeline/    → tmi-platform/docs/system/
tmi-pack15/billing-compliance/ → tmi-platform/docs/system/
tmi-pack15/proof-launch/      → tmi-platform/docs/system/
tmi-pack15/bot-specs/         → tmi-platform/docs/system/bots/
```

Source: `Downloads/tmi-pack16-repo-ready-normalization/`
Action: MERGE for docs, ADD for components/pages (inspect for conflicts first)
```
tmi-pack16/docs-system/       → tmi-platform/docs/system/
tmi-pack16/docs-system/bots/  → tmi-platform/docs/system/bots/
tmi-pack16/components/        → tmi-platform/apps/web/src/components/  ← CHECK CONFLICTS
tmi-pack16/pages/             → tmi-platform/apps/web/src/app/         ← CHECK CONFLICTS
```
⚠️ CONFLICT CHECK REQUIRED for pages/:
These pages must NOT be overwritten (they already work):
```
apps/web/src/app/page.tsx              ← DO NOT OVERWRITE
apps/web/src/app/(auth)/register/      ← DO NOT OVERWRITE
apps/web/src/app/(auth)/login/         ← DO NOT OVERWRITE
apps/web/src/app/onboarding/           ← DO NOT OVERWRITE
apps/web/src/app/dashboard/            ← DO NOT OVERWRITE
apps/web/src/app/streamwin/            ← DO NOT OVERWRITE
```

Source: `Downloads/tmi-final-deploy-layer/`
```
tmi-final-deploy/docs-system/ → tmi-platform/docs/system/
tmi-final-deploy/audit/       → tmi-platform/docs/system/
```

---

## STEP 2 — MOVE PACK 24 (SUPERCHARGE LAYER)

Source: `Downloads/tmi-pack24-supercharge/`

### 2a. Docs and bots (MERGE)
```
tmi-pack24/docs-system/       → tmi-platform/docs/system/
tmi-pack24/docs-system/bots/  → tmi-platform/docs/system/bots/
```

### 2b. Components (ADD — these are all new)
```
tmi-pack24/components/search/         → tmi-platform/apps/web/src/components/search/
tmi-pack24/components/notifications/  → tmi-platform/apps/web/src/components/notifications/
tmi-pack24/components/economy/        → tmi-platform/apps/web/src/components/economy/
tmi-pack24/components/feed/           → tmi-platform/apps/web/src/components/feed/
tmi-pack24/components/mobile/         → tmi-platform/apps/web/src/components/mobile/
tmi-pack24/components/scenes/         → tmi-platform/apps/web/src/components/scenes/
tmi-pack24/components/error/          → tmi-platform/apps/web/src/components/error/
tmi-pack24/components/settings/       → tmi-platform/apps/web/src/components/settings/
```

### 2c. Page shells (ADD — check each for conflicts)
```
tmi-pack24/pages/search/         → tmi-platform/apps/web/src/app/search/
tmi-pack24/pages/notifications/  → tmi-platform/apps/web/src/app/notifications/
tmi-pack24/pages/settings/       → tmi-platform/apps/web/src/app/settings/
tmi-pack24/pages/wallet/         → tmi-platform/apps/web/src/app/wallet/
tmi-pack24/pages/credits/        → tmi-platform/apps/web/src/app/credits/
tmi-pack24/pages/tip/            → tmi-platform/apps/web/src/app/tip/
tmi-pack24/pages/feed/           → tmi-platform/apps/web/src/app/feed/
tmi-pack24/pages/fan-club/       → tmi-platform/apps/web/src/app/fan-club/
tmi-pack24/pages/beats/          → tmi-platform/apps/web/src/app/beats/
tmi-pack24/pages/competitions/   → tmi-platform/apps/web/src/app/competitions/
tmi-pack24/pages/editorial/      → tmi-platform/apps/web/src/app/editorial/
tmi-pack24/pages/dashboard/      → tmi-platform/apps/web/src/app/dashboard/  ← CHECK CONFLICTS
```

### 2d. Special Next.js files (REPLACE if stub exists, ADD if missing)
```
tmi-pack24/not-found.tsx   → tmi-platform/apps/web/src/app/not-found.tsx  ← REPLACE stub
tmi-pack24/error.tsx       → tmi-platform/apps/web/src/app/error.tsx      ← REPLACE stub
tmi-pack24/global-error.tsx → tmi-platform/apps/web/src/app/global-error.tsx  ← ADD
tmi-pack24/loading.tsx     → tmi-platform/apps/web/src/app/loading.tsx    ← REPLACE stub
tmi-pack24/robots.ts       → tmi-platform/apps/web/src/app/robots.ts      ← ADD
tmi-pack24/sitemap.ts      → tmi-platform/apps/web/src/app/sitemap.ts     ← ADD
```

---

## STEP 3 — MOVE PACK 25 (CONTRACTS + SAFETY RULES)

Source: `Downloads/tmi-pack25-final-closure/`
```
tmi-pack25/docs-system/contracts/   → tmi-platform/docs/system/
tmi-pack25/docs-system/prisma/      → tmi-platform/docs/system/
tmi-pack25/docs-system/*.md         → tmi-platform/docs/system/
tmi-pack25/copilot/*.md             → tmi-platform/docs/copilot/
```

---

## STEP 4 — MOVE PACK 26 (FINAL CLOSURE + FINANCE)

Source: `Downloads/tmi-pack26-final-closure/`
```
tmi-pack26/closure/*.md    → tmi-platform/docs/system/
tmi-pack26/finance/*.md    → tmi-platform/docs/system/finance/
tmi-pack26/copilot/*.md    → tmi-platform/docs/copilot/
```

---

## STEP 5 — PRISMA MIGRATION

After all docs are moved:
```bash
# Copy models from docs/system/PRISMA_SCHEMA_DELTA_PACK.md into:
# packages/db/prisma/schema.prisma

# Then run:
cd tmi-platform
npx prisma migrate dev --name pack25_26_final
npx prisma generate
```

---

## STEP 6 — WIRE API ENDPOINTS

Wire all endpoints per API_CONTRACT_PACK.md into:
```
apps/api/src/modules/search/
apps/api/src/modules/notifications/
apps/api/src/modules/feed/
apps/api/src/modules/tips/
apps/api/src/modules/wallet/
apps/api/src/modules/credits/
apps/api/src/modules/fan-clubs/
apps/api/src/modules/beats/
apps/api/src/modules/competitions/
apps/api/src/modules/seasons/
apps/api/src/modules/editorial/
apps/api/src/modules/settings/
apps/api/src/modules/family/
apps/api/src/modules/tickets/anti-bot/
apps/api/src/modules/owner-finance/
```

---

## STEP 7 — WIRE STRIPE WEBHOOKS

```
apps/api/src/stripe/webhooks/tip.webhook.ts
apps/api/src/stripe/webhooks/fan-club.webhook.ts
apps/api/src/stripe/webhooks/beat-license.webhook.ts
apps/api/src/stripe/webhooks/ticket.webhook.ts
apps/api/src/stripe/webhooks/payout.webhook.ts
apps/api/src/stripe/webhooks/credits.webhook.ts
```

---

## STEP 8 — WIRE WEBSOCKET EVENTS

Per REALTIME_EVENT_MAP.md:
```
apps/api/src/gateways/room.gateway.ts      → room:* events
apps/api/src/gateways/battle.gateway.ts    → battle:* events
apps/api/src/gateways/notification.gateway.ts → notification:* events
apps/api/src/gateways/season.gateway.ts    → season:*, leaderboard:* events
apps/api/src/gateways/ticket.gateway.ts    → ticket:* events (queue mode)
```

---

## STEP 9 — WIRE FAMILY/KID SAFETY

Add `canSendMessage()` middleware check per FAMILY_KID_HARD_RULES_PACK.md to:
```
apps/api/src/middleware/message-safety.middleware.ts
```
Apply to: POST /api/messages, room:chat WebSocket handler, friend request API.

---

## STEP 10 — FINAL BUILD + PROOF

```bash
cd tmi-platform
pnpm install --frozen-lockfile
pnpm -C packages/db run build
pnpm -C apps/api run build
pnpm -C apps/web run build

# Infrastructure probes
curl https://api.themusiciansindex.com/health
curl https://api.themusiciansindex.com/api/readyz

# Discovery-first critical test
pnpm test:discovery  ← BLOCKS DEPLOY IF FAILS

# Full smoke test
pnpm test:smoke
```
