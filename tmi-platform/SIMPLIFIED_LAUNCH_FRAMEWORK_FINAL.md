# Simplified Launch Framework (LOCKED 2026-06-25)

**Authority**: Build Director (Marcel Dickens)  
**Principle**: Convergence and launch, not invention  
**Timeline**: 8 weeks to soft launch with revenue flowing  
**Simplification**: One dashboard, five tracks, three roles, clear priorities

---

## One Dashboard (Source of Truth)

Update daily. This is the ONLY status dashboard you need.

| System | % Complete | Blocking Revenue | Blocking Launch | Owner | Track |
|--------|-----------|------------------|-----------------|-------|-------|
| **Stripe** | 92% | ✅ YES | ✅ YES | Claude | R |
| **Memberships** | 88% | ✅ YES | ✅ YES | Claude | R |
| **Tips** | 85% | ✅ YES | ✅ YES | Claude | R |
| **Webhooks** | 80% | ✅ YES | ✅ YES | Claude | R |
| **Taxes** | 75% | ✅ YES | ✅ YES | Claude | R |
| **Authentication** | 96% | ❌ NO | ✅ YES | Claude | A |
| **Database** | 95% | ❌ NO | ✅ YES | Claude | A |
| **Live Session Chain** | 83% | ❌ NO | ✅ YES | Claude | B |
| **Notifications** | 80% | ❌ NO | ✅ YES | Claude | B |
| **Discovery** | 82% | ❌ NO | ✅ YES | Claude | B |
| **Homepage** | 85% | ❌ NO | ✅ YES | Copilot | B |
| **GO LIVE Button** | 90% | ❌ NO | ✅ YES | Copilot | B |
| **Chat** | 78% | ❌ NO | ✅ YES | Claude | B |
| **Profiles** | 72% | ❌ NO | ✅ YES | Copilot | C |
| **Admin Dashboard** | 89% | ❌ NO | ✅ YES | Copilot | C |
| **CRM (Core)** | 61% | ❌ NO | ❌ NO | Claude | C |
| **Audience Realism** | 58% | ❌ NO | ❌ NO | Claude | D |
| **Avatar Runtime** | 63% | ❌ NO | ❌ NO | Claude | D |
| **Venue Life** | 52% | ❌ NO | ❌ NO | Claude | D |
| **Mobile** | 47% | ❌ NO | ❌ NO | Copilot | D |
| **Performance** | 91% | ❌ NO | ❌ NO | Blackbox | E |

---

## Five Parallel Tracks

### Track R: Revenue (HIGHEST PRIORITY)

**Goal**: Money flows, memberships work, taxes calculated

**Items**:
- [ ] Stripe production verified
- [ ] Memberships subscriptions
- [ ] Tips payment flow
- [ ] Tickets purchases
- [ ] Merchandise purchases
- [ ] Sponsorship purchases
- [ ] Booking payments
- [ ] Webhooks reliable
- [ ] Tax withholding
- [ ] Refunds process
- [ ] Existing member migration
- [ ] Revenue dashboards

**Owner**: Claude  
**Timeline**: Week 1-3 (COMPLETE by Week 3)  
**Success**: Real money flowing by Week 2 ✅

---

### Track A: Foundation Verification

**Goal**: Verify all canonical systems exist before freezing them

**Verification checklist** (for each system):
- [ ] File exists
- [ ] Used by production code
- [ ] No duplicate system exists
- [ ] API wired correctly
- [ ] UI wired correctly
- [ ] Mobile wired correctly
- [ ] Admin wired correctly
- [ ] Passes typecheck
- [ ] Builds without errors

**Systems to verify**:
- Authentication
- Database
- Stripe
- Messaging
- Notifications
- Inventory
- Memory Wall
- Revenue
- Followers/Following
- XP
- Analytics

**Owner**: Claude + Blackbox  
**Timeline**: Week 1 (COMPLETE by end of Week 1)  
**Success**: All canonical systems verified ✅

---

### Track B: Live Runtime (CRITICAL PATH)

**Goal**: GO LIVE → all surfaces, notifications flow, discovery works

**Items**:
- [ ] Live Session Chain verified
- [ ] All 15 destinations update in <2 sec
- [ ] Notifications work
- [ ] Discovery ranks live content
- [ ] Homepage reflects live rooms
- [ ] Chat works
- [ ] GO LIVE button exists and works

