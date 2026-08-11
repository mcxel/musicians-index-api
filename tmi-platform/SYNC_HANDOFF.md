# TMI Platform — SYNC HANDOFF (MASTER BUILD STATE)

**Date:** 2026-08-11 (next full-sync resume document)  
**Branch of record:** `origin/eos/vocal-improv-clean`  
**Candidate baseline (geometry contract):** **`845c4f6f`** — FULL SYNC + 4-ZONE CANDIDATE  
**`845c4f6f` visual cert:** **FAIL** — HQ deep workspaces still opened as UniversalWorkspaceWindow **FLOATING** over stage (Marcel screenshots). CODE/TYPECHECK had passed; browser geometry did not.  
**Presentation-fix candidate:** **`d9c4b2fb`** — Media Console DrawerDock + YoPho honesty/capacity/z-depth  
**Mobile root-shell isolation candidate (eos tip):** **`8aed6532`** — TYPECHECK PASS; **MOBILE VISUAL CERT PENDING**

**`origin/main` tip (intentionally untouched / CLOSED for this work):** **`fd0f7bd1`** — do **not** merge/push mobile P0 to main.  
**Rule:** ChatGPT/Gemini/Copilot “finished” claims are **code candidates only**. TYPECHECK ≠ VISUAL CERT. Never claim production certified without Marcel hard-refresh proof (Rule 20).

---

## Resume sentence (paste into next chat)

> TMI's remaining mission is not to invent another architecture—it is to converge the substantial architecture already built into the exact persistent spatial operating system shown by the blueprints: uninterrupted center stage, simultaneous live quick panels on the sides, deep persistent workspace underneath, one searchable moving Live Lobby Wall for discovery, exact-room entry, and genuine 3D/WebRTC destinations behind it.

---

## Product one-liner

TMI = **persistent entertainment OS**:

| Layer | Job |
|-------|-----|
| Headquarters (Command Center) | Watch + operate |
| Side panels | Quick act / inspect |
| Bottom workspace | Deep work |
| Live Lobby Wall | Discover |
| 3D / WebRTC venues | Participate |

**Do not collapse** the phone-style Lobby Wall reference and the desktop Fan/Performer blueprint into one generic floating window. They define different surfaces of the same OS.

---

## Certification doctrine (permanent)

```
CODE EXISTS
    ≠
TYPECHECK PASSES
    ≠
BROWSER WORKS
    ≠
UX MATCHES BLUEPRINT
    ≠
PRODUCTION CERTIFIED
```

Only the last state may be called finished.

---

## 1. WHERE WE ACTUALLY ARE

**Phase:** Production UX Convergence (not greenfield architecture).

Underlying platform largely exists (auth, roles, live sessions, competition presentation, avatar data, lobby presence, messaging, community feed, rewards, tickets/payments foundations, workspace registries, sponsor infrastructure, Memory Wall foundations, many routes/components).

**Remaining problem:** pieces are not consistently in the correct **place / size / presentation depth / runtime context**. A component can exist in the tree and still look wrong in the browser.

### Ledger (locked)

```
845c4f6f — FULL SYNC + 4-ZONE CANDIDATE
         · TYPECHECK/CODE PASS
         · HARD-REFRESH VISUAL CERT FAIL (FLOATING over stage)
         · MAIN intentionally untouched

d9c4b2fb — PRESENTATION FIX CANDIDATE (Media Console DrawerDock)
         · Root cause: WORKSPACE_OPENED → universalWorkspaceRuntime.open() → FLOATING
           after canonical path had already set drawerWorkspace
         · HQ modules → WorkspacePresentationRuntime (BOTTOM_DEEP / L/R / DISCOVERY)
         · UniversalWorkspaceHost mounts FLOATING_EXCEPTION only (e.g. share-studio)
         · YoPho: honest placeholders + tier image capacity + z-depth layers
         · HARD-REFRESH FAN/PERFORMER VISUAL-RUNTIME CERT STILL PENDING
         · MAIN intentionally untouched

4620a7b6 — CommandCenterShell true conditional mobile render (no in-flow rails)
901dbd7a — earlier responsive attempt (superseded for CCS by 4620a7b6)
6d79c5c1 — AdminHubShell mobile tabs + Overseer partial isMobile widths (mid-flight)

8aed6532 — MOBILE P0 ROOT-SHELL ISOLATION (eos tip)
         · ROOT CAUSE: DashboardWorkspaceContainer mounted Fan+Performer+Admin as
           siblings (display:none keep-alives) + mobile swipe (≥60px) switched roles;
           ChevronNavigation also history-swiped across role shells. Desktop min-widths
           (290|1fr|320 Admin, 230|1fr|300 CCS, Overseer 268px rails) compounded overflow.
         · FIX: exclusive single-shell mount; Admin → /admin/overseer only (no swipe);
           Overseer mobileOpsTab SENTINEL|MONITOR|INBOX; AdminHub COMMAND|MONITOR|INTEL;
           shell width/maxWidth 100% + minWidth 0; CCS 4620a7b6 preserved
         · PRESERVED: BOTTOM_DEEP under mini player; Avatar/Memory Quick side HUDs desktop;
           quick IDs (avatar-quick, memory-quick, inventory-quick) ≠ full DRAWER IDs
         · TYPECHECK: pnpm --filter web typecheck PASS
         · MOBILE VISUAL CERT: PENDING (Marcel hard-refresh @ 360/390/430)
         · MAIN: CLOSED — do not promote
```

