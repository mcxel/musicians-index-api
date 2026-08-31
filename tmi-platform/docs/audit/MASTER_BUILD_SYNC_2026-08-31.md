# TMI Master Build Sync — 2026-08-31

**Branch:** `eos/vocal-improv-clean` (verified)  
**HEAD:** `a6026b38` — `fix(avatar): unblock Foundry GLB so Canister SMILE can enable.` (2026-08-30)  
**Origin:** in sync (`ahead 0` / `behind 0`)  
**Supersedes for edge state:** `SYNC_HANDOFF.md` (2026-08-12), `NEXT_SYNC_2026_08_1*.md`, and any pasted “architecture status” older than this file.  
**Audit package (Pass 1 / 3.5 normalize only):** `docs/audit/FULL_PLATFORM_*` — **Pass 2–3 NOT done.**  
**Pasted source `20260831-170636` / “Pasted markdown”:** not found under workspace, Downloads, or chat attachment scan — truth corrections below come from this conversation’s ship log + repo evidence.

---

## 0. Executive edge (last 48h + next action)

### What we were last working on
- Fan Avatar Canister Foundry path: GLB middleware starvation → fetch/parse → SMILE browser enable (`a6026b38` tip).
- Account letter / role menu restore + Overseer mount; Moderation Case Desk scaffold.
- Hub shell cleanup (legacy rails gone); ROLE_RESOLVING hang mitigated via cookie-first hub pages.
- Elastic room expand dwell + venue-skin Stripe → OwnershipRuntime.
- **User-elevated P0 (Aug 31):** Live Publication & Presence end-to-end — **not** “GO LIVE button cleanup = done.”

### What just closed (this conversation / last 48h commits)
| Closed | Evidence |
|--------|----------|
| ROLE_RESOLVING hang / dual-shell import path | Cookie-first `/hub/fan` + `/hub/performer`; `SessionRoleGate` only as fallback; cert `roleResolving: false` in hub-rail-gone; ~44s→~6.8s claim |
| Hub rails gone Fan/Performer × desktop/mobile | `.cursor/artifacts/hub-rail-gone/` — 4/4 PASS, `railVisible: N` |
| Account letter popover role switch + logout | `7c0737a4` |
| Moderation Case Desk + REPORTS queue | `72ff7eb2` |
| Admin letter on Overseer Flight Deck | `7ae5ff71` |
| Avatar Canister no production capsule; Foundry binding | `b2a10ebc` |
| `bobblehead_v0` manufactured + certified | `5f66deb6` then remanufacture `aa859320` (`from_mix=False`) |
| Full-body Canister mesh visible | `a1d70101` |
| GLB middleware starvation + SMILE browser PASS | `a6026b38` — `smile-cert-report.json` `pass: true`, `smileClicked: true` |
| Elastic expand dwell + venue-skin commerce grant | `8930e874`, `0daf10cf` |
| Media-player ownership migration (earlier) | `85f853e2` |

### Immediate P0 queue (ordered)
1. **Live Publication & Presence chain** (Marcel P0 Aug 31) — publish → Lobby Wall → audience presence → CAST targets → platform bezel lights → Fan/Artist ID+QR on bezel → clean disconnect.  
2. **Do not** start “canonical rig brainstorm” ahead of (1); software avatar contract + manufacturing proof for `bobblehead_v0` are ahead of live publication reliability.  
3. Browser-cert account letter click proof (**OPEN / ABORTED** — not in-progress).  
4. Avatar remaining: clothing + prop + full anim set + collision + two-device + room identity matrix + 360 (beyond Canister SMILE).  
5. Audit Pass 2–3; then Stripe / Rule 17 tickets / multi-seat SoT / Go Live L7 orphans.

---

## 1. Conversation ship log (commits + agents)

