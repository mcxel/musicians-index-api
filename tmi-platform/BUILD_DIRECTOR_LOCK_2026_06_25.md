# Build Director Strategic Lock (2026-06-25)

**Established by**: Marcel Dickens (Build Director)  
**Status**: LOCKED — No changes without explicit approval  
**Authority**: Overrides all prior guidance, roadmaps, and priorities

---

## The Strategic Directive

> **Take what already exists. Connect it together. Prove it works. Then polish it until it feels alive.**

This is the North Star for all work until soft launch.

---

## Platform Status

| Area | Current | Target | Confidence |
|------|---------|--------|------------|
| Overall Progress | 85–88% | Soft Launch | High |
| Visual Design | 95% | 95% | Complete |
| Runtime Architecture | 80% | 100% | High |
| Live Infrastructure | 80% | 100% | High |
| CRM Ecosystem | 55% | 100% | Medium |
| Business Layer | 60% | 100% | Medium |
| Runtime Humanity | 65% | 100% | High |
| Mobile | 45% | 100% | Medium |

---

## Execution Sequence (LOCKED)

### Phase 1: Live Session Chain (WEEKS 1-2)
**Objective**: One GO LIVE button updates all 15 surfaces.

**Success Criteria**:
- ✅ Level 1 Runtime Certification passes (5/5 tests)
- ✅ Level 2 Integration Certification passes (7/7 tests)
- ✅ GO LIVE → 15 destinations in <2 seconds
- ✅ Zero fake data on any live surface
- ✅ Zero dead links
- ✅ Admin can monitor all live rooms
- ✅ Followers notified immediately
- ✅ Mobile + Web synchronized

**Destinations**:
1. GlobalLiveSessionRegistry (canonical source)
2. Homepage (Home 3)
3. Discovery Rail
4. Billboards (Home 1-2)
5. Search
6. Notifications
7. Admin Dashboard
8. Venue Dashboard
9. Promoter Dashboard
10. Magazine (live modules)
11. Mobile app
12. APIs
13. Analytics
14. Ranking systems
15. (Implicit: all discovery surfaces)

**Certification Path**:
```
Day 1: Run Level 1 + Level 2 certs
Days 2-3: Audit current GO LIVE implementation
Days 4-7: Wire all 15 destinations
Days 8-10: Validate end-to-end
```

**Deliverable**: GO LIVE button is the single authoritative trigger for all live events.

---

### Phase 2: CRM Ecosystem (WEEKS 3-5)
**Objective**: Every role has a complete, functional profile.

**Identity Layer** (shared across all roles):
- [ ] Verified badge
- [ ] XP + Level
- [ ] Rank (within role)
- [ ] Membership tier (FREE → DIAMOND)
- [ ] Badges & Achievements
- [ ] Trust score
- [ ] Followers/Following
- [ ] Statistics dashboard

**Business Layers** (role-specific):

**Performer**:
- Revenue center (tips, bookings, sponsors, subscriptions, merch, royalties)
- Analytics (fan conversion, livestream metrics, engagement)
- Payout center (Stripe connected, schedules, taxes)

**Fan**:
- Collections (favorite performers, events, music)
- Memories (gallery of moments, reactions)
- Playlist manager
- Event history
- Purchase history
- Rewards dashboard
- XP/achievement tracker

**Venue**:
- Calendar (bookings, events, staff)
- Booking management
- Capacity & seating
- Ticket dashboard
- Staff roster
- Equipment inventory
- Financial reports

**Promoter**:
- Campaign manager (active, archived, ROI)
- Venue relationships
- Performer roster
- Budget tools
- Contracts & settlements
- Event pipeline

**Writer**:
- Editorial workflow (drafts, submitted, published)
- Article queue
- Analytics (readership, earnings)
- Assignments
- Publishing schedule

**Sponsor**:
- Campaign builder (active campaigns, creatives)
- Performance metrics (impressions, CTR, conversions)
- Performer partnerships
- Billing & contracts
- ROI dashboard

