# MASTER_MONETIZATION_SYSTEM.md
## Platform-Wide Advertising and Sponsorship — Complete Architecture
### BerntoutGlobal XXL / The Musician's Index

---

## MONETIZATION PHILOSOPHY

```
Rule 1: Advertisers buy VOLUME (many cheap slots)
Rule 2: Sponsors buy PRESTIGE (few expensive ownership placements)
Rule 3: Platform fills unused inventory with HOUSE ADS (own promotions)
Rule 4: Never let the platform feel like a spam wall
Rule 5: Editorial content always appears before first ad
Rule 6: Keep pricing affordable so advertisers buy MORE slots, not fewer
```

---

## ADVERTISER PRICING TIERS

```
Starter Advertiser:    $9.99/week   → 1 slot, 1 surface, standard creative
Basic Advertiser:      $24.99/week  → 3 slots, 2 surfaces, standard creative
Standard Advertiser:   $49.99/week  → 8 slots, 4 surfaces, image + text
Premium Advertiser:    $99.99/week  → 20 slots, all surfaces, video allowed
Takeover Advertiser:   $249.99/week → Full belt/section ownership
```

Note: Weekly pricing drives repeat purchases. Users buy again every week.

```
Category Bundles (higher value):
  Music News Network:     $79.99/week  → all article ad slots for 1 category
  Game Night Sponsor:     $149.99/week → full game session sponsorship
  Cypher Arena Sponsor:   $199.99/week → cypher room brand ownership
  Contest Sponsor:        $499+/week   → title sponsor of a competition
  Season Sponsor:         $999+/season → season title ownership
```

---

## GLOBAL SLOT REGISTRY

### Homepage Slots

| Slot ID | Belt | Type | Weekly Price |
|---|---|---|---|
| HOME_EDITORIAL_SPONSOR_STRIP | BELT_EDITORIAL | Sponsor strip | $199.99 |
| HOME_EDITORIAL_INLINE_1 | BELT_EDITORIAL | Inline card | $49.99 |
| HOME_DISCOVERY_GENRE_SPONSOR | BELT_DISCOVERY | Genre hex branded | $79.99 |
| HOME_DISCOVERY_CHART_SPONSOR | BELT_DISCOVERY | Chart label | $49.99 |
| HOME_MARKETPLACE_PRIMARY | BELT_MARKETPLACE | Large sponsor card | $249.99 |
| HOME_MARKETPLACE_POWERED_BY | BELT_MARKETPLACE | "Powered by" | $149.99 |
| HOME_TRENDS_COUNTDOWN_SPONSOR | BELT_TRENDS | Countdown wrapper | $99.99 |
| HOME_TRENDS_EVENT_SPONSOR | BELT_TRENDS | Event calendar | $49.99 |
| HOME_ADV_HERO_STRIP | BELT_ADVERTISER | Full-width banner | $99.99 |
| HOME_ADV_TILE_1 | BELT_ADVERTISER | Large tile | $49.99 |
| HOME_ADV_TILE_2 | BELT_ADVERTISER | Medium tile | $29.99 |
| HOME_ADV_TILE_3 | BELT_ADVERTISER | Medium tile | $29.99 |
| HOME_ADV_LOCAL | BELT_ADVERTISER | Geo-targeted | $19.99 |

### Article Page Slots

| Slot ID | Placement | Type | Weekly Price |
|---|---|---|---|
| ART_HEADER_SPONSOR | Article header | Sponsor strip | $39.99 |
| ART_INLINE_1 | After 2nd paragraph | Inline card | $24.99 |
| ART_INLINE_2 | After 5th paragraph | Inline card | $24.99 |
| ART_VIDEO_BREAK | Mid-article | Video ad | $49.99 |
| ART_SIDEBAR_TOP | Right sidebar | Sidebar | $29.99 |
| ART_SIDEBAR_MID | Right sidebar | Sidebar | $19.99 |
| ART_RELATED_SPONSORED | Related articles | Sponsored card | $19.99 |
| ART_ENDCAP_CTA | End of article | CTA card | $34.99 |
| ART_STICKY_MOBILE | Mobile bottom sticky | Sticky | $14.99 |
| ART_PRESENTED_BY | Article header | "Presented by" | $149.99 |

### Show/Live Event Slots

| Slot ID | Placement | Type | Weekly Price |
|---|---|---|---|
| SHOW_PRE_SPLASH | Pre-show splash | Full screen (3s) | $79.99 |
| SHOW_COUNTDOWN | Countdown sponsor | Branded countdown | $49.99 |
| SHOW_LOWER_THIRD | Live show | Lower-third overlay | $99.99 |
| SHOW_MID_BREAK | Mid-show break | Break screen ad | $59.99 |
| SHOW_SIDE_PANEL | Live show | Side panel brand | $49.99 |
| SHOW_TIP_MATCH | Tip button area | Tip match sponsor | $149.99 |
| SHOW_END_CTA | Post-show | End screen CTA | $39.99 |
| SHOW_REPLAY_SPONSOR | Replay page | Replay wrapper | $29.99 |

