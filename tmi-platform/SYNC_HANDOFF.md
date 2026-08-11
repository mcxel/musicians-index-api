# TMI Platform — SYNC HANDOFF

**Date:** 2026-08-10 (assembly director pass)  
**Branch:** `main` local HEAD = `origin/eos/vocal-improv-clean` = **`c0a4c2ed`**  
**Rule:** Never claim 100% certified without logged-in browser proof (Rule 20).

---

## Git SHA verification (this session)

| Ref | SHA | Message | Verified |
|-----|-----|---------|----------|
| `origin/main` | **`fd0f7bd1`** | fix(tickets): close the seat double-booking race condition | ✅ fetched |
| `origin/eos/vocal-improv-clean` | **`c0a4c2ed`** | feat(lobby): Visual Live Discovery Wall + Shell Colors → Settings | ✅ fetched |
| Local HEAD (on `main`) | **`c0a4c2ed`** | same as eos tip | ✅ |
| YoPho canvas lineage | **`559a32f2`** | feat(workspace): Canonical 4-Zone Spatial Architecture | ✅ ancestor of eos |
| Community feed | **`6434c051`** | feat(community): real platform-wide community message feed | ✅ ancestor of eos |
| R3F fault boundaries | **`e62b2b45`** | fix(dashboard): isolate R3F crashes + P0 API hardening | ✅ ancestor of main |
| Admin revenue poll | **`aca0acb9`** | fix(admin): align revenue poll timer | ✅ ancestor of main |
| Lobby/settings (Gemini claim) | **`c0a4c2ed`** | Visual wall + settings realignment | ✅ **is eos tip** — CODE PASS only |

### Branch divergence

```
merge-base(main, eos) = fd0f7bd1
eos is exactly +1 commit ahead of main: c0a4c2ed
main has no commits eos lacks (fast-forward merge clean)
```

**Production note:** Vercel prod last verified in REALITY_AUDIT at Aug 8 deploy (~`aca0acb9` window). `fd0f7bd1` and post-session commits are **not browser-certified on production** until Marcel hard-refreshes logged-in dashboard.

---

## Profiles/ folder inventory (2026-08-10 full scan)

| File | Type | Drawer/Panel shown |
|------|------|-------------------|
| `tmi fan and performer blue print Ui with drawers.png` | **Master 4-zone layout** | All zones + floating quick panels |
| `tmi fan and performer blue print.png` | Hub without bottom drawer expanded | WATCH + ACT overlays only |
| `digital-panel-1.jpg` | Quick panel HUD chrome (cyan) | ACT L/R cybernetic frame reference |
| `digital-panel-2.jpg` | Quick panel HUD chrome (green) | Alternate HUD gauge style |
| `Playlist drawer base.jpg` / `playlist drawer base.png` | **Playlist deep drawer** | WORK bottom — library grid + EQ |
| `playlisy detach blue print.png` | Detached playlist window | Floating WMP-style (legacy — prefer bottom drawer) |
| `messenger drawer base.png` | **Messenger drawer** | Multi-zone comms hub |
| `YoPho base drawer.png` / `YoPho base.png` | **YoPho studio drawer** | Identity card + avatar customizer |
| `Sponser base drawer.png` | **Sponsor/commercial drawer** | Sponsor canister + GO LIVE |
| `Stats and analitics base drawer.png` | **Analytics drawer** | 4-quadrant revenue/engagement |
| `Adminisratation Hub.jpg` | Admin overseer | Not fan/performer command center |
| `Advertiser and sponser hub.jpg` | Advertiser hub | Role-specific |
| `Fan/Performer/Sponsor/Advertiser Sign up.png` | Onboarding | Not command center |
| `overeeser what i see now.png` | Overseer runtime | Admin-only |
| `season Pass.jpg` | Season pass UI | Commerce |
| `error.png` | Error state reference | SYSTEM INTERRUPT styling |
| `tmi_platform_prototype_complete.html` | Interactive HTML prototype | Drawer gallery tab |
| `tmi_master_prototype_all_systems.html` | Interactive HTML prototype | Platform + playlist + messenger screens |

**Also:** `Lobbies/lobies walls base.png` — Live Lobby Wall mobile matrix (search + category chips + video tile grid).

---

## Profiles drawer/panel style map (L → R, blueprint-derived)

### Zone WATCH — center (never resize/cover)

