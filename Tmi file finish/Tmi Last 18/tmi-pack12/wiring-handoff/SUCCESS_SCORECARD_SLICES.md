# SUCCESS_METRICS_MASTER.md
## What "Better" Actually Means — Measurable Goals

---

## DISCOVERY METRICS (Platform Purpose)

| Metric | Target | Great |
|---|---|---|
| % of artists with 0 viewers who get first room join | 30% weekly | 50%+ |
| Artist discovery-to-follow conversion | 15% | 25%+ |
| Lobby Wall position 1 click-through | 20% | 35%+ |
| Undiscovered artist earned first 10 followers | 5 artists/week | 10+/week |

## ENGAGEMENT METRICS

| Metric | Target | Great |
|---|---|---|
| Homepage average session time | 4 min | 8+ min |
| Article completion rate | 40% | 65%+ |
| Room join from lobby preview | 25% | 40%+ |
| Return visit within 7 days | 50% | 70%+ |
| Stream & Win daily active | 20% of users | 40%+ |

## ECONOMY METRICS

| Metric | Target | Great |
|---|---|---|
| Tip conversion rate (viewers who tip) | 5% | 12%+ |
| Subscription upgrade rate (Free → paid) | 8% first 30 days | 15%+ |
| Artist payout growth month-over-month | +10% | +25%+ |
| Sponsor CTR | 2% | 4%+ |

## PLATFORM HEALTH METRICS

| Metric | Target | Great |
|---|---|---|
| Homepage load time | < 2.5s | < 1.5s |
| API response time | < 200ms | < 100ms |
| Uptime | 99.5% | 99.9%+ |
| Error rate | < 0.5% | < 0.1% |
| Bot reliability | 99% run success | 99.9%+ |

---

# PLATFORM_HEALTH_AND_EVOLUTION_SCORECARD.md
## The Weekly Operating Report

---

## WHAT BIG ACE SEES EVERY MONDAY

```
┌──────────────────────────────────────────────────────────────────┐
│  TMI WEEKLY EVOLUTION SCORECARD — Week of [Date]                │
├──────────────────────────────────────────────────────────────────┤
│  PLATFORM HEALTH                                                  │
│  Uptime: 99.8%  |  Avg Load: 1.8s  |  Error Rate: 0.3%         │
│  Bot reliability this week: 98.4%                               │
├──────────────────────────────────────────────────────────────────┤
│  TOP WINS THIS WEEK                                               │
│  → Discovery: 42 artists got their first room join              │
│  → Article Feature: 68% completion (up from 54%)               │
│  → Sponsor: CTR 3.2% (up from 2.8%)                            │
├──────────────────────────────────────────────────────────────────┤
│  AREAS THAT DROPPED                                               │
│  → Stream & Win daily active: 18% (down from 22%)              │
│  → Lobby Wall position 3 CTR: 12% (down from 16%)              │
├──────────────────────────────────────────────────────────────────┤
│  EXPERIMENTS RUNNING                                              │
│  → Headline test A/B: 5% users, Day 4 of 7                     │
│  → Lobby row size test: 3% users, Day 1 of 14                  │
├──────────────────────────────────────────────────────────────────┤
│  BOT ACTIVITY                                                     │
│  → Crown Bot: ran Sunday, rotated #1 (new champion: [Artist])  │
│  → Discovery Bot: 2 sort updates this week                      │
│  → Guardian Bot: 14 mutes, 2 ghost timeouts                    │
├──────────────────────────────────────────────────────────────────┤
│  SUGGESTED ACTIONS                                                │
│  → Review Stream & Win drop (investigate cause)                 │
│  → Approve Experiment A if CTR holds through Day 7             │
│  → New comic insert needed for this Sunday                      │
└──────────────────────────────────────────────────────────────────┘
```

---

# WEEKLY_SELF_REVIEW_BOT_SPEC.md
## The Bot That Runs Every Sunday Night

---

## SCHEDULE: Sunday 23:00 (before Crown Bot at midnight)

## WHAT IT COLLECTS

1. All logging events from the week
2. Experiment status reports from all active tests
3. Bot run success/failure logs
4. Discovery conversion numbers
5. Content performance metrics
6. Sponsor performance data
7. Error and fallback event counts

## WHAT IT PRODUCES

```json
{
  "report_id": "weekly-2026-W12",
  "generated_at": "2026-03-22T23:00:00Z",
  "week_of": "2026-03-16",
  "top_wins": [...],
  "drops": [...],
  "bot_summary": {...},
  "experiment_status": [...],
  "suggested_actions": [...],
  "metrics_vs_targets": {...},
  "urgent_flags": []
}
```

## WHO SEES IT

- Big Ace: Full report → operator console
- Marcel: Summary section only
- Jay Paul: Top-line numbers only

---