**Completion Target**: 100% across all roles

**Deliverable**: Every user has a functional profile operating system for their role.

---

### Phase 3: Unified Business Layer (WEEKS 5-6)
**Objective**: One revenue engine, not six fragmented systems.

**Financial Flow**:
```
User Action (tip/subscribe/purchase/book)
  ↓
Stripe (payment gateway)
  ↓
UnifiedRevenueEngine
  ├─ Identify source (membership/tip/merch/sponsorship/ticket/booking/ad/subscription/royalty)
  ├─ Calculate splits (platform fee, performer share, venue share, etc.)
  ├─ Track tax withholding
  └─ Queue settlement
  ↓
Settlement Scheduler
  ├─ Process daily/weekly/monthly
  ├─ Generate payout records
  └─ Update bank accounts
  ↓
Business Dashboard
  ├─ Unified revenue view
  ├─ Role-specific breakdowns
  ├─ Real-time metrics
  └─ Tax/legal documents
```

**Systems to consolidate**:
- Membership tier revenue
- Tips (direct audience → performer)
- Merchandise sales
- Sponsorship deals
- Ticket sales (venue box office)
- Booking commissions
- Ad revenue
- Subscription fees
- Royalties (music streams, articles)
- Digital products (beats, NFTs, courses)

**Completion Target**: Every dollar has a single, auditable path from collection to settlement.

**Deliverable**: Unified Business Dashboard where any role can see their complete financial picture.

---

### Phase 4: Runtime Humanity (WEEKS 4-6, CONCURRENT)
**Objective**: Crowds, stages, and venues feel alive through emergent behavior.

**Audience Behaviors**:
- [ ] Shifting weight (subtle, 5-10 sec cycles)
- [ ] Looking around (eyes scanning, not locked forward)
- [ ] Checking phones (occasional, natural)
- [ ] Reactions (clapping, cheering, dancing)
- [ ] Talking (mouth movement, hand gestures)
- [ ] Laughing (body shake, head tilt)
- [ ] Waving (to friends, to performers)
- [ ] Recording videos (phones raised, following)
- [ ] Dancing (context-aware)
- [ ] Entering/leaving (smooth walk animations)

**Attention Contagion**:
- One avatar reacts → nearby avatars notice
- Reaction spreads in waves (not synchronized)
- Timing varies (realistic psychology)
- Intensity varies (not everyone equally invested)

**Stage Behaviors**:
- [ ] Camera operators (visible, following)
- [ ] DJ (mixing, animated at turntables)
- [ ] Announcer/Host (visible, speaking, interacting)
- [ ] Security (positioned at entry/exit)
- [ ] Photographers (moving, capturing)
- [ ] Lighting technician (responding to events)
- [ ] Bartenders (if applicable)
- [ ] Merch booths (staffed, visible)
- [ ] Sponsor reps (at sponsor zones)

**Environment**:
- [ ] LED wall transitions
- [ ] Moving lights (reacting to energy)
- [ ] Smoke/fog timing
- [ ] Crowd waves (spontaneous energy)
- [ ] Sponsor activations
- [ ] Confetti (timed, not spam)
- [ ] Floor reflections
- [ ] Ambient sound (voices, movement)

**Completion Target**: Venue never feels frozen. Every frame implies activity.

**Deliverable**: Level 3 Experience Certification passes (human reviewers: "This feels alive").

---

### Phase 5: Venue Life (WEEKS 6-7)
**Objective**: Venues are places with operational realism, not just backdrops.

**Visible NPCs**:
- Camera operators (dynamic positioning, following performers)
- DJ (mixing, visible reactions)
- Host/Announcer (speaking, gesturing, interacting with audience)
- Security (posted at entry/exit, alert)
- Photographers (moving around, capturing moments)
- Lighting technician (adjusting rigs, responding to events)
- Bartenders (serving, moving behind bar)
- Merch booth staff (selling, displaying products)
- Sponsor representatives (at branded zones)
- Ushers (helping performers/guests, pointing to seats)

