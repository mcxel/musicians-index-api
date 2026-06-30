# TMI Platform — Master Roadmap (LOCKED 2026-06-25)

**Strategic Direction**: Connect existing systems, prove them work, polish the user experience, then launch.

**Overall Progress**: ~75–80% complete toward production platform.

**Time to Soft Launch**: ~6–8 weeks with focused execution.

---

## Phase 1: Live Session Chain (WEEKS 1-2)

**Objective**: One GO LIVE action updates every surface in the platform.

**Deliverable**: Unified live session registry that is the single source of truth.

**What Gets Wired**:

```
GO LIVE
  ↓
GlobalLiveSessionRegistry (canonical, read-only)
  ↓
Homepage (Home 3, live now section)
  ↓
Discovery (DiscoveryRail across all pages)
  ↓
Search (live filter active)
  ↓
Notifications (followers alerted)
  ↓
Billboards (Home 1-2 updated)
  ↓
Magazine (live modules updated)
  ↓
Admin Dashboard (live rooms visible)
  ↓
Venue Dashboard (venue sees its live rooms)
  ↓
Promoter Dashboard (promoter sees events)
  ↓
Mobile (native app updated)
  ↓
APIs (all clients synchronized)
  ↓
Analytics (real-time metrics)
  ↓
Ranking Systems (live performers ranked)
```

**Success Criteria**:
- [ ] Level 1 Runtime Certification passes
- [ ] Level 2 Integration Certification passes
- [ ] One GO LIVE action triggers updates in all 15 surfaces within 2 seconds
- [ ] No stale data visible on any surface
- [ ] Admin can monitor all live sessions in real-time
- [ ] Followers receive notifications immediately
- [ ] Discovery rail shows live performers ranked by energy/engagement
- [ ] Mobile app reflects live status instantly

**Tools Ready**:
- RuntimeCertificationSuite (ready)
- IntegrationCertificationSuite (ready)
- AttentionDebugOverlay (ready)

---

## Phase 2: CRM Ecosystem (WEEKS 3-5)

**Objective**: Every role has a complete profile with Identity + Business layers.

### Layer A: Identity (Shared Across All Roles)

Every profile displays:
- [ ] Verified status
- [ ] XP + Level
- [ ] Rank (within role)
- [ ] Membership tier (FREE → DIAMOND)
- [ ] Badges & Achievements
- [ ] Trust score
- [ ] Followers count
- [ ] Following count
- [ ] Statistics dashboard
- [ ] Reputation (tips given/received, positive interactions)

**Component**: `components/profiles/IdentityModule.tsx`

---

### Layer B: Business (Role-Specific)

#### Performer CRM

Profile must include:
- [ ] Tips received (today, week, month, year)
- [ ] Bookings (requested, scheduled, completed, cancelled)
- [ ] Ticket sales (per venue, per event type)
- [ ] Sponsorships (active, completed, revenue)
- [ ] Subscriptions (subscriber count, revenue, growth)
- [ ] Merchandise (inventory, sales, revenue)
- [ ] Royalties (streams, earnings)
- [ ] Analytics (fan conversion, livestream metrics, engagement)
- [ ] Payout center (Stripe connected, scheduled payouts, tax forms)

**Component**: `components/profiles/performer/PerformerCRM.tsx`

---

#### Fan CRM

Profile must include:
- [ ] Memories (gallery of captures, reactions, moments)
- [ ] Playlists (saved, created, shared)
- [ ] Collections (favorite performers, events, music)
- [ ] Favorite performers (ranked, sorted by last visit)
- [ ] Purchases (tickets, merch, subscriptions, tips)
- [ ] Rewards (XP, coins, badges, unlocked cosmetics)
- [ ] Event history (attended, upcoming, wishlist)
- [ ] Watch history (streams, articles, interviews)
- [ ] Supporter history (how much tipped, which performers)
- [ ] Friend network (followers, following, collaborators)
- [ ] Subscriptions (active memberships, tier benefits)

**Component**: `components/profiles/fan/FanCRM.tsx`

---

#### Venue CRM

Profile must include:
- [ ] Calendar (bookings, events, staff schedule)
- [ ] Bookings (requests, scheduled, completed, revenue)
- [ ] Capacity management (seating, VIP, general admission)
- [ ] Ticket sales (by tier, by event, total revenue)
- [ ] Room analytics (occupancy, engagement, revenue per event)
- [ ] Equipment inventory (stages, lighting, audio, visual)
- [ ] Staff management (roles, schedules, payroll)
- [ ] Sponsor relationships (active, revenue, placements)
- [ ] Settlements (revenue share, payouts, accounting)

