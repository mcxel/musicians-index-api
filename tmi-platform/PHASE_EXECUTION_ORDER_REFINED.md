# Phase Execution Order (REFINED — 2026-06-25)

**Authority**: Build Director (Marcel Dickens)  
**Date**: 2026-06-25  
**Status**: LOCKED — This is the final execution sequence

---

## Pre-Execution: Audit

### Pre-Certification Audit (1 day)

**BEFORE running Level 1 & 2 certification suites**, execute comprehensive audit:

1. Verify ONE canonical GlobalLiveSessionRegistry exists
2. Map all 15 surfaces (identify polling vs. subscribing)
3. Find all GO LIVE entry points (verify they write to same registry)
4. Create dependency map
5. Verify all APIs exist and work
6. Test data flow consistency
7. Document error handling
8. Establish performance baseline
9. Assign ownership
10. Fix any blockers found

**Deliverable**: `PHASE1_AUDIT_REPORT.md` with zero blockers remaining

**Then proceed to certification.**

---

## Phase 1: Live Session Chain (WEEKS 1-2)

**Objective**: One GO LIVE action updates all 15 surfaces in <2 seconds.

**Precondition**: Pre-certification audit complete with zero blockers

**Work**:
- Run Level 1 Runtime Certification
- Run Level 2 Integration Certification
- Wire any missing surfaces to GlobalLiveSessionRegistry
- Verify all 15 destinations receive updates within 2 seconds

**Success Criteria**:
- ✅ Level 1 cert: 5/5 tests pass
- ✅ Level 2 cert: 7/7 tests pass
- ✅ All 15 surfaces update in <2 seconds
- ✅ Zero fake data visible
- ✅ Zero dead links
- ✅ Admin can monitor all live rooms
- ✅ Followers notified immediately
- ✅ Mobile + Web synchronized

**Deliverable**: `WEEK1_COMPLETION_REPORT.md` with all certifications passing

---

## Phase 2A: Shared Identity System (WEEKS 3-4)

**Objective**: Every profile in the platform has the same professional identity section.

**What Gets Built** (once, used everywhere):

```
┌─────────────────────────────────┐
│  IDENTITY MODULE (Shared)       │
├─────────────────────────────────┤
│                                 │
│  [Avatar]    John Doe          │
│              @johndoe           │
│                                 │
│  🏆 Rank: #42 (Hip-Hop)        │
│  ⭐ XP: 15,420                 │
│  💎 Membership: Gold            │
│  ✓ Verified Badge              │
│                                 │
│  📊 Followers: 1,247            │
│     Following: 89               │
│                                 │
│  🏅 Badges: Top Tipper, 100k+   │
│  🎖️ Achievements: 12/25        │
│                                 │
│  📱 Social Links                │
│  💬 About: "Hip-hop producer..." │
│  📅 Joined: Jan 2025            │
│  🔗 Website, Twitter, etc.      │
│                                 │
│  🔴 LIVE NOW                    │
│     Listeners: 542              │
│     [JOIN BUTTON]               │
│                                 │
│  🎯 Activity                    │
│     Recent: Tipped $100         │
│     Posted: "New beat out..."   │
│     Followed: 5 artists         │
│                                 │
└─────────────────────────────────┘
```

**Implementation**:
- [ ] Create `components/profiles/IdentityModule.tsx` (reusable component)
- [ ] Use across ALL profiles: Performer, Fan, Venue, Promoter, Writer, Sponsor
- [ ] Pull data from: User model, XP system, verification system, followers API, live registry
- [ ] No hardcoded data (Rule 20)

**Impact**: Every profile immediately looks professional and complete, even if business modules aren't done yet.

**Success Criteria**:
- ✅ IdentityModule appears on 100% of profiles
- ✅ All data is real (XP, rank, followers, badges)
- ✅ Live status shows correctly
- ✅ No duplicate implementations

**Deliverable**: Shared identity module deployed to all 6 role types

---

## Phase 2B: Role-Specific Business Modules (WEEKS 4-5)

**Objective**: Attach specialized modules to each role profile.

**Architecture**: Don't think "build Performer Profile."  
Think "attach Performer Modules to the Identity base."

### Performer Profile Modules

