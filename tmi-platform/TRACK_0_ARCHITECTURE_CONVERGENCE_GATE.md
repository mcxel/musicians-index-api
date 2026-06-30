# Track 0: Architecture & Convergence Gate (LOCKED 2026-06-25)

**Authority**: Build Director (Marcel Dickens)  
**Purpose**: Approve or reject work BEFORE it enters Tracks A/B/C  
**Responsibility**: Guard against architectural drift and duplicate systems  
**Timeline**: Runs every day, before any coding starts

---

## What Track 0 Does

Before Claude, Copilot, or Blackbox write a single line of code, Track 0 answers:

1. **Is there already a runtime for this?** (Check CANONICAL_SYSTEMS.md)
2. **Does this violate canonical architecture?** (Check UNIVERSAL_PROFILE_RUNTIME_ARCHITECTURE.md)
3. **Is this introducing duplicate state?** (Check RUNTIME_CONVERGENCE_LEDGER.md)
4. **Should this be a module instead of a new page?** (Check PLATFORM_FEATURE_MATRIX.md)
5. **Is this launch-critical?** (Check PHASE priorities)
6. **Does it meet Definition of Done criteria?** (Check DEFINITION_OF_DONE.md)

**If YES to all**: Approve → send to Track A/B/C  
**If NO to any**: Reject or revise → fix architecture first

---

## The Gate Keeper Questions

### Question 1: Does This System Already Exist?

**Check**: CANONICAL_SYSTEMS.md

**Examples**:
- "I need to build a followers system" → Already exists (SocialGraphEngine)
- "I need to build a messaging system" → Already exists (MessagingRuntime)
- "I need to build XP tracking" → Already exists (XpActionRegistry)

**Result**: Reuse, don't rebuild.

---

### Question 2: Should This Be a Module or a New Page?

**Check**: UNIVERSAL_PROFILE_RUNTIME_ARCHITECTURE.md

**Example**:
- "Performer revenue dashboard" → Should be a module attached to Universal Profile Runtime
- NOT a new page at `/performer/revenue`
- YES a module at `lib/profiles/roles/performer/RevenueCenter.tsx`

**Result**: Architecture stays clean, code reusable, maintenance simplified.

---

### Question 3: Does This Introduce Duplicate State?

**Check**: RUNTIME_CONVERGENCE_LEDGER.md

**Example**:
- "I want to track who's online" → Already tracked by Audience Runtime
- Don't build a second "online status" system
- Use the canonical Audience Runtime

**Result**: Single source of truth, no sync problems.

---

### Question 4: Will Every Role Need This Feature?

**Check**: PLATFORM_FEATURE_MATRIX.md

**Example**:
- "Analytics dashboard" → Check matrix
- Should Performer have it? ✓ Yes
- Should Fan have it? ✓ Yes
- Should Venue have it? ✓ Yes
- Should Promoter have it? ✓ Yes
- Should Writer have it? ✓ Yes
- Should Sponsor have it? ✓ Yes
- Should Admin have it? ✓ Yes
- → Build once, attach to all roles

**Result**: No forgotten roles, consistent experience.

---

### Question 5: Is This Launch-Critical?

**Check**: Phase priorities

**Examples**:
- Live Session Chain? ✓ P0 (Week 1-2)
- Avatar micro-movements? △ P2 (Week 6-7)
- Advanced radio network? ✗ P3 (Post-launch)

**Result**: Focus on P0/P1 before P2/P3.

---

### Question 6: Can This Pass Definition of Done?

**Check**: DEFINITION_OF_DONE.md — 10 criteria

**Example**: "Real-time tips"
- [ ] Functional with real data? (Can test with Stripe mock)
- [ ] Connected to UnifiedRevenueEngine? (Required)
- [ ] Responsive on all devices? (Required)
- [ ] Error handling? (Required)
- [ ] Loading states? (Required)
- [ ] Performance acceptable? (Required)
- [ ] Accessible? (Required)
- [ ] No duplicates? (Required)
- [ ] No mock data? (Required)
- [ ] In certification? (Required)

**Result**: If you can't meet all 10, the feature isn't ready to be built.

---

## Track 0 Approval Process

### Daily Standup (10 min)

Build Director asks Track 0:

**"What work is pending approval?"**

Track 0 owner presents:
1. Feature name
2. Which role(s) it serves
3. Architectural concerns (if any)
4. Canonical system it uses (if existing)
5. Definition of Done checklist

**Decision**: APPROVE / REJECT / REVISE

---

### Approval Criteria