| Item | Commit / artifact | Status |
|------|-------------------|--------|
| ROLE_RESOLVING hang / cookie hub path | Hub pages + `SessionRoleGate` fallback; related auth `35268a9e`; rail cert Aug 28 | **CLOSED** |
| Hub rails gone (4 viewports) | `3c636d7e` + `.cursor/artifacts/hub-rail-gone/` | **CLOSED** |
| Account letter role switch + logout | `7c0737a4` | **CLOSED** (code) |
| Browser-cert account letter click | User aborted | **OPEN / ABORTED** — do **not** mark in-progress |
| Moderation Case Desk + REPORTS | `72ff7eb2` | **CLOSED** (scaffold wired into Overseer workspace) |
| Admin letter on Flight Deck | `7ae5ff71` | **CLOSED** |
| Canister Foundry bind / ban capsule | `b2a10ebc`, `1482b42c` | **CLOSED** |
| bobblehead_v0 promote | `5f66deb6` | **CLOSED** |
| Remanufacture morphs `from_mix=False` | `aa859320` | **CLOSED** |
| Full-body mesh visible | `a1d70101` | **CLOSED** |
| GLB middleware + SMILE enable | `464e63f0` then `a6026b38` | **CLOSED** (SMILE click certified) |
| Elastic expand dwell hysteresis | `8930e874` | **CLOSED** |
| Venue-skin Stripe → OwnershipRuntime | `0daf10cf` | **CLOSED** |
| Playlist / media-player ownership migration | `85f853e2` | **CLOSED** |
| Live session → Lobby/Home + Distribution Bezel | `9ae9cbf6` (earlier) | **PARTIAL** — wiring exists; production E2E unreliable per Marcel |
| Avatar clothing / prop / full anim / 2-device | — | **OPEN** |
| Venue geometry GLB / Battle Arena physical cert | — | **OPEN** |
| Account letter browser click proof | — | **OPEN (ABORTED)** |
| Full platform audit Pass 2–3 | `docs/audit/` Pass 1 / 3.5 only | **OPEN** |

**Agent threads (recent avatar/account edge):** [Avatar SMILE unblock](18e16190-3ddb-433a-b2be-f464f3a40f1f), [bobblehead remanufacture land](7c3a4777-7773-41cf-beb1-8cb8cc044891), long-running platform chat [ff59d71b](ff59d71b-0391-4e67-bddd-ce888ecf71cb).

**Uncommitted WIP (do not treat as shipped):** dirty tree includes `CommandCenterMediaStack.tsx`, `mobileCommandCenterCapabilities.ts`, `quickToolsActions.ts` (small cast-related diffs), `admin/layout.tsx`, HUD/quick panel files, manufacturing GLB artifacts. Tip commit remains `a6026b38`.

---

## 2. Fully completed / certified (do not redesign)

- **Tier / constitution** Rule 26–28 locked in repo docs; assembly-director posture unchanged.
- **Command Center dual monitors + media-player chrome** as canonical hub surface (Fan + Performer).
- **Cookie-first role hubs** — avoid client ROLE_RESOLVING when `tmi_role` classifies FAN/PERFORMER.
- **Legacy outer hub rails removed** — certified gone Fan/Performer × desktop/mobile.
- **AccountCommandMenu** role switch + logout restored (`7c0737a4`); Overseer letter mount (`7ae5ff71`).
- **Moderation Case Desk + reports queue scaffold** (`72ff7eb2`) — disposition engine files present.
- **Avatar Foundry slot `bobblehead_v0`:** `certified: true`, `facialTargetsCertified: true` in `AvatarGlbRegistry.ts`; production capsule banned; Canister binds Foundry GLB.
- **Middleware excludes `.glb/.gltf/...`** so Foundry assets are not starved (`a6026b38`).
- **Canister SMILE browser cert PASS** (`.cursor/artifacts/avatar-canister/smile-cert-report.json`).
- **Elastic expand dwell / WARMING→ACTIVE** (`8930e874`).
- **Venue-skin Stripe fulfill → OwnershipRuntime grant** (`0daf10cf`).
- **Performer playlist ownership migration off legacy hash chassis** (`85f853e2`).
- **Security Stability Slices A+B** code-admitted (browser verify still pending per AGENTS Priority 1).
- **Instant Go Live launch path exists** (in-place on hub) — *path exists ≠ E2E certified* (see §5).

---

## 3. Partially finished

