# TMI Platform — Full Honest Audit

**Date:** 2026-08-11 (assembly director pass)  
**Workspace:** `tmi-platform`  
**Branch of record:** `eos/vocal-improv-clean`  
**eos tip (this audit):** **`c270ede7`** — `feat(gate-e+c): deployment identity + Playwright mobile audit`  
**Doctrine:** CODE EXISTS ≠ TYPECHECK ≠ BROWSER WORKS ≠ UX MATCHES BLUEPRINT ≠ PRODUCTION CERTIFIED  
**Gemini/Copilot “100% Certified & Locked” tables:** inventory claims only — **not** production truth.

---

## A. Executive one-pager

| Field | Honest status |
|-------|----------------|
| **Phase** | Production UX Convergence + Mobile P0 candidate |
| **eos tip** | `c270ede7` (ahead of handoff’s older lock `6d0c776b`; lineage includes mobile isolation `8aed6532` + Gate E/C audit) |
| **`origin/main` (fetched)** | `d289c3ee` — *not* the older handoff claim `fd0f7bd1`. Main has advanced (mobile responsive layouts commit). Treat SYNC_HANDOFF §2 main SHA as **stale until rewritten**. |
| **Merge relationship** | Merge-base of `HEAD` vs `origin/main` = `d289c3ee` → eos tip is **ahead of** current main (do **not** merge eos→main without Marcel visual cert). |
| **4-zone / Media Console** | Code candidates wired (`845c4f6f` lineage + presentation fix `d9c4b2fb` story). **`845c4f6f` hard-refresh VISUAL CERT = FAIL** (floating over stage — Marcel). Presentation-fix **browser cert still PENDING**. |
| **Mobile P0** | Exclusive role shells + matchMedia landed. **MOBILE VISUAL CERT PENDING** (scrollWidth≈innerWidth @ 360/390/430; no role swipe). Playwright Gate E/C exists at tip — **not** a substitute for Marcel hard-refresh UX cert. |
| **Production** | `REALITY_AUDIT.md` (2026-08-10) anonymous prod check: login gate OK; **authenticated Command Center / R3F NOT CERTIFIED**. Do not claim live site = eos tip. |
| **Main promote** | **BLOCKED** until Fan + Performer HQ geometry cert **and** mobile visual cert. |

**Bottom line:** Substantial architecture exists and is partially wired on eos. Almost nothing in the certification slice is **browser-proven** to match blueprints. Next sync is fix/verify presentation + mobile — not greenfield systems, and not Dev Cycle 2.

---

## B. Three buckets (evidence paths)

### B1. STRONG / mostly wired (NOT “100% certified”)

Building blocks that **exist + mount/import**; browser / blueprint match = **PENDING** unless noted.

