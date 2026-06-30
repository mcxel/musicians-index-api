# TMI Platform Certification Framework

Three-level verification system that ensures platform correctness before soft launch.

---

## Overview

Before any system becomes part of the canonical runtime, it must pass three sequential certifications:

```
Level 1: Runtime Certification (Automated, Technical)
    ↓ PASS
Level 2: Integration Certification (Automated, Signal Flow)
    ↓ PASS
Level 3: Experience Certification (Human, Subjective)
```

**Rule 15 (Locked)**: Every new system must be accompanied by an automated certification before it becomes part of the canonical runtime.

---

## Level 1: Runtime Certification

### Purpose
Verify technical correctness of a single runtime (Crowd, Live, Avatar, Game, Camera, Audio, AI, Mobile).

### What It Tests

**RuntimeCertificationSuite** runs 5 automated tests:

#### Test 1: Event Propagation ✅
- Records reaction, tip, vote, gift events
- Confirms RoomEnergyEngine updates
- Confirms CrowdAttentionEngine receives updates
- **Pass Criteria:** ≥3 attention updates received, energy score > 0

#### Test 2: Attention State Updates ✅
- Triggers directAttention() on avatar
- Confirms AvatarAttentionRuntime returns valid output
- Confirms getStats() produces valid metrics
- **Pass Criteria:** headYaw/pitch updated, stats valid

#### Test 3: Renderer Integration ✅
- Triggers applause (multi-avatar attention change)
- Retrieves AttentionVector[] as AudienceScene would
- Validates vector structure (yaw, pitch, intensity)
- **Pass Criteria:** All vectors valid and populated

#### Test 4: Performance Stability ✅
- Tests with 20, 100, 250, 500, 1000, 5000 avatars
- Measures event processing time at each scale
- Confirms timing doesn't degrade exponentially
- **Pass Criteria:** <250x timing increase for 250x avatar increase

#### Test 5: Memory Stability ✅
- Runs 50 cycles of applause + tip
- Confirms final state is still valid
- Confirms vectors are still correct (no NaN)
- **Pass Criteria:** State valid after 50 cycles, no memory leaks

### How to Run

#### Via API
```bash
curl http://localhost:3000/api/debug/runtime-certify
```

#### Programmatically
```typescript
import { runtimeCertificationSuite } from '@/lib/live/RuntimeCertificationSuite';

const report = await runtimeCertificationSuite.runAllTests();
console.log(report);
```

### Expected Output

```
📊 RUNTIME CERTIFICATION REPORT

Timestamp: 2026-06-25T...

5/5 tests passed

✅ Test 1: Event Propagation
   Duration: 245.3ms
   attentionUpdates: 4
   energyScore: 15
   energyLabel: WARMING

✅ Test 2: Attention State Updates
   Duration: 89.2ms
   headYaw: 0.42
   eyeYaw: 0.38
   avgIntensity: 0.65
   transitioningCount: 0

✅ Test 3: Renderer Integration
   Duration: 156.7ms
   vectorsGenerated: 8
   sampleYaw: 0.31
   samplePitch: -0.12
   sampleIntensity: 0.75

✅ Test 4: Performance Stability
   Duration: 512.4ms
   timing20: 18.3ms
   timing100: 42.1ms
   timing250: 89.5ms
   timing500: 142.7ms
   timing1000: 198.4ms
   timing5000: 524.1ms
   degradationFactor: 28.6

✅ Test 5: Memory Stability
   Duration: 342.8ms
   cyclesCompleted: 50
   finalEnergyScore: 127
   finalEnergyLabel: ON FIRE
   finalVectorsValid: true

✨ All tests passed. Runtime is certified.
```

### Success Criteria for Level 1

- [ ] All 5 tests pass
- [ ] No errors reported
- [ ] Performance metrics are reasonable
- [ ] No memory issues during cycles

**If a test fails:**
1. Identify which link in the chain broke
2. Patch only that specific link
3. Run the suite again
4. Do not add features or redesign — only fix the break

---

## Level 2: Integration Certification

### Purpose
Verify that a GO LIVE event propagates correctly through all canonical systems.

### What It Tests

**IntegrationCertificationSuite** runs 7 automated tests:

#### Test 1: GO LIVE → Live Registry ✅
- Trigger a GO LIVE action
- Confirm GlobalLiveSessionRegistry updates
- **Pass Criteria:** Registry entry exists, room ID correct, timestamp recent

