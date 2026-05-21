# PACK29_ACCEPTANCE_TEST_MATRIX.md
## What "Done" Means — Proof Gate for Every System
### BerntoutGlobal XXL / The Musician's Index

Every row = one proof gate. Copilot marks ✅ after each passes.

---

## DESIGN SYSTEM PROOFS

```
[ ] TMI homepage loads with deep purple background (#0D0520)
[ ] Belt headers show gold Bebas Neue labels
[ ] Lightning bolt decorations visible on page load
[ ] LIVE badge pulses red on artist tiles
[ ] Genre hexagons render in honeycomb grid
[ ] Artist card cyan border glows on hover
[ ] Crown badge pulses gold animation
[ ] Countdown timer animates (numbers count down in real-time)
[ ] Mobile bottom nav shows 5 tabs correctly
[ ] No white backgrounds visible anywhere on homepage
[ ] Fonts: Bebas Neue loads for headers, Oswald for labels, Inter for body
```

---

## HOMEPAGE BELT PROOFS

```
[ ] All 8 belts render vertically in correct order
[ ] Cover belt shows 9-artist grid with rank numbers
[ ] Live World belt shows lobby wall (viewers_asc sort)
[ ] Editorial belt shows article feature + news ticker + interview + recap
[ ] Discovery belt shows genre hexagons + top 10 + weekly playlists
[ ] Marketplace belt shows merch + booking + achievements + sponsor
[ ] Trends belt shows countdown timer + event calendar + undiscovered + gateway
[ ] Advertiser belt shows paid ads + house ad fallback (never empty container)
[ ] Party Teaser belt shows public parties or friend activity
[ ] pnpm test:discovery PASSES (lobby wall viewers_asc confirmed)
```

---

## AD SYSTEM PROOFS

```
[ ] GET /api/ads/slot/HOME_ADV_TILE_1 returns 200 always (never 404 or 500)
[ ] AdRenderer component renders paid ad when campaign exists
[ ] AdRenderer renders house ad when inventory is empty
[ ] House ad never shows empty container
[ ] Ad disclosure label ("Ad" or "Sponsored") visible on all paid placements
[ ] Article page renders ART_INLINE_1 slot after paragraph 2
[ ] Game intermission screen shows GAME_INTERMISSION ad slot (3s max)
[ ] Brand safety bot blocks BLOCKED_CATEGORY creative from rendering
[ ] Two competitor ads never appear adjacent in same viewport
[ ] Campaign analytics record impression after AdRenderer fires
```

---

## ADVERTISER SELF-SERVE PROOFS

```
[ ] POST /api/advertiser/register creates Advertiser record + redirects to dashboard
[ ] POST /api/advertiser/campaigns with valid Stripe test payment → status: PENDING_REVIEW
[ ] Admin approves → campaign status → APPROVED
[ ] Campaign startDate reached → status → ACTIVE → ads start serving
[ ] Creative upload accepts: JPG/PNG (1200×628), MP4 (30s max)
[ ] Creative upload rejects: wrong dimensions → 400 invalid_creative_dimensions
[ ] /dashboard/advertiser loads with campaign list
[ ] /dashboard/advertiser/analytics shows impressions + clicks per campaign
```

---

## SALES CRM PROOFS

```
[ ] prospect-scout-bot creates leads (run manually: npx ts-node bots/prospect-scout.bot.ts --dry-run)
[ ] POST /api/admin/sales/proposals with discountPct=0 → 201 Created
[ ] POST /api/admin/sales/proposals with discountPct=15 → 403 discount_requires_approval
[ ] CampaignProposal expiresAt = now + 7 days
[ ] Proposal accepted → SalesCRMEntry status → RESERVED
[ ] renewal-bot runs and sends renewal email 7 days before campaign end
[ ] /admin/sales/leads shows pipeline with status column
```

---

## PARTY LOBBY PROOFS

```
[ ] POST /api/party creates Party + returns inviteCode
[ ] GET /api/party/:id returns party state with members
[ ] Two users with inviteCode can join same party
[ ] Party WebSocket: user A sends party:message → user B receives party:message-new
[ ] Party WebSocket: user A joins room → user B receives party:member-update { presenceStatus: 'IN_ROOM' }
[ ] Party survives when one member enters a room
[ ] Party persists when member exits a room (status returns to IN_LOBBY)
[ ] PartyLobbyMini bar appears at top of room screen for party members
[ ] party:transport fires → all ready members receive joinUrl
[ ] Party auto-disbands after 60min with no members (expiresAt job)
[ ] Adult cannot join party with child account members (age-group check)
[ ] /party page shows public parties list
```

---

## GAME SESSION PROOFS

```
[ ] POST /api/games/sessions creates GameSession with status LOBBY
[ ] Three users join session → players array has 3 entries
[ ] Host triggers start → game:countdown fires (3,2,1)
[ ] game:round-start fires with first question
[ ] POST /api/games/sessions/:id/answer { correct answer } → correct: true, points > 0
[ ] POST /api/games/sessions/:id/answer { wrong answer } → correct: false, points: 0
[ ] After final round → game:ended fires with winner
[ ] Game intermission ad slot fires between rounds (GAME_INTERMISSION)
[ ] GameSession endedAt populated → winnerUserId set
[ ] If isRanked: winner gains season points
[ ] /games page shows active game sessions list
```

---

## EDITORIAL PROOFS

```
[ ] POST /api/editorial creates Article with status DRAFT
[ ] Editor publishes → status PUBLISHED → article appears on /editorial
[ ] Article page renders ART_INLINE_1 slot
[ ] News ticker on homepage shows latest published articles (last hour)
[ ] Sponsored article shows "Presented by [Brand]" disclosure
[ ] /editorial?category=music_news returns correct articles
[ ] Article analytics track viewCount on page load
```

---

## STREAM & WIN PROOFS

```
[ ] POST /api/stream-win/event { eventType: 'daily_login' } → pointsEarned > 0
[ ] GET /api/stream-win/score → returns weeklyScore + lifetimeScore
[ ] Homepage Trends Belt shows current user score (when logged in)
[ ] Leaderboard endpoint returns top 10
[ ] Score resets weekly (Sunday midnight job)
```

---

## SAFETY INTEGRATION PROOFS (carryover from Pack 25/26)

```
[ ] Adult → kid DM attempt → 403 Forbidden (message-safety middleware)
[ ] Kid fan → kid performer message → 200 OK
[ ] Adult → kid party join → 403 Forbidden
[ ] Ticket purchase 9 for same event → 429 limit_exceeded
[ ] Diamond badge shows on Marcel + BJ profiles (billing-integrity-bot confirms)
[ ] pnpm test:discovery PASSES (0-viewer = position 1 in lobby wall)
```

---

## FULL PLATFORM SMOKE TEST SEQUENCE

Run these in order. All must pass before any deploy.

```bash
pnpm test:discovery              # CRITICAL — blocks deploy if fails
pnpm test:smoke                  # Full smoke test suite
pnpm -C apps/api typecheck       # No TypeScript errors
pnpm -C apps/web typecheck       # No TypeScript errors
pnpm -C apps/web build           # Build must exit 0

# Manual:
curl https://api.themusiciansindex.com/health
curl https://api.themusiciansindex.com/api/readyz
curl https://api.themusiciansindex.com/api/ads/slot/HOME_ADV_TILE_1
# ^ Must always return 200 (type: 'house' if empty)
```
