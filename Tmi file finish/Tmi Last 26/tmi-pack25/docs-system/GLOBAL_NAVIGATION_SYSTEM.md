# GLOBAL_NAVIGATION_SYSTEM.md
## Navigation Architecture — Desktop, Mobile, and Rooms
### BerntoutGlobal XXL / The Musician's Index

---

## NAVIGATION LAYERS

### Desktop: Top Navigation Bar
```
[TMI Logo]  [/discover]  [/lobby]  [/editorial]  [/beats]  [/rankings]
                                              [Search]  [Notifications]  [Profile]
```

### Mobile: Bottom Tab Bar (5 tabs)
`/live`  `/lobby`  `/discover`  `/feed`  `/dashboard`
(MobileNavBar component from Pack 24)

### In-Room: Minimal Navigation
- Back arrow (exits room)
- TMI wordmark (links home)
- No full nav bar in rooms (overlaps performer view)

---

## ROUTE GROUPS (Next.js App Router)

```
src/app/
  (main)/           ← Public routes with full nav bar
    page.tsx
    discover/
    editorial/
    lobby/
    ...
  (auth)/           ← Already exists: login, register, onboarding
  (dashboard)/      ← Protected: artist/fan dashboards
  (rooms)/          ← Minimal nav: arena, battle, cypher, etc.
  (admin)/          ← Admin only: GlobalCommandCenterShell
  (settings)/       ← Settings shell layout
  (family)/         ← Family account layout
```

---

## BREADCRUMBS

Used on deep nested pages:
`Home / Artists / Marcel Dickens / Media`
`Home / Events / Summer Battle 2026 / Results`

BreadcrumbBar component renders from `usePathname()`.
Hidden inside rooms and admin pages.

---

## KEYBOARD NAVIGATION (GLOBAL)

`/` → Search bar
`g h` → Go Home
`g l` → Go to Lobby
`g d` → Go to Discover
`g f` → Go to Feed
`Escape` → Close modal/overlay
Arrow keys inside dropdowns and search