| Area | Evidence | PENDING proofs |
|------|----------|----------------|
| **Command Center shell + 4-zone hosts** | `CommandCenterShell.tsx` imports `CanonicalLeftQuickPanelHost`, `CanonicalRightQuickPanelHost`, `CanonicalBottomDrawerHost`, `PersistentMediaInteractionDock`; desktop mounts L/R; mobile uses overlay sheets | Stage rect Δ=0 on drawer open/close; L+R coexistence; no FLOATING cover; Marcel Fan/Performer hard-refresh |
| **Presentation runtime** | `WorkspacePresentationRuntime.ts` — BOTTOM_DEEP / L/R / DISCOVERY / FLOATING_EXCEPTION map; HQ modules prefer DRAWER | No regression to UniversalWorkspaceWindow for playlist/avatar/lobby/memory |
| **Quick launch (code intent)** | `lib/commandCenter/hubQuickLaunch.ts` — one press → `openCanonicalWorkspaceQuick`; comments forbid FLOATING default | Every launcher one-click; no redundant OPEN second door (known FAIL risk) |
| **Exclusive mobile role shells** | `DashboardWorkspaceContainer.tsx` header: mutually exclusive FAN\|PERFORMER\|ADMIN mount; no sibling keep-alives | scrollWidth≈innerWidth; swipe does not reveal other roles |
| **Mobile detection** | CCS `matchMedia('(max-width: 767px)')` + mobile-first `isMobile` default (`c270ede7` lineage / `9949ee24`) | No overflow↔innerWidth loop at 360–430 |
| **Live Lobby Wall embed** | `CanonicalBottomDrawerHost` dynamic-imports `LiveLobbyWallContent` from `LiveLobbyDrawer.tsx`; search + category chips | Visual matrix vs directory; live previews; tile → exact room; not floating room |
| **YoPho honesty stack (code)** | `YoPhoTripleStageStudio.tsx`, `YoPhoImageCapacity.ts`, `YoPhoLayerStack.ts` — “Put your image here”, tier capacity, z-order | Triple-stage UX in BOTTOM_DEEP; no stock filler in browser; position pad; free-drag still Coming Soon |
| **Settings drawer candidate** | `SettingsWorkspaceContent.tsx` — Shell Colors under Appearance; Sign Out → `/api/auth/logout`; role/convert links | Full lifecycle real; deactivate not fake |
| **Role conversion engine + Overseer widget** | `roleConversionEngine.ts`, `/api/admin/convert-role`, `RoleConversionWidget.tsx` | Admin session convert (KG = universal feature path); audit log |
| **Auth / provision routes** | `/api/auth/register`, `/api/auth/provision`, middleware / session helpers | Rule 26 matrix browser; no wrong-role resources |
| **Stripe route surface** | `app/api/stripe/*`, `lib/stripe/*` | Real checkout + webhook delivery on prod keys |
| **Community feed component** | `CommunityFeedPanel.tsx` mounted from `OperationsSidebar.tsx` | Dual-pane / persistence; not demo |
| **Canisters (files)** | `PlaylistCanister`, `MemoryWallCanister`, `MessagingCanister` present | Correct Quick vs Deep presentation; data four-states |
| **Competition / live foundations** | Battles/cyphers/rooms routes + engines exist (see matrix) | Official show runtimes (MNS, Deal or Feud) fidelity |
| **Admin dead-route closure** | `admin/certification/page.tsx` → `redirect("/admin/runtime-check")` | Priority 4 sample closed in code |
| **R3F fault boundaries (main lineage)** | `SafeReactThreeCanvas`, `PrimaryRendererFaultBoundary` (per REALITY_AUDIT) | Logged-in dashboard no SYSTEM INTERRUPT |
| **Video Shuffle canonical engine** | `lib/shuffle/VideoShuffleRuntimeEngine.ts` + `VideoShufflePresentationAdapter.ts` (Phase 5.2 adoption test imports shuffle path) | Independent of Radio; live 4-channel network |
| **Stream & Win radio engine files** | `lib/radio/StreamAndWinRadioRuntimeEngine.ts`, `lib/economy/StreamAndWinEngine.ts`, `/radio` page uses `StreamAndWinRadioPlayer` | Full Rule 25 chain; real shared timeline |

---

### B2. PARTIAL — exists but incomplete, wrong presentation, uncertified, or gaps