**Operational Details**:
- Staff react to performances (energy, applause, milestones)
- Animations are natural (walking, gesturing, not floating)
- Staff visible during entire performance
- NPCs are interactive (can be spoken to, can provide info)
- Venue feels staffed, not empty

**Completion Target**: Every venue type (arena, concert hall, comedy club, dance floor) has appropriate visible staff.

**Deliverable**: Venues feel like real operational spaces, not just stages.

---

### Phase 6: Mobile Parity (WEEKS 7-8)
**Objective**: Mobile is redesigned for touch and mobile context, not scaled from desktop.

**NOT a responsive version of web.**  
**IS a mobile-native experience.**

**Mobile-Specific Design**:
- Bottom navigation (thumbs naturally reach)
- Vertical scrolling (natural mobile behavior)
- Large touch targets (48x48px minimum)
- Gesture-based interaction (swipe, tap, long-press)
- Full-screen live rooms (portrait mode primary)
- Simplified navigation (max 3 taps to any feature)
- Mobile-optimized charts (finger-scrollable, readable at small size)
- Mobile-optimized video (adaptive bitrate, playback controls sized for touch)

**Mobile-Specific Features**:
- Push notifications (background alerts)
- Background audio (listen with screen off)
- Offline support (cache recent data)
- Native haptic feedback (vibration on actions)
- Battery efficiency (reduced animations on low power)
- Home screen widgets (quick stats)
- App shortcuts (jump to favorites)

**Performance Targets**:
- <2s load time on 4G
- 60fps animations
- <50MB app bundle
- Offline-first where possible
- Sync when online

**Completion Target**: Mobile app feels native and primary, not secondary.

**Deliverable**: Native iOS + Android apps with 100% feature parity with web.

---

### Phase 0: Onboarding Excellence (WEEKS 1-8, PARALLEL)
**Objective**: New user → first meaningful action within 5 minutes.

**User Journey**:
```
Minute 1: Sign up
  ↓ Email or social sign-in
  ↓ Email verified in-app
  
Minute 2: Role choice
  ↓ Fan vs. Performer
  ↓ Music/interest selection
  
Minute 3: Avatar creation
  ↓ Photo upload or template
  ↓ Name + bio
  ↓ Skip to defaults OK
  
Minute 4: Enter live room
  ↓ Show 3-5 rooms happening now
  ↓ Click "Join"
  ↓ Instant seat + audience + performer + chat
  
Minute 5: First action
  ↓ Send reaction (clap/wave/heart)
  ↓ OR follow performer
  ↓ OR send tip
  ↓ Celebration moment (positive feedback)
```

**Success Metrics**:
- [ ] Signup → first live room: <5 minutes
- [ ] First reaction sent: >70% of users
- [ ] Day 1 return rate: >60%
- [ ] First purchase: >15% within 7 days

**Completion Target**: Every new user understands the platform by minute 5.

**Deliverable**: Frictionless onboarding that converts casual visitors to engaged users.

---

### Phase 7: Soft Launch Certification (WEEK 8+)
**Objective**: Prove every system works under production load.

**Certification Areas**:

**Performance**:
- <2s page load
- 60fps animations
- 5000+ avatar scaling
- 100+ concurrent streams
- Optimized queries

**Payments**:
- Stripe integration stable
- Refunds processed correctly
- Tax withholding accurate
- Settlements on schedule
- 99%+ success rate

**Live Streaming**:
- RTMP ingest stable
- HLS playback reliable
- Audio/video sync tight
- Chat latency <1s
- Global CDN delivery

**Notifications**:
- Email >99% delivery
- Push <2s latency
- In-app real-time
- No spam/abuse
- Unsubscribe honored