**Module 1: Revenue Center**
- Tips received (today, week, month, year, all-time)
- Revenue breakdown by source
- Real-time earnings ticker

**Module 2: Bookings Manager**
- Booking requests (pending, scheduled, completed)
- Booked events (upcoming, past)
- Booking calendar

**Module 3: Concerts Module**
- Upcoming shows (performer-created)
- Past shows (with stats)
- Ticket sales integration

**Module 4: Music Module**
- Uploaded tracks
- Streaming stats
- Album management
- Release calendar

**Module 5: Sponsors Module**
- Active sponsorships
- Sponsor deals
- Revenue from sponsorships
- Sponsor brands

**Module 6: Analytics Module**
- Fan conversion
- Livestream metrics
- Engagement stats
- Growth charts

**Module 7: Media Locker**
- Uploads, playlists, videos
- Organization & curation
- Sharing controls

**Module 8: Contracts**
- Signed agreements
- Booking contracts
- Sponsorship terms

**Module 9: Payout Center**
- Stripe connection status
- Scheduled payouts
- Tax forms
- Historical payouts

---

### Fan Profile Modules

**Module 1: Collections**
- Favorite performers (saved list)
- Favorite venues
- Favorite songs
- Favorite articles

**Module 2: Memories**
- Gallery of moments
- Reactions sent
- Live room captures
- Shared memories

**Module 3: Playlist Manager**
- Saved playlists
- Created playlists
- Shared playlists
- Listen history

**Module 4: Event History**
- Attended events
- Upcoming tickets
- Wishlist
- Event reviews

**Module 5: Purchases**
- Merchandise purchased
- Tickets owned
- Subscriptions active
- Digital products

**Module 6: Rewards**
- XP history
- Coins earned/spent
- Badges unlocked
- Achievements (12/25 completed)

**Module 7: Supporter Badge**
- Artists you support (tipped)
- Total tips given
- Supporter tier

**Module 8: Friend Network**
- Followers list
- Following list
- Collaborators
- Block list

---

### Venue Profile Modules

**Module 1: Calendar**
- Upcoming bookings
- Past events
- Staff schedule

**Module 2: Bookings Manager**
- Booking requests
- Confirmed bookings
- Revenue per event
- Cancellations

**Module 3: Capacity & Seating**
- Room capacity
- Current occupancy
- Seating map
- VIP vs. general allocation

**Module 4: Ticket Dashboard**
- Ticket sales by event
- Inventory levels
- Revenue per tier
- Sold-out vs. available

**Module 5: Staff Roster**
- Staff by role
- Schedules
- Payroll
- Contact info

**Module 6: Equipment Inventory**
- Stages
- Lighting
- Audio
- Visual equipment
- Maintenance schedule

**Module 7: Financial Reports**
- Revenue per event
- Expense tracking
- Profit & loss
- Settlement history

**Module 8: Sponsor Management**
- Active sponsors
- Sponsorship terms
- Revenue sharing

---

### Promoter Profile Modules

**Module 1: Campaign Manager**
- Active campaigns
- Campaign performance
- ROI
- Archived campaigns

**Module 2: Venue Relationships**
- Venues represented
- Booking pipeline
- Terms & agreements
- Revenue splits

**Module 3: Performer Roster**
- Represented performers
- Event history
- Commission rates
- Performance stats

**Module 4: Budget Tools**
- Monthly budget
- Spent vs. allocated
- Campaign budgets
- Remaining balance

**Module 5: Ads & Placements**
- Active ads
- Spend history
- Impressions & CTR
- Conversions

**Module 6: Contracts**
- Performer contracts
- Venue agreements
- Exclusivity terms
- Commission structures

**Module 7: Settlements**
- Revenue summary
- Payment history
- Pending payouts
- Disputes

---

### Writer Profile Modules

**Module 1: Editorial Workflow**
- Drafts (working documents)
- Submitted (awaiting review)
- Under Review (feedback)
- Published (live articles)

**Module 2: Article Queue**
- Scheduled for publication
- Publication dates
- Editors assigned

**Module 3: Analytics**
- Readership per article
- Total views
- Average read time
- Shares & engagement

**Module 4: Assignments**
- Assigned articles
- Deadline
- Status
- Feedback

**Module 5: Publishing Calendar**
- Upcoming publication
- Archive
- Series

