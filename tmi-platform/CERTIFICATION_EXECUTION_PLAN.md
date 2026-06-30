# Certification Framework — Complete Implementation

**Status**: Fully wired and ready for execution  
**Date**: 2026-06-25  
**Build Director Decision**: Implement three-level certification with automated Level 1 & 2, human Level 3

---

## What Was Created

### 1. **RuntimeCertificationSuite** (`lib/live/RuntimeCertificationSuite.ts`)

Automated test suite for runtime technical correctness.

**Tests:**
- Event Propagation (reactions, tips, votes, gifts flow through the chain)
- Attention State Updates (runtime produces valid output)
- Renderer Integration (vectors reach the renderer)
- Performance Stability (tests 20, 100, 250, 500, 1000, 5000 avatars)
- Memory Stability (50 cycles, no leaks or NaN)

**API Endpoint:**
```bash
curl http://localhost:3000/api/debug/runtime-certify
```

### 2. **IntegrationCertificationSuite** (`lib/live/IntegrationCertificationSuite.ts`)

Automated test suite for GO LIVE signal propagation.

**Tests:**
1. GO LIVE → Live Registry
2. Live Registry → Homepage
3. Discovery → DiscoveryRail
4. Billboard Update
5. Followers Notification
6. Admin Panel Update
7. Venue/Promoter Update

**API Endpoint:**
```bash
curl http://localhost:3000/api/debug/integration-certify
```

### 3. **CERTIFICATION_FRAMEWORK.md**

Complete documentation for all three levels:
- **Level 1**: Technical correctness (5 tests, ~30 min)
- **Level 2**: Signal flow (7 tests, ~45 min)
- **Level 3**: Human judgment (5 scenarios, ~2 hours)

---

## Three-Sprint Execution Plan

### Sprint 1: Runtime Certification (Day 1, ~30 min)

**Command:**
```bash
npm run dev
curl http://localhost:3000/api/debug/runtime-certify
```

**Expected:**
- ✅ All 5 tests pass
- ✅ No errors
- ✅ Performance metrics reasonable
- ✅ No memory issues

**If failure:** Fix only the broken link, retest.

---

### Sprint 2: Integration Certification (Day 1, ~45 min)

**Prerequisites:** Sprint 1 PASS

**Command:**
```bash
curl http://localhost:3000/api/debug/integration-certify
```

**Expected:**
- ✅ All 7 tests pass
- ✅ GO LIVE reaches all 8 destinations
- ✅ No dropped updates

**If failure:** Debug the specific destination, fix, retest.

---

### Sprint 3: Experience Certification (Day 2, ~2 hours)

**Prerequisites:** Sprint 1 + Sprint 2 PASS

**Scenarios:**

1. **Idle Crowd** (100+ avatars)
   - Does crowd feel alive?
   - Does it feel natural?
   - Do conversations feel organic?

2. **Applause** (trigger from broadcast panel)
   - Do heads turn naturally?
   - Does attention propagate?
   - Does energy feel contagious?

3. **Tip Event** (send large tip)
   - Does crowd react?
   - Does tipper stand out?
   - Does performer's energy increase?

4. **Multi-Performer Attention** (two performers, alternate focus)
   - Do heads follow correctly?
   - Is attention shift smooth?
   - Is LOD handling invisible?

5. **Intermission** (performance → break → intermission)
   - Does crowd settle smoothly?
   - Does transition feel natural?
   - Are avatars responsive?

**Expected:** All five scenarios feel cinematic, organic, alive

**If failure:** Identify the broken behavior, check the corresponding runtime, fix, re-run Levels 1-2, then Level 3

---

## What NOT to Do During Certification

❌ **No new instrumentation** — HUD is finished  
❌ **No feature additions** — only fix broken links  
❌ **No redesigns** — patch the specific piece  
❌ **No skipping levels** — must be sequential  

---

## After Certification Passes

1. **Level 1 runs in CI/CD** (every commit)
2. **Level 2 runs pre-deployment** (every staging build)
3. **Level 3 runs pre-launch** (manual, on demand)
4. **Any regression** → revert the commit that broke it

---

## Meta-Rule: Governance for Future Systems

Added to CLAUDE.md:

> **Every new system must be accompanied by an automated certification before it becomes part of the canonical runtime.**

This applies to:
- Future Live Runtime
- Future Avatar Runtime
- Future Game Runtime
- Future Camera Runtime
- Future Audio Runtime
- Future AI Runtime
- Future Mobile Runtime
- Any other major system

---

## Files Created

```
apps/web/src/lib/live/
├── RuntimeCertificationSuite.ts          (252 lines)
└── IntegrationCertificationSuite.ts      (239 lines)

apps/web/src/app/api/debug/
├── runtime-certify/route.ts              (27 lines)
└── integration-certify/route.ts          (26 lines)

Root:
├── CERTIFICATION_FRAMEWORK.md            (505 lines)
└── CERTIFICATION_EXECUTION_PLAN.md       (this file)

CLAUDE.md:
└── Added Meta-Rule: Certification Requirement
```

---

## Timeline

```
Sprint 1 (Runtime):     ~30 min
Sprint 2 (Integration): ~45 min
Sprint 3 (Experience):  ~2 hours
─────────────────────────────
Total: ~3.5 hours spread across 2 days
```

---

## Success Definition

✅ **Certification Complete** when:

1. All Level 1 tests pass (automated)
2. All Level 2 tests pass (automated)
3. All Level 3 scenarios pass (human review)
4. No regressions in existing functionality
5. Typecheck passes with no errors

---

## Next Build Director Sprints (After Certification)

Once all three levels pass:

### Sprint A: Live Session Chain (Day 3-4)
- Ensure ONE authoritative event source
- Verify GO LIVE updates everywhere
- Stabilize Global Live Session Registry

### Sprint B: Soft Launch Certification (Day 4-5)
- Rule 20 final audit (no fake data)
- Mobile validation
- Performance validation under load
- Production deployment readiness

### Sprint C: Beyond
- Additional features (Perception, AI behaviors)
- Advanced monetization
- Scale infrastructure

---

## Questions for Build Director

1. **Should Level 1 run on every commit in CI/CD?**
   - Recommendation: Yes, to catch regressions immediately

2. **Should we pause feature work until Level 3 passes?**
   - Recommendation: Yes, prevents accumulation of unproven systems

3. **What's the threshold for "acceptable degradation" in performance tests?**
   - Current: <250x timing for 250x avatar increase
   - Should this be tighter (linear only)?

---

## Command Reference

**Local testing:**
```bash
npm run dev
curl http://localhost:3000/api/debug/runtime-certify
curl http://localhost:3000/api/debug/integration-certify
```

**In CI/CD:**
```bash
npm run test:certification:level1
npm run test:certification:level2
```

**Build:**
```bash
pnpm typecheck
pnpm build
```

---

Ready for execution. The framework is wired. Standing by for Build Director go-ahead to Sprint 1.
