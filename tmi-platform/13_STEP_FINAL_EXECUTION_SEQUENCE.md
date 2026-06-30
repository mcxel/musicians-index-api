# 13-Step Execution Sequence (FINAL LOCKED 2026-06-25)

**Authority**: Build Director (Marcel Dickens)  
**Status**: FINAL AND LOCKED — This is the canonical path to soft launch  
**Supersedes**: All previous roadmap versions

---

## The 13 Steps

### STEP 1: Canonical Architecture Audit (WEEK 1, DAY 1)

**Objective**: Verify there is exactly ONE authoritative implementation for 13 critical systems.

**Audit 13 systems**:
1. Live Sessions → GlobalLiveSessionRegistry
2. User Identity → Universal Profile Runtime
3. Followers / Following → Social Graph Runtime
4. Notifications → Notification Runtime
5. XP → XP Engine
6. Rankings → Ranking Engine
7. Membership Tiers → Tier Engine
8. Revenue → Unified Revenue Engine
9. Inventory → Inventory Runtime
10. Memory Wall → Memory Wall Runtime
11. Chat / Messaging → Messaging Runtime
12. Media Locker → Media Locker Runtime
13. Avatar System → Avatar Runtime

**For each system, answer**:
- Where is the canonical implementation?
- Who writes to it?
- Who reads from it?
- Is there duplicate logic anywhere?
- Is mock data still involved?
- Does every surface use the same source?

**Deliverable**: `CANONICAL_ARCHITECTURE_AUDIT.md` with findings for all 13 systems

**Gate**: All 13 systems must have ONE canonical implementation (or be marked for consolidation)

---

### STEP 2: Live Session Chain Audit (WEEK 1, DAY 2)

**Objective**: Map the complete GO LIVE propagation flow.

**Map**:
```
GO LIVE
  ↓
GlobalLiveSessionRegistry
  ├─ Home 3
  ├─ Discovery
  ├─ Billboards
  ├─ Admin
  ├─ Followers
  ├─ Notifications
  ├─ Venue
  ├─ Search
  ├─ Analytics
  ├─ Mobile
  ├─ Magazine
  ├─ Rankings
  └─ (2 more surfaces)
```

**For each destination**:
- How does it receive updates? (subscribe? poll? API?)
- Latency to update after GO LIVE? (target: <2s)
- Any stale data? (cached/mocked?)
- Any broken routing?

**Deliverable**: `LIVE_SESSION_PROPAGATION_MAP.md` with complete flow and latencies

**Gate**: All 15 surfaces are mapped; any >2s latencies identified

---

### STEP 3: P0 Repairs (WEEK 1, DAYS 3-4)

**Objective**: Fix ONLY blocking issues that prevent core systems from working.