| Area | What exists | What’s missing |
|------|-------------|----------------|
| **GO LIVE** | `presentInstantGoLiveInPlace` → `executeInstantGoLive` → optional `POST /api/live/go` + DiscoveryBus; privacy gates; in-place monitors | Reliable published broadcast, Lobby Wall propagation, audience presence, disconnect cert |
| **CAST** | Media-stack CAST panel: Share Screen + Big Screen; playlist cast bus; mobile `tmi:cast-panel-toggle` | Live destination / target-selection CAST as product requires; not “cast to Lobby Wall / room big screen” fully |
| **Distribution Bezel** | External YT/IG/FB/KK/TW strip (`LiveDistributionBezel`) | Explicitly **no TMI platform lights**; external ingest mostly scaffold |
| **Fan/Artist ID + QR** | `ArtistIdShareStrip` + `ArtistShareIdentity` + media-stack ARTIST ID / FAN ID toggle; `TmiIdentitySurface` | Placement/cert as permanent upper bezel identity (product law); browser proof incomplete |
| **Audience / seats** | `audienceRuntimeEngine`, Lobby Wall APIs, Monitor B “audience” kind | Multi-SoT; performer cannot reliably *see* real audience; Rule 21 converge incomplete |
| **Avatar** | Full-body mesh + SMILE/HYPE morphs on Canister | Clothing, props, full anim set product cert, collision, two-device, room identity matrix, 360 |
| **Moderation** | Case Desk UI + disposition scaffold | End-to-end report→case→enforce production cert |
| **Audit** | Pass 1 inventory + Pass 3.5 evidence normalize | Pass 2–3 deep cert; Q1 not auto-started |
| **Stripe** | Routes implemented | CONFIGURED/TEST/LIVE unknown → ORANGE |
| **Mobile Stage Deck / T1** | Long history in `SYNC_HANDOFF.md` | T1 still OPEN historically; not closed this conversation |

---

## 4. Missing / OPEN (grouped)

### Live Publication P0 (elevate — Aug 31 user correction)
1. GO LIVE end-to-end publish → real published broadcast  
2. Live Lobby Wall propagation (canonical discovery/lobby walls)  
3. Audience visibility / presence for performers  
4. CAST controls + **target selection** on live media-player area  
5. Platform-live bezel indicators (illuminated abbreviations where currently live)  
6. Fan ID + Performer/Artist ID near CAST (upper bezel)  
7. QR exposure via same identity component  
8. Placement law: CAST + ID on upper media-player/live-control bezel (no fake floating chrome)  
9. Clean disconnect  
10. Preserve: privacy (no auto-publish), Fan vs Performer avatar law, Regular Go Live ≠ Monday Night Stage  

**Certification chain (user-stated):**  
`GO LIVE → explicit mic/cam → publish → register destination → WebRTC → Live Lobby Wall → audience presence → CAST → platform lights → Fan/Performer ID → QR → clean disconnect`

### Avatar Foundry
- Clothing + prop bind/equip  
- Full animation set product/browser cert (registry may mark motion package flags; **product OPEN**)  
- Collision / seat fit  
- Two-device cert  
- Room identity matrix / 360  
- Additional GLB slots still `certified: false` (`bobblehead_fan_urban`, `athlete`, `face_scan_mesh_v1`)  
- Venue geometry GLB / Battle Arena **physical** cert  

### Audit blockers (from `FULL_PLATFORM_BLOCKERS.md` — still valid unless corrected above)
- Stripe not L6 (ORANGE)  
- Rule 17 tickets — `createTicket()` lacks authority/inventory  
- Multi-seat SoT (audienceRuntime / SeatingMesh / seat-presence / venue seat / sessionStorage reclaim)  
- Go Live L7 orphans: `BroadcastControlRuntime` (0 import), `GoLiveStudio` (0 import) — orphan risk “NONE” for execution but dual LIVE SoT **PRESENT** (`tmi_is_live` localStorage vs `GlobalLiveSessionRegistry`)  
- Rankings/XP seed `rank:` vs `computeRanks()` (RED)  
- Session SoT outside hubs not browser-certified  
- Security / advertiser auth browser verify pending  