**Component**: `components/profiles/venue/VenueCRM.tsx`

---

#### Promoter CRM

Profile must include:
- [ ] Campaign manager (active, archived, ROI)
- [ ] Venue relationships (roster, booking requests, terms)
- [ ] Performer roster (represented, event history)
- [ ] Budgets (monthly, event-based, campaign-based)
- [ ] Ads & placements (spent, impressions, CTR)
- [ ] Contracts (terms, parties, status)
- [ ] Settlements (revenue, payments, disputes)
- [ ] Event pipeline (prospect, in-progress, completed)

**Component**: `components/profiles/promoter/PromoterCRM.tsx`

---

#### Writer CRM

Profile must include:
- [ ] Drafts (working documents, auto-saved)
- [ ] Published articles (with readership stats)
- [ ] Interviews (with subjects, published date)
- [ ] Article queue (scheduled for publication)
- [ ] Editorial workflow (submitted, under review, approved, published)
- [ ] Assignments (editors assign articles)
- [ ] Earnings (per article, royalties)
- [ ] Readership analytics (views, shares, average read time)

**Component**: `components/profiles/writer/WriterCRM.tsx`

---

#### Sponsor CRM

Profile must include:
- [ ] Active campaigns (spent, impressions, CTR, conversions)
- [ ] Creative assets (logos, banners, videos, copy)
- [ ] Performer partnerships (exclusive deals, endorsements)
- [ ] Conversions (clicks, signups, purchases traced back to sponsor)
- [ ] Invoices & billing (payment history, upcoming charges)
- [ ] ROI dashboard (cost per acquisition, revenue attributed)
- [ ] Report center (download analytics, custom reports)

**Component**: `components/profiles/sponsor/SponsorCRM.tsx`

---

### Unified Business Dashboard

**Location**: `/hub/business` (accessible by all roles with financial activity)

**Displays**:
```
Total Revenue (this month)
├─ Memberships
├─ Tips
├─ Merchandise
├─ Sponsorships
├─ Ticket Sales
├─ Bookings
├─ Ads
├─ Subscriptions
├─ Royalties
└─ Digital Products

Next Payout (date, amount)
Pending Settlements
Recent Transactions
Analytics (growth, trends, forecasts)
```

**Component**: `components/hq/UnifiedBusinessDashboard.tsx`

---

**Success Criteria**:
- [ ] All 6 role profiles complete (Performer, Fan, Venue, Promoter, Writer, Sponsor)
- [ ] Identity module visible on all profiles
- [ ] Business layer visible and functional for role-specific metrics
- [ ] Unified Business Dashboard aggregates all revenue sources
- [ ] No hardcoded data (Rule 20: all data is real or honest empty state)
- [ ] All APIs wired to real data sources

---

## Phase 3: Business Layer Unification (WEEK 5-6)

**Objective**: One consolidated revenue engine instead of fragmented systems.

**What Gets Unified**:

```
Revenue Sources
├─ Membership Tier Income (FREE → DIAMOND)
├─ Tips (audience to performer)
├─ Merchandise (inventory + sales)
├─ Sponsorships (brand partnerships)
├─ Ticket Sales (venue box office)
├─ Bookings (service transactions)
├─ Ads (display + sponsored content)
├─ Subscriptions (fan club, premium features)
├─ Royalties (music streaming, article reads)
└─ Digital Products (beats, NFTs, courses)

Flow
├─ Collection (from user → Stripe)
├─ Processing (platform fees, taxes, splits)
├─ Settlement (to recipient)
└─ Reporting (unified dashboard)
```

**What Gets Built**:
- [ ] UnifiedRevenueEngine (consolidates all sources)
- [ ] SettlementScheduler (calculates, queues, executes payouts)
- [ ] TaxCompliance (tracks withholding, generates forms)
- [ ] RevenueReporting (unified dashboard, role-specific views)
- [ ] FinancialAPI (for analytics, forecasting)

**Success Criteria**:
- [ ] Every dollar has a single canonical path from collection to settlement
- [ ] No data duplicated across systems
- [ ] Admin can see total platform revenue in real-time
- [ ] Each performer/venue/promoter can see their exact earnings and pending payouts
- [ ] Tax withholding is automatic and transparent