| Area | Status | Evidence / gap |
|------|--------|----------------|
| **4-zone Media Console geometry** | PARTIAL / FAIL history | `845c4f6f` VISUAL FAIL (FLOATING). Presentation fix candidate on eos — **uncertified** |
| **Mobile shell** | PARTIAL | Code isolation PASS claims; **MOBILE VISUAL CERT PENDING**. Tip adds Playwright Gate E/C — still not Marcel UX sign-off |
| **Quick launch second door** | PARTIAL / known FAIL | Intent in `hubQuickLaunch.ts`; Marcel/history: OPEN second door still reported — treat as **not closed** until browser proof |
| **Live Lobby / Discovery Wall** | PARTIAL | Wall content filters `PERFORMER_REGISTRY` + `GlobalLiveSessionRegistry`; risk of registry-as-directory vs living previews; virtualization / AWR consumer not proven |
| **YoPho** | PARTIAL | Honesty strings + capacity/layers code; Marcel known FAIL: fake images historically; free drag Coming Soon; canvas routes nested (`yopho/card/[cardId]`) not a studio hub root |
| **Playlist / Media Player expand** | PARTIAL | Dock + `playlist-studio` → `mediaConsoleMode: "expanded"`; persistence across nav **not browser-proven** |
| **Avatar Quick vs Full Studio** | PARTIAL | Quick panel uses `AvatarViewer` (2D/visor style), label “LIVE 3D” — **not** Rule 18 bobblehead. Full Studio deep path via `openCanonicalDeepStudio`. Performer correctly gated (Rule 26 copy) |
| **Memory Wall Quick vs Full** | PARTIAL | `memory-quick` in registry + Cybernetic HUD; deep = drawer. Browser coexistence with L/R/Bottom **PENDING** |
| **Messaging / Community** | PARTIAL | Canister + CommunityFeedPanel; dual dialogue / incoming bubbles OPEN per REALITY_AUDIT |
| **Settings / account lifecycle** | PARTIAL | Sign Out wired; “DEACTIVATE / DELETE” links `/account-recovery` (recovery ≠ deactivate engine); privacy tab honest empty; Fan→Performer convert = link to onboarding, not full `convertUserRole` user self-serve |
| **Role Conversion & Overseer** | PARTIAL | Engine + admin API + widget exist; KG scripts (`scripts/convert-kg-account.js`) are ops tools — email may be missing; not a substitute for in-app Overseer cert |
| **Stream & Win vs Video Shuffle** | PARTIAL / dual risk | **Must stay independent.** Canonical shuffle under `lib/shuffle/`; **duplicate** `lib/playlists/VideoShuffleRuntimeEngine.ts` (simpler random pool) — **no import consumers found** in spot-check (orphan/LEGACY risk). `/stream-win` is a **static XP card shell**, not radio runtime; `/radio` is the richer Stream & Win surface — route naming drift |
| **Sponsor ribbon vs Sponsor Management** | PARTIAL | `SponsorRibbon.tsx` ships **hardcoded `DEFAULT_SPONSORS`** (Rule 20 honesty fail if presented as live paid). Management = BOTTOM `sponsors` workspace map entry — convergence uncertified |
| **Overseer / Admin Flight Deck** | PARTIAL | Routes + shells exist (`admin/overseer`); mobile ops tabs in isolation commits; admin-only browser cert required |
| **Auth / Rule 26** | PARTIAL | Provision/register exist; Priority 1 security (session-only workspace, 403, partner switcher removal) still open per `.agents/AGENTS.md` |
| **Stripe / revenue** | PARTIAL | Routes exist; production E2E + webhook canon not closed (REALITY_AUDIT) |
| **Live rooms / venues / battles / cyphers / MNS** | PARTIAL | Many routes under `live/*`, `rooms/*`, `battles`, `cyphers`, `shows/monday-night-stage`, `competitions/monday-night-stage`, `games/deal-or-feud` — **duplicate route families**; inherit-best-of-breed not finished; show fidelity uncertified |
| **Fan Lobby / Avatar Lobby** | PARTIAL | `fan-lobby`, lobby components; Prisma split on main lineage; embedded CC path not re-verified |
| **Home 1–5** | PARTIAL | `home/1`–`home/5` pages exist; coherence + registry binding + freshness not certified this pass |
| **Profiles / canisters** | PARTIAL | Files + embed matrix aspirational; presentation depth wrong historically |
| **UniversalWorkspaceWindow** | PARTIAL / hazard | Still in tree; host restricted to FLOATING_EXCEPTION — regression risk if WORKSPACE_OPENED reopens floating |
| **href="#"** | PARTIAL signal | Spot-check under CC/workspace/hub/dashboard: **0** matches. Broader tree still has Coming Soon strings in multiple files — not zero stub surface |
| **Dirty local workspace** | NOTE | Uncommitted mods (e.g. `CommandCenterShell.tsx`, finance payouts) + untracked Profiles/Sounds — **must not ride** audit commits |

---

### B3. MISSING / NOT STARTED / FUTURE (Rule 20 forbids stubs)