**Module 6: Earnings**
- Per-article earnings
- Royalties
- Total earned
- Payment history

---

### Sponsor Profile Modules

**Module 1: Campaign Builder**
- Active campaigns
- Campaign settings
- Budget allocation
- Duration

**Module 2: Performance Metrics**
- Impressions
- Clicks
- CTR
- Conversions
- Cost per acquisition

**Module 3: Creative Assets**
- Logos
- Banners
- Videos
- Copy variations
- A/B test results

**Module 4: Performer Partnerships**
- Sponsored performers
- Deal terms
- Exclusivity
- Revenue share

**Module 5: Billing & Contracts**
- Invoices
- Payment history
- Subscription costs
- Contract terms

**Module 6: ROI Dashboard**
- Revenue attributed
- Cost per customer
- Customer lifetime value
- Forecast

**Module 7: Reports Center**
- Custom reports
- Download analytics
- Trending metrics

---

**Implementation Strategy**:

For each role, each module:
1. Create dedicated component: `components/profiles/[role]/[Module].tsx`
2. Wire to real data (APIs, databases, registries)
3. Handle loading states
4. Handle empty states (honest, per Rule 20)
5. No hardcoded data

**Timeline**:
- Week 4: Performer modules (9 modules)
- Week 4-5: Fan modules (8 modules)
- Week 5: Venue (8 modules)
- Week 5: Promoter (7 modules)
- Week 5: Writer (6 modules)
- Week 5: Sponsor (7 modules)

**Success Criteria**:
- ✅ Every role has all modules implemented
- ✅ All data is real
- ✅ No duplicate implementations
- ✅ Consistent styling across all modules

**Deliverable**: Complete CRM ecosystem for all 6 roles

---

## Phase 3: Unified Business Layer (WEEKS 5-6)

**Objective**: One revenue engine consolidates all money flows.

**Financial Flow**:

```
User Action (tip/subscribe/purchase/book)
  ↓
Stripe (payment processor)
  ↓
UnifiedRevenueEngine
  ├─ Identify source (membership/tip/merch/sponsorship/ticket/booking/ad/subscription/royalty)
  ├─ Validate transaction
  ├─ Calculate splits (platform fee, performer share, venue cut, etc.)
  ├─ Track tax withholding (1099, W2, international)
  ├─ Create settlement record
  └─ Queue for next payout cycle
  ↓
SettlementScheduler
  ├─ Daily/weekly/monthly processing
  ├─ Generate payout records
  ├─ Update bank accounts
  └─ Log settlements
  ↓
Business Dashboard (for all roles)
  ├─ Unified revenue view
  ├─ Role-specific breakdowns
  ├─ Real-time metrics
  ├─ Pending payouts
  ├─ Tax documents
  └─ Settlement history
```

**Systems to Consolidate**:
- Membership tier income (subscription)
- Tips (direct audience → performer)
- Merchandise (inventory + sales)
- Sponsorships (brand partnerships)
- Ticket sales (venue box office)
- Bookings (service commissions)
- Ads (display + programmatic)
- Subscriptions (fan club, premium features)
- Royalties (music streams, article reads)
- Digital products (beats, NFTs, courses)

**Implementation**:
- [ ] UnifiedRevenueEngine (consolidates all sources into canonical revenue)
- [ ] SettlementScheduler (automates payouts)
- [ ] TaxCompliance (tracks withholding, generates forms)
- [ ] RevenueReporting (APIs for dashboards)
- [ ] Business Dashboard (executive view of all revenue)

**Success Criteria**:
- ✅ Every dollar has ONE canonical path from collection to settlement
- ✅ No data duplicated across systems
- ✅ Admin sees total platform revenue in real-time
- ✅ Each performer/venue/promoter sees exact earnings + pending payouts
- ✅ Tax withholding is automatic and transparent
- ✅ Settlement scheduler never fails

**Deliverable**: Unified Business Layer with consolidated revenue engine

---

## Phase 4: Runtime Humanity (WEEKS 4-6, CONCURRENT WITH PHASES 2-3)

**Objective**: Crowds, stages, and venues feel alive through emergent behavior.

**Four Layers** (each builds on previous):

