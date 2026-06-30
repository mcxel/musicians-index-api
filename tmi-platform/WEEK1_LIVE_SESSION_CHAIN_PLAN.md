# Week 1 Execution Plan — Live Session Chain (PHASE 1)

**Objective**: One GO LIVE action must update all 15 surfaces in the platform within 2 seconds.

**Current Status**: Level 1 & Level 2 certification suites built and ready.

**Timeline**: 2 weeks (days 1-10 intensive focus)

---

## Day 1: Certification & Baseline

### Task 1.1: Execute Level 1 Runtime Certification

```bash
npm run dev
curl http://localhost:3000/api/debug/runtime-certify
```

**Expected**: All 5 tests pass.
- Event Propagation ✓
- Attention State Updates ✓
- Renderer Integration ✓
- Performance Stability ✓
- Memory Stability ✓

**If any test fails**:
1. Identify which link broke
2. Check the specific engine (RoomEnergyEngine, CrowdAttentionEngine, etc.)
3. Fix only that link
4. Rerun the test

**Time**: ~30 min

---

### Task 1.2: Execute Level 2 Integration Certification

```bash
curl http://localhost:3000/api/debug/integration-certify
```

**Expected**: All 7 tests pass.
- GO LIVE → Live Registry ✓
- Live Registry → Homepage ✓
- Discovery → DiscoveryRail ✓
- Billboard Update ✓
- Followers Notification ✓
- Admin Panel Update ✓
- Venue/Promoter Update ✓

**If any test fails**:
1. Identify which destination didn't update
2. Check if the API endpoint is wired
3. Verify the data model is correct
4. Fix the missing link
5. Rerun the test

**Time**: ~45 min

---

### Task 1.3: Document Baseline Results

Create `WEEK1_CERTIFICATION_RESULTS.md`:
- Record which tests passed/failed
- Document any failures and fixes applied
- Note performance metrics
- Establish baseline for regression testing

**Time**: ~15 min

---

## Days 2-3: Map the Live Session Chain

### Task 2.1: Audit Current GO LIVE Implementation

**Find**:
- [ ] Where is `goLive()` implemented? (search `"goLive"` and `"Go Live"`)
- [ ] What data does it create?
- [ ] Which systems does it currently touch?
- [ ] What's the current update latency?