---

## Phase 4: Runtime Humanity (WEEKS 4-6, CONCURRENT WITH PHASES 2-3)

**Objective**: The crowd doesn't just sit. It *acts*.

**What Gets Implemented**:

### Avatar Micro-Behaviors

Every seated avatar should constantly make believable decisions:
- [ ] Shifting weight (left to right, subtle, ~5-10 sec cycles)
- [ ] Looking around (eyes scanning, not locked forward)
- [ ] Checking phones (occasional phone raises, scrolls)
- [ ] Reactions to action (clapping, cheering when relevant)
- [ ] Talking (mouth movement, hand gestures when speaking)
- [ ] Laughing (body shake, head tilt when funny moment)
- [ ] Waving (to friends, to performers)
- [ ] Recording videos (phones raised, follow performer)
- [ ] Dancing (when music suggests it)
- [ ] Cheering (at milestones, victories, reveals)
- [ ] Drinking (occasional sips from cups)
- [ ] Entering (walking to seat, sitting smoothly)
- [ ] Leaving (standing, walking out naturally)

**Not scripted.** Emergent based on energy level and event type.

**Engine**: `lib/engines/runtime/HumanityEngine.ts`

### Attention Contagion

When one avatar reacts, nearby avatars should:
- [ ] Notice the reaction
- [ ] Look in the same direction
- [ ] Amplify the reaction (if positive)
- [ ] Join in (clap if others clap)
- [ ] Spread through the crowd (not instantly, but in waves)

**Engine**: `lib/engines/runtime/AttentionContagion.ts` (enhance existing)

### Crowd Realism

Avoid synchronized movement:
- [ ] Vary timing (applause peaks at different moments)
- [ ] Vary intensity (not everyone claps equally hard)
- [ ] Vary participation (some sit it out)
- [ ] Vary focus (not everyone looks at stage)
- [ ] Add noise (ambient voices, background movement)

**Engine**: `lib/live/CrowdHumanityEngine.ts`

---

**Success Criteria**:
- [ ] Idle crowd never looks frozen (always subtle movement)
- [ ] Reactions feel organic, not synchronized
- [ ] Attention spreads through the crowd naturally
- [ ] Each avatar is distinct in behavior
- [ ] Contagion timing matches realistic human psychology
- [ ] Level 3 Experience Certification passes (human reviewers confirm it feels alive)

---

## Phase 5: Venue Life (WEEKS 6-7)

**Objective**: Venues are places, not just backgrounds.

**What Gets Populated**:

### Visible Staff

Venues should display:
- [ ] Camera operators (following performers, capturing angles)
- [ ] DJ (mixing tracks, visible at turntables)
- [ ] Announcer/Host (visible, speaking, interacting with audience)
- [ ] Security (positioned at entry/exit, visible)
- [ ] Photographers (capturing moments, moving around)
- [ ] Lighting technician (responding to events)
- [ ] Bartenders (visible at bar area if applicable)
- [ ] Merch booths (staffed, displaying inventory)
- [ ] Sponsor representatives (at sponsor zones)
- [ ] Ushers (helping performers/guests)

### Venue Behavior

These NPCs should:
- [ ] React to events (applause, performances, announcements)
- [ ] Animate naturally (walking, gesturing, reacting)
- [ ] Be interactive (take requests, provide information)
- [ ] Remain visible during performances
- [ ] React appropriately to performance energy

**Engine**: `lib/engines/runtime/VenueLifeEngine.ts`

---

**Success Criteria**:
- [ ] Every venue has at least 5 visible staff members
- [ ] Staff are positioned naturally and react to events
- [ ] Level 3 Experience Certification confirms venues feel like real places
- [ ] Mobile/web versions both show venue staff

---

## Phase 6: Mobile Parity (WEEKS 7-8)

**Objective**: Mobile is not a scaled desktop. It's a redesigned experience.

**Not scaled. Redesigned.**

### Mobile-Specific Layouts

For each major surface:
- [ ] Home → Bottom navigation, vertical scrolling, swipe gestures
- [ ] Live rooms → Portrait mode, larger controls, gesture-based interactions
- [ ] Profiles → Vertical card-based layout, simplified navigation
- [ ] Chat → Full-screen conversation, mobile keyboard friendly
- [ ] Discovery → Swipe-through cards, quick reactions
- [ ] Analytics → Mobile-optimized charts, finger-scrollable tables