### Layer 1: Attention (Mostly Built)
- [ ] Avatars look at stage
- [ ] Attention shifts when action happens
- [ ] Contagion spreads through crowd
- [ ] Energy meters drive intensity

**Status**: ~85% complete. Needs minor fixes.

---

### Layer 2: Behavior
- [ ] Talking (mouths move, hand gestures)
- [ ] Cheering (body shakes, arms up)
- [ ] Waving (hand motion to stage/friends)
- [ ] Recording (phones raised, following performer)
- [ ] Dancing (context-aware, not always)
- [ ] Sitting (varied postures, not uniform)
- [ ] Standing (when energy is high)
- [ ] Laughing (body shake, head tilt)
- [ ] Reacting to specific moments (surprises, reveals, jokes)

**Status**: ~50% complete. Needs significant work.

---

### Layer 3: Environment
- [ ] LED wall transitions (reacting to music/energy)
- [ ] Moving lights (following performers, reacting to beats)
- [ ] Smoke/fog timing (not random, contextual)
- [ ] Crowd waves (spontaneous energy ripples)
- [ ] Sponsor activations (timed, not spammy)
- [ ] Confetti (celebratory moments only)
- [ ] Floor reflections (stage lights reflected on floor)
- [ ] Ambient sound (crowd voices, background movement)

**Status**: ~40% complete. Needs environmental build-out.

---

### Layer 4: Micro Humanity
- [ ] Blinking (random but realistic 3-4 per minute)
- [ ] Breathing (subtle chest movement)
- [ ] Weight shifting (left-right, ~5-10 sec cycles)
- [ ] Looking at phones (occasional, natural)
- [ ] Scratching head (small distractions)
- [ ] Adjusting clothes (fidgeting, naturalness)
- [ ] Turning to friends (talking motions)
- [ ] Taking sips from cups (if applicable)

**Status**: ~30% complete. Needs detail pass.

---

**Implementation Strategy**:

Complete layers sequentially:
1. **Week 4**: Layer 1 (attention) — fix remaining issues
2. **Week 4-5**: Layer 2 (behavior) — primary implementation
3. **Week 5-6**: Layer 3 (environment) — visual effects
4. **Week 6**: Layer 4 (micro humanity) — polish details

**Success Criteria**:
- ✅ Idle crowd never looks frozen
- ✅ Reactions feel organic, not synchronized
- ✅ Attention spreads naturally through crowd
- ✅ Each avatar is distinct in behavior
- ✅ Contagion timing matches human psychology
- ✅ Environment reacts to energy/music
- ✅ Level 3 Experience Certification passes

**Deliverable**: Crowds feel alive. Stages feel real. Venues feel cinematic.

---

## Phase 5: Venue Life (WEEKS 6-7)

**Objective**: Venues are operational spaces with visible, responsive staff.

**Visible NPCs** (different for each venue type):

- Camera operators (dynamic positioning, following performers)
- DJ (at turntables, mixing, visible reactions)
- Host/Announcer (visible, speaking, interacting)
- Security (posted at entry/exit, alert)
- Photographers (moving, capturing moments)
- Lighting technician (adjusting rigs, responding)
- Bartenders (serving, moving behind bar)
- Merch booth staff (selling, displaying)
- Sponsor representatives (at branded zones)
- Ushers (helping performers/guests)

**Operational Details**:
- Staff react to performances
- Animations are natural (walking, gesturing)
- Staff visible during entire performance
- NPCs are interactive (can speak to, ask for info)
- Venue feels staffed, not empty

**Implementation**:
- [ ] VenueLifeEngine (NPC spawning, behavior)
- [ ] NPCBehavior system (reaction logic)
- [ ] VenueType configurations (different staff for different venues)
- [ ] Interaction system (player can speak to NPCs)

**Success Criteria**:
- ✅ Every venue has 5+ visible staff members
- ✅ Staff positioned naturally throughout venue
- ✅ Reactions to performance energy
- ✅ Level 3 Experience Certification: "Venue feels like a real event"

**Deliverable**: Venues are living, breathing event spaces

---

## Phase 6: Mobile Parity (WEEKS 7-8)

**Objective**: Mobile is redesigned for native feel, not shrunk from desktop.