**Do NOT promote** `eos/vocal-improv-clean` → `main` until Marcel hard-refresh cert passes on Fan + Performer Command Centers **and** mobile visual cert (scrollWidth≈innerWidth, no role swipe).

---

## 2. GIT VERIFICATION (2026-08-11)

| Ref | SHA | Message | Verified |
|-----|-----|---------|----------|
| `origin/main` | **`fd0f7bd1`** | fix(tickets): close the seat double-booking race condition | ✅ fetched · **CLOSED** |
| `origin/eos/vocal-improv-clean` tip | **`8aed6532`** | fix(mobile/P0): exclusive role shells — kill Fan/Admin swipe bleed | local tip; push next |
| Candidate baseline | **`845c4f6f`** | feat(workspace): wire 4-zone canonical panels from Profiles blueprints | ✅ on eos lineage |
| Lobby/Settings under baseline | **`c0a4c2ed`** | Visual Live Discovery Wall + Shell Colors → Settings | ✅ **ancestor of 845c4f6f** |

### Relationship

```
origin/main .............. fd0f7bd1   ← CLOSED (do not merge mobile P0 here)
                              │
                              ▼
                    c0a4c2ed  (Lobby Wall + Settings)
                              │
                              ▼
                    845c4f6f  ← CANDIDATE BASELINE (4-zone wire)
                              │
                              ▼
                    … presentation + CCS mobile lineage …
                              │
                              ▼
                    eos tip   ← MOBILE P0 isolation (VISUAL CERT PENDING)
```

Merge-base with main remains `fd0f7bd1`. Fast-forward to main **only after** Fan/Performer + mobile visual cert — not before.

### Local note (this workspace)

- **Trust `origin/eos/vocal-improv-clean`** after push; main stays closed.
- Unrelated dirty files (finance/payouts, Profiles assets, Sounds Pack, etc.) must **not** ride into handoff commits.
- KG role-conversion scripts exist (`scripts/convert-kg-account.js`, `scripts/find-user.js`) targeting `thegreatestlesp@gmail.com` — if email is not in DB, note only; **do not block mobile P0** on KG.

### Recent eos log (top 5)

```
8aed6532 fix(mobile/P0): exclusive role shells — kill Fan/Admin swipe bleed
6d79c5c1 fix(mobile/P0): root shell isolation — eliminate horizontal overflow in Admin + Overseer decks
4620a7b6 fix(mobile/P0): true conditional render in CommandCenterShell
901dbd7a fix(mobile/P0): responsive shell — collapse desktop rails at <768px
d6413ff6 feat(workspace): three-layer interaction stack — quick HUDs + drawer deep workspaces
```

### Recent origin/main log (top 5)

```
fd0f7bd1 fix(tickets): close the seat double-booking race condition
10d5159e fix(tickets): restore missing claim-seat route
d93f0c3b feat(workspace): implement Canonical Left and Right Quick Panel Hosts for simultaneous 4-zone coexistence candidate
5fa1163e fix(competition): restore missing CompetitionRatingStore.ts
559a32f2 feat(workspace): restore Canonical 4-Zone Spatial Architecture — Reserved Bottom Drawer Dock for full workspaces, Zero Stage Disruption
```

---

## 3. FIVE SURFACES (not generic windows)