### Mobile-Specific Features

- [ ] Push notifications (in addition to in-app)
- [ ] Background audio (continue listening when screen off)
- [ ] Offline support (cache recent data)
- [ ] Native gesture controls (swipe, tap, long-press)
- [ ] Mobile-optimized video (adaptive bitrate)
- [ ] Battery efficiency (reduce animation on low power)
- [ ] Haptic feedback (vibration on actions)

### Mobile Performance

- [ ] <2s load time on 4G
- [ ] 60fps animations
- [ ] <50MB app bundle
- [ ] Offline-first where possible
- [ ] Sync when online

---

**Success Criteria**:
- [ ] Mobile app feels native, not web-wrapped
- [ ] All major user journeys work on mobile
- [ ] Performance metrics met (load time, FPS, bundle size)
- [ ] Soft launch can include iOS + Android + Web equally

---

## Phase 7: Soft Launch Certification (WEEKS 8+)

**Objective**: Prove the platform is production-ready.

### Certification Areas

#### Performance
- [ ] <2s page load time
- [ ] 60fps animations
- [ ] Crowd scaling to 5000+ avatars
- [ ] Concurrent live streams (100+)
- [ ] Database queries optimized

#### Payments
- [ ] Stripe integration stable
- [ ] Refunds processed correctly
- [ ] Tax withholding accurate
- [ ] Settlement scheduling reliable
- [ ] No failed transactions

#### Live Streaming
- [ ] RTMP ingest stable
- [ ] HLS playback reliable
- [ ] Audio/video sync correct
- [ ] Chat latency <1 second
- [ ] CDN delivery global

#### Notifications
- [ ] Email delivery >99%
- [ ] Push notifications <2s latency
- [ ] In-app notifications real-time
- [ ] Unsubscribe honored
- [ ] No spam complaints

#### Discovery
- [ ] Search works for all entity types
- [ ] DiscoveryRail ranking algorithm stable
- [ ] Fresh content surfaces properly
- [ ] No dead links anywhere
- [ ] All CTAs route to real destinations

#### Moderation
- [ ] Chat filtering works
- [ ] Report workflow functions
- [ ] Admin can ban/mute quickly
- [ ] Logs complete and audit-able

#### Analytics
- [ ] Real-time metrics accurate
- [ ] Historical data consistent
- [ ] Forecasting models stable
- [ ] Reports generate without errors

#### Failover
- [ ] Database failover <2s
- [ ] CDN failover transparent
- [ ] API rate limiting active
- [ ] Cache invalidation working
- [ ] Error handling comprehensive

#### Onboarding
- [ ] Signup <2 minutes
- [ ] Avatar creation intuitive
- [ ] First live room entry smooth
- [ ] First follow/tip/reaction obvious
- [ ] Retention after day 1 >60%

---

**Success Criteria**:
- [ ] All certification areas pass
- [ ] Rule 20 audit shows zero fake data
- [ ] User testing with 100+ testers
- [ ] Zero critical bugs reported
- [ ] Mobile + Web both stable
- [ ] Build Director approval to launch

---

## Phase 0 (PARALLEL): Onboarding Excellence (WEEKS 1-8)

**Objective**: First 5 minutes determine if a user stays.

**Deliverable**: Frictionless path from signup to first meaningful action.

### New User Journey

**Minute 1: Signup**
- [ ] Email signup (or social sign-in)
- [ ] Password creation (or skip for social)
- [ ] Email verification (instant, in-app)

**Minute 2: Role Choice**
- [ ] Choose Fan or Performer (clear differences)
- [ ] Skip or complete onboarding questions
- [ ] Select music interests

**Minute 3: Avatar Creation**
- [ ] Quick avatar builder (not full customization)
- [ ] Upload photo OR select template
- [ ] Name + bio
- [ ] Skip to defaults if preferred

**Minute 4: Enter a Live Room**
- [ ] Show 3-5 live rooms happening right now
- [ ] Click "Join" → instant entry
- [ ] See audience, performer, chat
- [ ] Reaction buttons visible

**Minute 5: First Action**
- [ ] User sends reaction (clap, wave, heart)
- [ ] Or follows performer
- [ ] Or tips (if payment ready)
- [ ] Celebration moment (positive feedback)

### Onboarding Metrics

