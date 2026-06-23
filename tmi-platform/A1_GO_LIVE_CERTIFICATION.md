# A1 Go Live Certification

**Objective:** Prove the platform's core discovery loop works end-to-end without fake data.

**Gate:** 20/20 consecutive test passes (no fake viewers, no duplicate sessions, no ghost broadcasts).

---

## Test Scenarios

### T1: Single Performer Go Live → Discovery Propagation

**Setup:**
- Performer account: Big Ace (userId: `test-performer-1`)
- Room: `battle-test-001`
- Title: "Test Battle Stream"
- Category: `battle`

**Execution:**
1. POST `/api/live/go` with GoLivePayload
2. Verify: Session appears in GlobalLiveSessionRegistry
3. Verify: Home 1 orbital wheel shows Big Ace as LIVE
4. Verify: Home 1-2 billboard wall shows broadcast
5. Verify: Home 3 live world shows room
6. Verify: Billboard lobby wall renders room
7. Verify: `/live/lobby` route loads and room is listed
8. Performer ends broadcast
9. Verify: Session removed from registry
10. Verify: LIVE badge removed from all surfaces

**Pass Condition:** All 10 steps succeed with zero fake data.

---

### T2: Multiple Performers (Concurrent Live Streams)

**Setup:**
- Performer 1: Lani Flame (`test-performer-2`)
- Performer 2: DJ Blend (`test-performer-3`)
- Performer 3: Astra Nova (`test-performer-4`)

**Execution:**
1. P1 goes live (category: `live`)
2. Verify: Surfaces show 1 live room
3. P2 goes live (category: `concert`)
4. Verify: Surfaces show 2 live rooms (sorted by viewer count, then recency)
5. P3 goes live (category: `cypher`)
6. Verify: Surfaces show 3 live rooms in correct order
7. P1 viewer count increments: POST `/api/live/ping?userId=test-performer-1&viewerCount=125`
8. Verify: P1 moves to top of list (highest viewer count)
9. All three end broadcasts
10. Verify: All sessions removed, surfaces show 0 live rooms

**Pass Condition:** Viewer count correctly reorders sessions; no fake data injected.

---

### T3: Stress Test (10 Concurrent Broadcasters)

**Setup:**
- 10 test performers (test-performer-5 through test-performer-14)
- Each goes live with different categories (5 battles, 3 concerts, 2 cyphers)

**Execution:**
1. All 10 register simultaneously via POST `/api/live/go`
2. Verify: GlobalLiveSessionRegistry has exactly 10 sessions
3. Verify: Home 1 orbital wheel has 10 performers with LIVE badge
4. Verify: Home 3 live world shows all 10 rooms
5. Verify: Rooms appear in correct sorted order (viewer count desc, recency tiebreak)
6. Simulate viewer entry for each room: 100, 200, 300, ... 1000
7. Verify: Rooms re-sort correctly by viewer count
8. All 10 end broadcasts
9. Verify: Registry back to 0 sessions

**Pass Condition:** No race conditions, no duplicate sessions, correct sorting.

---

### T4: Lobby Wall Population (No Fake Occupancy)

**Setup:**
- Performer goes live in battle
- Room capacity: 2730 seats (as defined in code)

**Execution:**
1. Performer goes live: room registers to GlobalLiveSessionRegistry
2. Fan 1 joins: POST `/api/live/audience?roomId=room-1&userId=fan-1`
3. Verify: Audience count updates in registry
4. Fan 2-20 join incrementally
5. Verify: Lobby wall seat grid updates with real seat assignments (NOT fake occupancy %)
6. Verify: No `generateSeats()` mock data used
7. All fans leave
8. Verify: Lobby wall shows empty seats (honest state, not fake occupancy)

**Pass Condition:** TMILobbyWall.tsx uses real `GlobalLiveSessionRegistry` + `audienceRuntimeEngine`, not hardcoded `isLive: true` or `Math.random() < 0.72`.

---

### T5: Billboard Wall Rendering (No Hardcoded isLive)

**Setup:**
- WorldLobbySection.tsx currently has hardcoded VENUES with `isLive: true`

**Execution:**
1. Verify: WorldLobbySection queries GlobalLiveSessionRegistry instead
2. Verify: Only sessions in registry show LIVE badge
3. Verify: Viewer count is real (from registry), not fake random increments
4. Perform test T1 (single go live)
5. Verify: WorldLobbySection shows updated viewer count (not incremented by interval)
6. End broadcast
7. Verify: LIVE badge removed from WorldLobbySection (not stuck)

**Pass Condition:** WorldLobbySection.tsx line 28 removed (no `setInterval` fake jitter); all data from GlobalLiveSessionRegistry.

---

### T6: Home 3 Live World (No Hardcoded Mock Data)

**Setup:**
- Home3MainPreviewLobby currently has hardcoded mock rooms with `isLive: true`

**Execution:**
1. Verify: Home 3 queries GlobalLiveSessionRegistry
2. Verify: Mock ROOMS array removed or deprioritized
3. Verify: Only real sessions show as LIVE
4. Perform test T3 (10 concurrent broadcasters)
5. Verify: Home 3 displays all 10 real rooms
6. Verify: Viewer counts are real, not fake

