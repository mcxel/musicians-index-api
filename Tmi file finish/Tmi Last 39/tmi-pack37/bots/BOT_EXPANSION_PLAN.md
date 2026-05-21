# TMI BOT EXPANSION PLAN (Pack 37)
## Every Bot Family, Purpose, File, and Escalation Path

---

## BOT FAMILIES (Total: 55 bots across 12 families)

### 1. EDITORIAL BOTS (6 bots)
```
bots/editorial/
  cover-generator.bot.ts      — weekly Sunday cover refresh
  editorial-assembly.bot.ts   — editorial belt composition every 30min
  homepage-rotation.bot.ts    — all belt refresh every 15min
  featured-story.bot.ts       — hourly magazine front
  article-freshness.bot.ts    — daily freshness check
  headline-ticker.bot.ts      — 5min news ticker
```
Input: Prisma (articles, artists, issues)
Output: homepage-config.json updates
Permissions: READ articles, WRITE homepage_config
Escalation: admin@tmi when article pool < 5

### 2. MONETIZATION BOTS (13 bots)
```
bots/monetization/
  house-ad-fallback.bot.ts    — fills empty ad slots instantly (Platform Law #7)
  ad-placement.bot.ts         — places new campaigns to slots
  ad-rotation.bot.ts          — rotates active creatives
  sponsor-matching.bot.ts     — local biz → local artist matching
  campaign-expiration.bot.ts  — handles expiring campaigns
  renewal.bot.ts              — renewal offers 7d before end
  prospect-scout.bot.ts       — discovers prospective local sponsors
  outreach.bot.ts             — sends approved outreach templates
  proposal.bot.ts             — generates deal proposals
  brand-safety.bot.ts         — checks new ad creatives
  ctr-optimizer.bot.ts        — adjusts placement weights by CTR
  billing-integrity.bot.ts    — verifies Diamond users every 4h
  fraud-sentinel.bot.ts       — monitors suspicious transactions
```
Input: campaigns, placements, sponsors, advertisers tables
Output: placement assignments, outreach emails, fraud flags
Permissions: READ/WRITE campaigns; READ users; WRITE fraud_flags
Big Ace gate: ANY deal > $99.99/week | any exclusivity | any payout
Escalation: Never auto-release payout. Always flag to Big Ace.

### 3. DISCOVERY BOTS (4 bots)
```
bots/discovery/
  trending.bot.ts             — trending artists/articles every 10min
  recommendation.bot.ts       — personalized recommendations
  clip-highlight.bot.ts       — auto-clips best moments from replays
  search-index.bot.ts         — keeps search index fresh
```

### 4. COMPETITION BOTS (4 bots)
```
bots/competition/
  contest-ops.bot.ts          — manages active contest state
  leaderboard.bot.ts          — refreshes all leaderboards
  ranking.bot.ts              — weekly crown/season ranking
  crown.bot.ts                — crown assignment + animation trigger
```
Crown rules: weekly, decays after 1 week, every winner → hall of fame

### 5. PLATFORM OPS BOTS (9 bots)
```
bots/platform/
  notification.bot.ts         — processes notification queue
  timeline.bot.ts             — user activity timeline updates
  analytics.bot.ts            — aggregates analytics events
  payout.bot.ts               — prepares payout reports (Big Ace reviews)
  billing-integrity.bot.ts    — Diamond verification every 4h
  owner-finance.bot.ts        — weekly P&L for Big Ace
  media-qc.bot.ts             — validates uploaded media
  station-activity.bot.ts     — artist station freshness
  backup.bot.ts               — daily backup trigger
  health-monitor.bot.ts       — system health every 5min
```

### 6. MODERATION BOTS (5 bots)
```
bots/moderation/
  moderation.bot.ts           — auto-review flagged content
  guardian.bot.ts             — live room behavior monitor
  spam-filter.bot.ts          — chat spam detection
  upload-scanner.bot.ts       — media content moderation
  age-gate.bot.ts             — COPPA-safe chat (kids talk to kids only)
```
Kids rule: canSendMessage() blocks adult↔unlinked-child at middleware level
Upload scanning: must happen before CDN delivery, not after

### 7. ACQUISITION BOTS (8 bots)
```
bots/acquisition/
  venue-scout.bot.ts          — discovers venues in artist cities
  venue-outreach.bot.ts       — sends venue signup invitations
  booking-ops.bot.ts          — matches artists to venue openings
  onboarding.bot.ts           — guides new users through onboarding
  artist-onboarding.bot.ts    — artist profile completion checklist
  fan-onboarding.bot.ts       — fan interest capture
  support-triage.bot.ts       — auto-routes support tickets
  referral.bot.ts             — tracks and rewards referrals
```

### 8. ECONOMY BOTS (6 bots)
```
bots/economy/
  item-generator.bot.ts       — creates items from platform triggers
  daily-drop.bot.ts           — refreshes daily shop rotation
  seasonal-catalog.bot.ts     — seasonal collection management
  reward-allocation.bot.ts    — grants rewards after events
  economy-health.bot.ts       — monitors inflation/deflation
  points-cap-enforcer.bot.ts  — enforces daily/weekly point caps
```

### 9. BROADCAST BOTS (4 bots)
```
bots/broadcast/
  broadcaster-script.bot.ts   — generates show commentary
  lower-thirds.bot.ts         — creates show graphics
  commercial-break.bot.ts     — manages ad break timing
  fail-safe.bot.ts            — emergency broadcast fallback
```

### 10. ARCHIVE BOTS (3 bots)
```
bots/archive/
  archivist.bot.ts            — weekly snapshot of platform state
  issue-packager.bot.ts       — assembles weekly magazine issue
  replay-packager.bot.ts      — processes replay files
```

### 11. ANALYTICS BOTS (2 bots)
```
bots/analytics/
  analytics-aggregator.bot.ts — hourly aggregation of raw events
  report-generator.bot.ts     — weekly/monthly reports for admins
```

### 12. RELEASE/QA BOTS (3 bots)
```
bots/release/
  compat-qa.bot.ts            — cross-device compatibility checks
  smoke-test.bot.ts           — runs smoke tests after deploy
  rollback-sentinel.bot.ts    — triggers rollback if error rate spikes
```

---

## BOT BASE CLASS (shared structure)
```typescript
// apps/api/src/bots/bot-base.ts
export abstract class BotBase {
  abstract botId: string;
  abstract schedule: string; // cron expression
  abstract run(): Promise<void>;
  
  // All bots must implement:
  async executeWithSafety(): Promise<void> {
    // Never auto-payout without Big Ace approval
    // Never modify locked files
    // Log start/end/error to BotLog table
    // Respect daily run limits
    // Respect BOT_SAFETY_RULES from bot-orchestrator.ts
  }
}
```

---

## IMPORTANT BOT SAFETY RULES (Never Override)
- `maxAutoApproveWeeklyCents: 9999` — $99.99 max without Big Ace
- `payoutNeedsBigAce: true` — never auto-release
- `ownerFinanceNeedsBigAce: true` — never auto-distribute profit
- `zeroViewersAlwaysPositionOne: true` — discovery law
- `diamondUsersNeverBilled: true` — Marcel + BJ M Beat's permanent
- `kidsCannotSeeAdContent: true` — COPPA compliance
- `exclusivityNeedsBigAce: true` — always escalate exclusivity deals
