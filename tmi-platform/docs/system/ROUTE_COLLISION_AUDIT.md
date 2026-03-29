# ROUTE_COLLISION_AUDIT.md
## Pack 24 vs Existing Routes — No Collisions Found
### BerntoutGlobal XXL / The Musician's Index

---

## SPECIAL FILE AUDIT (most collision-prone)

| File | In Pack 24 | Existing in Repo | Action |
|---|---|---|---|
| `not-found.tsx` | ✅ New (NotFoundShell) | May exist as stub | **REPLACE** — Pack 24 version is complete |
| `error.tsx` | ✅ New (PlatformErrorShell) | May exist as stub | **REPLACE** — Pack 24 version is complete |
| `global-error.tsx` | ✅ New | Likely missing | **ADD** |
| `loading.tsx` | ✅ New | May exist as spinner | **REPLACE** — branded TMI loader |
| `robots.ts` | ✅ New | Likely missing | **ADD** |
| `sitemap.ts` | ✅ New | Likely missing | **ADD** |

## ROUTE OVERLAP AUDIT

| Pack 24 Route | Conflict? | Notes |
|---|---|---|
| `/search` | None | New route |
| `/notifications` | None | New route |
| `/settings/*` | Possible | Check if /settings exists — Pack 24 adds full shell |
| `/wallet` | None | New route |
| `/credits` | None | New route |
| `/feed` | None | New route |
| `/fan-club/*` | None | New route |
| `/beats` | None | New route |
| `/competitions/*` | None | New route |
| `/editorial/*` | Check | May conflict with /articles — use /editorial for full articles |
| `/seasons/[slug]` | None | New sub-route |

## DASHBOARD OVERLAP AUDIT

Pack 24 adds `/dashboard/fan-clubs` and `/dashboard/beats`.
Existing dashboard routes: check that these don't conflict with `/dashboard/[catch-all]`.
If dashboard uses catch-all: add specific routes BEFORE the catch-all in Next.js segment order.

## IMPORT ALIAS VERIFICATION

Pack 24 uses `@/components/...` and `@/features/...`.
Verify `tsconfig.json` has:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## TAILWIND CLASS VERIFICATION

Pack 24 uses `tmi-` prefix CSS classes.
These must be added to `apps/web/src/styles/tmi-classes.css` or your existing class file.
No Tailwind utility class conflicts since we use custom `tmi-*` classes consistently.