| Surface | Intent | Examples |
|---------|--------|----------|
| **PRIMARY_STAGE** | WATCH | Live performer, venue, media, competition |
| **LEFT_QUICK** | ACT quickly | Avatar Quick, Inventory Quick |
| **RIGHT_QUICK** | INSPECT / react | Memory Quick, contextual reaction/comms |
| **BOTTOM_WORKSPACE** | WORK deeply | Playlist Studio, YoPho, Full Avatar Studio, Store, Settings, Messenger, Sponsor Mgmt, Stats |
| **DISCOVERY_WALL** | DISCOVER | Visual Live Lobby Wall (search + chips + tile matrix) |
| **FULL_DESTINATION** | ENTER | Exact room / 3D venue / battle-cypher-game-concert |

Flow: **WATCH → ACT → WORK → DISCOVER → ENTER DESTINATION**

### Prohibited

`UniversalWorkspaceWindow` (or any single floating rectangle) must **not** turn every capability into one giant panel that replaces itself (Avatar → Memory → Playlist → Lobby in the same box). That destroys the OS concept.

Presentation runtime must resolve **intent / class / depth**, not merely a workspace name.

---

## 4. PRESENTATION TAXONOMY (Profiles drawer family)

Skimmed `Profiles/` filenames 2026-08-11 — family list remains accurate. Assets are largely **untracked** in git; they are blueprint references, not deployed code.

### Renderer map

```text
LEFT_QUICK
  Avatar Quick
  Inventory Quick

RIGHT_QUICK
  Memory Quick
  Contextual communication / reaction tools

BOTTOM_DEEP
  Playlist Studio
  Messenger / Communications Hub
  YoPho Studio
  Full Avatar Studio
  Sponsor Management
  Stats & Analytics
  Settings
  Store / Marketplace
  other creation/management workspaces

STABLE_SHELL
  Primary stage
  Persistent player / media band
  Navigation
  Sponsor Ribbon (thin, where applicable)

DISCOVERY
  Visual Live Lobby Wall

DESTINATION
  Exact live room
  3D / avatar venue
  Battle / cypher / game / concert runtime
```

### Profiles inventory (filename skim)

| File | Class |
|------|-------|
| `tmi fan and performer  blue print Ui with drawers.png` | Master 4-zone composition |
| `tmi fan and performer  blue print.png` | Hub without bottom expanded |
| `digital-panel-1.jpg` / `digital-panel-2.jpg` | Quick-panel HUD chrome |
| `Playlist drawer base.jpg` / `playlist drawer base.png` | BOTTOM Playlist Studio |
| `playlisy detach  blue print.png` | Detached player (legacy preference: bottom deep) |
| `messenger drawer base.png` | BOTTOM Messenger Hub |
| `YoPho base drawer.png` / `YoPho base.png` | YoPho Studio vs identity card artifact |
| `Sponser base drawer.png` | BOTTOM Sponsor Management |
| `Stats and analitics  base drawer.png` | BOTTOM Stats & Analytics |
| `Lobbies/lobies walls base.png` | DISCOVERY Live Lobby Wall (phone matrix) |
| Admin / signup / season / overseer / HTML prototypes | Out of Fan/Performer CC cert scope |

### Key distinctions (do not collapse)

| A | ≠ | B |
|---|---|---|
| AVATAR_QUICK | ≠ | AVATAR_STUDIO ≠ AVATAR_VENUE_RUNTIME (same avatar state, different presentation) |
| Sponsor Ribbon (thin shell) | ≠ | Sponsor Management workspace |
| YoPho Profile / identity card | ≠ | YoPho Studio |
| Messages chat popup | ≠ | Messenger communications command center |
| MediaPlayerDevice (chassis) | ≠ | PlaylistArtifact (content) |
| Lobby Wall living matrix | ≠ | drawer / directory / text JOIN list |
| Media Console mini player | ≠ | expanded Playlist Studio (same playback session) |
| FLOATING_EXCEPTION (Share) | ≠ | HQ BOTTOM_DEEP drawers |

### Media Console contract (presentation fix)

```
MAIN STAGE (never covered/resized by deep drawers)
  [LEFT_QUICK]              [RIGHT_QUICK]
MINI MEDIA PLAYER  ← PersistentMediaInteractionDock
        ⇅ ATTACHED
DrawerDock (CanonicalBottomDrawerHost) — one activeDrawer
  playlist | messaging | yopho | championship | store | settings | …
```

- `mediaConsoleMode`: `expanded` only for playlist-studio; else `mini` + dock under mini player.
- Lobby / live-destinations → `DISCOVERY_WALL` (`liveDiscoveryOverlayStore`), not FLOATING room.
- Stage `getBoundingClientRect` Δx/Δy/Δw/Δh must stay 0 when opening/closing/switching drawers.

### YoPho studio contract (honesty + capacity + z-depth + position)

