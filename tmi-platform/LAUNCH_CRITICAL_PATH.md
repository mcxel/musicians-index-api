# Launch Critical Path — 4-8 Weeks to Soft Launch

**Date**: 2026-06-22  
**Mandate**: Prove four things work end-to-end. Gate soft launch on certification. Proceed with parallel convergence + HQ wiring.

---

## Track A — Soft Launch Blockers (3-4 weeks)

These are the **only four things** that can stop onboarding. No exceptions. No "we'll fix that later."

### A1: Go Live Certification (72 hours)

**Test Flow**:
```
Performer opens /go-live
  ↓ Starts broadcast
  ↓ Appears on GlobalLiveSessionRegistry
  ↓ Appears on Home 1 orbital wheel (performer ring)
  ↓ Appears on Home 1-2 billboard preview
  ↓ Appears on Home 3 live world wall
  ↓ Fan clicks room tile
  ↓ Fan joins room
  ↓ Fan sees live video feed + audience
  ↓ Performer sees audience count update in real-time
```

**Gates** (all must pass):

- [ ] Broadcast starts without error
- [ ] Registry records live status within 2 seconds
- [ ] Home 1 updates within 5 seconds (no manual refresh needed)
- [ ] Home 1-2 billboard shows live preview with correct video stream
- [ ] Home 3 shows room in live world wall (no missing tile)
- [ ] Fan entry is instantaneous (< 2 seconds load time)
- [ ] Audience count accurate (matches real seats assigned)
- [ ] Broadcast ends cleanly (registry updates, room disappears from discovery)
- [ ] No console errors during full flow

**Pass Criteria**: 20 consecutive successful flows (different performers, different times, different devices). Any failure resets counter.

**Evidence**: Video screen capture of Home 1 → Home 3 → Live room entry with timestamps.

---

### A2: Media Certification (72 hours)

**Test Flow**:
```
Performer uploads song via /hub/performer or Dashboard Upload
  ↓ File stores (S3 or local)
  ↓ Transcoding completes (if applicable)
  ↓ Song appears in Performer Profile under Playlist
  ↓ Song appears in Magazine (if featured)
  ↓ Song appears in Discovery Rail (if matched to user)
  ↓ Fan clicks song from any surface
  ↓ Song plays in MediaPlayer or PlaylistPlayer
  ↓ Audio plays without stuttering/gaps
  ↓ Song metadata displays correctly (artist, duration, cover art)
```

**Gates** (all must pass):

- [ ] Upload accepts .mp3, .wav, .ogg (min 128kbps)
- [ ] Upload file size limit enforced (max 50MB)
- [ ] Transcoding completes within 5 minutes (or skipped if already correct format)
- [ ] Song stored with correct metadata (artist name, title, duration, cover)
- [ ] Song appears in performer's library within 10 seconds
- [ ] Song plays from Profile, Playlist, Magazine, Radio (all contexts)
- [ ] Audio quality consistent across all playback contexts
- [ ] Seek bar works (skip forward/backward)
- [ ] Volume control works
- [ ] Song metadata displays on all playback surfaces
- [ ] Video upload (if applicable) follows same flow
- [ ] No console errors during full flow

**Pass Criteria**: 15 successful song uploads from 5 different performers, all playing correctly on all surfaces.

**Evidence**: Performer uploads → Profile shows → Fan plays → Player displays metadata (screenshot per step).

---

### A3: Route Certification (48 hours)

**Test Flow**: Every clickable element routes correctly without dead links or 404s.

**Priority Routes** (must pass):

```
Home 1 Orbital Performers
  ↓ Click performer card
  ↓ Load /performers/[slug]
  ↓ Profile loads with: image, bio, playlist, booking, store, memory wall, message

Home 1 Sponsor Rail
  ↓ Click sponsor card
  ↓ Load /sponsors/[id]
  ↓ Sponsor page loads

Magazine Article
  ↓ Click article card
  ↓ Load /magazine/article/[slug]
  ↓ Article loads with: title, content, related articles, related performers

Battle Tile
  ↓ Click battle card
  ↓ Load /battles/live or /games/[id]
  ↓ Arena loads with: competitors, voting, scoreboards

Live Room Tile
  ↓ Click room tile
  ↓ Load /live/rooms/[id]
  ↓ Room loads with: video stream, audience, HUD, chat

Fan Club Button
  ↓ Click "Join Fan Club"
  ↓ Modal appears with price/benefits
  ↓ Click subscribe
  ↓ Stripe modal appears
  ↓ Complete charge
  ↓ Member badge appears on profile

Tip Button
  ↓ Click "Send Tip"
  ↓ Tip modal appears
  ↓ Enter amount
  ↓ Stripe modal appears
  ↓ Complete charge
  ↓ Tip recorded in creator's earnings

Booking Button
  ↓ Click "Book This Artist"
  ↓ Booking form appears
  ↓ Submit booking request
  ↓ Confirmation sent to performer email
```

