# TMI THREE-WAY EXPERIENCE — REDESIGN DIRECTIVE
### Source: tmi_complete_all_four_dashboards_v2.html (original base) → corrected into canister architecture
### Claude = Architect | BlackBox = Wiring

---

## WHY THIS DOCUMENT EXISTS

The uploaded `tmi_complete_all_four_dashboards_v2.html` was the **original starting base** — a 4-tab dashboard (Fan Theater / Artist Studio / Overseer Deck / Admin Hub) with the playlist and lobby wall hardcoded directly into the page as a long horizontal strip.

Since that file was built, Claude has separately designed:
- `tmi_playlist_engine_complete` — the full Playlist Engine with 10 skins, skin generator, lobby sync
- `tmi_memory_wall_sponsor_booking_canisters` — Memory Wall + Sponsor Stamp Wall + Sponsor Orbit + Booking Map
- 5 separate Admin Hubs (Marcel, Big Ace, Jay Paul, Justin — Micah removed) — replacing the single "Overseer Deck" tab

This directive corrects the original base to use those newer systems as **pluggable canisters** instead of hardcoded page content, and fixes the structural issues Marcel identified.

---

## 1. ACCOUNT SEPARATION — FAN vs PERFORMER (HARD RULE)

**Problem:** Fan and Performer were reachable from the same logged-in session (tab switching inside one dashboard).

**Fix:**
```typescript
// Fan and Performer are SEPARATE accounts, never linked
// User must:
1. Have a Fan account (email A) OR a Performer account (email B)
2. To use the other role, sign out completely
3. Log in to the other account separately
4. No "switch role" button inside an active session

// Database: User.role is fixed at signup (FAN | PERFORMER)
// No role field mutation after account creation
// Session token is role-scoped — a Fan session token cannot
// authenticate Performer-only routes, even with the same email
```

Both accounts get full feature parity for their role, **including Season Pass** on both:
- Fan account → Season Pass (fan rewards track: badges, avatar items, lobby perks)
- Performer account → Season Pass (performer rewards track: studio passes, NFT unlocks, main stage access)

---

## 2. THE THREE-MONITOR SYSTEM (NEW — APPLIES TO FAN PAGES + HOME PAGE)

Modeled after the Admin Observatory's working 3-monitor pattern, but repositioned for fan/performer/home pages:

```
Layout:
┌─────────────────────────────────────┐
│                                       │
│         MAIN MONITOR (large, top)    │
│         shows: live stream OR        │
│         billboard wall OR            │
│         sponsor/ad slot              │
│                                       │
└──────┬─────────────────────────┬─────┘
   ┌───┴────┐                ┌───┴────┐
   │ SMALL   │                │ SMALL   │
   │ bottom  │                │ bottom  │
   │ LEFT    │                │ RIGHT   │
   │ (mute   │                │ (PIP /  │
   │ control)│                │ billboard)│
   └─────────┘                └─────────┘
```

**Main monitor switchable content:**
- Fan lobby view (default)
- Billboard Live Lobby Wall (scrollable — user can browse all live rooms from their own page)
- Sponsor/ad slot (when no live content, never blank — falls back per Ad Slot Fallback Law)

**Bottom-left monitor:** Mute control surface
**Bottom-right monitor:** Picture-in-picture / billboard mini-preview

These are NOT connected/locked together — independent floating monitors, not a single fused panel.

```tsx
// Component: ThreeMonitorSystem.tsx
<ThreeMonitorSystem
  mainContent={mainMode} // 'lobby' | 'billboard' | 'sponsor-ad'
  bottomLeft="mute-control"
  bottomRight="pip-billboard"
  onMainSwitch={(mode) => setMainMode(mode)}
/>
```

---

## 3. LIVE LOBBY — REDESIGNED AS A 3D POP-UP CANISTER (NOT A STRIP)

**Problem identified:** The original `FAN LOBBY WALL` rendered avatars in a single horizontal line across the screen — faces too small, doesn't read as a real audience.

**Fix:**
- Live Lobby becomes its own **canister** with a chevron header (matches Playlist/Memory Wall pattern)
- Closed state: compact pill showing fan count
- Open state: **pops out with animation** into a grid of bigger avatar tiles (not a line)
- Avatar tiles sized to read clearly — minimum 80px, responsive grid
- 3D treatment: subtle depth via tile hover-lift, staggered entrance animation
- Microphone control inside the lobby panel — fans/performers can speak to the room, not just type
- Text input remains available alongside voice

```tsx
// Component: LiveLobbyCanister.tsx (replaces old horizontal LOBBY WALL strip)
<LiveLobbyCanister
  participants={lobbyMembers}      // bigger avatar grid, not a strip
  layout="popup-grid"               // NOT "horizontal-strip"
  micEnabled={true}
  textChatEnabled={true}
  is3D={true}                       // depth + hover-lift + stagger-in
/>
```

---

## 4. CAMERA CAPTURE → MEMORY WALL / PLAYLIST PIPELINE

**New capability:** Every user's camera (fan or performer) supports record-and-save.

```
Flow:
User camera (getUserMedia)
↓
Record button
↓
MediaRecorder API captures clip
↓
Stop recording
↓
Save options modal: Memory Wall | Playlist | Discard
↓
If Memory Wall → MemoryItem created (type: VIDEO, sourceType: 'self-capture')
↓
If Playlist → PlaylistMediaCard created (type: 'video', uploaded by self)
```