**Discovery**:
- Search works all entity types
- DiscoveryRail ranking algorithm stable
- Fresh content surfaces
- No dead links
- All CTAs functional

**Moderation**:
- Chat filtering works
- Report workflow functional
- Admin can ban/mute fast
- Logs complete

**Analytics**:
- Real-time metrics accurate
- Historical data consistent
- Forecasting models stable
- Reports error-free

**Failover**:
- Database failover <2s
- CDN failover transparent
- Rate limiting active
- Cache invalidation working

**Completion Target**: Zero critical bugs, all areas certified, Build Director approval.

**Deliverable**: Platform is production-ready for soft launch.

---

## What Gets Built in Each Phase

| Phase | System | Owners | Weeks |
|-------|--------|--------|-------|
| 1 | Live Session Chain | Runtime team | 1-2 |
| 2 | CRM Ecosystem | Profile team | 3-5 |
| 3 | Business Layer | Payment team | 5-6 |
| 4 | Runtime Humanity | Avatar/runtime team | 4-6 |
| 5 | Venue Life | Avatar/world team | 6-7 |
| 6 | Mobile Parity | Mobile team | 7-8 |
| 0 | Onboarding | UX team | 1-8 |
| 7 | Soft Launch Cert | QA + integration | 8+ |

---

## What Does NOT Get Built

❌ New AI systems (beyond existing Big Ace, Nova, etc.)  
❌ Advanced radio network (Phase 25, future)  
❌ Three-lane rewards (Rule 24, future)  
❌ Distributed event architecture (Phase 21, future)  
❌ New game show formats (beyond existing)  
❌ Advanced inventory trading (future)  
❌ Subscription tiers beyond DIAMOND (future)  
❌ Anything not in the 7 phases above

**Rationale**: Every system listed above adds cognitive load. The platform must be proven before expanding.

---

## Certification Gates

### Before Phase 2 Starts
- ✅ Phase 1 complete
- ✅ Level 1 + Level 2 certs pass
- ✅ All 15 GO LIVE destinations wired and verified
- ✅ Build clean (pnpm typecheck, pnpm build pass)

### Before Phase 3 Starts
- ✅ Phase 2 complete
- ✅ All 6 CRM profiles functional
- ✅ No fake data on any profile (Rule 20)
- ✅ Real data APIs wired

### Before Phase 4 Starts
- ✅ Phases 2-3 complete
- ✅ Runtime Humanity test infrastructure ready
- ✅ Avatar systems stable

### Before Phase 7 Starts
- ✅ Phases 1-6 complete
- ✅ All critical features functional
- ✅ No known critical bugs
- ✅ Performance baseline established

---

## What This Roadmap Accomplishes

By end of Week 8:

✅ One authoritative live system (GO LIVE updates everything)  
✅ Complete profile ecosystem for all 6 roles  
✅ Unified business layer (all revenue in one place)  
✅ Crowds that feel alive (not frozen)  
✅ Venues that feel real (visible operations)  
✅ Mobile app that feels native  
✅ Onboarding that converts in 5 minutes  
✅ Everything certified for production  

**Result**: TMI feels like a world-class live entertainment platform, not a website.

---

## Authority

This roadmap overrides:
- Previous priorities
- Competing suggestions
- Optimization requests
- Feature additions
- Architectural redesigns

If someone asks "should we also build X?", the answer is **no** until soft launch.

---

## Build Director Signature

**Approved by**: Marcel Dickens  
**Date**: 2026-06-25  
**Authority**: Final and binding until soft launch  
**Next review**: End of Phase 1 (2026-06-26)

This roadmap will not change.

Execute it exactly as written.

---

## The North Star

Every decision between now and soft launch must answer this question:

> **Does this move us closer to proving the platform works and making it feel alive?**

If yes: Do it.  
If no: Skip it.

That's the filter for every task, every feature, every discussion.

Connect. Prove. Polish. Launch.

Nothing else matters until those four things are done.