**Gates** (all must pass):

- [ ] No `href="#"` links anywhere (grep confirms)
- [ ] No `onClick={() => {}}` buttons (grep confirms)
- [ ] All routes load in < 2 seconds
- [ ] All routes load without 404
- [ ] All routes load without console errors
- [ ] All media on routes displays without broken images
- [ ] All nested routes (e.g., `/performers/[slug]/article`) work
- [ ] All dynamic routes (e.g., `/live/rooms/[id]`) resolve correctly
- [ ] All buttons trigger actions (open modals, navigate, submit)

**Pass Criteria**: 100% route coverage on critical path (20 routes). Zero 404s. Zero console errors.

**Evidence**: Automated route audit script output (or manual verification grid).

---

### A4: Revenue Certification (72 hours)

**Test Flow**: Money flows correctly from user → Stripe → creator.

**Test 1: Tip**
```
Fan clicks "Send Tip"
  ↓ Modal shows preset amounts ($1, $5, $10)
  ↓ Fan selects $5
  ↓ Stripe modal appears
  ↓ Fan enters card (use Stripe test card: 4242 4242 4242 4242)
  ↓ Charge processes
  ↓ Modal closes
  ↓ Success toast appears ("Tip sent!")
  ↓ Creator receives notification
  ↓ Creator's earnings dashboard shows +$5 (within 60 seconds)
  ↓ Stripe dashboard shows charge (within 60 seconds)
```

**Gates**:
- [ ] Stripe modal appears (not blank)
- [ ] Charge succeeds with test card
- [ ] Creator notification sent
- [ ] Creator earnings dashboard updated
- [ ] Stripe record created
- [ ] No double-charges
- [ ] Tip appears in creator's transaction history

**Test 2: Fan Club Subscription**
```
Fan clicks "Join Fan Club" on performer profile
  ↓ Modal shows: "$9.99/month"
  ↓ Fan clicks "Subscribe"
  ↓ Stripe modal appears
  ↓ Fan enters card (4242 4242 4242 4242)
  ↓ Charge processes ($9.99)
  ↓ Member badge appears on fan's profile
  ↓ Fan sees exclusive content (member-only posts, early access, etc.)
  ↓ Creator sees +1 member in dashboard
  ↓ Creator receives subscription notification
  ↓ Stripe shows recurring charge scheduled for 30 days
```

**Gates**:
- [ ] Subscription created in Stripe
- [ ] Recurring charge scheduled
- [ ] Member badge appears on fan profile
- [ ] Member-only content accessible
- [ ] Creator dashboard shows +1 subscriber
- [ ] Creator notification sent
- [ ] Cancellation flow works (fan can unsubscribe)

**Test 3: Ticket Purchase**
```
Fan browses /ticketing or ticket section
  ↓ Selects event (e.g., "World Concert #1")
  ↓ Selects seat category (General Admission = $15)
  ↓ Adds to cart
  ↓ Clicks "Checkout"
  ↓ Stripe modal appears
  ↓ Fan enters card (4242 4242 4242 4242)
  ↓ Charge processes ($15)
  ↓ Ticket code issued (email + inventory)
  ↓ Ticket appears in fan's collection
  ↓ Venue sees ticket inventory decrease
  ↓ Revenue recorded to venue/promoter
```

**Gates**:
- [ ] Stripe charge succeeds
- [ ] Ticket code generated
- [ ] Ticket sent to email
- [ ] Ticket appears in user's collection
- [ ] Inventory tracking accurate
- [ ] Venue/promoter earnings updated
- [ ] Ticket can be scanned/redeemed

**Pass Criteria**: 5 successful transactions each (5 tips, 5 subscriptions, 5 tickets). Zero failed charges. Zero missing notifications. All creator dashboards updated.

**Evidence**: Screenshots of each transaction flow + Stripe dashboard confirmation.

---

### A1-A4 Gate Condition

**Soft launch gates ONLY when**:

```
✓ Go Live: 20 consecutive successful broadcasts
✓ Media: 15 successful song uploads + playback
✓ Routes: 100% critical path coverage, zero 404s, zero console errors
✓ Revenue: 15 successful transactions (5 tips + 5 subscriptions + 5 tickets)
```

**If any gate fails**: Fix → re-test from start of that gate. No partial credit.

---

## Track B — Parallel Convergence (Weeks 3-4)

