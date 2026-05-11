# Visual Slots Requiring Authority Enforcement

**Generated:** 2026-05-11T15:04:40.990Z
**Total Slots:** 18

## MAGAZINE
**Count:** 2 slots

### MagazineLayout.tsx
- **Component:** `PageRenderer`
- **File:** `src/components/tmi/magazine/MagazineLayout.tsx`
- **Description:** Magazine cover, article hero images, sponsor inserts
- **Priority:** P0
- **Authority Domain:** `image-generation-control`
- **Wrapper Function:** `resolveMagazineSlotWithAuthority()`

### MagazineCover.tsx
- **Component:** `MagazineCover`
- **File:** `src/components/MagazineCover.tsx`
- **Description:** Magazine issue cover tiles with publication metadata
- **Priority:** P0
- **Authority Domain:** `image-generation-control`
- **Wrapper Function:** `resolveMagazineSlotWithAuthority()`

## SPONSOR
**Count:** 3 slots

### SponsorTile.tsx
- **Component:** `SponsorTile`
- **File:** `src/components/sponsor/SponsorTile.tsx`
- **Description:** Sponsor logo, badge, billboard rendering
- **Priority:** P0
- **Authority Domain:** `image-generation-control`
- **Wrapper Function:** `resolveMagazineSlotWithAuthority()`

### SponsorBoard.jsx
- **Component:** `SponsorBoard`
- **File:** `src/components/tmi/sponsor/SponsorBoard.jsx`
- **Description:** Sponsor tier layout with crown zone, patches, strips
- **Priority:** P0
- **Authority Domain:** `image-generation-control`
- **Wrapper Function:** `resolveMagazineSlotWithAuthority()`

### SponsorBelt.tsx
- **Component:** `SponsorBelt`
- **File:** `src/components/home/belts/SponsorBelt.tsx`
- **Description:** Homepage sponsor carousel, billboard grid
- **Priority:** P0
- **Authority Domain:** `image-generation-control`
- **Wrapper Function:** `resolveMagazineSlotWithAuthority()`

## HOMEPAGE
**Count:** 3 slots

### HomepageCanvas.tsx
- **Component:** `HomepageCanvas`
- **File:** `src/components/home/HomepageCanvas.tsx`
- **Description:** Magazine carousel, featured artist, trending, live shows, top 10
- **Priority:** P0
- **Authority Domain:** `image-generation-control`
- **Wrapper Function:** `hydrateImageWithAuthority()`

### FeaturedArtist.tsx
- **Component:** `FeaturedArtist`
- **File:** `src/components/home/belts/FeaturedArtist.tsx`
- **Description:** Featured artist hero image, backdrop, metadata
- **Priority:** P0
- **Authority Domain:** `image-generation-control`
- **Wrapper Function:** `hydrateImageWithAuthority()`

### NewReleases.tsx
- **Component:** `NewReleases`
- **File:** `src/components/home/belts/NewReleases.tsx`
- **Description:** Album art tiles, release cover grid
- **Priority:** P1
- **Authority Domain:** `image-generation-control`
- **Wrapper Function:** `hydrateImageWithAuthority()`

## VENUE
**Count:** 2 slots

### DigitalVenueTwinShell.tsx
- **Component:** `DigitalVenueTwinShell`
- **File:** `src/components/venue/DigitalVenueTwinShell.tsx`
- **Description:** Venue 3D reconstruction, environment theme rendering
- **Priority:** P0
- **Authority Domain:** `visual-hydration-control`
- **Wrapper Function:** `reconstructVenueWithAuthority()`

### VenueCard.tsx
- **Component:** `VenueCard`
- **File:** `src/components/venue/VenueCard.tsx`
- **Description:** Venue thumbnail, stage preview, seating visualization
- **Priority:** P1
- **Authority Domain:** `visual-hydration-control`
- **Wrapper Function:** `reconstructVenueWithAuthority()`

## PORTRAIT
**Count:** 2 slots

### PerformerCard
- **Component:** `PerformerHUD`
- **File:** `src/components/performer/PerformerCard.tsx`
- **Description:** Live performer portrait, motion portrait, avatar animation
- **Priority:** P0
- **Authority Domain:** `motion-portrait-authority`
- **Wrapper Function:** `resolvePerformerPortraitWithAuthority()`

### ArtistProfile
- **Component:** `ArtistHeader`
- **File:** `src/components/artist/ArtistProfile.tsx`
- **Description:** Artist profile hero, background, avatar display
- **Priority:** P0
- **Authority Domain:** `motion-portrait-authority`
- **Wrapper Function:** `resolvePerformerPortraitWithAuthority()`

## ARTICLE
**Count:** 2 slots