| Concern | Rule |
|---------|------|
| Placeholders | Center = **Put your image here**; sides = **Preview** / **Preview 2** — no bot/stock filler |
| Filters | Click → live on Preview panes; **Apply to Master** commits; 60s/70s = Coming Soon; B&W + Vintage live |
| Multi-image | Tier-gated via `YoPhoImageCapacity.ts` |
| Capacity defaults | FREE **1** · PRO **3** · RUBY **5** · SILVER **6** · GOLD **8** · PLATINUM/BAND **12** · DIAMOND **16** |
| At limit | Honest **Upgrade to add more images** → `/account/subscription` |
| Dimensional layers | `YoPhoLayerStack.ts` — zIndex reorder (▲/▼ / Front / Back); canvas composites by z-order (person behind car) |
| Layer position | Active-layer pad: ←→↑↓ nudges `xOffset`/`yOffset`; Front/Back z-order; scale +/−; green = +/Front, red = −/Back. FREE single image may still reposition/scale. Persisted on layer → Apply to Master |
| Free drag | **Coming Soon** — nudges shipped; pointer-drag not wired |
| Advanced 3D perspective | Coming Soon if missing — **z-order behind/in front must work** for multi-image tiers |

---

## 5. CERT AGAINST `845c4f6f` — ACCEPTANCE STANDARD

**Marcel hard-refresh** on **Fan** and **Performer** Command Centers (logged-in). Do not merge to main based on “drawers open.”

> Does each launcher open the **correct class and depth** from the blueprint taxonomy — without compressing, shifting, replacing, or remounting the stage?

### Checklist

| # | Path | Pass criteria |
|---|------|---------------|
| 1 | **Avatar Quick** | Left compact HUD; live 3D; outfit/emote/prop works; Full Studio → **bottom** |
| 2 | **Live Lobby Wall** | Visual card matrix (not text directory); search + chips filter **same wall**; tile → **exact room** |
| 3 | **Playlist** | Quick = compact remote; deep = bottom studio; **playback persists** across surfaces |
| 4 | **Settings** | Shell Colors **only** under Appearance; Sign Out / convert / switch / deactivate / delete **visible** |
| 5 | **Spatial** | Stage never reflows; L+R coexist; bottom under media band; no giant generic cover; one-click open, toggle close, reopen preserves state |

Plus: every launcher maps to correct CLASS/DEPTH (Quick vs Deep vs Discovery vs Destination).

### Pending cert paths (ready for Marcel)

1. Logged-in Fan Command Center hard-refresh (Ctrl+Shift+R) — console + DOM + screenshot.
2. Logged-in Performer Command Center — same matrix + sponsor ribbon vs sponsor management distinction.
3. Confirm no full-page `TMI — SYSTEM INTERRUPT` on auth dashboard path.
4. Confirm no Universal floating rectangle replacing stage for Avatar / Lobby / Playlist / Memory.

---

## 6. NEXT BUILD ORDER (after cert / or while fixing fails on eos)

1. **Shell geometry** — stage, mini player, L/R quick, bottom workspace, no reflow  
2. **Launcher semantics** — one click opens correct presentation; toggle close; no redundant OPEN door  
3. **Avatar Quick + Full Studio**  
4. **Live Lobby Wall** — live/moving previews, real sessions, exact-room entry  
5. **YoPho three-stage** editor (source / final / effect)  
6. **Playlist / Memory / Messages** coexistence  
7. **Performer workspaces + Sponsor Ribbon**  
8. **Observatory** convergence  
9. **3D / photoreal** production pass  
10. **E2E runtime certification**

If any cert item fails: fix on `eos`, recertify, **then** promote exact SHA to main. Never promote on compile report alone.

---

## 7. STRONG / IMPLEMENTED (building blocks — §18)

Real foundations — **not** “UX finished”:

- Competition presentation components  
- Competition integrity / history foundation  
- Avatar identity / data foundation  
- Fan Lobby persistence foundation  
- Exact-room routing concepts + portions of live routing  
- Canonical payment / webhook architecture  
- Ticketing foundations  
- Reward infrastructure  
- Memory Wall infrastructure  
- Community Feed  
- Universal Workspace registries / runtime foundations  
- Sponsor architecture  
- Observatory telemetry work  
- Role / security isolation work  
- Settings realignment **candidate** (`c0a4c2ed`+)  
- Visual Live Lobby Wall **candidate** (`c0a4c2ed`+)  
- 4-zone canonical panel hosts + presentation routing **candidate** (`845c4f6f`+)

---