### Mobile
- T1 Stage Deck physical gates historically OPEN  
- Multi-role hubs beyond Fan/Performer L5 incomplete  
- Cold hub improved but not platform-wide cert  

### Commerce
- Stripe test-mode purchase proof missing  
- Monetization journey E2E missing  
- Venue-skin grant path shipped (`0daf10cf`) — broader catalog/checkout cert incomplete  

### Observatory / Errors
- Overseer console / bot route noise historically addressed in older commits — re-verify on current tip  
- FunctionHealthRegistry population incomplete  

### Product workspaces
- YoPho Rule 27 unify  
- Magazine Runtime v2 / Cycle 2 items — **frozen until certification Priority 1–5 closed** (`.agents/AGENTS.md`)  
- Writer / Sponsor / Venue / Promoter / Advertiser hubs — partial account menu wiring; not L5-certified  

---

## 5. Live Publication & Presence — detailed gap analysis

**Audit only — no implementation in this sync.**

### 5.1 Instant Go Live / publish

| Piece | Path | Exists? | Wired? | Gap |
|-------|------|---------|--------|-----|
| In-place presenter | `apps/web/src/lib/dock/presentInstantGoLiveInPlace.ts` | YES | Hub Command Center / session strip | Broadcaster stays on hub; good |
| Canonical trigger | `triggerCanonicalGoLive` same file | YES | Off-hub → hub `?golive=1` | OK |
| Execute + mint room | `apps/web/src/lib/dock/executeInstantGoLive.ts` | YES | Called from presenter | `publishSession` gate real |
| Registry POST | `POST /api/live/go` from execute when `publishSession` | YES | On success → DiscoveryBus upsert | Failures fall back to **local** `publishLiveRoom` — can look “live” to self without durable wall |
| Privacy / no auto-publish | `publishSession` + `livePrivacyState` / YoPho privacy commits | YES | Explicit GO LIVE | Must keep |
| Session strip GO LIVE | `CommandCenterSessionControlStrip.tsx` | YES | `publishSession: true` | Button UX ≠ E2E proof |
| Admit gate | `goLiveAdmitGate.ts` | YES | Used by presenter | — |
| Bootstrap overlay | `goLiveBootstrapStore.ts`, `InPlaceGoLiveMonitorLayer` | YES | Media stack | Phases need production cert |

**Honest status:** Launch path and registry write **exist**. Marcel reports sessions **do not reliably become real published broadcasts** and do not reliably appear on Lobby Walls. Dual SoT (`tmi_is_live` in `TMIGlobalHUD`, `GoLiveBanner`, orphan `GoLiveStudio`) can lie relative to `GlobalLiveSessionRegistry`.

### 5.2 GlobalLiveSessionRegistry + Lobby Wall

| Piece | Path | Exists? | Gap |
|-------|------|---------|-----|
| Client/store | `lib/broadcast/globalLiveSessionStore.ts` | YES | TTL / hydrate races |
| Server persist | `GlobalLiveSessionRegistry.server.ts` | YES | Must confirm production DB hydration |
| Lobby wall API | `app/api/live/lobby-wall/route.ts` | YES | Reads active sessions |
| Canister | `components/canisters/LiveLobbyWallCanister.tsx` | YES | `/api/homepage/live` |
| Grid pages | `battles|challenges|games/lobby-wall` | YES | Category walls |
| Discovery publish | `lib/discovery/DiscoveryPublisher.ts` + `DiscoveryBus` | YES | Client upsert can mask server fail |
| Home featured / Home 3 | discovery components + `BroadcastRotationEngine` | PARTIAL | Nav map says GO LIVE wired; “not every create path publishes” |

**Gap:** Propagation to **canonical** live discovery/lobby walls is the product failure mode — treat as P0 even though code paths exist.

### 5.3 Audience visibility / presence

| Piece | Path | Exists? | Gap |
|-------|------|---------|-----|
| Audience API | `app/api/live/audience/route.ts` | YES | Comments note registry viewerCount sync |
| Seat engines (multiple) | `audienceRuntimeEngine`, SeatingMesh, seat-presence, venue seat | YES (divergent) | Multi-SoT blocker |
| Monitor B audience kind | `CommandCenterMediaStack` | YES | Layout modes; not proof of real seats |
| Progressive fill / AudienceScene | live lib / venue components | PARTIAL | Instant Go Live product intent (empty venue → real arrivals) not production-certified |
| Performer “see audience” | — | **UNRELIABLE / OPEN** | User P0 |