### ArticlesHub.jsx
- **Component:** `ArticlesHub`
- **File:** `src/components/tmi/articles/ArticlesHub.jsx`
- **Description:** Article card mosaic, hero images, thumbnail grid
- **Priority:** P1
- **Authority Domain:** `image-generation-control`
- **Wrapper Function:** `hydrateImageWithAuthority()`

### NewsStrip.tsx
- **Component:** `NewsStrip`
- **File:** `src/components/home/NewsStrip.tsx`
- **Description:** News ticker images, article preview carousel
- **Priority:** P1
- **Authority Domain:** `image-generation-control`
- **Wrapper Function:** `hydrateImageWithAuthority()`

## TICKET
**Count:** 2 slots

### TicketDisplay.tsx
- **Component:** `TicketDisplay`
- **File:** `src/components/tickets/TicketDisplay.tsx`
- **Description:** Ticket preview, barcode, seat visualization
- **Priority:** P1
- **Authority Domain:** `visual-hydration-control`
- **Wrapper Function:** `hydrateImageWithAuthority()`

### NFTTicketPreview.tsx
- **Component:** `NFTTicketPreview`
- **File:** `src/components/nft/NFTTicketPreview.tsx`
- **Description:** NFT ticket visual, blockchain token art, rarity display
- **Priority:** P1
- **Authority Domain:** `visual-hydration-control`
- **Wrapper Function:** `hydrateImageWithAuthority()`

## GAME
**Count:** 1 slots

### DealOrFeud.jsx
- **Component:** `DealOrFeud`
- **File:** `src/components/tmi/shared/DealOrFeud.jsx`
- **Description:** Game stage visuals, deal zone, feud board, audience wall
- **Priority:** P1
- **Authority Domain:** `visual-hydration-control`
- **Wrapper Function:** `hydrateImageWithAuthority()`

## FAN_DASHBOARD
**Count:** 1 slots

### FanDashboard.tsx
- **Component:** `FanDashboard`
- **File:** `src/components/fan/FanDashboard.tsx`
- **Description:** Fan profile avatar, ticket collection, reward badges
- **Priority:** P1
- **Authority Domain:** `image-generation-control`
- **Wrapper Function:** `hydrateImageWithAuthority()`

## Authority Mapping

| Category | Domain | Wrapper Function |
|----------|--------|------------------|
| ARTICLE | `image-generation-control` | `hydrateImageWithAuthority()` |
| FAN_DASHBOARD | `image-generation-control` | `hydrateImageWithAuthority()` |
| GAME | `visual-hydration-control` | `hydrateImageWithAuthority()` |
| HOMEPAGE | `image-generation-control` | `hydrateImageWithAuthority()` |
| MAGAZINE | `image-generation-control` | `resolveMagazineSlotWithAuthority()` |
| PORTRAIT | `motion-portrait-authority` | `resolvePerformerPortraitWithAuthority()` |
| SPONSOR | `image-generation-control` | `resolveMagazineSlotWithAuthority()` |
| TICKET | `visual-hydration-control` | `hydrateImageWithAuthority()` |
| VENUE | `visual-hydration-control` | `reconstructVenueWithAuthority()` |

## Enforcement Checklist

- [ ] Wrap `FeaturedArtist` in `hydrateImageWithAuthority()`
- [ ] Wrap `HomepageCanvas` in `hydrateImageWithAuthority()`
- [ ] Wrap `DigitalVenueTwinShell` in `reconstructVenueWithAuthority()`
- [ ] Wrap `SponsorBelt` in `resolveMagazineSlotWithAuthority()`
- [ ] Wrap `SponsorBoard` in `resolveMagazineSlotWithAuthority()`
- [ ] Wrap `SponsorTile` in `resolveMagazineSlotWithAuthority()`
- [ ] Wrap `ArtistHeader` in `resolvePerformerPortraitWithAuthority()`
- [ ] Wrap `PerformerHUD` in `resolvePerformerPortraitWithAuthority()`
- [ ] Wrap `MagazineCover` in `resolveMagazineSlotWithAuthority()`
- [ ] Wrap `PageRenderer` in `resolveMagazineSlotWithAuthority()`
- [ ] Wrap `VenueCard` in `reconstructVenueWithAuthority()`
- [ ] Wrap `TicketDisplay` in `hydrateImageWithAuthority()`
- [ ] Wrap `NFTTicketPreview` in `hydrateImageWithAuthority()`
- [ ] Wrap `ArticlesHub` in `hydrateImageWithAuthority()`
- [ ] Wrap `NewsStrip` in `hydrateImageWithAuthority()`
- [ ] Wrap `DealOrFeud` in `hydrateImageWithAuthority()`
- [ ] Wrap `NewReleases` in `hydrateImageWithAuthority()`
- [ ] Wrap `FanDashboard` in `hydrateImageWithAuthority()`
