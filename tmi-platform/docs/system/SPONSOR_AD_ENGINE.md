# SPONSOR_AD_ENGINE.md
# Sponsor / Ads System — Engine Architecture
# Visual authority: PDF page 2 (sponsor tiles)
# Repo paths: apps/web/src/app/sponsors/, apps/api/src/modules/sponsors/

## What Is The Sponsor / Ads System

The Sponsor / Ads System manages branded content tiles on the homepage, magazine, and live surfaces.
These are NOT generic banner ads. They are TMI-styled sponsor tiles that match the platform aesthetic.
Sponsors get dashboards to view their impressions and configure their tiles.

---

## PDF Authority Summary

- **Page 2**: Sponsor tiles on the homepage belt — neon-edged tiles with logo, tagline, CTA button

---

## Ad Unit Types

| Type | Surface | Description |
|------|---------|-------------|
| Belt Tile | Homepage Belt 6 (Sponsor Rail) | 1-up or 2-up horizontal scroll tiles |
| Article Interstitial | Magazine reader between pages | Full-spread branded page |
| Live Room Badge | Live room header | Sponsor logo badge on live room |
| Cypher Stage Banner | Cypher stage background | Subtle branded backdrop tile |
| Game Sponsor | Game session splash | Sponsor logo on game start screen |

---

## Engine Architecture

```
SponsorAdEngine
├── AdRegistry            — list of active sponsors + their assigned slots
├── AdSlotResolver        — determines which ad goes in which slot
├── ImpressionTracker     — records ad views (privacy-safe, aggregated)
├── ClickTracker          — records CTA clicks
├── SponsorDashboard      — sponsor's view of their campaign stats
├── AdTileRenderer        — renders correct ad unit per slot type
└── AdminAdManager        — admin CRUD for ad slots and sponsors
```

---

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/sponsors/slots` | Get active ad slots + content |
| GET | `/api/sponsors/slots/:slotId` | Get specific slot |
| POST | `/api/sponsors/impressions` | Record impression (batched) |
| POST | `/api/sponsors/clicks` | Record click |
| GET | `/api/sponsors/dashboard` | Sponsor's campaign stats (auth: SPONSOR) |
| POST | `/api/sponsors` | Create sponsor (Admin) |
| PATCH | `/api/sponsors/:id` | Update sponsor |
| POST | `/api/sponsors/:id/slots` | Assign ad slot |

---

## DB Models Needed

```prisma
model Sponsor {
  id          String   @id @default(cuid())
  name        String
  logoUrl     String?
  websiteUrl  String?
  userId      String?  // optional: linked to a SPONSOR-role user account
  isActive    Boolean  @default(true)
  adSlots     AdSlot[]
  createdAt   DateTime @default(now())
}

model AdSlot {
  id          String   @id @default(cuid())
  sponsorId   String
  sponsor     Sponsor  @relation(fields: [sponsorId], references: [id])
  slotType    String   // BELT_TILE | ARTICLE_INTERSTITIAL | LIVE_BADGE | etc.
  headline    String?
  tagline     String?
  ctaText     String?
  ctaUrl      String?
  imageUrl    String?
  isActive    Boolean  @default(true)
  priority    Int      @default(50)
  impressions Int      @default(0)
  clicks      Int      @default(0)
  startsAt    DateTime?
  endsAt      DateTime?
  createdAt   DateTime @default(now())
}
```

---

## Frontend Routes

| Route | Description |
|-------|-------------|
| `/sponsors` | Public sponsor showcase (exists, stub) |
| `/sponsors/dashboard` | Sponsor campaign dashboard (auth: SPONSOR) |
| `/admin/sponsors` | Admin sponsor management |

---

## Files To Create / Edit

| File | Action |
|------|--------|
| `apps/api/src/modules/sponsors/sponsors.module.ts` | CREATE |
| `apps/api/src/modules/sponsors/sponsors.controller.ts` | CREATE |
| `apps/api/src/modules/sponsors/sponsors.service.ts` | CREATE |
| `apps/web/src/app/sponsors/dashboard/page.tsx` | CREATE |
| `apps/web/src/app/admin/sponsors/page.tsx` | CREATE |
| `apps/web/src/systems/sponsor/SponsorAdEngine.ts` | CREATE |
| `apps/web/src/components/sponsor/AdTile.tsx` | CREATE |
| `apps/web/src/components/sponsor/SponsorBelt.tsx` | CREATE (also in BELT docs) |
| `packages/db/prisma/schema.prisma` | EDIT — add Sponsor, AdSlot |

---

## Visual Rules (from PDF page 2)

- Tile: neon edge glow (brand color), sponsor logo centered top, tagline below
- CTA button: solid neon color, sharp corners
- NO white backgrounds, NO rounded generic card look
- Tile matches TMI visual language — these are editorial sponsor tiles, not banner ads
- On hover: brightness boost, subtle scale (1.02–1.03 max)

---

## States Required

- Slot loaded: renders sponsor tile
- Slot empty / no sponsor assigned: renders nothing (no placeholder, no drift)
- Sponsor dashboard loading: skeleton analytics
- Sponsor dashboard empty: "No data yet — your campaign is being tracked"
- Error loading slot config: silent fail (slot disappears, no error shown to user)