### 5.4 CAST

| Piece | Path | Exists? | Gap |
|-------|------|---------|-----|
| CAST button on media stack | `CommandCenterMediaStack.tsx` (~1042–1200) | YES | Opens panel |
| CAST actions today | Share Screen (`useMonitorScreenShare`) + Big Screen fullscreen | YES | **Not** live destination CAST |
| Playlist cast | `PlaylistMonitorCast.ts` → Monitor A | YES | Playlist → monitor, not lobby |
| Mobile quick CAST | `mobileCommandCenterCapabilities.ts` + `quickToolsActions` → `tmi:cast-panel-toggle` | YES | Uncommitted small diffs in tree |
| Target selection (Lobby / room screen / platform) | — | **MISSING / incomplete** | User P0 |

### 5.5 Platform-live bezel indicators

| Piece | Path | Exists? | Gap |
|-------|------|---------|-----|
| External Distribution Bezel | `components/broadcast/LiveDistributionBezel.tsx` | YES | YT/IG/FB/KK/TW/+ ; comment: **“NO TMI light on this strip”** |
| TMI platform lights (Lobby / Home / genre walls abbreviations) | — | **MISSING** | User P0 #5 |
| Destination registry | `BroadcastDestinationRegistry.ts`, `ExternalBroadcastDistributor.ts` | YES | External-focused |

### 5.6 Fan ID / Artist ID / QR

| Piece | Path | Exists? | Gap |
|-------|------|---------|-----|
| Share identity engine | `lib/identity/ArtistShareIdentity.ts` | YES | Profile URL + follow payload |
| Strip + QR | `components/identity/ArtistIdShareStrip.tsx` | YES | Used on public profiles + media stack |
| Media-stack toggle | `CommandCenterMediaStack` ARTIST ID / FAN ID + popover | YES | Near CAST on utility row |
| Zero-monitor surface | `TmiIdentitySurface.tsx` | YES | WATCH 0 monitors |
| Upper bezel permanence + cert | — | **PARTIAL** | Exists in toolbar; product wants locked upper live-control bezel behavior + QR proof |

### 5.7 Already-exists one-liners (do not rebuild)
- Instant Go Live in-place: `presentInstantGoLiveInPlace.ts`  
- Publish: `executeInstantGoLive.ts` → `/api/live/go` + DiscoveryBus  
- Lobby Wall read: `/api/live/lobby-wall`, `LiveLobbyWallCanister`  
- CAST UI chrome: `CommandCenterMediaStack` CAST panel  
- External bezel: `LiveDistributionBezel`  
- ID+QR: `ArtistIdShareStrip` + `ArtistShareIdentity`  

**Do not invent a second GO LIVE runtime.** Finish the certification chain on these paths; mark orphans LEGACY after harvest (`BroadcastControlRuntime`, `GoLiveStudio`).

---

## 6. Avatar Foundry — accurate current state

### Corrections vs stale sync / Pass 3.5 blockers
| Stale claim | Truth 2026-08-31 |
|-------------|------------------|
| “All AvatarGlbRegistry `certified: false`” / Herser unbound | **FALSE** — `bobblehead_v0` is `certified: true` with facial targets |
| Canister still capsule / unbound | **FALSE** — capsule banned; Foundry GLB binding (`b2a10ebc`+) |
| Avatar work blocked on remanufacture | **FALSE** — `aa859320` `from_mix=False` done |
| SMILE disabled / morph probe hang | **FALSE** — middleware + loader fix; browser `pass: true` |
| Full avatar product done | **FALSE** — only Canister full-body + SMILE (and related morph UI) certified |

### Done
- Manufacturing proof JOB-AVATAR-PROOF001 → promote `public/models/avatars/bobblehead_v0.glb`  
- Canister full-body visible  
- SMILE click enabled + face change cert  
- Rule 28 binding diagnostics (`CANONICAL_AVATAR_NOT_BOUND` fail-visible)  