| Item | Why listed |
|------|------------|
| **Rule 18 face-scan → ultrarealistic bobblehead pipeline** | Constitution scope honesty — not wiring |
| **Full Venue Runtime / photoreal 3D venues** | Cycle 2 / Rule 21 expansion — locked behind cert slice |
| **Magazine Runtime v2, Sound Runtime, Universal Media Surface Stage 2, Sponsor/Reward expansion** | `.agents/AGENTS.md` Dev Cycle 2 — **do not start** |
| **Rule 23/24 Rewards governor + three-lane ecosystem** | Documented; no honest engine |
| **Rule 25 full radio network** (20 channels, shared timeline, SpeakingPresence, etc.) | Engines/pages partial; full protocol not built |
| **Native iOS/Android store shells** | Web-first; not certified products |
| **Account Settings & Lifecycle Center (locked queued)** | REALITY_AUDIT — post-P0 |
| **Michael Charlie Fan Economy engine** | Architecture only |
| **AI sponsor proposals as production authority** | Would violate Rule 20 if faked |
| **Deal or Feud 1000 complete backend/runtime** | Multiple routes; not launch-certified show |
| **World Dance Party / Lounge final fidelity** | Direction ≠ certified |

---

## C. Routes / places / rooms matrix

**Legend:** KEEP = real page exists and is intended; PARTIAL = exists but incomplete/duplicate/uncertified; DEAD = should redirect/remove; REDIRECT = already redirects; UNKNOWN = not deep-audited.

