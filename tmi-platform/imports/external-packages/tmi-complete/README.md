# TMI Platform — Complete Build v2
## The Musician's Index Magazine — Full System Bundle

This bundle contains **42 total files** (17 new + 25 from previous build):
- **9 canonical engine modules** (single source of truth)
- **6 new UI components** (HUD, sponsor, analytics, live, magazine)
- **1 Prisma schema addition file**
- **1 PLACEMENT.md**

---

## NEW IN THIS BUILD (17 Files)

### Canonical Engines (`packages/engines/src/`)

| Engine | File | Purpose |
|---|---|---|
| **TierEngine** | `TierEngine.ts` | All tier rules: ad frequency, points caps, loadout limits, sponsor exposure |
| **PointsEngine** | `PointsEngine.ts` | Points math, earn/spend, daily caps, inflation monitoring |
| **RevenueEngine** | `RevenueEngine.ts` | Atomic revenue splits, payout calculations, sponsor ROI |
| **AdEngine** | `AdEngine.ts` | Ad placement, frequency caps, session tracking, blackout events |
| **SponsorEngine** | `SponsorEngine.ts` | Contracts, placement priority, fulfillment workflow, prize shipping |
| **EventOrchestrator** | `EventOrchestrator.ts` | Weekly schedule, deadlines, performer queues, winner determination |
| **InventoryEngine** | `InventoryEngine.ts` | Emotes, icons, cosmetics, loadouts, season passes, rarity |
| **VotingAntiFraudEngine** | `VotingAntiFraudEngine.ts` | Vote validation, anomaly detection, fair game-show randomness |
| **InterviewArticlePipeline** | `InterviewArticlePipeline.ts` | Bot interviews → moderation → article → magazine insertion |
| **index.ts** | `index.ts` | Barrel export for all engines |

### New UI Components

| Component | File | Purpose |
|---|---|---|
| **PlayWidget** | `hud/PlayWidget.tsx` | Live emote/icon slots, tier-limited loadout, floating reactions |
| **AuctionWidget** | `hud/AuctionWidget.tsx` | Beat auction HUD — live bids, countdown, bid history |
| **SponsorTile** | `sponsor/SponsorTile.tsx` | 5 variants: profile rail, event banner, magazine insert, contest prize, bumper |
| **AnalyticsMiniPanel** | `analytics/AnalyticsMiniPanel.tsx` | Artist/fan analytics — sparklines, stats, battle records |
| **DealVsFeud1000** | `live/DealVsFeud1000.tsx` | Game show doors — knock/rattle/open animations, crowd shout window |
| **MagazineLayout** | `magazine/MagazineLayout.tsx` | Horizontal page-turn nav, swipe, keyboard, insertion algorithm |

---

## QUICK USAGE

### Engine Usage

```typescript
import {
  getTierFromPoints,
  calculateEarnings,
  calculateSplit,
  shouldShowAd,
  selectPlacement,
  getSortedWeeklySchedule,
  validateLoadout,
  validateVote,
  detectAnomalies,
  interviewToArticle,
} from '@tmi/engines';

// Determine user tier
const tier = getTierFromPoints(2500);  // → 'SILVER'

// Calculate points earned for watching
const earned = calculateEarnings('WATCH_LIVE', tier, 10);  // 10 minutes

// Calculate revenue split for a tip
const entries = calculateSplit(
  1000,  // $10.00 in cents
  DEFAULT_SPLITS.TIP,
  'artist_123',
);

// Should this user see a pre-roll ad?
const decision = shouldShowAd(session, 'PRE_ROLL', 'LIVE_EVENT');

// Get next week's events sorted by countdown
const schedule = getSortedWeeklySchedule();
```

### Component Usage

