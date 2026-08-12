# Targets 1–3 Execution Evidence — 2026-08-12

**Branch:** `eos/vocal-improv-clean`  
**main:** CLOSED (`bf9024fd`)  
**Rule:** Code ≠ wired ≠ tested ≠ production certified. No percentage inflation.

---

## Target 1 — Mobile / Command Center Visual Acceptance

| Criterion | Result | Notes |
|-----------|--------|-------|
| Automated 9-cell width/exclusive-shell measure | PASS (prior report) | `MOBILE_VISUAL_CERT_MEASURE.md` authenticated matrix |
| Visible hierarchy `monitor→controls→mini-player→quick→drawer` on Marcel phone | **PENDING / NOT CERTIFIED** | Requires Marcel UX acceptance — agent cannot mark 100% |
| AVATAR/MEMORY/PLAYLIST/YOPHO reachable | PENDING | Toolbar candidate `55da3f5e` — phone confirm needed |
| Drawers do not vanish | PENDING | Phone confirm |
| OPS/CHAT do not resize stage | PENDING | Candidate `c6777f33` — phone confirm |
| No random floating workspaces | PENDING | Fix #2 adjacency |

**T1 status: NOT 100%.** Automated measure ≠ Marcel acceptance. No shell redesign in this pass.

---

## Target 2 — Subscription Entitlement Policy

### Locked rule applied
- Canon: `FREE → PRO → RUBY → SILVER → GOLD → PLATINUM → DIAMOND`
- `createRoomEnabled = (tier index >= PLATINUM)` only
- **Removed** creator≥PRO bypass — role/ADMIN cannot grant create

### Files
- `apps/web/src/lib/subscriptions/SubscriptionEntitlementEngine.ts`
- `apps/web/src/lib/subscriptions/assertCreateRoomEntitlement.ts` (DB tier + 403 helper)
- `apps/web/src/tests/runEntitlementMatrix.test.ts` — all 7 tiers × fan/performer

### Per-tier createRoomEnabled
| Tier | Fan | Performer |
|------|-----|-----------|
| FREE | false | false |
| PRO | false | false |
| RUBY | false | false |
| SILVER | false | false |
| GOLD | false | false |
| PLATINUM | true | true |
| DIAMOND | true | true |

### Progressive caps (honest gap)
`SubscriptionPlanEngine` does **not** define room-creation limits. Engine already had local fields `maxSimultaneousRooms` / `unlockedSkinSlots` (platinum 3/8, diamond 10/20; gold max rooms forced to 0). **These are not product-canon until named in the subscription plan manifest.** T2 progressive-capability gate = **PARTIAL** — create boolean locked; caps reported as non-canon placeholders.

### Server rejection
- `POST /api/rooms` → `assertCreateRoomEntitlement` → **403** if ineligible
- `POST /api/live/go` with `intent: "create-room"` / `createRoom: true` → **403** if ineligible
- Ordinary Go Live (no create-room intent) remains auth-only (does not steal CREATE ROOM gate)

**T2 createRoom boolean + 403 + 7-tier tests: PASS.** Progressive plan-canon caps: **FAIL / missing policy.** Overall T2 **not 100%**.

---

## Target 3 — CREATE ROOM End-to-End P0

### Chain (converged, not duplicated)
1. **Button:** `BillboardLiveWall` → `/live/rooms/new`
2. **Page:** `apps/web/src/app/live/rooms/new/page.tsx` → `POST /api/live/go` `{ intent: "create-room", createRoom: true }`
3. **Alt path:** `POST /api/rooms` (cypher/dirty-dozens create) also gated + registers registry
4. **Entitlement:** `assertCreateRoomEntitlement` (Prisma `User.tier` via `resolveTierFromDb`)
5. **Registry:** `registerLiveSession` → `GlobalLiveSessionRegistry` / `globalLiveSessionStore`
6. **Persist:** `persistSessionNow`
7. **Discovery:** verified via `getSession` + `getSessionsByCategory`; clients poll `GET /api/live/go`
8. **Exact room:** `/live/rooms/[roomId]?from=live-lobby`
9. **Host enter:** create page `router.push(href)`
10. **Guest see/join:** registry unit proves same `roomId` in `getActiveSessions`; **live two-account browser join NOT executed this session**

### Authoritative endpoints
| Intent | Endpoint |
|--------|----------|
| CREATE ROOM (member venue) | `POST /api/live/go` + `intent=create-room` **or** `POST /api/rooms` |
| List LIVE NOW | `GET /api/live/go` (Target 4 SoT) |
| Enter room | `/live/rooms/[roomId]` |

### Unit evidence
- `runCreateRoomE2EChain.test.ts` — **allPassed: true** (gates + registry + exact href + cleanup)
- `runActiveRoomInventoryCreateRoom.test.ts` — **allPassed: true**
- `runEntitlementMatrix.test.ts` — **allPassed: true**

### Criteria board
| Criterion | Result |
|-----------|--------|
| Files/routes identified | PASS |
| Authoritative create endpoint | PASS (`/api/live/go` create-room intent + `/api/rooms`) |
| Per-tier entitlement | PASS (unit) |
| Room ID minted + registry | PASS (unit) |
| Discovery category listing | PASS (unit) |
| Host navigates exact room | PASS (code path) |
| Second account browser join same session | **FAIL / NOT RUN** |
| Cleanup endLiveSession | PASS (unit) |

**T3 status: NOT 100%.** Chain wired + unit proven; **two-account live join acceptance still open.**

---

## Targets 4–8 (carried)
4 Active-room truth — **implemented; unit PASS; runtime cert PENDING** → see `TARGETS_1_4_EVIDENCE.md`  
5 Lounges first-class destinations — queued (after T3 live join + T4 runtime)  
6 Venue Skin economy  
7 Revenue Go-Live  
8 Room/Lounge runtime certification 

---

## Gates
- Tests: entitlement + create-room E2E unit + active inventory — **PASS** (executed)
- Typecheck: `pnpm typecheck` (apps/web) — **PASS**
- Production build: **FAIL (environment)** — `pnpm --filter web build` blocked by locked/corrupt `.next` (`ENOTEMPTY` / missing `build-manifest.json` while another Next process holds the cache). Not a T2/T3 type error. Re-run build after stopping conflicting `next dev` / clearing `.next` with owner approval.
- Commit: **`ad402319`** on `origin/eos/vocal-improv-clean`
- **main** remains **`bf9024fd`** (CLOSED)