| Element | Blueprint source | Spec |
|---------|-----------------|------|
| Dual 16:9 monitors | `tmi fan…with drawers.png` | Chrome/gold bezel; split 1/2/4/8 configurable; monitors stay fixed size when panels open |
| Stage / live feed | Same + `tmi fan…blue print.png` | Performer on stage; LIVE badge from real registry only |
| Media dock under monitors | Both blueprints | Now-playing strip + nav icons + screenshot/record/share/quality + connection ms |

### Zone ACT — left quick panels (eye level, ~320–340px wide)

| Panel | Blueprint | Placement | Chrome | Controls inside |
|-------|-----------|-----------|--------|-----------------|
| **Avatar / Inventory quick** | `tmi fan…with drawers.png` LEFT overlay | Fixed left of monitors, eye level (~top 100px) | Purple glass border, `digital-panel-1` chamfer | Compact 3D avatar, 4 outfit slots, emotes, **CUSTOMIZE → opens full studio** |
| **Live Destinations / Lobby** | `lobies walls base.png` | LEFT quick (not text JOIN list) | Cyan/orange category chip borders | Search bar, chips (LIVE NOW, Games, Challenges, Cyphers, Lounges, Avatars, Playlists), **video tile grid**, tap = exact room |
| **Rewards quick** | HTML prototype | LEFT | Orange accent | Streak/points telemetry |

### Zone ACT — right quick panels (eye level)

| Panel | Blueprint | Placement | Controls |
|-------|-----------|-----------|----------|
| **Playlist remote** | `playlisy detach` (compact mode) + dock | RIGHT quick ~320px | Prev/play/next, track title, **OPEN FULL STUDIO** |
| **Memory wall quick** | `tmi fan…with drawers.png` RIGHT | RIGHT overlay | Photo/video/ticket tabs, VIEW ALL |
| **Messaging quick** | `messenger drawer base.png` (compact) | RIGHT | Conversation cards, not full 9-zone layout |

### Zone WORK — bottom drawer (under media dock, full width)

| Drawer | Blueprint | Height | Controls |
|--------|-----------|--------|----------|
| **Avatar full studio** | LEFT inventory overlay expanded | ~45vh max | Full FanAvatarCanister, face scan, inventory grid, seat binding |
| **Playlist deep** | `Playlist drawer base.jpg` | Wide 3-column | Left: large art + transport; Center: playlist library grid; Right: tracklist + hardware EQ |
| **YoPho studio** | `YoPho base drawer.png` | Full | Identity card, pose/outfit layering, vibe tags, color-way engine, Save Template |
| **Messenger deep** | `messenger drawer base.png` | Full 9-zone | Conversation cards, active calls, shared media, invitations, settings toggles |
| **Sponsor/commercial** | `Sponser base drawer.png` | Full | Sponsor canister list, GO LIVE, gift drop, promoter messages |
| **Analytics** | `Stats and analitics base drawer.png` | Full 4-quadrant | Revenue, engagement, fan analytics, platform stats |
| **Settings** | Derived from messenger Zone 9 + rail removal | Bottom drawer | Profile, Convert Fan↔Performer, Switch Account, Shell Colors (ThemeEngine), Sign Out, Deactivate |

### DISCOVER — Live Lobby Wall (`lobies walls base.png`)

- **NOT** a text JOIN list or generic floating window
- Top: TMI logo + **search all content** + diamond balance
- Horizontal **category chips** with color-coded borders per type
- **3-column video tile grid** with LIVE badge + viewer count + country + performer subtitle
- Tile types visible: Live Now (orange), Games (teal), Fan Lobby (avatars), YoPho canvas, Battles, etc.
- Bottom nav + chevron drawer trigger (mobile reference; desktop = LEFT quick panel)

### Visual chrome canon

| Token | Value (Profiles HTML `:root`) |
|-------|--------------------------------|
| Background | `#070714` / `#06060F` |
| Card/panel | `#0D0D24` / `#111130` |
| Primary accent | `#FF6B1A` orange |
| Cyan | `#00D4FF` / `#00FFFF` |
| Purple | `#9B59FF` / `#AA2DFF` |
| Gold | `#FFD700` |
| Quick panel frame | `digital-panel-1.jpg` — cyan chamfer, corner brackets, telemetry dials |
| Drawer frame | Thin cyan bottom border, `#060918` glass, Orbitron headers |

