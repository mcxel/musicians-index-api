# TMI COMPONENT MERGE MANIFEST
## Copilot Integration Instructions
### tmi-components + tmi-complete + tmi-nav → tmi-platform/apps/web

---

## OVERVIEW

You have **3 downloaded packages** to merge into `tmi-platform/apps/web`:

| Package | ZIP File | What It Contains |
|---|---|---|
| `tmi-components` | tmi-components-complete.zip | Original 10 components (pages 1-15 from PDF) |
| `tmi-complete` | tmi-complete-v2.zip | Upgraded 14 components + architecture docs |
| `tmi-nav` | tmi-nav-v3.zip | Magazine navigation system (NEW) |

**Rule: `tmi-complete` supersedes `tmi-components` for all duplicate files.**

---

## STEP 1 — IDENTIFY DUPLICATES

These files exist in BOTH packages. Use the `tmi-complete` version:

| File | Keep From |
|---|---|
| `components/hub/PromotionalHub.*` | tmi-complete |
| `components/articles/ArticlesHub.*` | tmi-complete |
| `components/admin/AdminCommandHUD.*` | tmi-complete |
| `components/booking/ArtistBookingDashboard.*` | tmi-complete |
| `components/billboard/BillboardBoard.*` | tmi-complete |
| `components/audience/AudienceRoom.*` | tmi-complete |
| `components/games/GameNightHub.*` | tmi-complete |
| `components/shows/WinnersHall.*` | tmi-complete |
| `components/shows/DealOrFeud.*` | tmi-complete |
| `components/sponsor/SponsorBoard.*` | tmi-complete |
| `hooks/useLivePhoto.js` | tmi-complete |
| `hooks/useBioRotation.js` | tmi-complete |
| `styles/tokens.css` | tmi-complete |
| `styles/globals.css` | tmi-complete |
| `App.jsx` | tmi-complete (14 pages) |
| `App.css` | tmi-complete |

---

## STEP 2 — NEW FILES (only in tmi-complete)

These are NEW and must be added:

| File | Destination |
|---|---|
| `components/homepage/HomepageLiveCover.*` | `src/components/tmi/homepage/` |
| `components/homepage/MagazinePage2.*` | `src/components/tmi/homepage/` |
| `components/preview/PreviewStackWall.*` | `src/components/tmi/preview/` |
| `components/artist/ArtistProfileHub.*` | `src/components/tmi/artist/` |
| `docs/architecture/MASTER_ARCHITECTURE.md` | `docs/tmi/` |

---

## STEP 3 — NAV SYSTEM (only in tmi-nav)

These are NEW navigation files from tmi-nav:

| File | Destination |
|---|---|
| `components/nav/MagazineNav.jsx` | `src/components/tmi/nav/` |
| `components/nav/MagazineNav.css` | `src/components/tmi/nav/` |
| `docs/MAGAZINE_NAVIGATION_SYSTEM.md` | `docs/tmi/` |
| `docs/MERGE_MANIFEST.md` | `docs/tmi/` |

---

## STEP 4 — FINAL DESTINATION MAP

```
tmi-platform/apps/web/
├── src/
│   ├── components/
│   │   └── tmi/
│   │       ├── nav/
│   │       │   ├── MagazineNav.jsx         ← NEW (tmi-nav)
│   │       │   └── MagazineNav.css         ← NEW (tmi-nav)
│   │       ├── homepage/
│   │       │   ├── HomepageLiveCover.jsx   ← NEW (tmi-complete)
│   │       │   ├── HomepageLiveCover.css   ← NEW (tmi-complete)
│   │       │   ├── MagazinePage2.jsx       ← NEW (tmi-complete)
│   │       │   └── MagazinePage2.css       ← NEW (tmi-complete)
│   │       ├── preview/
│   │       │   ├── PreviewStackWall.jsx    ← NEW (tmi-complete)
│   │       │   └── PreviewStackWall.css    ← NEW (tmi-complete)
│   │       ├── artist/
│   │       │   ├── ArtistProfileHub.jsx    ← NEW (tmi-complete)
│   │       │   └── ArtistProfileHub.css    ← NEW (tmi-complete)
│   │       ├── hub/
│   │       │   ├── PromotionalHub.jsx      ← FROM tmi-complete
│   │       │   └── PromotionalHub.css      ← FROM tmi-complete
│   │       ├── articles/
│   │       │   ├── ArticlesHub.jsx         ← FROM tmi-complete
│   │       │   └── ArticlesHub.css         ← FROM tmi-complete
│   │       ├── admin/
│   │       │   ├── AdminCommandHUD.jsx     ← FROM tmi-complete
│   │       │   └── AdminCommandHUD.css     ← FROM tmi-complete
│   │       ├── booking/
│   │       │   ├── ArtistBookingDashboard.jsx ← FROM tmi-complete
│   │       │   └── ArtistBookingDashboard.css ← FROM tmi-complete
│   │       ├── billboard/
│   │       │   ├── BillboardBoard.jsx      ← FROM tmi-complete
│   │       │   └── BillboardBoard.css      ← FROM tmi-complete
│   │       ├── audience/
│   │       │   ├── AudienceRoom.jsx        ← FROM tmi-complete
│   │       │   └── AudienceRoom.css        ← FROM tmi-complete
│   │       ├── games/
│   │       │   ├── GameNightHub.jsx        ← FROM tmi-complete
│   │       │   └── GameNightHub.css        ← FROM tmi-complete
│   │       ├── shows/
│   │       │   ├── WinnersHall.jsx         ← FROM tmi-complete
│   │       │   ├── WinnersHall.css         ← FROM tmi-complete
│   │       │   ├── DealOrFeud.jsx          ← FROM tmi-complete
│   │       │   └── DealOrFeud.css          ← FROM tmi-complete
│   │       └── sponsor/
│   │           ├── SponsorBoard.jsx        ← FROM tmi-complete
│   │           └── SponsorBoard.css        ← FROM tmi-complete
│   ├── hooks/
│   │   ├── useLivePhoto.js                 ← FROM tmi-complete
│   │   └── useBioRotation.js               ← FROM tmi-complete
│   └── styles/
│       └── tmi/
│           ├── tokens.css                  ← FROM tmi-complete (import globally)
│           └── globals.css                 ← FROM tmi-complete (import globally)
│
├── docs/
│   └── tmi/
│       ├── MASTER_ARCHITECTURE.md          ← FROM tmi-complete
│       ├── MAGAZINE_NAVIGATION_SYSTEM.md   ← FROM tmi-nav
│       └── MERGE_MANIFEST.md               ← this file
```

