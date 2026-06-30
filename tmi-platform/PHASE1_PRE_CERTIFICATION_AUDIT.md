# Phase 1: Pre-Certification Audit Plan

**Objective**: Before running Level 1 & 2 certification suites, verify the Live Session Chain is architecturally sound.

**Timeline**: 1 day (intensive audit)

**Purpose**: Identify broken links now, so certifications succeed on first run.

---

## Audit Task 1: Canonical Registry Verification

### Question: Is there ONE authoritative GlobalLiveSessionRegistry?

**Search**:
```bash
grep -r "GlobalLiveSessionRegistry" apps/web/src/lib/
grep -r "liveSessionRegistry" apps/web/src/lib/ --ignore-case
grep -r "LiveRegistry" apps/web/src/lib/ --ignore-case
grep -r "ACTIVE_SESSIONS" apps/web/src/lib/ --ignore-case
```

**Look for**:
- [ ] Exactly ONE file that owns the canonical live session data
- [ ] All other systems read FROM it, never write to it
- [ ] Clear interface (what fields are stored? what's the schema?)
- [ ] Real-time update mechanism (pub/sub? event emitter? WebSocket?)

**Document**:
- File name and location
- Data model (fields, types)
- Update mechanism
- Who writes to it (only one source?)
- Who reads from it (all 15 destinations?)

**If not found or multiple versions exist**:
- Flag as BLOCKER
- Estimate work to consolidate

---

## Audit Task 2: Polling vs. Subscribing Inventory

### Question: How many surfaces still POLL for live data instead of SUBSCRIBING?

**Polling is bad**: Surfaces ask "is there new live data?" every N seconds → stale, inefficient, wrong latency

**Subscribing is good**: Surfaces listen for live updates → real-time, efficient, correct latency

**Search**:
```bash
grep -r "setInterval" apps/web/src/components/ | grep -i "live\|session\|room"
grep -r "setTimeout" apps/web/src/components/ | grep -i "live\|session\|room"
grep -r "refetchInterval" apps/web/src/app/ | grep -i "live"
grep -r "cache.*false" apps/web/src/app/ | grep -i "live"
```

**Also check**:
- Components calling `/api/live/` endpoints
- Do they have explicit refresh timers?
- Or do they subscribe to real-time updates?

**Document for each surface**:

| Surface | Current Method | Update Latency | Issue | Fix |
|---------|---|---|---|---|
| Homepage (Home 3) | Polling / Subscribing | ? | ? | ? |
| Discovery | Polling / Subscribing | ? | ? | ? |
| Billboards | Polling / Subscribing | ? | ? | ? |
| Admin | Polling / Subscribing | ? | ? | ? |
| [etc.] | | | | |

**Target**: All 15 surfaces should be SUBSCRIBING, not polling.

---

## Audit Task 3: GO LIVE Entry Points

### Question: Where can a performer trigger GO LIVE?

**Search**:
```bash
grep -r "goLive\|go.*live\|startLive" apps/web/src/ --ignore-case
grep -r "recordReaction\|recordTip\|recordVote" apps/web/src/lib/live/
find apps/web/src/components/hq -name "*live*" -o -name "*broadcast*" -o -name "*go*"
```

**For each GO LIVE entry point**, verify:
- [ ] It writes to GlobalLiveSessionRegistry (not a separate system)
- [ ] It uses the same schema as other entry points
- [ ] It triggers all 15 destinations

**Document all entry points**:

| Entry Point | Location | Writes to | Latency Target |
|---|---|---|---|
| Go Live Button (HQ) | `components/hq/GoLivePanel` | GlobalLiveSessionRegistry | <500ms |
| Start Concert | `components/concert/StartConcert` | ? | <500ms |
| Mini Cypher | `components/cypher/StartCypher` | ? | <500ms |
| [etc.] | | | |

**Target**: Every entry point writes to the SAME registry with consistent schema.

---

## Audit Task 4: Event Flow Dependency Map

### Create a visual dependency map

```
GO LIVE (any entry point)
  ↓
GlobalLiveSessionRegistry (CANONICAL)
  ├─ emits "liveSessionCreated" event
  └─ broadcast to all subscribers
  
Subscribers (15 destinations):
├─ Home 3 Component
│  └─ reads registry, renders live room
├─ Discovery Engine
│  └─ adds room to discovery ranking
├─ Billboard Component
│  └─ renders preview panel
├─ Notifications System
│  └─ sends alerts to followers
├─ Admin Dashboard
│  └─ displays live room in grid
├─ Venue Dashboard
│  └─ shows room stats
├─ Promoter Dashboard
│  └─ tracks revenue/attendance
├─ Search Index
│  └─ marks as "live" for search filter
├─ Mobile API
│  └─ returns live sessions to app
├─ Analytics Engine
│  └─ records "liveSessionStarted" event
├─ Ranking System
│  └─ boosts performer in rankings
├─ Magazine Live Modules
│  └─ displays live room preview
├─ [14th destination]
└─ [15th destination]
```

**For each destination**:
- [ ] Clearly identify how it gets live data (subscribe? query? API?)
- [ ] Trace latency path (how long from GO LIVE to visible?)
- [ ] Check for circular dependencies (if A depends on B and B depends on A, that's bad)

---

## Audit Task 5: API Endpoint Audit

### Question: Are all relevant API endpoints wired correctly?

**Check these endpoints**:

```bash
/api/live/sessions              # List active live sessions
/api/live/sessions/[id]         # Get single session details
/api/live/sessions/[id]/events  # Stream of events from a session
/api/live/followers/[id]        # Get user's followers
/api/live/search?q=...&live=true # Search with live filter
/api/admin/live                 # Admin live sessions dashboard
/api/venue/[id]/live            # Venue's live sessions
/api/promoter/[id]/live         # Promoter's live sessions
/api/analytics/live/[id]        # Analytics for live session
```

**For each endpoint**:
- [ ] Does it exist?
- [ ] Does it read from GlobalLiveSessionRegistry?
- [ ] Does it return real data or cached/stale data?
- [ ] Is response time <500ms?
- [ ] Does it handle "no active sessions" gracefully?

**Document issues**:

| Endpoint | Status | Latency | Issue | Priority |
|---|---|---|---|---|
| /api/live/sessions | ✓/✗ | ? | ? | ? |
| [etc.] | | | | |

---

## Audit Task 6: Data Flow Consistency Check

### Question: When GO LIVE fires, does the same data reach all destinations?

**Manual test**:

1. **Trigger**: Performer presses GO LIVE
2. **Capture**: Simultaneously check what each destination sees
3. **Compare**: Are all 15 destinations showing the same live room?

**Create comparison table**:

| Destination | Room ID | Performer Name | Audience Count | Start Time | Status |
|---|---|---|---|---|---|
| Home 3 | ABC123 | John Doe | 42 | 14:30:00 | MATCH |
| Discovery | ABC123 | John Doe | 42 | 14:30:00 | MATCH |
| Admin | ABC123 | John Doe | 42 | 14:30:00 | MATCH |
| [etc.] | | | | | |

**Issues to flag**:
- Room ID mismatch (different IDs = different sources of truth)
- Data mismatch (name/count/time different = not synchronized)
- Missing from one destination (incomplete propagation)
- Stale data (timestamp older than GO LIVE time)

---

## Audit Task 7: Error Handling & Fallbacks

### Question: What happens if something breaks?

**Scenarios**:

1. **Registry goes down**
   - [ ] Do all 15 destinations fail gracefully?
   - [ ] Or do they show stale/cached data?
   - [ ] Is there a retry mechanism?

2. **One subscriber can't update (e.g., Notifications fails)**
   - [ ] Does it block other subscribers from updating?
   - [ ] Or do other 14 destinations still update?
   - [ ] Is the failure logged?

3. **Network latency spike**
   - [ ] Does a 2-second delay break anything?
   - [ ] Or do destinations wait for correct data?

4. **Duplicate GO LIVE (same performer, same room, triggered twice)**
   - [ ] Does it create one session or two?
   - [ ] Is deduplication working?

**Document for each scenario**:
- Current behavior
- Expected behavior
- If different, flag as ISSUE

---

## Audit Task 8: Performance Baseline

### Measure current latency for each surface

```bash
Time A: GO LIVE button pressed
  ↓
Time B: Home 3 displays live room
  ↓ Latency = B - A (target: <2 seconds)

Time A: GO LIVE button pressed
  ↓
Time B: Admin sees live room
  ↓ Latency = B - A (target: <2 seconds)

[repeat for all 15 destinations]
```

**Create baseline table**:

| Destination | Current Latency | Target | Status |
|---|---|---|---|
| Home 3 | 450ms | <2s | ✓ GOOD |
| Admin | 1.2s | <2s | ✓ GOOD |
| Search | 850ms | <2s | ✓ GOOD |
| Mobile API | 2.3s | <2s | ✗ OVER |
| [etc.] | | | |

**If any destination is >2s**:
- Identify bottleneck (network? query? rendering?)
- Flag for optimization

---

## Audit Task 9: Documentation & Ownership

### Create final summary

**Owner**: Who is responsible for each destination?

| Destination | Owner | Current Status | Blocking Issues |
|---|---|---|---|
| Home 3 | ? | READY / NEEDS WORK | NONE / LIST |
| Admin | ? | READY / NEEDS WORK | NONE / LIST |
| [etc.] | | | |

**Blockers to fix before certification**:

| Blocker | Impact | Effort | Priority |
|---|---|---|---|
| GlobalLiveSessionRegistry missing | CRITICAL | 4h | P0 |
| Mobile API polling instead of subscribing | HIGH | 2h | P1 |
| [etc.] | | | |

---

## Pre-Certification Audit Checklist

- [ ] Task 1: One canonical GlobalLiveSessionRegistry identified
- [ ] Task 2: All 15 surfaces identified (polling vs. subscribing)
- [ ] Task 3: All GO LIVE entry points mapped
- [ ] Task 4: Dependency map created
- [ ] Task 5: All relevant APIs checked and functional
- [ ] Task 6: Data flow consistency verified (same data reaches all destinations)
- [ ] Task 7: Error handling and fallbacks documented
- [ ] Task 8: Performance baseline established
- [ ] Task 9: Ownership and blockers documented

---

## Output: Pre-Certification Report

Create `PHASE1_AUDIT_REPORT.md` containing:

1. **System Architecture Summary**
   - GlobalLiveSessionRegistry location and schema
   - Complete dependency graph
   - All 15 destinations and how they receive updates

2. **Issues Found**
   - Blockers (must fix before certification)
   - High-priority (fix before certification)
   - Low-priority (can fix after)

3. **Performance Baseline**
   - Current latency for each destination
   - Targets vs. actuals
   - Optimization opportunities

4. **Ownership Matrix**
   - Who owns each destination
   - Who owns the registry
   - Who owns each entry point

5. **Certification Readiness**
   - READY TO CERTIFY? YES / NO
   - If NO, what must be fixed?
   - Estimated time to fix blockers

---

## Timeline

```
Day 1 Morning   (2-3 hours): Tasks 1-4 (registry, polling inventory, entry points, dependency map)
Day 1 Afternoon (2-3 hours): Tasks 5-9 (APIs, data flow, error handling, perf, documentation)

Output: Pre-Certification Report

If BLOCKERS found:
  → Fix them immediately (shouldn't take long with clear map)
  → Rerun relevant audit tasks
  → Once clean, proceed to certification

If NO BLOCKERS found:
  → Proceed directly to Level 1 + Level 2 certification suites
```

---

## Success Criteria for Pre-Cert Audit

- [ ] One canonical live session registry clearly identified
- [ ] All 15 destinations mapped and subscribing (not polling)
- [ ] All entry points write to same registry with consistent schema
- [ ] Dependency graph is acyclic (no circular dependencies)
- [ ] All relevant APIs exist and return correct data
- [ ] Data flow consistency verified (same data reaches all destinations)
- [ ] Error handling exists for common failure modes
- [ ] Performance baseline measured (<2s target for all destinations)
- [ ] Clear ownership assigned
- [ ] Zero blockers remaining (or blockers fixed)

---

## What This Prevents

This audit prevents the certification suites from finding issues like:

- Multiple conflicting sources of truth
- Surfaces polling instead of subscribing (stale data, high latency)
- Inconsistent data reaching different destinations
- Circular dependencies
- Missing or broken API endpoints
- Over-latency scenarios

By fixing these now, the certification suites will pass on the first run.

---

## Next Step

Once this audit is complete and blockers are fixed:

→ Execute Level 1 & 2 Certification Suites with high confidence of passing