### Remaining (OPEN)
- Clothing + prop  
- Full anim set product/browser cert (beyond smile/hype/neutral)  
- Collision / seat  
- Two-device cert  
- Room identity matrix / 360  
- Other registry slots uncertified  
- Venue/Battle Arena physical GLB cert  

**Antigravity / Herser:** assets only into the **same** Foundry contract (`AvatarGlbRegistry` / manufacture scripts) — no parallel capsule/rig.

---

## 7. Recommended finish sequence (ordered, no thrash)

1. **P0 Live Publication & Presence** — wire/certify the user chain on existing Instant Go Live + registry + Lobby Wall + media-stack CAST/ID; add **TMI platform bezel lights**; kill dual `tmi_is_live` lies; honest empty states.  
2. **Account letter browser click cert** (resume aborted proof) — short.  
3. **Avatar remaining slice** — clothing/prop/anims/collision/two-device (no new rig redesign).  
4. **Audit Pass 2–3** on `docs/audit/` matrices (no Q1 auto-start until directed).  
5. **Stripe CONFIGURED + test purchase artifact** + **Rule 17 ticket engine authority**.  
6. **Seat SoT converge** → `audienceRuntimeEngine` inherit mesh/sessionStorage reclaim.  
7. **Go Live L7 Daily continuity** after publish path is honest; then LEGACY orphans.  
8. **Venue geometry / Battle Arena physical cert**.  
9. **Mobile / multi-role hubs / T1 gates**.  
10. **Observatory / error quiet + FunctionHealth**.  
11. **YoPho Rule 27 / Magazine** — only after certification Priority lock allows Cycle 2.

**Explicit anti-thrash:** Do **not** put “canonical rig spec brainstorm” before Live Publication P0. Software contract + `bobblehead_v0` proof are sufficient for next avatar *asset* work; live money-path presence is the revenue-critical gap.

---

## 8. Do-not-do list (constitution + this sync)

- Do not redesign TMI visual canon / Flight Deck Two-Deck without architectural defect.  
- Do not treat “GO LIVE button cleaned up” as live system done.  
- Do not auto-publish private/rehearsal sessions.  
- Do not give Performers avatar-ownership UI (Rule 26); Fans own bobbleheads; audience still renders fan avatars.  
- Do not conflate Regular Go Live with Monday Night Stage / Official World events.  
- Do not build a second Venue Runtime, second Avatar rig, or second Live registry.  
- Do not stub rewards/radio/face-scan full pipeline (Rules 22–25 / 18 honesty).  
- Do not mark account letter browser cert as in-progress (ABORTED → OPEN).  
- Do not claim audit Pass 2–3 done.  
- Do not start Development Cycle 2 (Magazine v2, Split Action, Sound Runtime, etc.) before Priority 1–5 certification lock.  
- Do not present capsules/placeholders as certified Herser/Foundry assets.  
- Do not invent fake viewer counts or LIVE badges outside `GlobalLiveSessionRegistry`.  
- Do not delete LEGACY systems until replacement verified (mark LEGACY first).  
- Do not create sprawl sync docs — evolve this master (and promote into MASTER ledgers when asked).

---

## 9. Definition of done / certification standard

Apply Rule 20 four-states + physical Acceptance Template (AGENTS.md):

**Live Publication P0 DONE only when all observed on real device/browser:**
1. Explicit mic/cam (or honest deny)  
2. Publish registers durable session (server registry, not only local DiscoveryBus)  
3. Session appears on canonical Live Lobby Wall / home live surfaces within poll window  
4. Performer sees real audience/presence or honest empty seating  
5. CAST opens with real target selection that affects the live surface  
6. Platform bezel lights illuminate only for verified live destinations  
7. Fan/Artist ID + QR on upper media-player bezel work role-aware  
8. END LIVE / disconnect clears registry, wall, lights, local flags  

**Avatar Canister slice DONE (already):** Foundry bind + full-body + SMILE click.  
**Avatar product DONE:** clothing + prop + anim set + collision + two-device + room matrix — **not yet**.