#### Test 2: Live Registry → Homepage ✅
- Confirm Home 3 (Live World) displays the live room
- **Pass Criteria:** Room appears with performer name, thumbnail, join button

#### Test 3: Discovery → DiscoveryRail ✅
- Confirm DiscoveryRail on all surfaces includes the live room
- **Pass Criteria:** Room appears on home, profiles, articles, lobbies, venues

#### Test 4: Billboard Update ✅
- Confirm Home 1-2 billboards display the live room
- **Pass Criteria:** Preview loading, broadcast director active, camera animating

#### Test 5: Followers Notification ✅
- Confirm followers are notified
- **Pass Criteria:** Notification created, delivered, links to room

#### Test 6: Admin Panel Update ✅
- Confirm Admin home, live rooms grid, performer list, revenue tracker all update
- **Pass Criteria:** All panels show the live room immediately

#### Test 7: Venue/Promoter Update ✅
- Confirm Venue and Promoter dashboards reflect the live room
- **Pass Criteria:** Venue home synced, revenue calculated, tickets reflected

### How to Run

#### Via API
```bash
curl http://localhost:3000/api/debug/integration-certify
```

#### Programmatically
```typescript
import { integrationCertificationSuite } from '@/lib/live/IntegrationCertificationSuite';

const report = await integrationCertificationSuite.runAllTests();
console.log(report);
```

### Expected Output

```
📊 INTEGRATION CERTIFICATION REPORT

Timestamp: 2026-06-25T...

7/7 tests passed

✅ Test 1: GO LIVE → Live Registry
   Duration: 125.4ms
   ✓ registryUpdated: true
   ✓ roomIdCorrect: true
   ✓ performerIdCorrect: true
   ✓ timestampRecent: true

✅ Test 2: Live Registry → Homepage
   Duration: 89.2ms
   ✓ home3Queried: true
   ✓ liveRoomInList: true
   ✓ performerNameCorrect: true
   ✓ thumbnailLoaded: true
   ✓ joinButtonActive: true

✅ Test 3: Discovery → DiscoveryRail
   Duration: 203.1ms
   • discoverySurfaces: 5
   ✓ railsUpdated: true
   ✓ liveRoomIncluded: true
   ✓ positioningCorrect: true

✅ Test 4: Billboard Update
   Duration: 156.7ms
   ✓ home1Billboard: true
   ✓ home2Billboard: true
   ✓ previewLoading: true
   ✓ broadcastDirectorActive: true
   ✓ cameraAnimating: true
   ✓ audioMixActive: true

✅ Test 5: Followers Notification
   Duration: 67.3ms
   ✓ notificationCreated: true
   ✓ notificationDelivered: true
   ✓ notificationHasLink: true
   ✓ linkPointsToRoom: true

✅ Test 6: Admin Panel Update
   Duration: 142.8ms
   ✓ adminHomeUpdated: true
   ✓ liveRoomsGridUpdated: true
   ✓ performerListUpdated: true
   ✓ revenueTrackerUpdated: true
   ✓ moderationQueueReady: true

✅ Test 7: Venue/Promoter Update
   Duration: 98.4ms
   ✓ venueHomeSynced: true
   ✓ promoterEventListUpdated: true
   ✓ revenueCalculated: true
   ✓ ticketInventoryReflected: true

✨ All integration tests passed. GO LIVE signal propagates correctly.
```

### Success Criteria for Level 2

- [ ] All 7 tests pass
- [ ] GO LIVE signal reaches all 8 destinations
- [ ] No dropped updates anywhere in the chain

**If a test fails:**
1. Check the specific destination that didn't update
2. Verify the API endpoint is wired
3. Verify the data model is correct
4. Fix only that link in the chain
5. Run the suite again

---

## Level 3: Experience Certification

### Purpose
Human evaluation of whether the platform *feels* right.

### What It Tests

A human tester runs the following scenarios and answers subjective questions:

#### Scenario 1: Idle Crowd
- Load a room with 100+ seated avatars
- **Questions:**
  - Do avatars feel alive? (blinking, subtle movement, not frozen?)
  - Does the crowd feel natural? (not uniformly synchronized?)
  - Do conversations feel organic? (overlapping, varied pacing?)

#### Scenario 2: Applause & Reaction
- Trigger applause from the broadcast panel
- **Questions:**
  - Do heads turn toward the stage naturally?
  - Does the attention propagate through the crowd?
  - Does energy feel contagious?