# MONTHLY_EVOLUTION_REPORT_SPEC.md
## The Bot That Runs the 1st of Every Month

---

## SCHEDULE: 1st of month, 06:00

## WHAT IT ANALYZES

- 4-week rolling averages vs. previous month
- Feature flag performance
- What experiments became permanent
- What was rolled back and why
- Platform memory updates (new "best patterns" recorded)
- Artist success rate (who grew the most)
- Discovery wins (most undiscovered artists who got found)
- Crown history summary for the month

## WHAT IT RECOMMENDS

- 1-3 content changes for the coming month
- 1-2 experiment ideas (with rationale)
- What to keep from last month
- What to reconsider
- Anything urgent (declining metrics)

## WHAT HAPPENS NEXT

Big Ace reviews the report.
Approves or rejects the recommendations.
Algorithm adjusts within approved boundaries.
Marcel tracks the changes.
Jay Paul views summary.

---

# COPILOT_WIRING_SLICES.md
## The Safe Slice-by-Slice Wiring Order for Copilot

---

## THE GOLDEN RULE
One slice at a time. Prove each slice. Then move to the next.
No skipping. No simultaneous changes across multiple slices.

---

## SLICE 0 — FIX THE BUILD (MUST BE FIRST)
```
Fix @tmi/hud-runtime workspace resolution
Prove apps/web builds locally
Prove Cloudflare deploy is green
Smoke test: /, /register, /login → 200
Session persist after refresh
→ Only then proceed to Slice 1
```

---

## SLICE 1 — SHARED INFRASTRUCTURE
```
Wire shared header component
Wire page strip (1/2/3 navigation)
Wire corner peel interaction
Wire canvas card base (draggable, saves position)
Wire status footer HUD
Wire motion tokens (centralized constants)
→ Proof: all 3 pages load, cards drag, position saves
```

---

## SLICE 2 — HOMEPAGE 1 (COVER)
```
Wire CrownCard to crown API
Wire ArtistRingCard (×9) to rankings API
Wire ComicInsert to issue config
Wire homepage 1 belt layout
Wire page transition from 1 → 2
→ Proof: Homepage 1 proof gates pass
```

---

## SLICE 3 — HOMEPAGE 2 (LIVE WORLD)
```
Wire LobbyWall to live events API (discovery-first sort)
Wire PreviewLobbyCard (main)
Wire JoinRandomRoom
Wire CountdownCard
Wire UndiscoveredBoostCard
Wire CypherArenaGateway
Wire StreamAndWinCard
→ Proof: Homepage 2 proof gates pass
```

---

## SLICE 4 — HOMEPAGE 3 (EDITORIAL)
```
Wire ArticleFeatureCard
Wire NewsTicker
Wire GenreCluster
Wire TopTenCharts
Wire SponsorSpotlightCard + fallback
Wire StoreCard, BookingCard, AchievementsCard
→ Proof: Homepage 3 proof gates pass
```

---

## SLICE 5 — AUTH + ONBOARDING
```
Wire registration
Wire login
Wire session persistence
Wire role routing
Wire artist onboarding flow
Wire fan onboarding flow
→ Proof: Full onboarding proof gates (Pack 10) pass
```

---

## SLICE 6 — ECONOMY + POINTS
```
Wire points service
Wire stream & win accrual
Wire subscription billing (Stripe)
Wire payout service
Wire daily spin
→ Proof: Points update, subscription changes tier
```

---

## SLICE 7 — SOCIAL + DISCOVERY
```
Wire follow system
Wire search
Wire discovery feed
Wire fan clubs (basic)
Wire notifications
→ Proof: Follow records, search returns results
```

---

## SLICE 8 — LIVE ROOMS (BASIC)
```
Wire room entry (Free tier rooms first)
Wire seat assignment
Wire crowd animation (basic)
Wire tier upgrade sequence
→ Proof: Artist goes live, fan enters room
```

---

## SLICE 9 — SHOWS + GAMES (BASIC)
```
Wire Deal or Feud shell
Wire Game Night Hub
Wire scoreboard
Wire winner reveal
→ Proof: One episode runs end-to-end
```

---

## SLICE 10 — ADMIN + BOTS
```
Wire Big Ace admin panel
Wire Marcel analytics view
Wire Jay Paul view-only
Wire bot manifests (Crown Bot first)
Wire moderation queue
→ Proof: Role boundaries all pass
```

---

## FINAL SLICE — PROOF + LAUNCH
```
Run all proof gates (Pack 10 + Pack 12)
Run performance tests
Run mobile tests
Run onboarding dry run
Big Ace sign-off
Open to first members
```

---

*Success Metrics + Health Scorecard + Weekly Review + Monthly Report + Wiring Slices v1.0*
*BerntoutGlobal XXL / The Musician's Index*