---

## STEP 5 — GLOBAL CSS WIRING

In `apps/web/src/app/layout.tsx`, add:

```tsx
// TMI Design System
import '@/styles/tmi/tokens.css';
import '@/styles/tmi/globals.css';

// Google Fonts (already in index.html, add here for Next.js)
// Add to <head> via next/font or metadata
```

---

## STEP 6 — NEXT.JS PAGE ROUTING

Create or update these Next.js pages to use the components:

```tsx
// apps/web/src/app/page.tsx  (Homepage)
import HomepageLiveCover from '@/components/tmi/homepage/HomepageLiveCover';
import MagazinePage2     from '@/components/tmi/homepage/MagazinePage2';
import PreviewStackWall  from '@/components/tmi/preview/PreviewStackWall';
import { MagazineNavSystem } from '@/components/tmi/nav/MagazineNav';

// Wrap everything in MagazineNavSystem for Cmd+K, jump, recent, bookmarks
```

```tsx
// apps/web/src/app/artists/[slug]/page.tsx
import ArtistProfileHub from '@/components/tmi/artist/ArtistProfileHub';
```

```tsx
// apps/web/src/app/articles/[slug]/page.tsx
// Already exists from Phase C — import TMI article CSS tokens
```

---

## STEP 7 — WIRING THE NAV SYSTEM

The nav system wraps your entire app:

```tsx
// In layout.tsx or a page wrapper:
import { MagazineNavSystem } from '@/components/tmi/nav/MagazineNav';

export default function Layout({ children }) {
  return (
    <MagazineNavSystem
      currentSection={currentSection}     // from router
      onNavigate={(sectionId) => router.push(`/${sectionId}`)}
    >
      {children}
    </MagazineNavSystem>
  );
}
```

**Keyboard shortcut**: `Cmd+K` (Mac) / `Ctrl+K` (Windows) opens the command palette automatically.

---

## STEP 8 — CLEAN UP DOWNLOADS

Only delete from Downloads AFTER you verify:

- [ ] All files copied to correct repo locations
- [ ] `npm run build` passes in `apps/web`  
- [ ] `pnpm prisma migrate dev` runs without errors
- [ ] Homepage loads at `localhost:3001`
- [ ] `Cmd+K` opens command palette
- [ ] Jump bar shows section chips
- [ ] Recent pages persist on session reload
- [ ] Bookmarks persist across sessions (localStorage)
- [ ] Artist profile hub loads
- [ ] Preview wall sorts discovery-first

---

## UNRESOLVED ITEMS (fix before deleting)

| Item | Status | Notes |
|---|---|---|
| Demo data in components | Replace with API calls | Swap `DEMO_ARTISTS` arrays with `useSWR` hooks |
| Google Fonts loading | Verify Next.js setup | Add to `layout.tsx` metadata or use `next/font` |
| `process.env.NEXT_PUBLIC_API_URL` | Verify env name | Match to `API_BASE_URL` used elsewhere in repo |
| Phase C DB proof gate | Still pending | Run migration before testing artist hub article link |
| `useLivePhoto.js` for 6s homepage | Already implemented | Set `duration={6000}` for homepage, `{3000}` for profiles |

---

## COMPONENT STATUS SUMMARY

| Component | Status | Source |
|---|---|---|
| HomepageLiveCover | ✅ Complete | tmi-complete |
| MagazinePage2 | ✅ Complete | tmi-complete |
| PreviewStackWall | ✅ Complete | tmi-complete |
| ArtistProfileHub | ✅ Complete | tmi-complete |
| MagazineNav (jump/search/recent) | ✅ Complete | tmi-nav |
| PromotionalHub | ✅ Complete | tmi-complete |
| ArticlesHub | ✅ Complete | tmi-complete |
| BillboardBoard | ✅ Complete | tmi-complete |
| AudienceRoom | ✅ Complete | tmi-complete |
| GameNightHub | ✅ Complete | tmi-complete |
| WinnersHall | ✅ Complete | tmi-complete |
| DealOrFeud | ✅ Complete | tmi-complete |
| SponsorBoard | ✅ Complete | tmi-complete |
| AdminCommandHUD | ✅ Complete | tmi-complete |
| ArtistBookingDashboard | ✅ Complete | tmi-complete |
| useLivePhoto hook | ✅ Complete | tmi-complete |
| useBioRotation hook | ✅ Complete | tmi-complete |
| tokens.css | ✅ Complete | tmi-complete |
| globals.css | ✅ Complete | tmi-complete |
| MASTER_ARCHITECTURE.md | ✅ Complete | tmi-complete |

---

*TMI Merge Manifest — BerntoutGlobal XXL*
*Use this as the single source of truth for Copilot integration*