**Owner**: Claude + Copilot  
**Timeline**: Week 2-3  
**Success**: Platform is live-streaming ready ✅

---

### Track C: CRM Foundation

**Goal**: Profiles readable, revenue visible, admin operational

**Items** (Soft Launch):
- [ ] Performer profile (identity + revenue)
- [ ] Fan profile (identity + support history)
- [ ] Executive profile (platform overview)
- [ ] Venue profile (basic)
- [ ] Promoter profile (basic)
- [ ] Sponsor profile (basic)
- [ ] Writer profile (basic)
- [ ] Admin dashboard (operational)

**Owner**: Claude + Copilot  
**Timeline**: Week 3-4  
**Success**: All roles can use their dashboard ✅

---

### Track D: Experience & Realism (POLISH)

**Goal**: Platform feels alive and premium

**Soft Launch**: NOT REQUIRED (web without these is OK)  
**Post-Launch**: Add these after users arrive

**Items**:
- [ ] Avatar runtime (realism)
- [ ] Audience realism (movements, reactions)
- [ ] Venue life (visible staff)
- [ ] Cinematic presentation (lighting, cameras)
- [ ] Mobile native app (NOT required for soft launch)

**Owner**: Claude + Copilot  
**Timeline**: Week 5-7  
**Success**: Platform feels alive and broadcast-quality ✅

---

### Track E: Certification & Launch

**Goal**: Verify everything works, launch

**Items**:
- [ ] Layer 1: Engineering certification (technical)
- [ ] Layer 2: Experience certification (subjective)
- [ ] Load testing
- [ ] Revenue verification
- [ ] Production deployment
- [ ] Monitoring/alerting
- [ ] Launch readiness

**Owner**: Blackbox + Build Director  
**Timeline**: Week 7-8  
**Success**: Soft launch approved ✅

---

## Three Roles (Clear Ownership)

### Claude: Platform Runtime

**Owns**: Everything that runs on servers/clients

**Responsible for**:
- ✅ Verify canonical systems exist (Track A)
- ✅ Build revenue pipeline (Track R)
- ✅ Wire live chain (Track B)
- ✅ Build CRM APIs (Track C)
- ✅ Build avatar/audience/venue runtimes (Track D)
- ✅ Data architecture
- ✅ Business logic
- ✅ API endpoints
- ✅ Integration testing

---

### Copilot: Platform Polish

**Owns**: Everything users see

**Responsible for**:
- ✅ GO LIVE button UI (Track B)
- ✅ Profiles layouts (Track C)
- ✅ Homepage design (Track B)
- ✅ CRM module UX (Track C)
- ✅ Admin dashboard UI (Track C)
- ✅ Avatar visuals (Track D)
- ✅ Cinematic presentation (Track D)
- ✅ Mobile responsive design (Track D)
- ✅ Animation/transitions
- ✅ Visual consistency

---

### Blackbox: Launch Verification

**Owns**: Can this ship?

**Responsible for**:
- ✅ Dead code audit (Track A)
- ✅ Legacy cleanup (Track A)
- ✅ Duplicate detection (Track A)
- ✅ Build verification (all tracks)
- ✅ Typecheck (all tracks)
- ✅ Performance testing (Track E)
- ✅ Security review (Track E)
- ✅ Stripe verification (Track R)
- ✅ API verification (Track B/C)
- ✅ Regression testing (all tracks)
- ✅ Responsive testing (Track D)

---

## Soft Launch vs. Version 1.0

### Soft Launch (Week 8)

**MUST HAVE**:
- ✅ Revenue working (memberships, tips)
- ✅ Authentication working
- ✅ Profiles readable
- ✅ Live streaming works
- ✅ Chat works
- ✅ Notifications work
- ✅ Admin can see operations
- ✅ Discovery works
- ✅ Mobile web works

**Everything else is post-launch**.

---

### Version 1.0 (Weeks 9-12, Post-Launch)

**ADD AFTER USERS ARRIVE**:
- ✅ Runtime humanity (audience behavior)
- ✅ Venue staff (operational realism)
- ✅ Avatar realism (face scan, 3D)
- ✅ Advanced CRM (booking/tickets/merch)
- ✅ Deep analytics
- ✅ Advanced inventory
- ✅ World events
- ✅ NPC improvements
- ✅ Mobile native app