#### Scenario 3: Tip Event
- Send a large tip (🎁 animation should trigger)
  **Questions:**
  - Does the crowd react to the tip?
  - Does the avatar who tipped stand out visually?
  - Does the performer's energy increase?

#### Scenario 4: Multi-Performer Attention
- Have two performers on stage
- Direct audience attention to each alternately
- **Questions:**
  - Do heads follow the right performer?
  - Does the attention shift look smooth, not jarring?
  - Is LOD handling visible/invisible?

#### Scenario 5: Intermission
- End a performance and trigger intermission
- **Questions:**
  - Does the crowd settle into idle mode smoothly?
  - Does the intermission screen feel like a break, not a jarring transition?
  - Do avatars remain responsive during intermission?

### How to Run Level 3

1. **Prerequisites:**
   - Level 1 and Level 2 must both PASS
   - No pending TypeScript errors
   - Build is clean and deployed to staging

2. **Setup:**
   - Open a live room in a browser
   - Enable AttentionDebugOverlay (check console)
   - Have control panel accessible (broadcast/tip/vote controls)

3. **Run each scenario:**
   - Record screenshots/video of each test
   - Answer the subjective questions
   - Document any visual glitches

4. **Result:**
   - Pass: Platform feels alive, organic, cinematic
   - Fail: Platform feels robotic, unresponsive, or jarring

### Success Criteria for Level 3

- [ ] Idle crowd feels alive (not frozen)
- [ ] Attention propagation feels organic
- [ ] Reactions feel contagious
- [ ] Transitions are smooth
- [ ] Overall aesthetic matches Rule 18 (Vice City + Magazine + Broadcast + Spatial)

**If Level 3 fails:**
- Identify which behavior feels wrong
- Check the corresponding runtime (RoomEnergyEngine, CrowdAttentionEngine, AvatarAttentionRuntime, AudienceScene)
- Fix only the behavior
- Re-run Levels 1-2 to ensure nothing broke
- Re-run Level 3

---

## Certification Workflow

### Sprint 1: Runtime Certification

```
Level 1 Auto Tests
  ↓
  ✓ Pass → Sprint 2
  ✗ Fail → Debug → Fix → Retest
```

**Time: ~30 minutes**

### Sprint 2: Integration Certification

```
Level 2 Auto Tests
  ↓
  ✓ Pass → Sprint 3
  ✗ Fail → Debug → Fix → Retest
```

**Time: ~45 minutes**

### Sprint 3: Experience Certification

```
Level 3 Human Review
  ↓
  ✓ Pass → CERTIFIED
  ✗ Fail → Iterate → Retest
```

**Time: ~1 hour per scenario**

### Full Certification Timeline

```
Day 1: Level 1 (Runtime)       — Automated, 30 min
Day 1: Level 2 (Integration)   — Automated, 45 min
Day 2: Level 3 (Experience)    — Human review, 1-2 hours
```

---

## What NOT to Do During Certification

❌ Do **not** add new instrumentation or debug tools
- The HUD is finished
- The metrics are finished
- No more polishing debug utilities

❌ Do **not** add features
- Only fix broken links
- No new capabilities until certified

❌ Do **not** redesign systems
- If a runtime fails, find the broken piece and fix it
- Don't refactor the entire system

❌ Do **not** skip a level
- All three must pass in order
- You cannot do Level 3 without Level 2
- You cannot do Level 2 without Level 1

---

## Rule 15: Certification Requirement

> **Rule 15 (Locked, 2026-06-25)**: Every new system must be accompanied by an automated certification before it becomes part of the canonical runtime.

This means:

- Before merging a new runtime → must have a test suite
- Before merging a new engine → must have passing Level 1 tests
- Before connecting to canonical systems → must pass Level 2
- Before declaring "done" → must pass Level 3

---

## Ongoing Use

After initial certification:

- **Level 1** runs in CI/CD (every commit)
- **Level 2** runs pre-deployment (every staging build)
- **Level 3** runs pre-launch (manual, on demand)

If any level starts failing after merge, revert the commit and debug.

---

## Summary

```
Certification Framework
├─ Level 1: Runtime (Automated, Technical)
│  └─ 5 tests, ~30 min
├─ Level 2: Integration (Automated, Signal Flow)
│  └─ 7 tests, ~45 min
└─ Level 3: Experience (Human, Subjective)
   └─ 5 scenarios, ~2 hours

Total Time to Certification: ~3-4 hours
Timeline: Day 1 (L1+L2), Day 2 (L3)
```

Once all three pass, the system is **certified for soft launch**.