```typescript
// CameraCaptureWidget.tsx
const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
const recorder = new MediaRecorder(stream)
// On stop → present save destination choice
// Memory Wall save → POST /api/memory/create { type: 'VIDEO', mediaUrl, ownerType }
// Playlist save → POST /api/playlist/add-track { type: 'video', mediaUrl }
```

This is available on: Fan page, Performer studio page, live room pages.

---

## 5. CANISTER ARCHITECTURE — EVERYTHING PLUGS IN, NOTHING IS HARDCODED

Per the System Architecture Blueprint already established, these become independent pluggable canisters on both Fan and Performer pages:

| Canister | Source design | Pops up via |
|----------|---------------|-------------|
| PlaylistDashboardPanel | `tmi_playlist_engine_complete` | Chevron header |
| MemoryWallContainer | `tmi_memory_wall_sponsor_booking_canisters` | Chevron header |
| LiveLobbyCanister | NEW (this directive) | Chevron header |
| CameraCaptureWidget | NEW (this directive) | Inline in Memory Wall canister |
| ThreeMonitorSystem | NEW (this directive) | Always visible at top of page |
| SponsorStampWallCanister | `tmi_memory_wall_sponsor_booking_canisters` | Performer only, chevron |
| SponsorBubbleOrbitCanister | `tmi_memory_wall_sponsor_booking_canisters` | Performer only, chevron |
| BookingMapCanister | `tmi_memory_wall_sponsor_booking_canisters` | Performer only, chevron |
| AnalyticsPanel | NEW (this directive) | Chevron header |

**Rule:** No canister content is written directly into the page template. Each is a standalone component receiving props, mounted into a `CanisterSlot` wrapper that handles the open/close pop animation uniformly across the whole platform.

---

## 6. WHAT GETS REMOVED FROM THE ORIGINAL BASE FILE

```
REMOVE from tmi_complete_all_four_dashboards_v2.html base:
□ "OVERSEER DECK" tab — already superseded by the 5 separate admin hubs
  (Marcel / Big Ace / Jay Paul / Justin — Micah removed)
□ Hardcoded horizontal LOBBY WALL strip — replaced by LiveLobbyCanister
□ Hardcoded inline PLAYLIST WIDGET — replaced by PlaylistDashboardPanel canister
□ Single combined Fan/Artist tab switcher — replaced by separate account login
```

---

## 7. ANALYTICS — BARS, PIE, RULER/GAUGE (NEW REQUIREMENT)

Every Fan, Performer, Sponsor, Advertiser, Venue, Promoter dashboard gets an Analytics canister containing:
- **Bar chart** — weekly engagement / weekly revenue / weekly streams
- **Pie chart** — audience tier breakdown / genre breakdown / revenue source breakdown
- **Ruler/gauge meter** — hype score, XP progress, sponsor budget usage, season pass progress

```tsx
<AnalyticsPanel
  barData={weeklyEngagement}
  pieData={audienceTierBreakdown}
  gaugeData={{ label: 'Hype meter', value: 78, max: 100 }}
/>
```

---

## 8. THE THREE-WAY EXPERIENCE — CONFIRMED FLOW

```
Audience Experience (Portal)
↓
Fan Theater (Fan account, separate login)
↓
Performer Studio (Performer account, separate login)
↓
Profile (either role, shows their public-facing page)
```

This loop stays intact exactly as previously built — this directive only corrects the *internal composition* of each stop (canisters instead of hardcoded strips, 3-monitor system, separated accounts), not the routing chain itself.

---

## 9. VISUAL IDENTITY — UNCHANGED

Keep the existing TMI visual language across all of this:
- 1980s colorful magazine aesthetic
- Orbitron display font for titles, Exo 2 for body
- Red/orange/amber/gold palette with cyan and purple accents
- Neon glow, pulse, and flicker animation language already established

This directive changes **structure and composition**, not the color/font/era identity.

---

## BLACKBOX IMPLEMENTATION ORDER

```
PASS 1: Account separation
  □ Lock User.role at signup, remove in-session role switching
  □ Session tokens role-scoped

PASS 2: Three-monitor system
  □ Build ThreeMonitorSystem.tsx
  □ Mount on: Fan page, Performer page, Home page

PASS 3: Live Lobby canister
  □ Replace horizontal strip with LiveLobbyCanister.tsx
  □ Bigger avatar grid, chevron pop-up, mic + text input

PASS 4: Camera capture pipeline
  □ Build CameraCaptureWidget.tsx
  □ Wire record → save-to-Memory-Wall / save-to-Playlist

PASS 5: Canister conversion
  □ Convert hardcoded playlist widget → PlaylistDashboardPanel canister
  □ Convert hardcoded memory modal → MemoryWallContainer canister
  □ Remove Overseer Deck tab (superseded by 5 admin hubs)

PASS 6: Analytics
  □ Build AnalyticsPanel.tsx (bar + pie + gauge)
  □ Mount on all dashboards

PASS 7: Verify three-way flow intact
  □ Portal → Fan Theater → Performer Studio → Profile
  □ No regression in existing routing
```

---

*TMI_THREE_WAY_EXPERIENCE_REDESIGN.md — Claude, Build Director*