**Fix ONLY**:
- ✅ Broken propagation (GO LIVE doesn't reach a surface)
- ✅ Duplicate registry writes (multiple systems writing same data)
- ✅ Polling that should subscribe (stale data)
- ✅ Mock data still in production paths
- ✅ Broken routing (404s, dead links)
- ✅ API endpoints returning incorrect data

**Do NOT fix**:
- ❌ Cosmetic issues (styling, spacing, colors)
- ❌ Performance optimizations
- ❌ Missing features
- ❌ Refactoring for code quality

**Rule**: If it blocks the 15 core surfaces from updating, fix it. Otherwise, skip it.

**Deliverable**: All P0 issues fixed; P1/P2/P3 issues logged for later

**Gate**: All blocking issues resolved

---

### STEP 4: Certification (WEEK 1, DAY 5)

**Objective**: Prove the core runtime works correctly.

**Run**:
```bash
npm run dev
curl http://localhost:3000/api/debug/runtime-certify
curl http://localhost:3000/api/debug/integration-certify
```

**Expected**:
- ✅ Level 1 Runtime Certification: 5/5 tests pass
- ✅ Level 2 Integration Certification: 7/7 tests pass
- ✅ All 15 surfaces synchronized
- ✅ Update latency <2 seconds
- ✅ No fake data
- ✅ No dead links

**If failures occur**:
- They will be implementation issues, not architecture issues (since P0s were fixed)
- Patch only what failed
- Rerun certification
- Must pass before proceeding

**Deliverable**: Both certification suites passing with clean results

**Gate**: 100% pass rate on both suites

---

### STEP 5: Freeze Core Runtime (WEEK 1, END)

**Objective**: Lock the core systems so they become production infrastructure.

**Freeze**:
- ✅ Live Session Chain (locked, no changes unless critical bug)
- ✅ GlobalLiveSessionRegistry (canonical, no migrations)
- ✅ Core APIs (no breaking changes)
- ✅ Event flow (no architectural changes)

**Mark in code**:
```typescript
// FROZEN: Core runtime.
// Changes require Build Director approval.
// Do not modify unless fixing a critical bug.
```

**Effect**: These systems are now stable foundations for all future work

**Deliverable**: `CORE_RUNTIME_FROZEN.md` documenting what's locked and why

**Gate**: No further changes to core runtime architecture

---

### STEP 6: Legacy Artifact Audit (WEEK 2)

**Objective**: Identify old code, deprecated routes, and duplicate systems that could resurface during CRM work.

**Audit for**:
- Old homepage components still reachable
- Duplicate profile implementations (old Performer/Fan/Venue profiles)
- Deprecated routes (old URLs, old paths)
- Mock/demo pages presented as real
- CSS/animation conflicts with current design language
- Multiple versions of the same runtime logic
- Hardcoded data that should come from registries
- Dead components (imported nowhere)
- Orphaned API endpoints

**For each artifact found**:
1. Document location
2. Identify what it was for
3. Determine if it's still needed
4. Assign to "removal ledger" for Phase 2

**Deliverable**: `LEGACY_CLEANUP_LEDGER.md`
- List of every deprecated/duplicate artifact
- Location and removal effort estimate
- Priority (delete now vs. migrate vs. deprecate)

**Effect**: Prevents technical debt from accumulating in CRM phase

**Gate**: All legacy artifacts documented; migration path clear

---

### STEP 7: Universal Profile Runtime (WEEK 3)

**Objective**: Build ONE profile runtime used by all 6 roles (not 6 separate systems).

**Build ONE implementation**:
- Shared Identity Module (avatar, verification, rank, XP, membership, badges, followers, stats)
- Shared Social Module (activity, friends, notifications, AI assistant)
- Shared Media Module (locker, playlists, memories, gallery)
- Shared Inventory Module (items, equipment, cosmetics)
- Shared Live Presence Module (live status, current room, viewers)
- Shared Settings Module (privacy, billing, preferences)

**Deploy to all 6 roles**:
- Performer
- Fan
- Venue
- Promoter
- Writer
- Sponsor

**Result**: Every profile immediately looks professional and complete

**Deliverable**: Universal Profile Runtime with shared core used by all 6 roles

**Gate**: Shared layers deployed; all data is real (no hardcoding, per Rule 20)

---

### STEP 8: Role-Specific CRM Modules (WEEKS 4-5)

**Objective**: Attach specialized business modules to each role.

**Priority order**:

#### Priority 1: Performer Module
- Revenue Center (tips, merch, tickets, subs, sponsors, deep analytics)
- Bookings Manager
- Concerts Module
- Music Module
- Sponsors Module
- Analytics Module
- Contracts Module
- Payout Center

#### Priority 2: Fan Module
- Collections (favorite artists, venues, songs, events)
- Support History (tips, subscriptions)
- Upcoming Tickets
- Reward Progress
- Purchase History
- Playlists
- Friends/Groups
- Analytics

#### Priority 3: Executive Module (Big Ace)
- Platform Revenue
- Active Rooms
- User Health
- Moderation Queue
- Fraud Detection
- System Health
- Trending Content
- Growth Predictions

#### Priority 4-7: Venue, Promoter, Sponsor, Writer
(Each gets role-specific modules)

**Implementation**: Attach modules to Universal Profile Runtime (not 6 separate profiles)

**Deliverable**: All 7 role CRM modules functional and wired

**Gate**: All modules use real data; no duplicate implementations

---

### STEP 9: Unified Business Intelligence Layer (WEEK 5-6)

**Objective**: Consolidate all revenue flows and create business dashboards.

**Build**:
- Unified Revenue Engine (one canonical source for ALL money)
- Settlement Scheduler (automates payouts)
- Tax Compliance (withholding, forms)
- Business Dashboard (unified revenue view across all roles)

**Consolidate**:
- Memberships
- Tips
- Merchandise
- Sponsorships
- Ticket sales
- Bookings
- Ads
- Subscriptions
- Royalties
- Digital products

**Result**: One auditable path from collection to settlement for every dollar

**Deliverable**: Unified Business Layer with consolidated revenue engine

**Gate**: Every dollar traceable end-to-end; settlements processing correctly

---

### STEP 10: Runtime Humanity (WEEKS 4-6, CONCURRENT)

**Objective**: Make crowds, stages, and venues feel alive.

**Four layers** (each builds on the previous):

1. **Layer 1: Attention** (mostly built)
   - Avatars look at stage
   - Attention shifts when action happens
   - Contagion spreads through crowd

2. **Layer 2: Behavior** (build this)
   - Talking, cheering, waving, recording, dancing, laughing
   - Varied postures and reactions

3. **Layer 3: Environment** (build this)
   - LED transitions, moving lights, smoke/fog, crowd waves
   - Sponsor activations, confetti, reflections, ambient sound

4. **Layer 4: Micro Humanity** (polish)
   - Blinking, breathing, weight shifting, fidgeting

**Deliverable**: Crowds feel alive; Level 3 Experience Certification passes

**Gate**: Human reviewers confirm: "This feels like a real event"

---

### STEP 11: Venue Life (WEEK 6-7)

**Objective**: Populate venues with operational NPCs so they feel like real events.

**Visible staff** (varies by venue type):
- Camera operators
- DJ
- Host/Announcer
- Security
- Photographers
- Lighting technician
- Bartenders
- Merch booth staff
- Sponsor reps
- Ushers

**Result**: Venues feel staffed, operational, and cinematic

**Deliverable**: Every venue has 5+ visible, reactive staff members

**Gate**: Level 3 Experience Certification: "This venue feels like a real place"

---

### STEP 12: Mobile Native Experience (WEEK 7-8)

**Objective**: Redesign mobile as native app, not scaled desktop.

**Mobile-specific**:
- Bottom navigation (thumb-natural)
- Vertical scrolling (mobile behavior)
- Large touch targets (48x48px)
- Gesture-based interactions (swipe, tap, long-press)
- Full-screen live rooms (portrait primary)
- Push notifications
- Background audio
- Offline support
- Haptic feedback
- Battery efficiency

**Result**: Native iOS + Android apps with 100% feature parity

**Deliverable**: Mobile app feels native and primary, not secondary

**Gate**: All major user journeys work on mobile; performance targets met

---

### STEP 13: Soft Launch Certification (WEEK 8+)

**Objective**: Prove every system works under production load.

**Certify**:
- Performance (<2s load, 60fps, 5000+ avatars)
- Payments (Stripe stable, 99%+ success)
- Live Streaming (RTMP, HLS, <500ms latency)
- Notifications (>99% delivery, <2s latency)
- Discovery (search, ranking, freshness)
- Moderation (filtering, reporting, banning)
- Analytics (real-time, historical, forecasting)
- Failover (database, CDN, rate limiting)

**Gate**: Zero critical bugs; Build Director approval

**Result**: Platform is production-ready for soft launch

---

## Timeline

```
Week 1:    Steps 1-5  (Audit, repair, certify, freeze)
Week 2:    Step 6     (Legacy artifact audit)
Week 3:    Step 7     (Universal Profile Runtime)
Week 4-5:  Steps 8-10 (CRM modules, business layer, humanity)
Week 6-7:  Steps 11   (Venue life)
Week 7-8:  Step 12    (Mobile)
Week 1-8:  Continuous (Onboarding optimization)
Week 8+:   Step 13    (Soft launch certification)
```

**Total: 8 weeks to soft launch ready**

---

## Gating Criteria (STRICT)

| Gate | Condition |
|------|-----------|
| Step 1→2 | Canonical Architecture Audit complete |
| Step 2→3 | Live Session Chain mapped |
| Step 3→4 | All P0 issues fixed |
| Step 4→5 | Both certification suites pass |
| Step 5→6 | Core runtime frozen |
| Step 6→7 | Legacy artifacts documented |
| Step 7→8 | Shared profile layers deployed |
| Step 8→9 | All 7 CRM modules functional |
| Step 9→10 | Business layer verified |
| Step 10→11 | Humanity layers complete |
| Step 11→12 | Venue life operational |
| Step 12→13 | Mobile at feature parity |
| Step 13→LAUNCH | All certifications pass; Build Director approval |

---

## What This Accomplishes

✅ **Step 1-2**: Verify architecture is sound  
✅ **Step 3-4**: Prove core runtime works  
✅ **Step 5**: Lock foundation  
✅ **Step 6**: Prevent technical debt  
✅ **Step 7-12**: Build complete, polished platform  
✅ **Step 13**: Certify production readiness  

**Result**: TMI is a world-class live entertainment platform, not a website.

---

## Authority

This 13-step sequence is FINAL and LOCKED.

No deviations without explicit Build Director approval.

Every task follows this sequence.

No jumping ahead.

No parallel work before gating criteria met.

**This is the canonical path to soft launch.**

**Ready to begin Step 1?**
