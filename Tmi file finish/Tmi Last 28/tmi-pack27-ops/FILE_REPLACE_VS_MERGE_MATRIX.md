# FILE_REPLACE_VS_MERGE_MATRIX.md
## Every File — Safe Replace / Merge Only / Inspect First / Never Overwrite
### BerntoutGlobal XXL / The Musician's Index

---

## LEGEND
```
SAFE REPLACE   — Pack version is complete, overwrite the existing stub/old version
MERGE ONLY     — File exists with real content, add new sections carefully
INSPECT FIRST  — Look at existing file before deciding (may already be wired)
NEVER OVERWRITE — These files must not be touched
```

---

## NEXT.JS SPECIAL FILES

| File | Action | Reason |
|---|---|---|
| `apps/web/src/app/not-found.tsx` | **SAFE REPLACE** | Pack 24 has NotFoundShell |
| `apps/web/src/app/error.tsx` | **SAFE REPLACE** | Pack 24 has PlatformErrorShell + Sentry |
| `apps/web/src/app/global-error.tsx` | **SAFE REPLACE** (ADD if missing) | Pack 24 version is complete |
| `apps/web/src/app/loading.tsx` | **SAFE REPLACE** | Pack 24 has branded TMI loader |
| `apps/web/src/app/robots.ts` | **SAFE REPLACE** (ADD if missing) | Complete disallow list |
| `apps/web/src/app/sitemap.ts` | **SAFE REPLACE** (ADD if missing) | Structured sitemap generator |
| `apps/web/src/app/layout.tsx` | **NEVER OVERWRITE** | Provider chain locked in Slices 13-17 |
| `apps/web/src/middleware.ts` | **MERGE ONLY** | EXTEND to add child route blocking |

---

## PAGE ROUTES

| File | Action | Reason |
|---|---|---|
| `apps/web/src/app/page.tsx` | **NEVER OVERWRITE** | Homepage Crown — already wired |
| `apps/web/src/app/(auth)/register/page.tsx` | **NEVER OVERWRITE** | Working registration |
| `apps/web/src/app/(auth)/login/page.tsx` | **NEVER OVERWRITE** | Working login |
| `apps/web/src/app/onboarding/page.tsx` | **NEVER OVERWRITE** | Working onboarding |
| `apps/web/src/app/dashboard/page.tsx` | **INSPECT FIRST** | May have real wiring |
| `apps/web/src/app/streamwin/page.tsx` | **NEVER OVERWRITE** | Stream & Win wired |
| All Pack 16 new page shells | **SAFE REPLACE** | All are empty shells |
| All Pack 24 new page shells | **SAFE REPLACE** | All are empty shells |

---

## COMPONENTS

| File Pattern | Action | Reason |
|---|---|---|
| `components/profile/DiamondTierBadge.tsx` | **INSPECT FIRST** | Diamond logic is sacred |
| `components/lobby/LobbyWallPanel.tsx` | **INSPECT FIRST** | Must have viewers_asc sort |
| `components/preview/SharedPreviewStagePanel.tsx` | **INSPECT FIRST** | Critical singleton |
| `components/operator/GlobalCommandCenterShell.tsx` | **INSPECT FIRST** | Operator core |
| All Pack 24 components (new subfolders) | **SAFE REPLACE** | New folders, no conflict |
| All Pack 16 new components | **INSPECT FIRST** | Check if Copilot already wired any |

---

## DOCS / SYSTEM

| File Pattern | Action | Reason |
|---|---|---|
| All new `docs/system/*.md` from packs | **SAFE REPLACE** (ADD if missing) | Pure docs, no build impact |
| `docs/system/bots/*.md` | **SAFE REPLACE** (ADD if missing) | Pure docs |
| `docs/copilot/*.md` | **SAFE REPLACE** (ADD if missing) | Copilot reference only |

---

## PROVIDERS AND RUNTIME

| File | Action | Reason |
|---|---|---|
| `features/rooms/RoomInfrastructureProvider.tsx` | **NEVER OVERWRITE** | Core runtime |
| `features/live/SharedStageProvider.tsx` | **NEVER OVERWRITE** | Core live engine (Slice 14) |
| `features/live/StageQueueProvider.tsx` | **NEVER OVERWRITE** | Core queue engine (Slice 15) |
| `features/system/SystemHealthProvider.tsx` | **NEVER OVERWRITE** | Core health system (Slice 16) |
| `features/operator/OperatorCommandProvider.tsx` | **NEVER OVERWRITE** | Core operator (Slice 17) |
| New `features/economy/WalletProvider.tsx` | **SAFE REPLACE** (ADD) | New file |
| New `features/settings/SettingsProvider.tsx` | **SAFE REPLACE** (ADD) | New file |
| New `features/family/FamilyProvider.tsx` | **SAFE REPLACE** (ADD) | New file |

---

## PRISMA SCHEMA

| Action | Method |
|---|---|
| `packages/db/prisma/schema.prisma` | **MERGE ONLY** — APPEND new models at the end |
| Never delete existing models | Existing models are used by slices 13-17 |
| Run migrate after append | `npx prisma migrate dev --name pack25_26_import` |

---

## API / BACKEND

| File Pattern | Action | Reason |
|---|---|---|
| `apps/api/src/gateways/room.gateway.ts` | **MERGE ONLY** | Extend with new events |
| `apps/api/src/main.ts` | **MERGE ONLY** | Add new modules/providers |
| All new controller files | **SAFE REPLACE** (ADD) | New files in new modules |
| All new service files | **SAFE REPLACE** (ADD) | New files in new modules |
| `apps/api/src/stripe/` (new) | **SAFE REPLACE** (ADD) | New folder |