### Quick vs deep rule (from blueprints)

| Module | Quick (ACT) | Deep (WORK drawer) |
|--------|-------------|-------------------|
| Avatar/Inventory | LEFT compact 3D + 4–5 outfits/emotes | BOTTOM full studio |
| Playlist | RIGHT mini remote | BOTTOM library + EQ |
| Live/Lobby | LEFT visual wall matrix | N/A (discovery is quick-only) |
| Memory | RIGHT grid preview | BOTTOM full wall |
| Messaging | RIGHT thread preview | BOTTOM 9-zone hub |
| YoPho | — | BOTTOM full studio |
| Store/Sponsor/Analytics | — | BOTTOM only |
| Settings/Shell Colors | — | BOTTOM drawer Appearance tab only |

---

## Locked 4-zone architecture (Marcel + ChatGPT acceptance)

```
WATCH  — center monitors (NEVER resize/cover)
ACT    — left/right compact Quick Panels (coexist, live runtime controls)
WORK   — bottom reserved drawer (deep studios)
DISCOVER — Live Lobby Wall visual tile matrix (NOT text list, NOT generic floating window)
```

### Certification status: 4-zone + lobby + settings

| Item | Code | Runtime browser cert |
|------|------|----------------------|
| 4-zone spatial (`559a32f2`) | PASS — hosts + presentation store exist | **PENDING** |
| Canonical Quick Panel hosts (`d93f0c3b`) | PASS — files exist, wiring this session | **PENDING** |
| Visual Live Discovery Wall (`c0a4c2ed`) | PASS — LiveLobbyDrawer refactored | **PENDING** |
| Settings + Shell Colors move (`c0a4c2ed`) | PARTIAL — SettingsWorkspaceContent scaffold | **PENDING** |
| Avatar Quick = compact LEFT 3D | **THIS SESSION** — wiring FanAvatarCanister quick | **PENDING** |
| Avatar full = BOTTOM drawer | **THIS SESSION** | **PENDING** |
| Playlist Quick = mini remote | **THIS SESSION** | **PENDING** |
| Store/YoPho → bottom drawer not floating | **THIS SESSION** | **PENDING** |

**Do NOT treat Gemini "certified" claims as production truth.**

---

## Honest tier inventory

### P0 — React #300 / R3F fault boundaries (`e62b2b45` lineage)

| Tier | Status |
|------|--------|
| Code on main | ✅ `SafeReactThreeCanvas`, `PrimaryRendererFaultBoundary`, segment `dashboard/error.tsx` |
| Logged-in prod hard-refresh | ❌ **NOT CERTIFIED** — anonymous `/dashboard` clean; auth path unverified |

### Fan Lobby Prisma client split (`a9d9b78b` on main)

| Tier | Status |
|------|--------|
| Code | ✅ Fan lobby client-only, no direct Prisma import |
| Launch Dock loop signed-in cert | ❌ **PENDING** |

### Persistent dock / mini player

| Tier | Status |
|------|--------|
| Code | ✅ `PersistentMediaInteractionDock`, `commandCenterPlaybackBus` |
| Runtime uncertified | ❌ cross-navigation persistence not browser-proven |

### Overseer left rail

| Tier | Status |
|------|--------|
| Code | ✅ `OverseerFlightDeck`, section switcher |
| Runtime | ❌ **uncertified** — admin session required |

### AWR / Target 2 / Target 3 Gauntlet

| Tier | Status |
|------|--------|
| AWR telemetry contracts | ✅ partial — idle NO CONSUMER until wall mounted |
| Gauntlet engine | ✅ in-memory Map; **held**, not launch-certified |
| Avatar LOD / bobblehead canon | ❌ policy only — face-scan pipeline not built |

### Hostinger email

| Tier | Status |
|------|--------|
| Adapters | ✅ `HostingerMailAdapter`, audit log |
| Production IMAP poller | ~**90%** — env-dependent, inbound not proven |

### Stripe / AdSense ops

| Tier | Status |
|------|--------|
| Routes | ✅ checkout, webhook, customer portal |
| End-to-end prod payment | ❌ not closed |

### Video Shuffle / MTV jukebox + Stream & Win