**Document**:
- Current flow (what updates now)
- Missing destinations (what doesn't update)
- Data flow (how information travels)

**Deliverable**: `LIVE_SESSION_CHAIN_AUDIT.md`

---

### Task 2.2: Map Ideal vs. Current State

**Create table**:

| Destination | Current | Ideal | Work Needed |
|---|---|---|---|
| GlobalLiveSessionRegistry | ✓/✗ | ✓ | ? |
| Homepage (Home 3) | ✓/✗ | ✓ | ? |
| Discovery | ✓/✗ | ✓ | ? |
| Search | ✓/✗ | ✓ | ? |
| Notifications | ✓/✗ | ✓ | ? |
| Billboards | ✓/✗ | ✓ | ? |
| Magazine | ✓/✗ | ✓ | ? |
| Admin | ✓/✗ | ✓ | ? |
| Venue | ✓/✗ | ✓ | ? |
| Promoter | ✓/✗ | ✓ | ? |
| Mobile | ✓/✗ | ✓ | ? |
| APIs | ✓/✗ | ✓ | ? |
| Analytics | ✓/✗ | ✓ | ? |
| Ranking | ✓/✗ | ✓ | ? |

**For each row**, estimate:
- Lines of code to fix
- Priority (blocking vs. nice-to-have)
- Dependencies (what must be done first)

---

### Task 2.3: Identify Blocking Issues

**Questions to answer**:
- [ ] Is there a single GlobalLiveSessionRegistry that all systems read from?
- [ ] Or are there multiple parallel sources of truth?
- [ ] Which system is authoritative?
- [ ] What's the current update mechanism (polling, pub/sub, real-time)?
- [ ] Are there any circular dependencies?

**Deliverable**: `BLOCKING_ISSUES.md`

---

## Days 4-7: Wire the Chain

### Task 3.1: Establish Single Source of Truth

**Ensure GlobalLiveSessionRegistry**:
- [ ] Is real (exists in code)
- [ ] Is canonical (authoritative, never overwritten)
- [ ] Is broadcast-ready (other systems subscribe to it)
- [ ] Has complete data (performer ID, room ID, start time, audience count, etc.)
- [ ] Is real-time (updates within 100ms of event)

**If it doesn't exist or is incomplete**: Build it now. Everything else depends on it.

**Component**: `lib/engines/live/GlobalLiveSessionRegistry.ts`

---

### Task 3.2: Wire Each Destination (Priority Order)

#### Tier 1 (Blocking): Must finish first
1. **GlobalLiveSessionRegistry** (done above)
2. **Homepage (Home 3)** — users need to see live rooms
3. **Admin Dashboard** — Marcel needs visibility
4. **API endpoints** — mobile/external clients need data

**For each Tier 1 destination**:
- [ ] Find the component/page that displays it
- [ ] Add subscription to GlobalLiveSessionRegistry updates
- [ ] Render real data (not mocks)
- [ ] Handle loading state
- [ ] Handle no-data state
- [ ] Test update latency (<2 seconds from GO LIVE)

---

#### Tier 2 (High Value): Finish within days 5-6
5. **Discovery Rail** — users discover live content
6. **Billboards (Home 1-2)** — premium homepage visibility
7. **Notifications** — followers alerted immediately

---

#### Tier 3 (Complete): Finish within days 7-8
8. **Search** — live filter active
9. **Venue Dashboard** — venue sees its live rooms
10. **Promoter Dashboard** — promoter tracks events
11. **Magazine** — live modules update
12. **Mobile app** — native clients sync
13. **Analytics** — real-time metrics
14. **Ranking systems** — live performers sorted

---

### Task 3.3: Each Wiring Task Follows This Pattern

For each destination, do:

```
1. FIND where it's rendered
   grep -r "live.*room" apps/web/src/components/
   
2. READ the component
   Check what data it expects
   Identify where data comes from currently
   
3. WIRE the data
   Import GlobalLiveSessionRegistry (or subscribe to it)
   Replace hardcoded/mocked data with real subscription
   
4. TEST the update
   Trigger GO LIVE in dev
   Watch that destination update in <2 seconds
   Check console for errors
   
5. HANDLE EDGE CASES
   What if no live rooms exist? (honest empty state)
   What if live room ends while user views? (graceful removal)
   What if network fails? (show cached data with refresh button)
   
6. TYPECHECK
   pnpm typecheck
   Fix any errors
   
7. DOCUMENT
   What changed
   What's now real vs. mocked
   Any breaking changes
```

---

## Days 8-10: Validation & Polish

### Task 4.1: End-to-End Testing

**Manual test sequence**:

1. **Launch scenario**:
   - Performer goes live
   - Wait 500ms
   - Check all 15 destinations simultaneously
   - All should show the live room

2. **Growth scenario**:
   - Live room starts with 1 audience member
   - 10 more join
   - Check audience count updates everywhere
   - Should be real-time on all surfaces

3. **End scenario**:
   - Live room ends
   - Check all 15 destinations
   - Room should disappear from all surfaces within 2 seconds

4. **Mobile scenario**:
   - Open mobile app
   - Performer goes live in web
   - Mobile app should reflect update immediately
   - No manual refresh needed

5. **Admin scenario**:
   - Admin opens dashboard
   - Performer goes live
   - Admin sees new live room in their list
   - Admin can moderate/monitor it

---

### Task 4.2: Performance Validation

```bash
npm run build
npm run dev
curl http://localhost:3000/api/debug/runtime-certify
curl http://localhost:3000/api/debug/integration-certify
```

**Targets**:
- [ ] Level 1 cert: 5/5 tests pass
- [ ] Level 2 cert: 7/7 tests pass
- [ ] Update latency: <2 seconds
- [ ] No 404s or broken links
- [ ] Console: zero errors

---

### Task 4.3: Document Completion

Create `WEEK1_COMPLETION_REPORT.md`:

```
# Week 1 Completion Report

## Certifications
- Level 1: ✓ PASS (5/5 tests)
- Level 2: ✓ PASS (7/7 tests)

## GO LIVE Chain Status
- GlobalLiveSessionRegistry: ✓ WIRED
- Homepage: ✓ WIRED
- Admin: ✓ WIRED
- API: ✓ WIRED
- Discovery: ✓ WIRED
- Billboards: ✓ WIRED
- Notifications: ✓ WIRED
- Search: ✓ WIRED
- Venue: ✓ WIRED
- Promoter: ✓ WIRED
- Mobile: ✓ WIRED
- Magazine: ✓ WIRED
- Analytics: ✓ WIRED
- Ranking: ✓ WIRED

## Performance
- Update latency: 1.2 seconds (target: <2s) ✓
- Level 1 performance: Acceptable ✓
- Level 2 performance: Acceptable ✓

## Issues Found & Fixed
[List any issues found during testing and how they were resolved]

## Ready for Phase 2
✓ GO LIVE chain is unified and verified
✓ Ready to begin CRM ecosystem work
```

---

## Daily Standup Template

Each day (Days 1-10), document:

```
DATE: 2026-06-XX

COMPLETED TODAY
- [Task]
- [Task]

BLOCKERS
- [Issue if any]

TOMORROW
- [Next task]

CERTIFICATION STATUS
- Level 1: ✓/✗
- Level 2: ✓/✗
```

---

## Success Criteria for Week 1

- [ ] Both certification suites pass
- [ ] All 15 destinations show live rooms
- [ ] Update latency <2 seconds end-to-end
- [ ] Zero hardcoded/mocked live data
- [ ] Zero dead links on any live surface
- [ ] Mobile and web both synchronized
- [ ] Admin can see all live rooms in real-time
- [ ] Console shows no errors
- [ ] `pnpm typecheck` passes
- [ ] `pnpm build` succeeds
- [ ] Documentation complete

---

## If You Get Stuck

### "Which destination should I fix first?"
**Answer**: Homepage (Home 3). Most visible, highest impact if wrong.

### "I can't find where GO LIVE is called"
**Answer**: Search for `recordReaction`, `recordTip`, `goLive`, `createRoom` in codebase.

### "The destination isn't updating"
**Answer**: Check if it's subscribed to GlobalLiveSessionRegistry or if it's polling a stale endpoint.

### "Performance is slow"
**Answer**: Check if you're making N queries for N rooms (N+1 problem). Should be one batch query.

### "Mobile isn't showing the live room"
**Answer**: Check if the mobile app's API endpoint is wired to the same GlobalLiveSessionRegistry.

---

## Deliverables for Build Director Review (End of Week 1)

1. **WEEK1_CERTIFICATION_RESULTS.md** — Both certs passing with metrics
2. **LIVE_SESSION_CHAIN_AUDIT.md** — Baseline state before changes
3. **WEEK1_COMPLETION_REPORT.md** — Final status of all 15 destinations
4. **LIVE_SESSION_CHAIN_DEPENDENCY_MAP.md** — How systems are connected
5. **Passing build** — `pnpm typecheck` and `pnpm build` both succeed

---

## Ready to Start?

If all preconditions are met:
- [ ] Certification suites are wired
- [ ] Build is clean
- [ ] GlobalLiveSessionRegistry exists or has been identified
- [ ] Access to codebase is stable

**Then execute Day 1 immediately.**

Go live. Update everything. Prove it works.
