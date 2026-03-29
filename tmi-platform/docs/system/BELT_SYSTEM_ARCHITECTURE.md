# BELT_SYSTEM_ARCHITECTURE.md
# Homepage Belt System — Architecture Reference
# Visual authority: PDF pages 1–2
# Repo path: apps/web/src/app/page.tsx, apps/web/src/systems/belt/

## What Is The Belt System

The homepage is a vertical scroll of distinct editorial belts.
Each belt is a full-width horizontal section with its own visual identity, data source, and layout.

Belts are NOT generic cards. They are styled editorial surfaces from the TMI/Berntout PDF visual language.

---

## Belt Definitions

### Belt 1 — Promotional Hub
- **Purpose**: Hero promotional tiles, live event banners, featured artist spotlight
- **Layout**: 2–3 large promo tiles, sponsor injection slot
- **Data**: Config-driven from `hub` module or CMS
- **Live badge**: Yes — if live event is active, badge overlays the tile
- **PDF**: Page 1
- **Component path**: `apps/web/src/components/belts/PromoBelt.tsx`

### Belt 2 — Live Now / Artist Belt
- **Purpose**: Currently live artists and rooms
- **Layout**: Horizontal scroll of live cards (avatar + room name + viewer count)
- **Data**: Real-time from presence module (Socket.io)
- **Empty state**: "No live rooms right now — come back soon"
- **PDF**: Page 2
- **Component path**: `apps/web/src/components/belts/LiveNowBelt.tsx`

### Belt 3 — Charts / Discovery
- **Purpose**: This week's top tracks, featured playlists, trending artists
- **Layout**: Ranked list with artwork, rank badge, play button
- **Data**: PlaylistEngine weekly snapshot
- **PDF**: Page 11
- **Component path**: `apps/web/src/components/belts/ChartsBelt.tsx`

### Belt 4 — Magazine / Latest Issue
- **Purpose**: Teaser for the current magazine issue — horizontal spread preview
- **Layout**: 3-column preview tiles linking to full magazine reader
- **Data**: MagazineEngine latest issue
- **PDF**: Pages 4–8
- **Component path**: `apps/web/src/components/belts/MagazineBelt.tsx`

### Belt 5 — Game Night Teaser
- **Purpose**: Upcoming game events, active game lobby teaser
- **Layout**: Banner with game type icon, time, join button
- **Data**: GameEngine next scheduled event
- **PDF**: Pages 10–16
- **Component path**: `apps/web/src/components/belts/GamesBelt.tsx`

### Belt 6 — Sponsor / Ad Rail
- **Purpose**: Sponsored content rail, ad tiles
- **Layout**: Horizontal scroll of sponsor tiles (TMI-styled, not generic banner ads)
- **Data**: SponsorAdEngine
- **PDF**: Page 2 (sponsor tiles)
- **Component path**: `apps/web/src/components/belts/SponsorBelt.tsx`

---

## Belt Engine Architecture

```
BeltEngine
├── BeltRegistry          — ordered list of active belts + config
├── BeltRenderer          — maps belt ID to component
├── BeltDataLoader        — prefetch data per belt (SWR/React Query)
└── BeltAnimator          — entry animation on scroll-into-view
```

### BeltRegistry Schema (JSON config)
```json
{
  "belts": [
    { "id": "promo", "component": "PromoBelt", "order": 1, "enabled": true },
    { "id": "live-now", "component": "LiveNowBelt", "order": 2, "enabled": true },
    { "id": "charts", "component": "ChartsBelt", "order": 3, "enabled": true },
    { "id": "magazine", "component": "MagazineBelt", "order": 4, "enabled": true },
    { "id": "games", "component": "GamesBelt", "order": 5, "enabled": true },
    { "id": "sponsor", "component": "SponsorBelt", "order": 6, "enabled": true }
  ]
}
```

### Files To Create / Edit

| File | Action |
|------|--------|
| `apps/web/src/systems/belt/BeltRegistry.ts` | CREATE — belt config loader |
| `apps/web/src/systems/belt/BeltRenderer.tsx` | CREATE — dynamic belt renderer |
| `apps/web/src/components/belts/PromoBelt.tsx` | CREATE |
| `apps/web/src/components/belts/LiveNowBelt.tsx` | CREATE |
| `apps/web/src/components/belts/ChartsBelt.tsx` | CREATE |
| `apps/web/src/components/belts/MagazineBelt.tsx` | CREATE |
| `apps/web/src/components/belts/GamesBelt.tsx` | CREATE |
| `apps/web/src/components/belts/SponsorBelt.tsx` | CREATE |
| `apps/web/src/app/page.tsx` | EDIT — wire BeltRenderer |

---

## State Rules

- Each belt loads independently (no waterfall blocking)
- Belt fails → shows empty state, does not crash page
- Belt data is stale-while-revalidate (10 second interval for live belts)
- Stream & Win audio persists across belt navigation (never re-mounts)

---

## Visual Rules (from PDFs)

- Background: near-black with neon accent strips
- Card corners: sharp-ish (4–8px radius max)
- Live indicator: pulsing neon dot (red or teal)
- Typography: bold display font (TMI brand) / tight tracking
- NO generic card shadows, NO rounded-2xl, NO white card backgrounds