**While Track A is being certified**, immediately start merging duplicates. These don't block soft launch, but will block public scale.

### B1: AvatarLobbyCanvas Consolidation (6 hours)

```
git status | find . -name "AvatarLobbyCanvas.tsx"
→ Found at: components/avatars/, components/lobbies/, app/web/src/components/

Action:
1. Keep: components/avatars/AvatarLobbyCanvas.tsx (canonical)
2. Update imports across codebase
3. Delete duplicates
4. Test: Avatar lobby renders on all surfaces
5. Deploy: Single version confirmed
```

### B2: Event Shell Consolidation (8 hours)

```
Merge CypherRuntimeShell, BattleRuntimeShell, ChallengeRuntimeShell 
into ArenaEventShell with mode parameter.

Current:
  /battles/live → BattleRuntimeShell (hardcoded battle logic)
  /cypher/create → CypherRuntimeShell (hardcoded cypher logic)
  /challenges/[id] → ChallengeRuntimeShell (hardcoded challenge logic)

Target:
  /battles/live → ArenaEventShell mode="battle"
  /cypher/create → ArenaEventShell mode="cypher"
  /challenges/[id] → ArenaEventShell mode="challenge"

Action:
1. Extend ArenaEventShell.tsx to accept mode prop
2. Extract mode-specific logic into ArenaEventShell branches
3. Delete CypherRuntimeShell, BattleRuntimeShell, ChallengeRuntimeShell
4. Update all route imports
5. Test: All three event types work identically (other than mode differences)
6. Deploy: Single event shell confirmed
```

### B3: Host Engine Consolidation (4 hours)

```
Verify HostShowAssignmentEngine vs ShowHostAssignmentEngine.

If both exist and are identical:
  1. Keep: HostShowAssignmentEngine (canonical)
  2. Delete: ShowHostAssignmentEngine
  3. Update all imports

If they differ:
  1. Document separation clearly
  2. Add code comment explaining why they diverged
  3. Mark one as LEGACY if appropriate

Test: All host assignments work (Monthly Idol, radio, game shows)
Deploy: Confirmed single engine
```

### B4: Role Switcher Consolidation (2 hours)

```
Verify PersonaSwitcher vs RoleSwitcher.

If both exist and operate on MultiPersonaEngine:
  1. Keep: RoleSwitcher (more recent)
  2. Delete: PersonaSwitcher
  3. Update all header imports
  4. Test: Role switching works in all HQs

Deploy: Single switcher confirmed
```

**Track B Deliverable**: Zero duplicate runtimes committed. All routes work identically as before, but using consolidated code.

---

## Track C — Parallel HQ Wiring (Weeks 3-4)

**While Track A is being certified and Track B is consolidating**, wire monetization signals into HQ pages.

### C1: Fan HQ — Visualization Layer (16 hours)

**No new features. Only wire existing systems.**

Current Fan HQ shell renders generic layout. Wire these existing systems:

```
XP Counter (top-right)
  ← XpActionRegistry
  ← User's current XP value
  ← Tier progress bar
  ← Show: "2,450 / 5,000 XP to Gold"

Rewards Section
  ← RewardsEngine
  ← Show: Unclaimed rewards, claim buttons
  ← Show: Reward history (tips earned, tickets purchased, etc.)

Collections
  ← PlaylistEngine → Fan's playlists
  ← MemoryWallEngine → Fan's saved moments
  ← InventoryEngine → Fan's cosmetics, emotes, props
  ← TicketEngine → Fan's owned tickets

Leaderboard Preview
  ← RankingEngine
  ← Show: Fan's current rank among all fans
  ← Show: Next 3 fans to catch up to
  ← Show: XP needed to rank up

Live Discovery
  ← GlobalLiveSessionRegistry
  ← Show: Performers going live right now
  ← Show: Genres trending
  ← Show: Friends going live

Fan Club Memberships
  ← SubscriptionEngine
  ← Show: Subscribed-to performers
  ← Show: Auto-renewal dates
  ← Show: Member-exclusive content access
```

No new backend. Only render existing data.

**Implementation**: Add `<XpDisplay />`, `<RewardsWidget />`, `<CollectionsPanel />`, `<LeaderboardPreview />`, `<LiveDiscoveryRail />`, `<FanClubWidget />` to `FanHQShell.tsx`.

**Testing**: Log in as fan → verify all sections load → verify data matches backend systems.

### C2: Performer HQ — Visualization Layer (16 hours)

**No new features. Only wire existing systems.**

Current Performer HQ shell renders generic layout. Wire these existing systems:

