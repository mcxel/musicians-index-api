# REPO_FIT_CONFLICT_AUDIT.md
## Route Conflicts, Duplicate Files, and Import Risks
### BerntoutGlobal XXL / The Musician's Index

---

## SPECIAL FILES — CONFLICT RESOLUTION

| File | Action |
|---|---|
| `app/not-found.tsx` | REPLACE — Pack 24 version has NotFoundShell |
| `app/error.tsx` | REPLACE — Pack 24 version has PlatformErrorShell + Sentry hook |
| `app/global-error.tsx` | ADD — likely missing in repo |
| `app/loading.tsx` | REPLACE — Pack 24 version is branded TMI loader |
| `app/robots.ts` | ADD — disallow list for all non-public routes |
| `app/sitemap.ts` | ADD — generates structured sitemap |
| `app/layout.tsx` | DO NOT TOUCH — provider chain established in Slices 13–17 |
| `app/middleware.ts` | EXTEND ONLY — add child account route blocking, do not rewrite |

---

## PAGE ROUTE CONFLICTS

| Pack 24 Route | Risk | Action |
|---|---|---|
| `/editorial` | May conflict with `/articles` | Use `/editorial` as canonical article route |
| `/editorial/[slug]` | May conflict with `/article/[slug]` | Redirect `/article/*` → `/editorial/*` |
| `/dashboard/*` | May conflict with existing dashboard catch-all | Add specific routes BEFORE catch-all in segment order |
| `/settings/*` | May not exist yet | ADD — create `(settings)` route group |
| `/fan-club/*` | New | ADD |
| `/beats` | New | ADD |
| `/competitions/*` | New | ADD |

---

## COMPONENT NAMING CONFLICTS

Check these before copying components:
```
Existing: DiamondTierBadge.tsx   — Pack 16 version. Do not replace with any other version.
Existing: LobbyWallPanel.tsx     — Must retain viewers_asc sort. Verify before copy.
Existing: SharedPreviewStagePanel.tsx  — Do not duplicate.
Existing: GlobalCommandCenterShell.tsx — Do not duplicate.
```

Packs 24-26 use new subfolder pattern (`/search/`, `/notifications/`, etc.).
If repo does not have these subfolders, create them during move.

---

## IMPORT ALIAS AUDIT

Verify `tsconfig.json` contains:
```json
{ "compilerOptions": { "paths": { "@/*": ["./src/*"] } } }
```

Verify `next.config.js` does NOT have conflicting module aliases.

Pack 24-26 components use:
```typescript
import { X } from '@/components/search/GlobalSearchBar'
import { X } from '@/components/error/ErrorBoundaryShell'
import { X } from '@/features/economy/WalletProvider'  // if adding feature folders
```

If repo uses different feature folder pattern, update imports during wire step.

---

## PROVIDER/LAYOUT COLLISION RISKS

| Risk | Check | Resolution |
|---|---|---|
| Duplicate AudioProvider | `grep -r "AudioProvider" apps/web/src/app` | Must be only ONE — in root layout.tsx |
| Duplicate SharedPreviewProvider | Same check | Must be only ONE |
| Duplicate TurnQueueProvider | Same check | Must be only ONE |
| Multiple loading.tsx | `find apps/web/src/app -name loading.tsx` | Only root loading.tsx from Pack 24 is needed |
| Multiple error.tsx | `find apps/web/src/app -name error.tsx` | Root only — segment-specific ones only if needed |

---

## DOCS NAMING CONFLICTS

Pack 25 adds several docs that may overlap Pack 15/16:
```
PLATFORM_PROOF_MATRIX.md  — Pack 15 version exists. Pack 25 FINAL_SMOKE_TEST_MATRIX.md is the new version.
ENVIRONMENT_STRATEGY.md   — Pack 15 version exists. ENVIRONMENT_VARIABLE_SYSTEM.md is additive.
```
If conflict: keep both — they serve different audiences (architecture vs. operations).

---

## ROUTE GROUP SETUP (If Missing)

Pack 24 requires these Next.js route groups. Create them if they don't exist:
```bash
mkdir -p apps/web/src/app/(settings)
mkdir -p apps/web/src/app/(family)
mkdir -p apps/web/src/app/(economy)

# Create minimal layout.tsx in each:
# (settings)/layout.tsx → wrap SettingsProvider
# (family)/layout.tsx → wrap FamilyProvider  
# (economy)/layout.tsx → wrap WalletProvider
```
