# Magazine Navigation System

## Required modes
1. Guided flow: `artist -> article -> random -> repeat`
2. Jump mode: direct section access
3. Search mode: global query across sections and content types
4. Memory mode: recent pages + bookmarks

## Implemented in repo
- Component: `apps/web/src/components/tmi/nav/MagazineNavSystem.tsx`
- Scope: global (wired in root layout)
- Hotkey: `Ctrl/Cmd + K`

## Fast jump sections
- Home, Artists, Articles, Billboard, Live Rooms, Shows, Games, Contests, Sponsors, Store, Horoscope, Throwback, Seasonal, Dashboard, Admin

## Search behavior
- Search field in command palette filters section directory instantly.
- Section jump paths are route-safe (no dead links required to use the system).

## Reading memory
- Recent stack depth: 20 pages (session scope)
- Bookmark depth: 100 pages (persistent)
- Recent rail shows last 10 with one-click reopen

## UX placement
- Sticky jump bar at top
- Command palette overlay for universal access
- Recently viewed rail under jump bar
- Bookmark toggle in jump bar

## Performance constraints
- Storage only (`sessionStorage` + `localStorage`), no blocking network calls
- Overlay mounts on demand
- Search is local filter, O(n) on section list

## Next extension
- Add API-backed full-text index for artist/article/game/show entities
- Add “Back 20” timeline drawer with thumbnails
- Add keyboard row navigation inside palette