- [ ] Signup to first live room: <5 minutes
- [ ] First reaction sent: >70% of users
- [ ] Day 1 return rate: >60%
- [ ] First purchase within 7 days: >15%

**Component**: `components/onboarding/OnboardingFlow.tsx`

---

**Success Criteria**:
- [ ] Every step feels effortless
- [ ] No form abandonment
- [ ] Users understand the platform by minute 5
- [ ] Level 3 Experience Certification: "I know what to do next"

---

## Completion Criteria by Phase

| Phase | Criteria | Owner |
|-------|----------|-------|
| Phase 1 | Level 2 Cert passes | Runtime team |
| Phase 2 | All 6 CRM profiles done | Profile team |
| Phase 3 | Revenue engine unified | Payment team |
| Phase 4 | Level 3 Cert passes | Avatar/runtime team |
| Phase 5 | Venue NPCs visible | Avatar team |
| Phase 6 | Mobile parity verified | Mobile team |
| Phase 7 | All cert areas pass | QA + integration team |
| Phase 0 | <5 min user journey | UX team |

---

## Resource Allocation

**Priority Order**:
1. **Phase 1 (Live Session Chain)** → BLOCKING, must finish first
2. **Phase 0 (Onboarding)** → PARALLEL, can work simultaneously
3. **Phase 2 (CRM)** → STARTS after Phase 1 passes, highest business value
4. **Phase 4 (Humanity)** → PARALLEL with Phase 2-3
5. **Phase 3 (Business Layer)** → FOLLOWS Phase 2
6. **Phase 5 (Venue Life)** → FOLLOWS Phase 4
7. **Phase 6 (Mobile)** → FOLLOWS Phase 2-3 (design complete, implementation concurrent)
8. **Phase 7 (Soft Launch)** → FINAL gate before production

---

## Timeline

```
Week 1-2:     Phase 1 (Live Session Chain)
Week 1-8:     Phase 0 (Onboarding Excellence) [PARALLEL]
Week 3-5:     Phase 2 (CRM Ecosystem)
Week 4-6:     Phase 4 (Runtime Humanity) [PARALLEL with Phase 2]
Week 5-6:     Phase 3 (Business Layer)
Week 6-7:     Phase 5 (Venue Life)
Week 7-8:     Phase 6 (Mobile Parity)
Week 8+:      Phase 7 (Soft Launch Certification)
```

**Total**: 8 weeks to feature-complete + soft launch certification

---

## Success Metrics at Launch

| Metric | Target |
|--------|--------|
| Visual Polish | 90%+ |
| Runtime Stability | 99.5%+ uptime |
| User Retention (Day 1) | 60%+ |
| User Retention (Week 1) | 40%+ |
| Payment Success Rate | 99%+ |
| Live Stream Quality | <500ms latency |
| Search Relevance | Top 3 results relevant |
| Mobile Parity | 100% feature parity |
| Support Tickets | <0.1% of users in first week |

---

## Launch Readiness Checklist

- [ ] Phase 1: Live Session Chain complete + certified
- [ ] Phase 2: All CRM profiles complete
- [ ] Phase 3: Business layer unified
- [ ] Phase 4: Crowd feels alive (Level 3 passes)
- [ ] Phase 5: Venues have visible staff
- [ ] Phase 6: Mobile fully functional
- [ ] Phase 7: All soft launch certifications pass
- [ ] Phase 0: Onboarding smooth (<5 min path)
- [ ] Rule 20: Zero fake data or dead buttons
- [ ] Performance: All targets met
- [ ] Build Director: Final approval given

---

## What Success Looks Like

A new user:
1. Signs up in 1 minute
2. Creates an avatar in 2 minutes
3. Enters a live room in 30 seconds
4. Sends their first reaction
5. Follows a performer
6. Understands how to tip/book/subscribe
7. Feels the platform is alive, responsive, cinematic
8. Returns the next day

A performer:
1. Goes live with one button
2. Sees their room on Home 3, Discovery, Billboards, Notifications immediately
3. Watches the audience fill organically
4. Feels the crowd energy through attention signals
5. Earns money instantly (tips appear in real-time)
6. Understands their analytics at a glance

A business partner (Venue, Promoter, Sponsor):
1. Logs in to their dashboard
2. Sees revenue, bookings, conversions in one place
3. Makes data-driven decisions
4. Feels the platform is sophisticated and professional

---

**This roadmap is locked. No changes without Build Director approval.**

**Master directive: Connect, prove, polish, launch.**
