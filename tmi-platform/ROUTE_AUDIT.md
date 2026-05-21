# TMI Route Integrity Audit
Generated: 2026-04-26
Branch: blackboxai/phase-5.1-seating-camera-polish
Tool: Claude Code — audit-only, no patches applied

---

## PASS

All 18 specified priority routes verified present and non-stub:

| Route | Status | Notes |
|-------|--------|-------|
| /winner-hall | ✅ PASS | Full page, season champions + records |
| /tutorials | ✅ PASS | Full page, 5 categories |
| /explore | ✅ PASS | Full page, genres + trending + rooms |
| /browse | ✅ PASS | Full page, role/genre/city grids |
| /streamwin | ✅ PASS | Full page, prizes + standings |
| /credits | ✅ PASS | Full page, 4 bundles + Stripe links |
| /audio | ✅ PASS | Full page, tracks + waveform viz |
| /hall-of-fame | ✅ PASS | Full page |
| /lobby | ✅ PASS | Client component, lobby engine |
| /season-pass | ✅ PASS | Full page, 3 tiers + Stripe links |
| /shops | ✅ PASS | Full page, 6 categories |
| /leaderboard | ✅ PASS | Full page |
| /booking | ✅ PASS | Full page, TmiBookingRuntimePanel wired |
| /sponsor | ✅ PASS | Full page, 3 packages + contact |
| /submit | ✅ PASS | Redirect → /contests |
| /support | ✅ PASS | Full page, 4 categories + FAQ |
| /safety | ✅ PASS | Full page, guidelines + report |
| /wallet | ✅ PASS | Full page, balance + payout |

All 122 internal `href` links across all page.tsx files resolve to existing routes.
Zero "Coming soon" or "Shell ready" stubs remain.
TypeCheck: 0 errors.
Git: No unmerged paths, no conflict markers.

---

## FAIL

Routes in `lib/routes.ts` that generate URLs pointing to wrong or missing paths:

### F-1: `routes.artist()` — wrong URL shape
```ts
// CURRENT (wrong):
artist: (id: string | number) => `/artist/${id}`
// Generates: /artist/wavetek
// BUT: artist/[id]/page.tsx does NOT exist
// AND: canonical artist page is at /artists/[slug] (plural)
```
**Impact:** Any component using `routes.artist(slug)` produces a dead URL.
**Fix:** Change to `(slug: string) => \`/artists/\${slug}\``

### F-2: `routes.live()` — param name mismatch
```ts
// CURRENT:
live: (id: string | number) => `/live/${id}`
// Generates: /live/wavetek-neon-nights
// Page exists at: live/[slug]/page.tsx — so slug resolves, but it's a redirect to /rooms
```
**Impact:** Low — /live/[slug] redirects to /rooms so users land somewhere valid.
**Severity:** Warning, not breaking.

### F-3: `routes.login` → `/auth` but login page is at `/login`
```ts
// CURRENT:
login: "/auth",
// Actual page: app/login/page.tsx — not app/auth/page.tsx
```
Check: `app/auth/page.tsx` may be an alias or NextAuth handler — needs verification.

---

## MISSING

Pages that have **zero page.tsx** but their directory exists (orphaned dirs):

| Orphaned Directory | Should Map To | Risk |
|---|---|---|
| `app/artist/[id]/` | Dead — real page is `artist/[slug]` | Route collision risk |
| `app/live/[roomId]/` | Dead — real page is `live/[slug]` | Route collision risk |
| `app/rooms/[id]/` | Dead — real page is `rooms/[slug]` | Route collision risk |
| `app/articles/[articleId]/` | Dead — real page is `articles/[slug]` | Route collision risk |
| `app/venues/[id]/` | Dead — real page is `venues/[slug]` | Route collision risk |
| `app/shows/[id]/` | No parent page either | Low risk |
| `app/store/[slug]/` | /shop exists as the real store | Low risk |
| `app/advertisers/[id]/` | /advertiser is the real page | Low risk |

---

## ORPHANED

Directories that exist but serve no routing purpose:

- `app/api_disabled/auth/[...nextauth]/` — intentionally disabled NextAuth route. Safe as-is.
- `app/api/artist/[slug]/` — API route directory, expected to have route.ts not page.tsx.
- `app/empty/events/` — unknown purpose, appears to be a scaffold remnant.

