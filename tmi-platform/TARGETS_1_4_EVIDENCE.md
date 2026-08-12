# Target 4 Execution Evidence — Active Room Truth Counter — 2026-08-12

**Branch:** `eos/vocal-improv-clean`  
**main:** CLOSED (`bf9024fd`)  
**Rule:** Code ≠ wired ≠ tested ≠ production certified. No percentage inflation.  
**T2 progressive caps:** untouched (still missing product policy).

---

## Prior targets (unchanged status)

| Target | Status |
|--------|--------|
| T1 Mobile / CC visual | **PENDING** owner phone acceptance |
| T2 createRoom boolean + 403 | **PASS** (unit) |
| T2 progressive caps | **FAIL / missing policy** (not invented) |
| T3 create chain code/unit | **PASS** |
| T3 two-account live browser join | **PENDING** (return here before T5) |

---

## Active definition (exact)

| Field | Value |
|-------|--------|
| Source of truth | `GET /api/live/go` → `count` |
| Registry read | `getActiveSessionsDurable()` → `getActiveSessions()` |
| Active condition | Session present in in-memory GlobalLiveSessionRegistry **and** `now - lastPingAt ≤ 120_000` ms (stale eviction) |
| Public count excludes | `privacy === "INVITE_ONLY"` (existing DiscoveryPublisher visibility) |
| Dedupe | Unique `roomId` (newest `startedAt` wins) |
| Never counted | LiveRegistry seed sessions, AnchorRoomNetwork anchors, `/rooms/*` page inventory, static lobby cards, demo FALLBACK rooms, stale DB rows not hydrated into registry |

Response also returns `activeDefinition` for audit and keeps `anchors` / `anchorDiscovery` **outside** `count`.

---

## Files / routes

| Role | Path |
|------|------|
| SoT API | `apps/web/src/app/api/live/go/route.ts` (GET) |
| Truth helpers | `apps/web/src/lib/broadcast/globalLiveSessionStore.ts` (`getActiveRoomTruthCount`, `listPublicActiveRooms`) |
| Client helper | `apps/web/src/lib/broadcast/activeRoomTruth.ts` |
| Badge | `apps/web/src/components/live/LiveNowActiveRoomsBadge.tsx` |
| UI: Live World screen | `apps/web/src/components/home/LiveWorldScreen.tsx` |
| UI: Home 3 | `apps/web/src/components/home/Home3LiveWorldSurface.tsx`, `Home3LiveDensityRail.tsx` |
| Unit test | `apps/web/src/tests/runActiveRoomTruthCounter.test.ts` |

Required label: **`LIVE NOW — N ACTIVE ROOMS`**

---

## Criteria board

| Criterion | Result |
|-----------|--------|
| Count derived only from GET `/api/live/go` / registry active set | **PASS** (code) |
| Seeds / anchors / `/rooms/*` not in `count` | **PASS** (GET uses `getActiveSessionsDurable`; anchors separate) |
| Duplicate `roomId` does not double-count | **PASS** (unit) |
| Ended/stale not counted | **PASS** (unit end + TTL definition) |
| INVITE_ONLY follows existing visibility (excluded from public N) | **PASS** (unit) |
| UI shows `LIVE NOW — N ACTIVE ROOMS` | **PASS** (wired) |
| Unit lifecycle baseline → +1 → end → baseline | **PASS** (`runActiveRoomTruthCounter.test.ts`) |
| Live runtime create/end proves UI N→N+1→N in browser | **FAIL / NOT RUN** |
| Live discovery listing of created room (browser) | **FAIL / NOT RUN** (depends on T3 runtime) |

**T4 status: NOT 100%.** Implementation + unit lifecycle PASS; production certification blocked until real create/end runtime session proves UI count movement.

---

## Regression gates this pass

- `runActiveRoomTruthCounter.test.ts` — **PASS**
- `runActiveRoomInventoryCreateRoom.test.ts` — **PASS**
- `runEntitlementMatrix.test.ts` — **PASS** (T2 create boolean unchanged; caps still placeholders)
- `pnpm typecheck` (apps/web) — **PASS**
- Production build — not re-run if `.next` still contested; treat as environment gate still open

---

## Next

1. Close **T3 two-account live join** with the same registry.  
2. Use that session to certify T4 runtime N→N+1→N.  
3. Only then authorize **T5 Lounges**.