```
Revenue Dashboard (top)
  ← TipEngine → Tips received today/week/month
  ← SubscriptionEngine → Subscriber count, recurring revenue
  ← TicketEngine → Ticket sales (if performer hosts events)
  ← MerchEngine → Merch sales
  ← BookingEngine → Booking fees earned
  ← Total: Sum of all revenue streams

Audience Stats
  ← GlobalLiveSessionRegistry → Live viewer trends
  ← PerformerRegistry → Fan count, follower growth
  ← AnalyticsEngine → Watch time, shares, engagement

Recent Activity
  ← NotificationEngine → Fan subscriptions, tips, bookings, reviews
  ← ActivityTimelineCanister → Recent actions on performer's content

Opportunities Dock
  ← OpportunityEngine → Sponsorships, featured placement, promotion boosts
  ← SponsorRegistry → Active sponsor offers for performer tier

Subscriber List
  ← SubscriptionEngine → Who's subscribed, tier, auto-renewal date

Booking Requests
  ← BookingEngine → Incoming booking requests, calendar integration

XP + Achievements
  ← XpActionRegistry → Performer's current XP, tier, achievements

Media Library
  ← MediaEngine → Uploaded songs, videos, streams
  ← PlaylistEngine → Performer's featured playlists
```

No new backend. Only render existing data.

**Implementation**: Add `<RevenueOverview />`, `<AudienceStats />`, `<ActivityFeed />`, `<OpportunitiesDock />`, `<SubscriberList />`, `<BookingRequests />`, `<AchievementsDisplay />`, `<MediaLibrary />` to `PerformerHQShell.tsx`.

**Testing**: Log in as performer → verify all sections load → verify data matches backend systems.

---

## Convergence to Soft Launch

```
Week 1-2: Track A Certification
          ↓
Week 2-3: Track A + Track B Parallel
          ↓
Week 3-4: Track A + Track B + Track C Parallel
          ↓
End of Week 4: All A gates pass + B + C deployed
          ↓
SOFT LAUNCH GATE OPENS
```

At this point:

```
✓ Go Live works end-to-end
✓ Media pipeline works end-to-end
✓ All routes work (100% coverage, zero 404s)
✓ Revenue flows work (Tip → Stripe → Creator)
✓ Zero duplicate runtimes
✓ Fan HQ shows monetization signals
✓ Performer HQ shows revenue + opportunities
✓ Ready for 50-user beta
```

---

## Post-Launch (Parallel to Beta)

While 50-user beta onboards:

### Track D — Advanced Features (Concurrent with beta)
- Avatar world / 3D rendering (can launch beta without this)
- Radio network (Rule 25; can launch later)
- Advanced game shows (can launch later)
- Advanced booking/sponsorship (can launch later)

### Track E — Scale Testing
- Load testing (can 500 concurrent users stream?)
- Database scaling (is Prisma + database sufficient?)
- Video CDN scaling (is video playback smooth at scale?)

These don't stop beta. They happen in parallel.

---

## Success Condition

**Soft Launch Readiness** (gate opens when):

```
✓ A1: Go Live Certification PASS
✓ A2: Media Certification PASS
✓ A3: Route Certification PASS
✓ A4: Revenue Certification PASS
✓ B: Duplicate Runtimes Eliminated
✓ C: HQ Visualization Wired
✓ Zero known blockers
```

**Time**: 4-8 weeks (dependent on A gate retries + team capacity).

**Users**: 50-user beta immediately after gates pass.

**Revenue**: Real transactions flowing (tips, subscriptions, tickets).

**Content**: Real performers, real songs, real broadcasts.

**Discovery**: Real discovery (Go Live → Home → Fan entry).

---

## If Gates Start Failing

**Example**: A2 Media Certification discovers transcoding takes 15 minutes instead of 5.

**Action**:
1. Don't re-plan. Don't push soft launch to "8 weeks"
2. Fix the root cause (is it a performance issue? A code issue? A dependency issue?)
3. Re-test A2 from start
4. Continue with other tracks in parallel
5. Gate still opens when A2 passes

**Principle**: Certification is binary (pass/fail). If it fails, fix and re-test. No workarounds. No "we'll fix it later."

---

## Why This Works

**Track A (3-4 weeks)** proves you can onboard users without building anything new.

**Track B (parallel)** eliminates technical debt while A is being tested.

**Track C (parallel)** gives users monetization visibility while A is being tested.

**Result**: Soft launch date is data-driven (gates determine readiness), not calendar-driven.

If gates pass in week 4 → launch week 4.
If gates need retry in week 4-5 → launch week 5-6.
If gates pass with one retry → launch week 3-4.

**This is the path to real launch velocity.**