**Reason**: Users care about revenue + live + community first. Realism can improve with them watching.

---

## Verify Before Freezing (THE RULE)

Before marking any system as **CANONICAL**:

### Verification Checklist

- [ ] **File exists**: Can I find the file in the repo?
- [ ] **Used by runtime**: Is production code actually calling it?
- [ ] **No duplicates**: Did I check for other systems doing the same thing?
- [ ] **API wired**: Does the HTTP endpoint work?
- [ ] **UI wired**: Does the component consume the API?
- [ ] **Mobile wired**: Does the mobile version work?
- [ ] **Admin wired**: Can admins see it/use it?
- [ ] **Typecheck**: Does `pnpm typecheck` pass?
- [ ] **Builds**: Does `pnpm build` succeed?

**Only when all 9 checkboxes are checked: Mark it canonical.**

### Example Verification

**Before**: "GlobalLiveSessionRegistry is canonical"

**After**: 
- ✅ File exists: `lib/engines/live/GlobalLiveSessionRegistry.ts`
- ✅ Used by runtime: `recordGoLive()` calls it, not a different system
- ✅ No duplicates: Searched codebase, no other liveSession/activeRoom systems
- ✅ API wired: `/api/live/sessions` returns registry data
- ✅ UI wired: Home 3, Discovery, Billboards all consume the API
- ✅ Mobile wired: Mobile app calls the same API
- ✅ Admin wired: Admin dashboard shows live sessions from registry
- ✅ Typecheck: `pnpm typecheck` passes
- ✅ Builds: `pnpm build` succeeds

**Result**: NOW mark it canonical in CANONICAL_SYSTEMS.md

---

## Weekly Rhythm

### Every Monday
- Start of week standup
- Review dashboard
- Assign work for the week
- Identify blockers

### Every Friday
- Dashboard updated with current %
- Blockers identified
- Next week planned
- Track R priority confirmed

### Daily (End of Day)
- Dashboard reflects current state
- Blockers flagged immediately (don't wait for Friday)

---

## Launch Gate (Week 8)

**Soft launch is approved when**:

- ✅ All Track R items complete (revenue flowing)
- ✅ All Track A items complete (verified canonical)
- ✅ All Track B items complete (live streaming)
- ✅ All Track C items complete (profiles work)
- ✅ Layer 1 certification passes
- ✅ Layer 2 certification passes
- ✅ Build Director approves

**If any item incomplete**: Defer to Week 9 (post-launch).

---

## What's NOT Included in Soft Launch

These are explicitly deferred to Version 1.0 (post-launch):

- ❌ Native mobile apps (web is enough)
- ❌ Advanced avatar realism (static OK)
- ❌ Audience humanity (seated audience OK)
- ❌ Venue staff visibility (basic rendering OK)
- ❌ Advanced CRM (core profile only)
- ❌ Booking/tickets/merchandise
- ❌ Sponsorships
- ❌ Deep analytics
- ❌ World events
- ❌ Advanced inventory

**Reason**: Launch early with revenue + live + community. Add realism while users are onboarding.

---

## Project Status (Current)

| Area | Confidence |
|------|-----------|
| Architecture & governance | 95% |
| Visual design language | 95% |
| Core runtime foundation | 80-85% |
| Revenue readiness | 70-80% (needs verification) |
| CRM ecosystem | 55-65% |
| Runtime realism | 60-70% |
| **Soft launch readiness** | **80-85%** |

**Biggest opportunity**: Verify existing systems, remove duplicates, finish revenue pipeline, launch.

---

## The Simplified Truth

**You are not in "invent the platform" mode anymore.**

**You are in "converge and launch" mode.**

The biggest gains now come from:

1. **Proving systems work together** (not building new ones)
2. **Removing duplicates and legacy** (not adding complexity)
3. **Getting revenue operational** (not waiting for perfection)
4. **Launching with paying members** (not over-engineering)

**The dashboard tells you exactly where you are.**

**The five tracks keep you on schedule.**

**The three roles keep ownership clear.**

**Soft Launch is the goal. Version 1.0 comes after.**

---

## LOCKED

This framework is final.

Five tracks. One dashboard. Three roles.

Revenue first. Verify everything. Ship early.

Add realism after users arrive.

This is how you launch a revenue-generating platform in 8 weeks.