Work is APPROVED if:
- ✅ Uses canonical systems (no new duplicates)
- ✅ Fits architecture (module vs. page, shared vs. role-specific)
- ✅ Serves launch-critical goal (P0/P1)
- ✅ Can meet all 10 Definition of Done criteria
- ✅ Doesn't block other work
- ✅ Clear owner assigned

---

### Rejection Reasons

Work is REJECTED if:
- ❌ Violates canonical architecture (would duplicate a system)
- ❌ Creates new state that conflicts with existing runtime
- ❌ Introduces a new page when it should be a module
- ❌ Forgot a role (would leave gap in PLATFORM_FEATURE_MATRIX)
- ❌ P3 or post-launch work (not focus for Week 1-8)
- ❌ Fails Definition of Done assessment

---

### Revision Path

If work is REJECTED, Track 0 provides:
1. What's wrong with the current approach
2. What the correct approach should be
3. Revised architecture/design
4. Resubmit for approval

**Example**:
- **Submitted**: "Build a per-performer notification system"
- **Rejected**: "This violates canonical Notification Engine and creates duplicate state"
- **Revised**: "Use canonical Notification Engine, attach notification preferences module to each role in Universal Profile Runtime"
- **Resubmit**: "This fits the architecture, uses canonical system, serves all roles"
- **Approved**: "OK to build"

---

## What Track 0 Prevents

❌ **Claude writes a 2-week system that conflicts with existing architecture**
❌ **Copilot builds UI for a feature that shouldn't exist**
❌ **Blackbox optimizes code that should have been deleted**
❌ **A feature exists for Performer but not for Fan, breaking PLATFORM_FEATURE_MATRIX**
❌ **Two independent "followers" systems evolve in parallel**

---

## What Track 0 Enables

✅ **Bad ideas caught before wasting time**
✅ **Architecture stays clean and consistent**
✅ **No duplicate systems evolve**
✅ **All roles treated equally (no forgotten roles)**
✅ **Track A/B/C can execute confidently**

---

## Track 0 Checklist (Before Any Code)

Every feature submission must pass this:

- [ ] No duplicate system exists (check CANONICAL_SYSTEMS.md)
- [ ] Uses canonical system if applicable
- [ ] Fits Universal Profile Runtime pattern (module vs. page)
- [ ] No new state that conflicts with existing runtimes
- [ ] Serves launch-critical goal (P0/P1)
- [ ] All roles receive this feature or it's role-specific by design
- [ ] Can meet all 10 Definition of Done criteria
- [ ] Clear owner assigned (Claude/Copilot/Blackbox)
- [ ] No blocker on other work
- [ ] Build Director approves

---

## Example: Track 0 In Action

### Scenario 1: New Feature Proposal

**Developer**: "I want to build a 'fan interactions' system to track when fans interact with performers"

**Track 0**: 
- Check CANONICAL_SYSTEMS.md → Analytics Runtime exists
- Check UNIVERSAL_PROFILE_RUNTIME_ARCHITECTURE.md → This should be an analytics module
- Check PLATFORM_FEATURE_MATRIX.md → Which roles need this?

**Result**: 
- "Use canonical Analytics Runtime"
- "Build as an analytics module attached to relevant roles"
- "Serves Performer (fan interactions), Admin (platform analytics)"
- "Approved: proceed to Track A (Claude) to wire to Analytics Runtime, Track B (Copilot) for UI"

### Scenario 2: Architecture Violation

**Developer**: "I want to create a separate 'live room state' tracker"

**Track 0**:
- Check CANONICAL_SYSTEMS.md → GlobalLiveSessionRegistry exists
- Check RUNTIME_CONVERGENCE_LEDGER.md → Live Sessions is marked "Stable" (freeze after cert)

**Result**:
- "Rejected: GlobalLiveSessionRegistry already owns live room state"
- "Use the canonical system, don't create a duplicate"
- "Resubmit with architecture using existing registry"

### Scenario 3: Incomplete Role Coverage

**Developer**: "I want to build an analytics dashboard for Performers"

**Track 0**:
- Check PLATFORM_FEATURE_MATRIX.md → Which other roles need analytics?

**Result**:
- "Analytics dashboard needed for: Performer, Fan, Venue, Promoter, Writer, Sponsor, Admin"
- "Build once in Universal Profile Runtime, attach to all 7 roles"
- "Approved: proceed with universal analytics, not performer-only"

---

## Locked

Track 0 is the gatekeeper.

No work bypasses it.

Every feature is vetted against canonical architecture before a line of code is written.

This is how you prevent architectural drift.

This is how you keep systems from duplicating.

This is how you launch on time.