---

## COLLISIONS

Next.js **will fail at build time** if two dynamic segment directories coexist under the same parent, because it cannot determine which segment name to use.

### COLLISION-1 (HIGH): `rooms/[id]` + `rooms/[slug]`
Both exist under `app/rooms/`. Next.js build will warn or error.
`rooms/[id]` has no page.tsx — it is safe to delete.
Canonical: `rooms/[slug]/page.tsx` ✅

### COLLISION-2 (HIGH): `live/[roomId]` + `live/[slug]`
Both exist under `app/live/`. Same problem.
`live/[roomId]` has no page.tsx — safe to delete.
Canonical: `live/[slug]/page.tsx` ✅

### COLLISION-3 (HIGH): `articles/[articleId]` + `articles/[slug]`
Both exist under `app/articles/`. Same problem.
`articles/[articleId]` has no page.tsx — safe to delete.
Canonical: `articles/[slug]/page.tsx` ✅

### COLLISION-4 (HIGH): `artist/[id]` + `artist/[slug]`
Both exist under `app/artist/`. Same problem.
`artist/[id]` has no page.tsx — safe to delete.
Canonical: `artist/[slug]/page.tsx` ✅

### COLLISION-5 (LOW): `/artist/[slug]` vs `/artists/[slug]`
These are **different route paths** (singular vs plural) not a Next.js collision.
But both exist and both could serve as "artist profile" — creates confusion.
`routes.artist()` should canonicalize to `/artists/[slug]` (the plural one).

---

## FIX_PLAN

Ordered by priority. **Audit only — no patches applied yet.**

### Priority 1 — COLLISION FIXES (P0 before build)
Delete the empty orphaned dynamic dirs to prevent Next.js build collisions:
```
DELETE: app/rooms/[id]/                  (no page.tsx)
DELETE: app/live/[roomId]/               (no page.tsx)
DELETE: app/articles/[articleId]/        (no page.tsx)
DELETE: app/artist/[id]/                 (no page.tsx)
```

### Priority 2 — routes.ts FIXES (P0 before any navigation)
```ts
// lib/routes.ts — replace:
artist: (id: string | number) => `/artist/${id}`,
// with:
artist: (slug: string) => `/artists/${slug}`,

// Verify login route:
login: "/auth",
// Confirm whether /auth or /login is canonical, unify.
```

### Priority 3 — MISSING PAGE ADDITIONS (P1)
Add redirect pages for orphaned dirs that don't yet have page.tsx:
```
ADD: app/shows/[id]/page.tsx         → redirect("/shows")
ADD: app/store/[slug]/page.tsx       → redirect("/shop")
ADD: app/venues/[id]/page.tsx        → redirect("/venues/[slug]")  [already exists as venues/[slug]]
ADD: app/advertisers/[id]/page.tsx   → redirect("/advertiser")
```

### Priority 4 — CLEANUP (P2)
```
REVIEW: app/empty/events/            — determine if needed or delete
REVIEW: app/api_disabled/            — confirm intentionally disabled
```

### Priority 5 — VERIFY AFTER FIXES
After applying Priority 1-3:
```bash
pnpm --filter web build
# Then smoke test:
# / → loads
# /artists → loads
# /rooms → loads
# /lobby → loads
# /leaderboard → loads
# /winner-hall → loads
# /support → loads
```

---

## SUMMARY

| Category | Count |
|----------|-------|
| PASS (specified routes) | 18/18 |
| PASS (all href links) | 122/122 |
| FAIL (routes.ts mismatches) | 3 |
| MISSING (orphaned dirs, no page) | 8 |
| COLLISIONS (Next.js build risk) | 4 HIGH, 1 LOW |
| ORPHANED (non-routing dirs) | 3 |
| TypeCheck errors | 0 |
| Git conflicts | 0 |

**Build risk without fixes: HIGH** — the 4 dynamic segment collisions will likely cause `pnpm build` to warn or fail.
**Runtime risk without fixes: MEDIUM** — pages load in dev mode but production build may reject collision dirs.
**Revenue path impact: NONE** — all payment-facing routes (/season-pass, /credits, /wallet, /sponsor, /advertiser) are clean.
