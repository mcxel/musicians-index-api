# TMI PACK 34 — WORKING COMPONENTS + API STUBS + ADMIN HUD
## The Final Layer — Actual TSX + NestJS Files Ready to Drop In
### BerntoutGlobal LLC / The Musician's Index

---

## WHAT THIS PACK ADDS

### Components (9 files)
The actual working React components Copilot wires into pages.

| File | Purpose |
|---|---|
| TMILogo.tsx | Linked/unlinked wordmark — use everywhere in nav |
| TMILiveBadge.tsx | Pulsing LIVE badge — use on lobby tiles and room cards |
| TMIGlowCard.tsx | Dark card with accent glow — base card for most surfaces |
| TMIBeltHeader.tsx | Gold belt header with divider — use on all homepage belts |
| TMICountdownTimer.tsx | Real-time clock or target-date countdown — use in Belt 4 |
| TMICrownBadge.tsx | Pulsing crown + artist name — use on winner displays |
| AdRenderer.tsx | **Universal ad slot — always HTTP 200, never blank** |
| EarningsPanel.tsx | Full earnings sidebar — wire to wallet + stream-win API |
| SponsorCoachingSticky.tsx | Coaching note card — wire to coaching engine |

### API Module Stubs (5 files)
NestJS controller shells Copilot fills in.

| File | Route | Critical Note |
|---|---|---|
| ads.controller.ts | GET /api/ads/slot/:id | Platform Law #7: always 200 |
| home-composition.controller.ts | GET /api/home/composition | Belt stack for homepage |
| rooms.controller.ts | GET /api/rooms?sort=viewers_asc | **Discovery-first — 0 viewers = position 1** |
| editorial.controller.ts | GET /api/editorial, GET /api/editorial/:slug | Must return author.stationSlug |
| stream-win.controller.ts | GET/POST /api/stream-win/* | Points for engagement events |

### Admin (1 file)
| File | Purpose |
|---|---|
| admin/command-center/page.tsx | 6-panel HUD: health + owner finance + campaigns + bots + moderation + discovery |

### Pages (4 files)
| File | Route |
|---|---|
| beats/page.tsx | /beats (Beat Marketplace with genre filter) |
| hall-of-fame/page.tsx | /hall-of-fame (Crown winner history) |
| error/not-found/page.tsx | 404 in TMI style |
| error/maintenance/page.tsx | Maintenance screen |

### Docs (1 file)
| File | Purpose |
|---|---|
| COMPLETE_DELIVERY_REFERENCE.md | Every file across all 9 packs with context — the master reference |

---

## MOVE DESTINATIONS

```
components/tmi-design/*.tsx        → apps/web/src/components/tmi-design/
components/monetization/*.tsx      → apps/web/src/components/monetization/
api-modules/ads/*.ts               → apps/api/src/modules/monetization/
api-modules/home/*.ts              → apps/api/src/modules/home-composition/
api-modules/rooms/*.ts             → apps/api/src/modules/rooms/
api-modules/editorial/*.ts         → apps/api/src/modules/editorial/
api-modules/stream-win/*.ts        → apps/api/src/modules/stream-win/
admin/command-center/page.tsx      → apps/web/src/app/admin/command-center/page.tsx
pages/beats/page.tsx               → apps/web/src/app/beats/page.tsx
pages/hall-of-fame/page.tsx        → apps/web/src/app/hall-of-fame/page.tsx
pages/error/not-found/page.tsx     → apps/web/src/app/not-found.tsx
pages/error/maintenance/page.tsx   → apps/web/src/app/maintenance/page.tsx
docs/COMPLETE_DELIVERY_REFERENCE.md → docs/COMPLETE_DELIVERY_REFERENCE.md
```

---

## GRAND TOTAL: 224 FILES ACROSS 10 PACKS

Packs 25–34 cover every layer of The Musician's Index platform:
contracts → finance → safety → design → implementation → scaffold → homepage → systems → coaching → components

*BerntoutGlobal LLC — "This is your stage, be original."*
