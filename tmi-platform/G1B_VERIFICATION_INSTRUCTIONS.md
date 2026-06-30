# G-1B Level 1 Developer Verification

## Overview

The **G1BVerificationHarness** is an automated test suite that validates the runtime correctness of the attention system before human visual review.

## What It Tests

### Test 1: Event Propagation ✅
**Verifies:** Events fire and propagate through the chain
- Records reaction, tip, vote, gift events
- Confirms RoomEnergyEngine updates
- Confirms CrowdAttentionEngine receives updates
- **Pass Criteria:** ≥3 attention updates received, energy score > 0

### Test 2: Attention State Updates ✅
**Verifies:** Attention runtime updates correctly
- Triggers directAttention() on avatar
- Confirms AvatarAttentionRuntime returns valid output
- Confirms getStats() produces valid metrics
- **Pass Criteria:** headYaw/pitch updated, stats valid

### Test 3: Renderer Integration ✅
**Verifies:** AttentionVector reaches the renderer layer
- Triggers applause (multi-avatar attention change)
- Retrieves AttentionVector[] as AudienceScene would
- Validates vector structure (yaw, pitch, intensity)
- **Pass Criteria:** All vectors valid and populated

### Test 4: Performance Stability ✅
**Verifies:** System scales linearly with avatar count
- Tests with 25, 75, 150 avatars
- Measures event processing time
- Confirms timing doesn't degrade badly
- **Pass Criteria:** <10x timing increase for 6x avatar increase

### Test 5: Repeated Cycles (Memory Stability) ✅
**Verifies:** No memory leaks during extended operation
- Runs 50 cycles of applause + tip
- Confirms final state is still valid
- Confirms vectors are still correct
- **Pass Criteria:** State valid after 50 cycles, no NaN values

---

## How to Run

### Option A: Via API Endpoint

```bash
curl http://localhost:3000/api/debug/g1b-verify
```

Returns JSON report with pass/fail status for all 5 tests.

### Option B: Programmatically

```typescript
import { verificationHarness } from '@/lib/live/G1B_VerificationHarness';

const report = await verificationHarness.runAllTests();
console.log(report);
```

---

## Expected Output

```
📊 G-1B VERIFICATION REPORT

Timestamp: 2026-06-24T...

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
   timingFor25Avatars: 18.3ms
   timingFor75Avatars: 42.1ms
   timingFor150Avatars: 98.5ms
   degradationFactor: 5.38

✅ Test 5: Repeated Cycles (Memory Stability)
   Duration: 342.8ms
   cyclesCompleted: 50
   finalEnergyScore: 127
   finalEnergyLabel: ON FIRE
   finalVectorsValid: true

✨ All tests passed. Runtime is ready for visual certification.
```

---

## What This Proves

✅ **Technical Correctness**
- Events flow through the entire chain without breaking
- Attention state updates respond to inputs
- Renderer receives valid data

✅ **Performance**
- System scales linearly with audience size
- No unexpected slowdowns

✅ **Stability**
- No memory leaks during repeated cycles
- State remains valid after sustained operation

---

## What Happens Next

Once Level 1 verification passes, the work transitions to **Level 2: Human Visual Review**.

At that point, a person opens a live room and validates:
- Does the crowd feel alive?
- Do conversations look natural?
- Does applause propagate organically?
- Does the venue feel cinematic?

These subjective checks require human judgment, not automation.

---

## If a Test Fails

The report will indicate:
1. **Which test failed**
2. **What was expected**
3. **What actually happened**
4. **Error message** (if applicable)

Then, only patch that specific link in the chain. Don't add features or redesign.

Example failure:

```
❌ Test 3: Renderer Integration
   Duration: 156.7ms
   Error: getRoomAttentionVectors called before initialization
```

**Fix:** Ensure attention vectors are initialized before applause triggers.

---

## Success Criteria for Level 1

- [ ] All 5 tests pass
- [ ] No errors reported
- [ ] Performance metrics look reasonable
- [ ] No memory issues during cycles

Once all checks pass, move to Level 2: **Human Visual Certification**.