### Contest/Competition Slots

| Slot ID | Placement | Type | Price |
|---|---|---|---|
| CONTEST_TITLE | Contest header | Title sponsor | $499.99 |
| CONTEST_BRACKET | Bracket view | Bracket sponsor | $249.99 |
| CONTEST_VOTING | Voting page | Voting sponsor | $149.99 |
| CONTEST_PRIZE | Prize section | Prize sponsor | $199.99 |
| CONTEST_WINNER_REVEAL | Winner reveal | Reveal sponsor | $299.99 |
| CONTEST_CONTESTANT_TILE | Contestant cards | Tile ad | $49.99 |

### Game Slots

| Slot ID | Game | Placement | Weekly Price |
|---|---|---|---|
| GAME_LOBBY | All games | Lobby sponsor | $79.99 |
| GAME_ROUND_SPONSOR | All games | Round header | $49.99 |
| GAME_TIMER_SPONSOR | All games | Timer area | $39.99 |
| GAME_BRANDED_QUESTION | Trivia | Branded Q card | $29.99 |
| GAME_REWARD_SPONSOR | All games | Reward unlock | $59.99 |
| GAME_INTERMISSION | All games | Intermission screen | $49.99 |
| GAME_END_SCREEN | All games | End screen CTA | $39.99 |
| GAME_SEASONAL_SKIN | All games | Full skin takeover | $299.99/season |

### Room Slots

| Slot ID | Room Type | Placement | Weekly Price |
|---|---|---|---|
| ROOM_CYPHER_PANEL | Cypher | Side panel | $79.99 |
| ROOM_WATCHPARTY_STICKY | Watch Party | Sticky overlay | $49.99 |
| ROOM_AUDIENCE_PROMO | Audience Room | Promo banner | $39.99 |
| ROOM_VIP_SPONSOR | VIP Room | Room sponsor | $149.99 |
| ROOM_VENUE_BRANDED | Venue Room | Venue sponsor | $99.99 |

---

## ADVERTISER SELF-SERVE FLOW

```
1. Visit /advertise → see packages overview
2. Choose surface (homepage, articles, shows, games, etc.)
3. Select package tier
4. Pick specific slots from slot map
5. Upload creative (image: 1200x628, video: 30s max)
6. Set targeting (genre, geo, age group, device)
7. Set dates (campaign start/end)
8. Review pricing summary
9. Checkout (Stripe)
10. Creative goes to approval queue (24h max)
11. On approval: campaign goes live
12. Real-time analytics at /dashboard/advertiser
```

---

## WIDGET + OVERLAY RENDERING SYSTEM

Every ad slot renders via the AdRenderer component:

```typescript
// apps/web/src/components/monetization/AdRenderer.tsx
interface AdRendererProps {
  slotId: string;
  surfaceType: 'homepage' | 'article' | 'game' | 'show' | 'contest' | 'room';
  size: 'hero' | 'tile' | 'strip' | 'sidebar' | 'overlay' | 'lower-third' | 'sticky';
  targetingContext?: { genre?: string; geo?: string; userId?: string }
}

// Renders: paid ad → sponsor → house ad → nothing (clean collapse)
// Never shows broken/empty ad container
// All ads labeled with small "Ad" or "Sponsored" disclosure
```

---

## BRAND SAFETY RULES

```
Blocked categories (no ads allowed):
  - Gambling/betting (unless jurisdiction allows + proper licensing)
  - Tobacco/vaping
  - Adult content (any)
  - Payday loans/predatory financial
  - Fake news/misinformation
  - MLM/pyramid schemes
  - Competitor streaming platforms

Kid-safe surfaces (restricted):
  - Kid profile pages
  - Kid-mode rooms
  - Family account pages
  - Only: educational products, music instruments, family apps

Competitor conflict rules:
  - No two competing brands in same surface in same viewport
  - Music streaming services cannot appear adjacent to each other
  - Competitor booking platforms cannot appear in booking sections

Emergency takedown:
  - Big Ace can pause any campaign instantly via /admin/campaigns
  - 60-second propagation via feature flag system
```

---

## HOUSE AD FALLBACK CHAIN

When paid inventory is empty, fill with (in priority order):
```
1. TMI Premium subscription upsell
2. Artist booking portal promotion
3. Beat marketplace featured drop
4. Upcoming cypher/event promo
5. Fan credit bundle promo
6. Merch store featured item
7. App download / PWA install CTA
8. "Advertise here" placeholder (branded, not empty)
```