**Code exists ≠ certified. Typecheck ≠ visual cert. Preview SHA must match `/api/version` for deploy claims.**

---

## 10. Handoff sentences

### For Claude / assembly agents
Continue on `eos/vocal-improv-clean` @ `a6026b38`+. Read this file first. **Next work is Live Publication & Presence P0** on existing Instant Go Live → `GlobalLiveSessionRegistry` → Lobby Wall → media-stack CAST/ID — do not redesign shells or invent a new go-live runtime. Preserve privacy gates and Rule 26. Account letter click cert remains OPEN (aborted). Avatar clothing/prop/anims wait behind live P0 unless Marcel reprioritizes. Run Pass 2–3 audit only when directed; do not auto-start FULL_PLATFORM Q1.

### For Antigravity (assets only)
Deliver wardrobe/prop/venue GLBs into the **existing** Foundry manufacture → `AvatarGlbRegistry` / venue registries contract. Do not ship alternate skeletons, capsules, or parallel dimension systems. `bobblehead_v0` is already certified; extend slots honestly (`certified: false` until promoted + QA).

---

## Appendix A — Stale claim rejection log

| Claim | Disposition |
|-------|-------------|
| GO LIVE UI cleanup = live system complete | **REJECTED** — P0 publication chain open |
| Avatar Herser fully unbound / all slots uncertified | **REJECTED** — `bobblehead_v0` certified |
| SMILE / Canister still failing | **REJECTED** — `a6026b38` + smile-cert PASS |
| Account letter browser cert in progress | **REJECTED** — ABORTED → OPEN |
| Full platform audit Pass 2–3 complete | **REJECTED** — Pass 1 / 3.5 only |
| Hub ROLE_RESOLVING still ~44s cold path as current tip reality | **SUPERSEDED** — cookie-first hubs + rail cert `roleResolving: false`; treat ~6.8s class as current claim pending remeasure |
| TMI platform lights exist on Distribution Bezel | **REJECTED** — external-only; no TMI light by design comment |
| CAST fully meets live cast+target product | **REJECTED** — Share Screen / Big Screen / playlist cast only |

## Appendix C — P0-1 Live Publication pointer (2026-08-31)

- **Universal Media Player law:** [`LIVE_UNIVERSAL_MEDIA_PLAYER_LAW.md`](./LIVE_UNIVERSAL_MEDIA_PLAYER_LAW.md) — watchable experiences are seen through Universal Media Player Runtime; room/venue = context only.
- **P0-1 cert report:** [`LIVE_P0_1_CERT.md`](./LIVE_P0_1_CERT.md) + `.cursor/artifacts/live-p0/`.
- GO LIVE control hosts on `MediaPlayerGoLiveControl` inside `CommandCenterMediaStack` (media-player bezel). Hub strip deep-links only.
- Lobby Wall live sessions open `/hub/*?watch=` into the same player runtime.

## Appendix B — Key file index

```
docs/audit/MASTER_BUILD_SYNC_2026-08-31.md          # this file
docs/audit/FULL_PLATFORM_BLOCKERS.md
docs/audit/FULL_PLATFORM_PRIORITY.md
docs/audit/FULL_PLATFORM_EXECUTION_QUEUE.md
MASTER_AI_NAVIGATION.md                             # media player + go-live map
apps/web/src/lib/dock/presentInstantGoLiveInPlace.ts
apps/web/src/lib/dock/executeInstantGoLive.ts
apps/web/src/lib/broadcast/GlobalLiveSessionRegistry.server.ts
apps/web/src/components/broadcast/LiveDistributionBezel.tsx
apps/web/src/components/commandCenter/CommandCenterMediaStack.tsx
apps/web/src/components/identity/ArtistIdShareStrip.tsx
apps/web/src/lib/identity/ArtistShareIdentity.ts
apps/web/src/lib/avatars/AvatarGlbRegistry.ts
apps/web/src/components/avatar/FanAvatarCanister.tsx
apps/web/middleware.ts                              # GLB bypass
```

---

*Written 2026-08-31 for Marcel Dickens / next-session handoff. Analysis only — no Go Live implementation in this pass.*
