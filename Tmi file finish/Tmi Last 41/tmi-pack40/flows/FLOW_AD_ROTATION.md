# EVENT FLOW: AD ROTATION (Platform Law #7 — Always 200)
## From Empty Slot to Filled Ad — No Blank Slots Ever

```
PLATFORM LAW #7: GET /api/ads/slot/:zoneId ALWAYS returns 200.
Never return 204, 404, or empty. Always serve something.

THE 5-LEVEL HOUSE AD FALLBACK CHAIN:
Level 1: Active paid campaign creative for this zone
Level 2: Any active paid campaign that allows zone expansion
Level 3: House promotional content (crown winner spotlight)
Level 4: New artist discovery card (discovery-first principle)
Level 5: Platform brand card ("The Musician's Index — This Is Your Stage")

FLOW:

STEP 1 — PAGE LOADS (any page with ad zone)
  → SceneBackdrop or belt component mounts
  → GET /api/ads/slot/HOME1_HERO (or any PlacementZone)

STEP 2 — AD SLOT SERVICE EVALUATES
  → Query: SELECT placement WHERE zone = $zone AND isActive = true
             AND startsAt <= now() AND endsAt >= now()
             ORDER BY campaign.budgetCents DESC
  → Level 1: Found active campaign → return AdCreative { assetUrl, ctaUrl, type }
  → Level 2: No exact zone match → find campaign with zone expansion flag
  → Level 3: No paid campaign → return crown winner spotlight card
  → Level 4: No crown winner → return undiscovered artist (0 viewers, sorts first)
  → Level 5: Last resort → return TMI brand house ad
  → ALWAYS: HTTP 200 with { creative, zone, isHouseAd: boolean }

STEP 3 — FRONTEND RENDERS AD
  → AdRenderer component receives creative
  → Renders: banner | video | card | overlay | native
  → Never blank. Never error state visible to user.

STEP 4 — IMPRESSION TRACKING
  → IntersectionObserver detects ad is 50%+ visible for 1+ second
  → POST /api/ads/impressions { placementId, zoneId, userId? }
  → analytics.bot aggregates: impressions++
  → Campaign.impressions++

STEP 5 — CLICK TRACKING
  → Fan clicks ad → POST /api/ads/clicks { placementId }
  → Campaign.clicks++
  → CTR recalculated: clicks/impressions
  → ctr-optimizer.bot adjusts placement weights

STEP 6 — AD ROTATION (every N minutes by zone)
  → homepage-rotation.bot fires based on belt refresh schedule:
    Editorial belt: every 30min
    Activity belt: every 1min
    Analytics belt: every 15min
    Deals belt: never auto-rotate (manual)
  → /ads WebSocket namespace: emit ad_rotation event
  → Frontend: crossfade to new creative (no hard refresh)

STEP 7 — CAMPAIGN BUDGET EXHAUSTED
  → Transaction tracks campaign.spentCents
  → When spentCents >= budgetCents:
    campaign-expiration.bot: CampaignStatus → EXPIRED
    renewal.bot: sends renewal offer 7 days before
    house-ad-fallback.bot: immediately fills the zone (never blank)

STEP 8 — SPONSORED GAME/EVENT ADS
  → adSlotOnIntermission: true (Dirty Dozens between rounds)
  → broadcast.engine triggers commercial break
  → Full-screen ad overlay on game screen
  → 15-second countdown visible to players
  → Impression counted for sponsor + clicks tracked

STEP 9 — SPONSOR BOARD IN VR STADIUM
  → SponsorBoard.mediaUrl = AdCreative.assetUrl
  → Three.js texture maps campaign creative to 3D billboard
  → impressionsPerSecond: calculated from board visibility in 3D space
  → POST /api/ads/impressions called every 10 seconds per visible board

STEP 10 — HOME 4 ANALYTICS BELT
  → Sponsor/Advertiser logs into /advertise or /dashboard/advertiser
  → GET /api/analytics/campaigns/:id → real metrics
  → Shows: impressions, clicks, CTR, watch time, conversions, ROI
  → analytics.bot aggregates every 15min
  → Real-time updates via WebSocket if campaign active
```

**Platform Law #7 enforcement:** 5-level fallback, never blank, always 200
**Engines:** realtime (/ads namespace), economy (campaign budget), broadcast (game ad breaks)
**DB models:** Placement, Campaign, AdCreative, AnalyticsEvent
**Bots:** house-ad-fallback, ctr-optimizer, campaign-expiration, renewal, analytics