| Area | Key routes | Status | Notes |
|------|------------|--------|-------|
| Fan HQ | `/hub/fan`, `/dashboard` | PARTIAL | Command Center mount path; visual cert PENDING |
| Performer HQ | `/hub/performer` | PARTIAL | Same geometry cert debt; sponsor distinction |
| Admin Overseer | `/admin/overseer` | PARTIAL | KEEP as destination; runtime cert PENDING |
| Fan canvas / YoPho | `/fan/canvas`, `/yopho/card/[cardId]` | PARTIAL | No root `/yopho/page.tsx`; studio via drawer + canvas |
| Performer canvas | `/performer/canvas` | PARTIAL | KEEP candidate |
| Live hub | `/live`, `/live/lobby` | PARTIAL | Discovery + entry |
| Rooms | `/rooms`, `/rooms/*` (56 pages) | PARTIAL | Duplicate show/room paths |
| Settings / account | `/settings`, `/account`, `/account-recovery` | PARTIAL | Drawer + full pages; deactivate wiring weak |
| Home 1–5 | `/home/1` … `/home/5` | PARTIAL | Pages exist |
| Stream & Win | `/stream-win`, `/streamwin`, `/radio` | PARTIAL | `/stream-win` static XP shell; `/radio` richer player — converge naming |
| Fan lobby | `/fan-lobby`, lobbies/* | PARTIAL | |
| Avatar | `/avatar`, avatar-* | PARTIAL | Fan-only ownership policy |
| Battles / cyphers | `/battles`, `/cyphers` | PARTIAL | |
| Monday Night Stage | `/shows/monday-night-stage`, `/competitions/monday-night-stage`, `/rooms/monday-stage`, `/games/monday-night` | PARTIAL | Multi-door — pick canonical later |
| Deal or Feud | `/games/deal-or-feud`, `/rooms/deal-or-feud`, `/shows/deal-or-feud` | PARTIAL | Same duplication pattern |
| Sponsors | `/sponsors`, `/sponsor` | PARTIAL | Ribbon defaults fake-ish |
| Magazine | `/magazine/*` | PARTIAL / UNKNOWN | Not deep this pass; Cycle 2 locked |
| Auth | `/login`, `/signup` | KEEP | Provision Rule 26 PARTIAL |
| Coming soon | `/coming-soon` | KEEP (placeholder policy) | Acceptable only for Phase 2 |
| Admin certification | `/admin/certification` | REDIRECT | → `/admin/runtime-check` |
| Admin runtime-check | `/admin/runtime-check` | KEEP | Cert surface |
| Messages / memories / playlist | `/messages`, `/memories`, `/playlist` | PARTIAL | Prefer CC drawers for HQ depth |
| Admin surface | `/admin/*` (~278 pages) | UNKNOWN / PARTIAL | Huge surface — do not invent certs |
| Orphan risk | Many top-level app dirs | UNKNOWN | Route ledger still needed (Rule 20 #6) |

---

## D. Priority fix order for next sync

Align with SYNC_HANDOFF §6 + mobile P0:

1. **Mobile visual cert** — 360/390/430: scrollWidth≈innerWidth; exclusive shells; no role swipe; TopNav overflow fixed lineage verified in browser  
2. **Shell / drawer geometry** — stage never reflows; BOTTOM_DEEP under mini player; L/R quick coexist; kill FLOATING for HQ modules  
3. **Quick launch** — one click opens correct class/depth; toggle close; **no OPEN second door**  
4. **Avatar Quick + Full Studio** — honest presentation (do not claim photoreal 3D); Rule 26 fan-only  
5. **Live Lobby Wall** — living matrix, real sessions, exact-room entry  
6. **YoPho** — triple-stage, placeholders, capacity, z-depth/position; no fake images  
7. **Playlist / Memory / Messages** coexistence + media persistence  
8. **Performer workspaces + Sponsor Ribbon vs Management** (real sponsors or honest empty / Rule 12 chain)  
9. **Overseer** (incl. Role Conversion widget as universal admin tool — KG case)  
10. **Radio vs Video Shuffle independence** — retire/LEGACY-mark `playlists/VideoShuffleRuntimeEngine`; fix `/stream-win` honesty  
11. **E2E runtime certification** — only after geometry + mobile pass  

**Do not start** Dev Cycle 2 (Magazine v2, Sound Runtime, Venue expansion, etc.) until this slice closes.

---

## E. Resume sentence for next chat

> TMI on `eos/vocal-improv-clean` tip **`c270ede7`** is in **Production UX Convergence + Mobile P0**: 4-zone Media Console hosts, exclusive role shells, presentation runtime, YoPho honesty helpers, and role-conversion Overseer pieces are **code-wired candidates**, but **`845c4f6f` visual cert FAILED** (floating drawers), mobile/Fan/Performer blueprint match remain **PENDING**, `/stream-win` is a static shell while `/radio` holds Stream & Win, dual VideoShuffle files exist (`lib/shuffle` canonical vs `lib/playlists` orphan), and `origin/main` has moved to **`d289c3ee`** (handoff’s `fd0f7bd1` claim is stale)—**do not merge to main**; next sync proves mobile geometry + one-click drawers + Lobby/YoPho/Avatar presentation against Profiles blueprints, then Overseer/Radio-Shuffle honesty.

---

## Evidence index (spot-check 2026-08-11)

| Artifact | Path / SHA |
|----------|------------|
| This audit | `FULL_PLATFORM_AUDIT.md` |
| Handoff (resume) | `SYNC_HANDOFF.md` |
| Older prod inventory | `REALITY_AUDIT.md` (SHAs may lag) |
| eos tip | `c270ede7` |
| origin/main | `d289c3ee` |
| 4-zone FAIL baseline | `845c4f6f` (documented FAIL) |
| Mobile isolation | `8aed6532` |
| Cert gate priorities | `.agents/AGENTS.md` |

### Method notes

- Read SYNC_HANDOFF + REALITY_AUDIT; verified git tip/branch.  
- Confirmed mounts for CommandCenterShell, Canonical*Hosts, DashboardWorkspaceContainer exclusive shell, LiveLobbyWallContent, CommunityFeedPanel, roleConversionEngine, YoPho*, radio/shuffle engines.  
- Sampled `apps/web/src/app` families (hub/dashboard/admin/live/rooms/home/…); categorized without inventing 300 route certs.  
- **No authenticated browser proof in this pass** — all visual/runtime claims marked PENDING/PARTIAL/FAIL-history only.

---

*Assembly director honest audit. Inventory ≠ certification.*