```tsx
import { PlayWidget } from '@/components/hud/PlayWidget';
import { AuctionWidget } from '@/components/hud/AuctionWidget';
import { SponsorTile } from '@/components/sponsor/SponsorTile';
import { AnalyticsMiniPanel } from '@/components/analytics/AnalyticsMiniPanel';
import { DealVsFeud1000 } from '@/components/live/DealVsFeud1000';
import { MagazineLayout } from '@/components/magazine/MagazineLayout';

// Live play widget
<PlayWidget
  tier="GOLD"
  equippedEmotes={userEmotes}
  equippedIcons={userIcons}
  onEmoteSend={(emote) => socket.emit('emote', emote)}
  isLive={true}
/>

// Beat auction
<AuctionWidget
  lot={currentLot}
  currentUserId={userId}
  userPointsBalance={userBalance}
  bidHistory={bids}
  onBid={(lotId, amount) => placeBid(lotId, amount)}
/>

// Sponsor profile rail
<SponsorTile
  sponsorName="BeatGear Pro"
  tagline="Pro beats for every artist"
  variant="PROFILE_RAIL"
  onImpression={() => trackImpression(sponsorId)}
  onClickThrough={() => trackClick(sponsorId)}
/>

// Artist analytics
<AnalyticsMiniPanel
  variant="ARTIST_OVERVIEW"
  artistData={artistStats}
/>

// Game show
<DealVsFeud1000
  gameState={gameState}
  currentUserId={userId}
  currentUserName={userName}
  isContestant={isContestant}
  onDoorSelect={(doorId) => socket.emit('select_door', doorId)}
  onCrowdShout={(text) => socket.emit('crowd_shout', text)}
/>

// Magazine
<MagazineLayout
  pages={magazinePages}
  onPageChange={(page) => trackPageView(page.id)}
/>
```

---

## WEEKLY EVENT SCHEDULE

| Day | Time (UTC) | Event | Duration |
|---|---|---|---|
| Sunday | 15:00 | 💃 Dance Battle Sunday | 90 min |
| Sunday | 17:00 | 🎹 Beat Battle Sunday | 90 min |
| Sunday | 19:00 | 🎤 Open Shine Cypher | 60 min |
| Sunday | 21:00 | 🌍 Global Cypher Sunday | 120 min |
| Tuesday | 18:00 | 💰 Beat Auction Open | 24 hours |
| Wednesday | 19:00 | 🎙️ Global Karaoke Night | 120 min |
| Friday | 20:00 | 😂 Global Comedy Night | 120 min |
| Saturday | 17:00 | 🎮 Sound Squares | 90 min |
| Saturday | 20:00 | ⚡ Off the Cuff | 90 min |
| Saturday | 22:00 | 🌐 World Dance Party | 180 min |

---

## SINGLE SOURCE OF TRUTH ENFORCEMENT

These rules are enforced by engines — NO component should duplicate them:

| Rule | Canonical Location |
|---|---|
| Tier ad frequency | `TierEngine.TIER_AD_CONFIG` |
| Points earn caps | `TierEngine.TIER_POINTS_CONFIG` |
| Revenue splits | `RevenueEngine.DEFAULT_SPLITS` |
| Ad blackout events | `AdEngine.AD_BLACKOUT_EVENTS` |
| Vote cooldowns | `VotingAntiFraudEngine.VOTING_CONFIGS` |
| Loadout slot limits | `TierEngine.TIER_LOADOUT_CONFIG` |
| Sponsor placement priority | `SponsorEngine.selectPlacement()` |
| Emote rarity glows | `InventoryEngine.RARITY_CONFIG` |

---

## WHAT WAS FIXED IN THIS BUILD

1. ✅ **No duplicate systems** — 9 engines are single-file, single-source-of-truth
2. ✅ **UI separated from logic** — Components call engines; no business logic inside TSX
3. ✅ **Ad blackout enforced** — `AdEngine.shouldShowAd()` blocks ads during VOTING_ACTIVE, BATTLE_ACTIVE, DOOR_REVEAL, WINNER_ANNOUNCEMENT
4. ✅ **Fraud detection complete** — 7 anomaly types, automatic weight adjustment, provably fair game show reveals
5. ✅ **Magazine insertion algorithm** — Weighted sponsor card placement honoring contracts
6. ✅ **Complete fulfillment chain** — Sponsor → placement → winner → claim → address → sponsor packet → shipping → tracking → delivered
7. ✅ **Revenue split atomic** — `RevenueEngine.calculateSplit()` produces exact ledger entries, no rounding loss
8. ✅ **Loadout validation** — `InventoryEngine.validateLoadout()` enforces tier limits
9. ✅ **Interview pipeline complete** — Questions → answers → moderation → article → magazine insertion
10. ✅ **Points inflation monitoring** — `PointsEngine.inflationRisk()` score 0–100

---

See `PLACEMENT.md` for exact VS Code file locations and integration steps.