| Tier | Status |
|------|--------|
| Engines | ✅ partial — `SubmissionEngine`, `BotDJEngine` groundwork |
| Radio rotation / rooms | ❌ Rule 25 direction only |

### Michael Charlie Fan Economy

| Tier | Status |
|------|--------|
| Architecture | 🔒 locked — Michael Charlie authority, Big Ace excluded |
| Code | ❌ **not built** — no stub payout UI |

### Open items

| Item | Status |
|------|--------|
| Sponsor overlay dismiss/duration | OPEN |
| Screen share local-only | OPEN |
| Community feed color picker + alert toggles | deferred (on `6434c051` lineage) |
| YoPho Triple-Stage + multi-image/AI Magic | partial |
| Settings Lifecycle Center (post-P0 queue) | LOCKED QUEUED |

---

## YoPho canvas (`559a32f2` lineage)

- Canvas routes mount `YoPhoStudio` — restored on eos (`b366fbb4`, `87178704` chain).
- Hub drawer deep-link still routes to workspace, not canvas bounce.
- Rule: every control → visible preview → Apply to Master — **partial**, not runtime-certified.

---

## Community feed (`6434c051` on eos)

- Platform-wide community message feed shipped on eos branch.
- Avatars, report, profile links wired in code.
- Color picker + alert toggles **deferred**.
- On `main` until eos merged: **not live**.

---

## Files touched this session

| File | Change |
|------|--------|
| `SYNC_HANDOFF.md` | Created (this file) |
| `WorkspacePresentationRuntime.ts` | Canonical surface routing map |
| `openCanonicalPresentation.ts` | Hub → 4-zone surface helper |
| `hubQuickLaunch.ts` | Route through presentation store, stop floating for canonical modules |
| `CanonicalQuickPanelContent.tsx` | Quick panel bodies (avatar, lobby wall, playlist remote) |
| `CanonicalLeftQuickPanelHost.tsx` | Mount real quick content |
| `CanonicalRightQuickPanelHost.tsx` | Mount real quick content |
| `CanonicalBottomDrawerHost.tsx` | Deep studios (avatar, settings, store, playlist) |
| `CommandCenterShell.tsx` | Mount canonical hosts; Shell Colors → Settings drawer only |
| `types.ts` / `UniversalWorkspaceRegistry.ts` | Add `settings` workspace id |

---

## Still FAIL for browser certification

1. Logged-in fan/performer Command Center — no full-page SYSTEM INTERRUPT proof post-`e62b2b45`.
2. Avatar Quick LEFT panel — compact 3D + outfits (code wired; Marcel must verify no oversized floating box).
3. Live Destinations — visual tile matrix with search/tabs (code on `c0a4c2ed`; verify click → exact room).
4. Playlist Quick remote vs deep drawer — same canonical playback state (verify play/skip).
5. Settings drawer — Profile, Convert Fan↔Performer, Switch Account, Sign Out, Deactivate, Delete (scaffold only; actions need wiring).
6. digital-panel-1.jpg HUD aesthetic on quick panels — partial chrome via `digitalQuickPanelFrameStyle`.
7. Persistent dock survives navigation — uncertified.
8. Production deploy SHA — confirm Vercel includes `fd0f7bd1`+ after merge.

---

## Next session order

1. **Marcel authenticated browser cert** — hard refresh fan + performer hub; console + DOM; screenshot evidence.
2. **Merge eos → main** if FF clean (`c0a4c2ed` onto `fd0f7bd1`); redeploy Production; record Vercel deployment SHA.
3. **Wire Settings actions** — real sign-out, role convert, deactivate routes (post-P0 Lifecycle Center spec).
4. **Priority 1 security** — session-only workspace, 403 unauthorized, remove partner switcher from normal admin.
5. **Fan Lobby embedded path** — Command Center → lobby 3D with fault boundary fallback only.
6. **Stripe production smoke** — checkout + webhook + admin revenue panel.
7. **Sponsor overlay** — auto-dismiss duration policy.

---

## Related artifacts

| File | Use |
|------|-----|
| `REALITY_AUDIT.md` | Prior Phase A/B inventory (SHAs stale — use this handoff for git tips) |
| `CLAUDE.md` / `AGENTS.md` | Constitution + assembly rules |
| `.agents/AGENTS.md` | Certification gate Priority 1–5 stack |

*Assembly director pass — honest status only. Code PASS ≠ Runtime CERT.*
