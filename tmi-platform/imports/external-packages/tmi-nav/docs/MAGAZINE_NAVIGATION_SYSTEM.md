# MAGAZINE_NAVIGATION_SYSTEM.md
## TMI — Complete Navigation Architecture

---

## The 4 Navigation Modes

### Mode 1: Guided Magazine Flow (the spine)
The default reading experience. Never interrupt this.

```
Artist Feature Page
  → Article/News Page
    → Random Page
      → Artist Feature Page (next)
        → repeat...
```

This is how users discover organically. The other modes are escape hatches, not replacements.

### Mode 2: Jump Mode
Instant teleport to any section. Available via:
- Jump bar chips (persistent, visible at top)
- Command palette `Cmd+K` → Jump tab
- Floating nav button → opens palette

Jump targets include:
- All 20 sections from `SECTIONS` array
- Direct entity jumps (specific artist, article, game)

### Mode 3: Search Mode
Full-text search across all content types:
- Artists (name, genre, rank, city)
- Articles (title, tag, author)
- Games (name, status, players)
- Shows (name, date, sponsor)
- Contests (name, prize, deadline)
- Billboard (chart positions, genre)
- Sponsors (brand, category)
- Store (item name, price)
- Horoscope (sign, type)
- Throwback/Seasonal (era, theme)

Activates automatically when typing in command palette.

### Mode 4: Recent Page Memory
TMI-specific navigation history, separate from browser back/forward.

- **Session history**: Last 20 visited pages (clears on tab close)
- **Bookmarks**: Permanently saved pages (localStorage)
- **Issue path**: The sequence you navigated through this session

Key rule: Because random pages may not reappear for a long time, users must be able to get back to any page they saw.

---

## Component Structure

```
MagazineNavSystem  (provider wrapper)
├── JumpBar        (top, always visible)
├── MagazineBreadcrumb  (below jump bar)
├── {children}     (page content)
├── RecentlyViewedRail  (bottom of page, shows last 10)
├── FloatingNavButton   (fixed bottom-right, mobile-first)
└── CommandPalette      (modal overlay, Cmd+K)
    ├── Search input
    ├── Jump tab  → grouped section grid
    ├── Recent tab → last 20 pages
    └── Bookmarks tab → saved pages
```

---

## Visual Rules

All navigation UI must stay inside the TMI visual language:
- Dark neon surfaces, never white/light
- Neon accents per section color
- Orbitron/Exo 2 fonts, never system fonts
- Glow effects on hover/active states
- Smooth spring animations, never instant snaps
- Mobile: bottom sheet for palette (not centered modal)

---

## Performance Rules

- Command palette opens in <100ms
- Search debounce: 150ms
- History stored in sessionStorage (auto-clears)
- Bookmarks stored in localStorage (persistent)
- Do not fetch remote search until user has typed 2+ characters
- Keyboard navigation within palette (↑↓ Enter Esc)
- Trap focus inside open palette (accessibility)

---

## Data Integration

Replace demo `DEMO_RESULTS` with real API endpoints:

```ts
// Search endpoint
GET /api/search?q={query}&types=artist,article,game,show,contest,sponsor

// Returns:
{
  artists: [{ id, name, rank, genre, slug }],
  articles: [{ id, title, slug, tag }],
  games: [{ id, title, status, players }],
  sponsors: [{ id, name, tier }],
  // ...
}
```

---

## Files in This System

| File | Purpose |
|---|---|
| `MagazineNav.jsx` | All 4 nav modes in one component |
| `MagazineNav.css` | All nav styles (TMI-compliant) |
| `usePageMemory` hook | Session history + localStorage bookmarks |
| `SECTIONS` array | All 20 jump targets |
| `GROUPS` object | Section category groupings |

---

## Integration Checklist

- [ ] Import `tokens.css` globally before this component
- [ ] Wrap app or page with `<MagazineNavSystem>`
- [ ] Connect `onNavigate` to your router (Next.js `router.push`)
- [ ] Pass `currentSection` from current route
- [ ] Replace `DEMO_RESULTS` with real search API
- [ ] Test `Cmd+K` on Mac, `Ctrl+K` on Windows/PC
- [ ] Verify bookmarks persist after page refresh
- [ ] Verify recent history clears on new browser session
- [ ] Test mobile bottom sheet behavior (≤640px)
- [ ] Test keyboard navigation inside palette (↑↓ Enter Esc)
