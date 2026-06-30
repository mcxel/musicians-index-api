# Final Execution Sequence (LOCKED 2026-06-25)

**Authority**: Build Director (Marcel Dickens)  
**Status**: FINAL — This is the canonical path to soft launch  
**Supersedes**: All previous roadmap versions

---

## The Sequence

### WEEK 1: Foundation Audit & Repair

#### Day 1: Phase 1A — Live Session Audit (2-4 hours)

**Goal**: Answer these questions with certainty (don't fix yet, just map):

- [ ] Is there exactly ONE canonical GlobalLiveSessionRegistry?
- [ ] Does every GO LIVE button write to that registry?
- [ ] Which surfaces still POLL instead of SUBSCRIBE?
- [ ] Which APIs still return mock or stale data?
- [ ] Which pages still have legacy code paths?
- [ ] Are there duplicate live systems?

**Deliverable**: `LIVE_SESSION_CHAIN_AUDIT.md` (punch list of findings)

**Output**: Clear inventory of P0, P1, P2 issues

---

#### Days 2-3: Fix Only P0 Live Session Blockers

**What to fix**:
- Issues that prevent Home/Discovery/Live/Billboards/Notifications/Followers/Admin from updating from the same session
- Missing API endpoints that any of those 7 surfaces need
- Duplicate registries that create conflicting data
- Dead code paths that cause stale updates

**What NOT to fix**:
- Cosmetic issues
- Performance optimizations (can come later)
- Feature additions
- Design polish

**Rule**: If it's not blocking the 7 core surfaces from updating, skip it.

**Deliverable**: All P0 issues fixed, confirmed by re-running the audit

---

#### Day 4: Run Certification Suites

```bash
npm run dev
curl http://localhost:3000/api/debug/runtime-certify
curl http://localhost:3000/api/debug/integration-certify
```

**Expected**: Both suites pass (or very few failures, all easily fixable)

**If failures occur**: They'll now be implementation issues, not architecture issues

**Deliverable**: Both suites passing with clean results

---

#### Day 5: Patch Only Failed Certification Items

**Rule**: Only fix what the certification suite flagged

**Don't**:
- Redesign anything
- Add features
- Optimize performance
- Refactor working code

**Deliverable**: All certification suites passing, cleanly

---

#### End of Week 1: Freeze the Live Session Chain

**Once it passes certification**:
- Don't touch it again unless a bug is discovered
- This becomes production infrastructure
- All 7 core surfaces are now synchronized with ONE source of truth

**Status**: Phase 1 COMPLETE ✅

---

### WEEK 2: Canonical Data Audit

#### Phase 1.5 — Eliminate Duplicate Systems

**Goal**: One system owns every type of data.

**Audit for duplicates**:

```
XP System
- How many implementations? (target: 1)
- Which is canonical?
- Where are the others?

Followers System
- PerformerFollowers? FanFollowers? WriterFollowers? VenueFollowers?
- One implementation or four?

Revenue System
- One revenue engine or six fragmented ones?
- Where is money tracked?

Live Registry
- One canonical source or multiple parallel registries?

User Profiles
- One profile system or role-specific implementations?

Notifications
- One notification engine or per-role implementations?

Chat/Messaging
- One system or multiple?

Avatar System
- One avatar runtime or duplicates?

Analytics
- One analytics engine or per-surface implementations?

Memory Wall
- One or multiple?

Playlists
- One or multiple?
```

**For each duplicate found**:
1. Identify which version is most used (canonical)
2. Trace all systems that read from each version
3. Plan convergence (which to keep, which to deprecate)
4. Mark losers with `// LEGACY - use [canonical path] instead`

**Deliverable**: `CANONICAL_DATA_AUDIT_REPORT.md`
- Complete list of duplicate systems
- Which is canonical for each
- Convergence plan for each
- Estimated work to merge

**Why this matters**: 
- Prevents technical debt accumulation
- Makes CRM implementation cleaner (no conflicting sources)
- Saves debugging time later when data is inconsistent

**Status**: Phase 1.5 COMPLETE ✅

---

### WEEKS 3-5: Universal Profile Runtime + CRM

#### Phase 2A: Shared Identity System

**Build ONE implementation** (used by all 6 roles):

```tsx
<IdentityModule />  // Avatar, verification, rank, XP, membership, badges, followers, stats
<SocialModule />    // Activity, friends, notifications, AI assistant
<MediaModule />     // Locker, playlists, memories, gallery
<LivePresenceModule /> // Live status, current room, viewers
<SettingsModule />  // Privacy, billing, preferences
```

**Timeline**: Week 3 (4-5 days)

**Deliverable**: Shared identity appears on all 6 role profiles

---

#### Phase 2B: CRM Priority Sequence

**Priority order** (highest value first):

##### CRM Priority 1: Performer Module ⭐⭐⭐⭐⭐

**Why first**: Revenue-driving. Every feature here directly impacts money.

**Modules**:
- Revenue Center (deep analytics: tips, merch, tickets, subs, sponsors)
- Bookings Manager (requests, scheduled, completed)
- Concerts Module (shows, stats, calendar)
- Music Module (uploads, albums, releases, streaming stats)
- Sponsors Module (active deals, revenue, brands)
- Analytics Module (fan conversion, livestream metrics, growth)
- Contracts Module (signed agreements)
- Payout Center (Stripe, scheduled payouts, taxes)

**Timeline**: Week 3-4 (intensive)

**Deliverable**: Performer can see complete business picture

---

##### CRM Priority 2: Fan Module ⭐⭐⭐⭐⭐

**Why second**: User retention. Fans who see their memories, collections, and progress will stay.

**Modules**:
- Collections (favorite artists, venues, songs)
- Support History (total tips, supported artists)
- Upcoming Tickets (owned events)
- Reward Progress (XP, badges, achievements)
- Purchase History (merch, subs, digital products)
- Playlists (saved, created, shared)
- Groups/Friends (friends list, groups)
- Analytics (watch time, attendance, lifetime stats)

**Timeline**: Week 4-5 (concurrent with Performer)

**Deliverable**: Fans understand their impact and progress

---

##### CRM Priority 3: Executive Module (Big Ace) ⭐⭐⭐⭐⭐

**Why third**: Command center for the platform.

**Modules**:
- Platform Revenue (real-time, all sources)
- Active Rooms (what's happening now)
- User Health (growth, retention, engagement)
- Moderation Queue (reports, bans, issues)
- Fraud Detection (suspicious activity)
- System Health (servers, CPU, memory, CDN)
- Top Trending (artists, rooms, genres)
- Growth Predictions (forecasts)

**Timeline**: Week 5 (concurrent)

**Deliverable**: Build Director + Team have one command center

---

##### CRM Priority 4: Venue Module

**Modules**:
- Event Calendar (bookings, schedule, staff)
- Booking Management (requests, confirmations, revenue)
- Capacity & Seating (occupancy, allocation)
- Staff Roster (team, schedules, payroll)
- Equipment Inventory (stages, lighting, audio)
- Tickets Dashboard (sales, inventory, revenue)
- Financial Reports (revenue, settlements)

**Timeline**: Week 5

---

##### CRM Priority 5: Promoter Module

**Modules**:
- Campaign Manager (active, archived, ROI)
- Artist Roster (represented artists)
- Venue Relationships (bookings, terms)
- Budget Tools (spend, allocation)
- Contracts & Settlements (agreements, payouts)
- Reports (performance analytics)

**Timeline**: Week 5

---

##### CRM Priority 6: Sponsor Module

**Modules**:
- Campaign Builder (active campaigns)
- Performance Metrics (impressions, CTR, conversions)
- Creative Assets (logos, banners, videos)
- Partnership Manager (artist sponsorships)
- Billing & ROI (cost analysis, customer lifetime value)

**Timeline**: Week 5

---

##### CRM Priority 7: Writer Module

**Modules**:
- Editorial Workflow (drafts, submitted, published)
- Article Queue (scheduled content)
- Analytics (readership, engagement)
- Assignments (from editors)
- Royalties (earnings)

**Timeline**: Week 5

---

**Phase 2B Status**: Week 5 END — All 7 role CRM modules complete ✅

---

### WEEK 5-6: Unified Business Layer

#### Phase 3: Consolidate All Revenue

**One canonical flow**:

```
User Action (tip/subscribe/purchase/book)
  ↓
Stripe (payment processor)
  ↓
UnifiedRevenueEngine (ONE)
  ├─ Identify source
  ├─ Calculate splits
  ├─ Track tax withholding
  └─ Queue settlement
  ↓
SettlementScheduler
  ├─ Daily/weekly/monthly processing
  ├─ Generate payout records
  └─ Update banks
  ↓
Business Dashboard (visible to all roles with financial activity)
```

**Consolidate**:
- Membership tier income
- Tips
- Merchandise
- Sponsorships
- Ticket sales
- Bookings
- Ads
- Subscriptions
- Royalties
- Digital products

**Deliverable**: One auditable path from collection to settlement for every dollar

**Timeline**: Week 5-6

**Status**: Phase 3 COMPLETE ✅

---

### WEEKS 4-6: Runtime Humanity (CONCURRENT)

#### Phase 4: Make Crowds Feel Alive

**DO NOT invent new systems.**

**DO make existing attention runtime feel human.**

**Four layers**:

##### Layer 1: Attention (MOSTLY BUILT)
- Avatars look at stage
- Attention shifts when action happens
- Contagion spreads through crowd
- Energy drives intensity

**Work**: Fix remaining issues, verify it feels good

**Timeline**: Week 4 (2-3 days)

---

##### Layer 2: Behavior (BUILD THIS)
- Talking (mouth movement, gestures)
- Cheering (body shakes, arms up)
- Waving (hand motion)
- Recording (phones raised)
- Dancing (context-aware)
- Sitting/Standing (posture variety)
- Laughing (body shake)
- Reacting to specific moments

**Timeline**: Week 4-5 (primary focus)

---

##### Layer 3: Environment (BUILD THIS)
- LED wall transitions
- Moving lights (following performers)
- Smoke/fog timing
- Crowd waves (energy ripples)
- Sponsor activations (timed)
- Confetti (celebratory)
- Floor reflections
- Ambient sound

**Timeline**: Week 5-6

---

##### Layer 4: Micro Humanity (POLISH)
- Blinking (3-4 per minute)
- Breathing (subtle chest)
- Weight shifting (5-10 sec cycles)
- Looking at phones (occasional)
- Scratching head (fidgeting)
- Adjusting clothes
- Turning to friends
- Sipping from cups

**Timeline**: Week 6

---

**Phase 4 Status**: Week 6 END — Crowds feel alive ✅

**Gate**: Level 3 Experience Certification must pass (human reviewers confirm: "This feels alive")

---

### WEEK 6-7: Venue Life

#### Phase 5: Populate Venues with Operational Reality

**Visible NPCs** (different per venue type):
- Camera operators (following performers)
- DJ (at turntables)
- Host/Announcer (visible, speaking)
- Security (entry/exit)
- Photographers (capturing moments)
- Lighting technician (adjusting rigs)
- Bartenders (serving)
- Merch booth staff (selling)
- Sponsor reps (at zones)
- Ushers (helping guests)

**Deliverable**: Every venue has 5+ visible staff members, positioned naturally, reacting to performances

**Timeline**: Week 6-7

**Status**: Phase 5 COMPLETE ✅

---

### WEEK 7-8: Mobile Redesign

#### Phase 6: Native Mobile Experience

**NOT scaled from desktop.**  
**IS redesigned for mobile-native context.**

**Mobile-Specific**:
- Bottom navigation (thumb-natural)
- Vertical scrolling (mobile behavior)
- Large touch targets (48x48px minimum)
- Gesture-based (swipe, tap, long-press)
- Full-screen live rooms (portrait primary)
- Simplified navigation (max 3 taps)
- Push notifications
- Background audio
- Offline support
- Haptic feedback
- Battery efficiency

**Timeline**: Week 7-8

**Status**: Phase 6 COMPLETE ✅

---

### WEEKS 1-8: Onboarding Excellence (PARALLEL)

#### Phase 0: Continuous Onboarding Optimization

**User journey** (target: <5 minutes):

```
Minute 1: Sign up
Minute 2: Choose role (Fan/Performer)
Minute 3: Create avatar
Minute 4: Join live room
Minute 5: First action (reaction/follow/tip)
```

**Running continuously**:
- Test daily
- Fix friction points immediately
- A/B test variations
- Track conversion metrics
- Optimize each minute

**Success metrics**:
- [ ] Signup → first live room: <5 minutes
- [ ] First reaction: >70% of users
- [ ] Day 1 return: >60%
- [ ] Day 7 return: >40%
- [ ] First purchase within 7 days: >15%

**Timeline**: Weeks 1-8 (continuous)

**Status**: Phase 0 COMPLETE ✅

---

### WEEK 8+: Soft Launch Certification

#### Phase 7: Prove Everything Works

**Certification areas**:

- Performance (<2s load, 60fps, 5000+ avatars)
- Payments (Stripe stable, 99%+ success)
- Live Streaming (RTMP, HLS, <500ms latency)
- Notifications (>99% delivery, <2s latency)
- Discovery (search working, ranking stable)
- Moderation (filtering, reporting, banning)
- Analytics (real-time, historical, forecasting)
- Failover (database, CDN, rate limiting)

**Deliverable**: Zero critical bugs, all areas certified, Build Director approval

**Status**: Phase 7 COMPLETE ✅

---

## Timeline Summary

```
Week 1:    Phase 1 (Live Session Chain)
Week 2:    Phase 1.5 (Canonical Data Audit)
Week 3:    Phase 2A (Shared Identity)
Week 3-5:  Phase 2B (CRM Modules)
Week 5-6:  Phase 3 (Business Layer)
Week 4-6:  Phase 4 (Humanity) [CONCURRENT]
Week 6-7:  Phase 5 (Venue Life)
Week 7-8:  Phase 6 (Mobile)
Week 1-8:  Phase 0 (Onboarding) [PARALLEL]
Week 8+:   Phase 7 (Soft Launch Cert)

Total: 8 weeks to soft launch ready
```

---

## Gating Criteria (STRICT)

**Phase 1 → 1.5**:
- Level 1 + Level 2 certs pass
- All 15 surfaces wired and verified
- Live Session Chain frozen (no changes unless bug)

**Phase 1.5 → 2A**:
- Canonical Data Audit complete
- All P0 duplicates identified
- Convergence plan documented

**Phase 2A → 2B**:
- Shared identity deployed to all 6 role types
- All data is real (no hardcoding, per Rule 20)

**Phase 2B → 3**:
- All 7 role CRM modules functional
- No duplicate implementations
- All data APIs wired

**Phase 3 → 5**:
- Unified Business Layer verified
- One auditable path for every dollar
- All settlements processing correctly

**Phase 4 → 5**:
- Attention contagion working (naturally, not synchronized)
- Layer 2 behaviors implemented
- Level 3 Experience Certification: "Feels alive"

**Phase 5 → 6**:
- All venue NPCs visible and reacting
- Operational reality confirmed

**Phase 6 → 7**:
- Mobile app has 100% feature parity
- Performance targets met

**Phase 7 → LAUNCH**:
- All certification suites pass
- Zero critical bugs
- Rule 20 audit: Zero fake data
- Build Director approval

---

## What Does NOT Get Built

❌ New AI systems beyond Big Ace/Nova (Rule 22)  
❌ Advanced radio network (Rule 25)  
❌ Three-lane rewards (Rule 24)  
❌ Distributed event architecture (Rule 21)  
❌ New game shows beyond existing  
❌ Advanced inventory trading (future)  
❌ Subscription tiers beyond DIAMOND (future)  
❌ Anything not in these 7 phases

**Rationale**: Every new system adds risk and delay. The platform must be proven before expanding.

---

## Authority & Lock

**This execution sequence is FINAL and LOCKED.**

No changes without explicit Build Director approval.

Every task follows this sequence.

No jumping ahead.

No parallel work on later phases before gating criteria are met.

**This is the canonical path to soft launch.**

---

## The North Star

Every decision answers:

> **Does this move us closer to proving the platform works and making it feel alive?**

**YES** → Do it.  
**NO** → Skip it.

Connect. Prove. Polish. Launch.

Nothing else matters until those four things are done.
