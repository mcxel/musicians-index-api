# REPO_IMPORT_ORDER.md
## Exact Import Order for Copilot — Do Not Deviate
### BerntoutGlobal XXL / The Musician's Index

This order prevents breaking changes during the move. Earlier steps cannot depend on later steps.

---

## PHASE 0 — BEFORE ANYTHING (30 min)

```
□ Verify all pack zips are downloaded and extracted
□ Verify pack counts match PACK_INDEX_AND_CHECKSUMS.md
□ Create git branch: git checkout -b pack24-26-import
□ Confirm current build passes: pnpm -C apps/web build
□ Tag current state: git tag pre-pack24-import
```

---

## PHASE 1 — DOCS AND SYSTEM FILES (no build impact)

Import docs first. These have zero build impact and establish the reference foundation.

```
1a. Move tmi-pack15/*/         → tmi-platform/docs/system/     [MERGE]
1b. Move tmi-pack16/docs-system/ → tmi-platform/docs/system/   [MERGE]
1c. Move tmi-final-deploy/docs-system/ → tmi-platform/docs/system/ [MERGE]
1d. Move tmi-pack24/docs-system/ → tmi-platform/docs/system/   [MERGE]
1e. Move tmi-pack25/docs-system/ → tmi-platform/docs/system/   [MERGE]
1f. Move tmi-pack26/closure/    → tmi-platform/docs/system/    [MERGE]
1g. Move tmi-pack26/finance/    → tmi-platform/docs/system/finance/ [CREATE + MERGE]
1h. Move tmi-pack26/copilot/    → tmi-platform/docs/copilot/   [CREATE + MERGE]
1i. Move tmi-pack27-ops/        → tmi-platform/docs/system/    [MERGE]
```
Checkpoint: git commit -m "docs: import all pack docs and system files"

---

## PHASE 2 — PRISMA SCHEMA (must be before API wiring)

```
2a. Read: tmi-pack25/docs-system/prisma/PRISMA_SCHEMA_DELTA.md
2b. Append new models to: packages/db/prisma/schema.prisma
2c. Run: npx prisma migrate dev --name pack25_26_import
2d. Run: npx prisma generate
2e. Verify: pnpm -C packages/db run build exits 0
```
Checkpoint: git commit -m "prisma: add pack25-26 schema models"

---

## PHASE 3 — API ENDPOINTS (must be after Prisma)

Wire in this sub-order (most critical first):

```
3a. Auth/health endpoints (if any gaps from existing)
3b. Search endpoint:           GET /api/search
3c. Notification endpoints:    GET/POST /api/notifications + preferences
3d. Feed endpoint:             GET /api/feed
3e. Tip endpoints:             POST /api/tips/intent + webhook
3f. Wallet endpoints:          GET/POST /api/wallet
3g. Credits endpoints:         GET/POST /api/credits
3h. Fan club endpoints:        full CRUD /api/fan-clubs
3i. Beat endpoints:            full CRUD /api/beats
3j. Competition endpoints:     GET/POST /api/competitions
3k. Season endpoints:          GET /api/seasons
3l. Settings endpoints:        GET/PUT /api/settings
3m. Family/kid endpoints:      GET/POST /api/family
3n. Ticket anti-bot:           POST /api/tickets/purchase-check
3o. Owner finance endpoints:   GET/POST /api/admin/finance
```

Reference: tmi-pack25/docs-system/contracts/API_CONTRACTS.md

Checkpoint: git commit -m "api: wire all new endpoints"

---

## PHASE 4 — PROVIDERS AND LAYOUTS (must be after API)

```
4a. Create: apps/web/src/app/(settings)/layout.tsx  → wrap SettingsProvider
4b. Create: apps/web/src/app/(family)/layout.tsx    → wrap FamilyProvider
4c. Create: apps/web/src/app/(economy)/layout.tsx   → wrap WalletProvider
4d. Create: apps/web/src/features/economy/WalletProvider.tsx
4e. Create: apps/web/src/features/settings/SettingsProvider.tsx
4f. Create: apps/web/src/features/family/FamilyProvider.tsx
4g. EXTEND (do not replace): apps/web/src/app/middleware.ts → add child account route blocking
```

⚠️ DO NOT MODIFY: apps/web/src/app/layout.tsx (root provider chain)

Reference: tmi-pack25/docs-system/PROVIDER_WIRING_MAP.md

Checkpoint: git commit -m "providers: add settings, family, wallet providers"