## 8. NOT SAFE TO CALL FINISHED (§19)

- Fan HQ visual convergence  
- Performer HQ visual convergence  
- Correct side-panel geometry  
- Correct bottom-workspace geometry  
- Avatar Quick real 3D runtime integration (browser-proven)  
- Full Avatar Studio production presentation  
- `845c4f6f` / Lobby Wall **deployed** visual-runtime certification  
- Live moving-preview population of Lobby Wall  
- Exact-room join from every wall card  
- YoPho three-preview / editor convergence  
- Quick-launch one-click behavior everywhere  
- Persistent media / dock geometry  
- Observatory visual / runtime certification  
- Full Go Live repeatable loop  
- Screen-share broadcast to other participants  
- Full photorealistic avatar asset pipeline  
- Production-quality 3D venues  
- World Dance Party final fidelity  
- Lounge final fidelity  
- Shared synchronized props / reactions  
- Monday Night Stage complete show runtime  
- Deal vs. Feud 1000 backend / runtime  
- Sponsor / Advertiser / Venue / Promoter HQ convergence  
- Mobile / app experience certification  
- Accessibility / reduced-motion / keyboard pass  
- Stripe operational activation  
- AdSense approval and live slot configuration  
- Final production regression / certification  

---

## 9. KNOWN GAPS (handoff honesty)

| Gap | Note |
|-----|------|
| Browser cert | **PENDING** — `845c4f6f` VISUAL FAIL; presentation-fix tip needs Marcel hard-refresh proof |
| **MOBILE VISUAL CERT** | **PENDING** — prove @ 360/390/430: `document.documentElement.scrollWidth ≈ window.innerWidth`; swipe does **not** reveal Fan↔Performer↔Admin; monitor visible first on HQ |
| Main promote | **CLOSED / BLOCKED** until cert; `origin/main` stays `fd0f7bd1` |
| KG account scripts | `scripts/convert-kg-account.js` — if target email missing from DB, handoff-only; not a mobile P0 blocker |
| Profiles assets | Blueprint files untracked locally; taxonomy above is filename-confirmed |
| Settings actions | Scaffold / candidate — Sign Out, convert, switch, deactivate, delete need browser proof of real routes |
| Avatar Quick | Code candidate for compact LEFT 3D — must not regress to oversized floating box |
| Lobby Wall | Code candidate visual matrix — cert exact-room + live preview population |
| UniversalWorkspaceWindow | Still present in tree; must not own canonical modules that belong to L/R/Bottom/Discovery |
| REALITY_AUDIT.md | Older SHA tips (e.g. `aca0acb9` prod window) — use **this file** for git tips; audit still useful for P0 / Stripe / email inventory |
| React #300 | Prefer hook-order audit + runtime verification; do not revive Fiber-v9-as-root without fresh evidence |
| Security Priority 1 | Session-only workspace, 403 unauthorized, partner switcher removal — still certification-gate stack (`.agents/AGENTS.md`) |
| Dev Cycle 2 | Magazine Runtime v2, Sound Runtime, Venue Runtime expansion, etc. — **do not start** until this cert slice closes |

### Code candidates landed on eos (not certified)

| Area | Key files (under `apps/web`) |
|------|------------------------------|
| Presentation routing | `lib/workspace/universal/WorkspacePresentationRuntime.ts`, `openCanonicalPresentation.ts`, `hubQuickLaunch.ts` |
| Hosts | `CanonicalLeftQuickPanelHost.tsx`, `CanonicalRightQuickPanelHost.tsx`, `CanonicalBottomDrawerHost.tsx`, `CanonicalQuickPanelContent.tsx` |
| Settings | `SettingsWorkspaceContent.tsx` |
| Shell mount | `CommandCenterShell.tsx` |
| Lobby wall | `LiveLobbyDrawer.tsx` (via `c0a4c2ed`) |

---

## 10. RELATED ARTIFACTS

| File | Use |
|------|-----|
| `SYNC_HANDOFF.md` (this file) | **Single resume document** for next full sync |
| `REALITY_AUDIT.md` | Prior Phase A/B inventory (SHAs may be stale) |
| `CLAUDE.md` / `AGENTS.md` | Constitution + assembly rules |
| `.agents/AGENTS.md` | Certification gate Priority 1–5 stack |
| `Profiles/*` | Visual taxonomy / drawer family |
| `Lobbies/lobies walls base.png` | Discovery wall blueprint |

---

*Assembly director handoff — honest status only. Code PASS ≠ Runtime CERT. Main untouched until Marcel cert.*