**Pass Condition:** Home3MainPreviewLobby.tsx no longer shows hardcoded `isLive: true` rooms when real sessions exist.

---

### T7: End-to-End User Journey (Happy Path)

**Setup:**
- Fan account, Performer account, real browser session

**Execution:**
1. Fan signs in
2. Fan navigates to Home 1
3. Performer goes live (category: `live`)
4. Verify: Performer appears on Home 1 orbital wheel with LIVE badge
5. Fan clicks performer card
6. Verify: Routed to performer profile or live room
7. Fan joins audience
8. Verify: Fan appears in lobby wall seating
9. Fan sends tip ($5)
10. Verify: Tip recorded, performer sees revenue update
11. Performer ends broadcast
12. Verify: Performer removed from all discovery surfaces
13. Fan refreshes Home 1
14. Verify: Performer no longer shows LIVE

**Pass Condition:** Complete user flow works without fake data injection.

---

### T8: Ghost Session Cleanup (Stale Session Removal)

**Setup:**
- Performer goes live and then crashes (doesn't call `endLiveSession()`)

**Execution:**
1. Performer registers session at T=0
2. System pings registry every 30s
3. At T=120s (2 min), no ping received
4. Verify: Session auto-removed from GlobalLiveSessionRegistry (MAX_STALE_MS = 120_000)
5. Verify: LIVE badge removed from all surfaces
6. Verify: No ghost session remains

**Pass Condition:** Stale session eviction works; no manual cleanup needed.

---

### T9: Discovery Rail Integration (Real Sessions Only)

**Setup:**
- DiscoveryRail component queries live sessions

**Execution:**
1. Verify: DiscoveryRail queries GlobalLiveSessionRegistry (not hardcoded performers)
2. Verify: Only `isLive: true` in registry appears
3. Register 3 test sessions
4. Verify: DiscoveryRail shows 3 real rooms
5. Remove 1 session
6. Verify: DiscoveryRail updates to 2 rooms

**Pass Condition:** DiscoveryRail never shows hardcoded `isLive: true` flags; only real registry sessions.

---

### T10: Backward Compatibility (LiveRegistry Migration)

**Setup:**
- Old code still uses LiveRegistry (not GlobalLiveSessionRegistry)

**Execution:**
1. Verify: New sessions register in BOTH LiveRegistry (compat) and GlobalLiveSessionRegistry
2. Verify: Old surfaces reading LiveRegistry still work
3. Verify: New surfaces reading GlobalLiveSessionRegistry work
4. Plan migration path for old surfaces

**Pass Condition:** No breaking changes during migration.

---

## Critical Code Locations to Fix

### 1. WorldLobbySection.tsx

**Current (fake data):**
```tsx
const VENUES = [
  { ..., viewers: 3400, isLive: true, ... }
  // line 28: setInterval(() => setViewers(...), 3500)
]
```

**Fix:**
```tsx
// Query GlobalLiveSessionRegistry instead
import { getActiveSessions } from '@/lib/broadcast/GlobalLiveSessionRegistry'
const sessions = getActiveSessions()
```

---

### 2. Home3MainPreviewLobby.tsx

**Current (fake data):**
```tsx
const MOCK_ROOMS = [
  { ..., viewers: 847, isLive: true, ... }
]
```

**Fix:**
```tsx
// Query GlobalLiveSessionRegistry by category
import { getSessionsByCategory } from '@/lib/broadcast/GlobalLiveSessionRegistry'
const sessions = getSessionsByCategory('live')
```

---

### 3. TMILobbyWall.tsx

**Current (fake data):**
```tsx
function generateSeats(total: number): Seat[] {
  // ... random occupancy
}
```

**Fix:**
```tsx
// Use real audience from audienceRuntimeEngine
import { audienceRuntimeEngine } from '@/lib/live/audienceRuntimeEngine'
const seats = audienceRuntimeEngine.getSeatsForRoom(roomId)
```

---

## Pass Criteria

**A1 passes if:**
- ✅ 20/20 test scenarios pass
- ✅ Zero hardcoded `isLive: true` flags remain on critical surfaces
- ✅ Zero fake viewer count increments remain
- ✅ Zero fake seat generation remains
- ✅ All discovery surfaces query GlobalLiveSessionRegistry
- ✅ Stale session cleanup works
- ✅ No console errors during happy path

**A1 fails if:**
- ❌ Any hardcoded `isLive: true` remains active
- ❌ Any surface shows fake viewer counts
- ❌ Any test produces duplicate sessions
- ❌ Any surface shows ghost broadcasts after end

---

## Execution Order

1. Fix WorldLobbySection.tsx (remove line 28 fake jitter)
2. Fix Home3MainPreviewLobby.tsx (remove mock rooms or deprioritize)
3. Fix TMILobbyWall.tsx (use real seats, not generateSeats mock)
4. Run T1-T4 (basic functionality)
5. Run T5-T9 (integration tests)
6. Run T10 (backward compat check)
7. Run full happy path (T7)
8. Report results

---

## Success = Gateway Opens

Once A1 passes, soft launch is authorized to accept real performers.