---

## PHASE 5 — COMPONENTS AND PAGE SHELLS (must be after providers)

```
5a. Move tmi-pack16/components/       → apps/web/src/components/   [SELECTIVE — see matrix]
5b. Move tmi-pack24/components/search/ → apps/web/src/components/search/
5c. Move tmi-pack24/components/notifications/ → apps/web/src/components/notifications/
5d. Move tmi-pack24/components/economy/ → apps/web/src/components/economy/
5e. Move tmi-pack24/components/feed/   → apps/web/src/components/feed/
5f. Move tmi-pack24/components/mobile/ → apps/web/src/components/mobile/
5g. Move tmi-pack24/components/scenes/ → apps/web/src/components/scenes/
5h. Move tmi-pack24/components/error/  → apps/web/src/components/error/
5i. Move tmi-pack24/components/settings/ → apps/web/src/components/settings/
5j. Move new page shells from Pack 16 + Pack 24 → apps/web/src/app/ [SELECTIVE — see matrix]
5k. REPLACE stubs: not-found.tsx, error.tsx, loading.tsx
5l. ADD new: global-error.tsx, robots.ts, sitemap.ts
```

Checkpoint: pnpm -C apps/web typecheck
Checkpoint: git commit -m "components: import pack16+24 components and page shells"

---

## PHASE 6 — STRIPE WEBHOOKS (must be after API)

```
6a. Create: apps/api/src/stripe/stripe.service.ts
6b. Create: apps/api/src/stripe/webhooks/tip.webhook.ts
6c. Create: apps/api/src/stripe/webhooks/fan-club.webhook.ts
6d. Create: apps/api/src/stripe/webhooks/beat-license.webhook.ts
6e. Create: apps/api/src/stripe/webhooks/ticket.webhook.ts
6f. Create: apps/api/src/stripe/webhooks/payout.webhook.ts
6g. Create: apps/api/src/stripe/webhooks/credits.webhook.ts
6h. Register all webhook handlers in main.ts or StripeModule
```

Reference: tmi-pack25/docs-system/STRIPE_WIRING_PLAN.md

Checkpoint: Stripe test event → correct webhook handler fires

---

## PHASE 7 — WEBSOCKET EVENTS (can run parallel with Phase 6)

```
7a. Extend: apps/api/src/gateways/room.gateway.ts
    Add: room:tip_received, room:scene_change, room:turn_warning
7b. Create: apps/api/src/gateways/battle.gateway.ts
7c. Create: apps/api/src/gateways/notification.gateway.ts
7d. Create: apps/api/src/gateways/season.gateway.ts
7e. Create: apps/api/src/gateways/ticket.gateway.ts
```

Reference: tmi-pack25/docs-system/WEBSOCKET_EVENT_MAP.md

---

## PHASE 8 — FAMILY/KID SAFETY (must be after API + WebSocket)

```
8a. Create: apps/api/src/middleware/message-safety.middleware.ts
    Implement canSendMessage() per FAMILY_KID_SAFETY_RULES.md
8b. Apply to: POST /api/messages
8c. Apply to: room:chat WebSocket handler
8d. Apply to: POST /api/friends/request
8e. Extend middleware.ts: add child account route blocking
```

Reference: tmi-pack25/docs-system/FAMILY_KID_SAFETY_RULES.md

Proof: Adult → kid DM attempt → 403 Forbidden

---

## PHASE 9 — TICKET ANTI-BOT (must be after API + Stripe)

```
9a. Create: apps/api/src/modules/tickets/anti-bot.service.ts
9b. Implement all 4 layers per TICKET_ANTI_BOT_RULES.md
9c. Apply to: POST /api/tickets/purchase-check
9d. Verify Cloudflare Turnstile keys are in env
```

Reference: tmi-pack25/docs-system/TICKET_ANTI_BOT_RULES.md

Proof: Attempt 9 tickets → 429 limit_exceeded

---

## PHASE 10 — BUILD AND PROOF

```
pnpm install --frozen-lockfile
pnpm -C packages/db run build
pnpm -C apps/api typecheck
pnpm -C apps/api run build
pnpm -C apps/web typecheck
pnpm -C apps/web run build         ← must exit 0

pnpm test:discovery                ← CRITICAL — lobby sort verification
pnpm test:smoke                    ← full smoke test

git commit -m "feat: complete pack24-26 import and wiring"
git tag pack26-wired
```