**Mobile-Specific Design** (NOT responsive):
- Bottom navigation (thumb-natural)
- Vertical scrolling (natural mobile behavior)
- Large touch targets (48x48px minimum)
- Gesture-based (swipe, tap, long-press)
- Full-screen live rooms (portrait mode primary)
- Simplified navigation (max 3 taps to feature)

**Mobile-Specific Features**:
- Push notifications (background alerts)
- Background audio (listen with screen off)
- Offline support (cache data)
- Haptic feedback (vibration feedback)
- Battery efficiency (reduced animation on low power)
- Home screen widgets (quick stats)

**Performance**:
- <2s load on 4G
- 60fps animations
- <50MB bundle
- Offline-first where possible

**Implementation**:
- [ ] Create mobile-native layouts for each major surface
- [ ] Build native iOS + Android apps (or React Native)
- [ ] 100% feature parity with web
- [ ] Mobile-first UX, not desktop-first

**Success Criteria**:
- ✅ Mobile app feels native
- ✅ All major journeys work on mobile
- ✅ Performance targets met
- ✅ Soft launch can be mobile + web equally

**Deliverable**: Native mobile experience

---

## Phase 0: Onboarding Excellence (WEEKS 1-8, PARALLEL)

**Objective**: New user → first meaningful action in <5 minutes.

**User Journey**:

```
Minute 1: Sign up
  Email or social sign-in
  Email verified in-app
  
Minute 2: Role choice
  Fan vs. Performer
  Music/interest selection
  
Minute 3: Avatar creation
  Photo upload or template
  Name + bio
  Skip to defaults OK
  
Minute 4: Enter live room
  Show 3-5 rooms happening now
  Click "Join"
  Instant seat + audience + performer + chat
  
Minute 5: First action
  Send reaction (clap/wave/heart)
  OR follow performer
  OR send tip
  Celebration moment
```

**Running continuously**:
- Test onboarding daily
- Fix friction points immediately
- Optimize conversion at each step
- A/B test variations

**Success Metrics**:
- [ ] Signup → first live room: <5 minutes
- [ ] First reaction sent: >70% of users
- [ ] Day 1 return rate: >60%
- [ ] First purchase: >15% within 7 days

**Deliverable**: Frictionless onboarding that converts to engaged users

---

## Phase 7: Soft Launch Certification (WEEK 8+)

**Objective**: Prove every system works under production load.

**Certification areas** (from original roadmap):
- Performance, Payments, Live Streaming, Notifications, Discovery, Moderation, Analytics, Failover

**Success Criteria**:
- ✅ All systems certified
- ✅ Zero critical bugs
- ✅ Rule 20: Zero fake data
- ✅ Build Director approval

**Deliverable**: Production-ready platform

---

## Timeline Summary

```
Week 1-2:  Phase 1 (Live Session Chain) [+ Phase 0 Onboarding]
Week 3-4:  Phase 2A (Shared Identity) [+ Phase 0]
Week 4-5:  Phase 2B (Business Modules) [+ Phase 0]
Week 5-6:  Phase 3 (Business Layer) [+ Phase 0]
Week 4-6:  Phase 4 (Humanity - 4 layers) [CONCURRENT, + Phase 0]
Week 6-7:  Phase 5 (Venue Life) [+ Phase 0]
Week 7-8:  Phase 6 (Mobile Parity) [+ Phase 0]
Week 8+:   Phase 7 (Soft Launch Cert)

Total: 8 weeks from pre-audit to soft launch ready
```

---

## Gating Criteria

**Phase 1 → 2A**:
- Level 1 + 2 certs pass
- All 15 surfaces wired and verified

**Phase 2A → 2B**:
- IdentityModule deployed to all 6 role types
- Data is real, no hardcoding

**Phase 2B → 3**:
- All business modules functional
- No duplicate implementations

**Phase 3 → 7**:
- Phases 1-6 complete
- No critical bugs
- Rule 20 audit passes

---

## Authority

**This execution sequence is LOCKED.**

No changes without explicit Build Director approval.

Every task follows this sequence.

No jumping ahead.

No parallel work on later phases before gatekeeping criteria met.

---

## The North Star

Every decision answers this question:

> **Does this move us closer to proving the platform works and making it feel alive?**

If yes: Do it.  
If no: Skip it.

Connect. Prove. Polish. Launch.

Nothing else matters until those four things are done.
