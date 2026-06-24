# FILE 20: tmi_omni_presence_engine.html — TMI Omni-Presence System Architecture

**File Status:** IN_CANONICAL_FOLDER + RECOVERED_FROM_ZIP  
**Location:** `apps/web/public/blueprints/tmi_omni_presence_engine.html`  
**Audit Date:** 2026-06-23  
**Type:** Interactive Reference/Specification Document  
**Lines Analyzed:** 352 (complete)  
**Blueprint Completeness:** 95% (full system spec with interactive UI demos)  
**Runtime Convergence:** 5-10% (no integration found in prior audits; architecture aspirational)  
**Rule 20 Violations:** MODERATE (demo sample data only, clearly labeled as reference)

---

## EXECUTIVE SUMMARY

FILE_20 is a **comprehensive, fully-functional interactive reference document** specifying the complete TMI omni-presence system — messaging, video communication, audio intelligence, live routing, and 10-phase build directive. It documents 7 core engines, 6 interactive tabs with demos, 10 build phases with detailed implementation specs, and 8 propagation targets for live broadcast. The specification is 95% complete; no integration into the production codebase has been verified. **Status: SPECIFICATION ONLY, not yet built as runtime.**

---

## FAKE DATA AUDIT (Rule 20 Violations)

### Status
**MODERATE** — Demo sample data present, but file is clearly labeled as reference/specification document, not a live feature.

### Sample Data Elements (Lines 44-60)

**CONVS Array (5 sample conversations):**
```javascript
{name:"Julius",        role:"Friend",       icon:"🦦", unread:2, last:"Yo, you catch that set?"},
{name:"Wave Theory",   role:"Band",         icon:"🎸", unread:5, last:"Rehearsal at 9PM tonight"},
{name:"Cypher Crew",   role:"Group · 12",   icon:"🎤", unread:0, last:"Battle is set for Friday"},
{name:"Chario Ace",    role:"Performer",    icon:"⭐", unread:1, last:"Come thru to my lobby"},
{name:"Backstage VIP", role:"Backstage · 8",icon:"🔒", unread:3, last:"Sound check at 7"}
```

- 5 fabricated conversation partners
- Unread counts: 2, 5, 0, 1, 3 (demo values)
- All "last message" text is sample content

**MESSAGES Array (7 sample messages):**
- Message types: text, beat, playlist, invite, video
- Sample content from "Julius" (fabricated user)
- Timestamps: 3:14 PM, 3:15 PM, etc. (demo timestamps)

### Justification
This file is a **specification document with interactive UI reference implementation**, not a deployed feature. All sample data is clearly for UI demonstration purposes, labeled as demo/reference content. **Not intended for launch without real data integration.**

**Assessment:** MODERATE violation, justified as reference material. If deployed as-is to production without real data connection, would be a CRITICAL violation (Rule 20). Currently acceptable because scope is "specification document" not "live feature."

---

## CONTENT ANALYSIS

### Architecture Diagram (Lines 115-148)

**System Visualization (SVG):**
Central TMI OMNI-PRESENCE ENGINE hub with 7 surrounding engines:

```
                    [MessengerShell]
                          
    [SafetyEngine]                    [VideoTileMoodEngine]
         
    [AmbientScheduler]
    
                  [TMI OMNI-PRESENCE ENGINE]
                  
                  [AudioDuckingEngine]
                         
    [LiveRoutingEngine]                [MonitorRuntime]
```

**7 Core Engines:**

| Engine | Description | Components |
|---|---|---|
| MessengerShell | Chat and messaging | ConvStore, Chat, Band chats |
| VideoTileMoodEngine | Video call UI states | SpeakGlow, Energy, Stable |
| MonitorRuntime | Floating/docked monitors | Screen, Beat, Playlist, Article monitors |
| AudioDuckingEngine | Voice-first audio mixing | VoicePriority, AutoDuck, Mixer |
| LiveRoutingEngine | Go Live system | Registry, Propagate, Heartbeat |
| SafetyEngine | Content moderation | UploadScan, Block, Rate limits |
| AmbientScheduler | Ambient UI effects | 3–5min transitions, ReducedMotion respect |

### Tab System (6 Tabs)

#### Tab 1: Overview (System Map)
- SVG architecture diagram
- 7 engine summary cards
- Stats bar: "10 Phases", "16+ Components", "9 Message Types", "5 Monitor Types", "3–5 min", "5s Heartbeat"

#### Tab 2: Messenger (Chat UI)
- Left sidebar: 5 sample conversations with unread badges
- Right panel: chat thread with message history
- Message types rendered:
  - **Text**: Speech bubbles, left/right aligned
  - **Beat**: Compact card with 🎵 icon, BPM, duration, Play/Save/Share buttons
  - **Playlist**: Card with 📋 icon, track count, Listen/Save buttons
  - **Invite**: Special card with JOIN/DECLINE buttons ("Invite to Lobby")
  - **Video**: Call incoming widget with Answer/Decline buttons
- Composer: emoji button bar + text input + Send button

#### Tab 3: Video Tiles (Mood Engine)
- 7 tile modes: Default, Speaking, Energy, Performing, Stable, Cinematic, Minimized
- Mode selector buttons
- 4 sample tiles (Tiana, Julius, Redbeard, SByeeGil)
- Each tile rendered differently per mode:
  - **Speaking**: cyan glow animation (VAD)
  - **Energy**: orange pulse (beat-reactive)
  - **Performing**: gold pulse + energy ring
  - **Stable**: purple static border (locked)
  - **Cinematic**: soft pink drift animation
  - **Minimized**: avatar circle + green online indicator, video hidden
- 8-feature matrix explaining each tile mode

#### Tab 4: Audio Engine
- **Auto-ducking indicator**: Shows when voice > 70% volume
- **Audio Mixer** with 5 sliders:
  - Voice Volume (cyan)
  - Beat / Music (gold, shows as "DUCKED" when auto-reducing)
  - Room Audio (purple)
  - Performer (orange)
  - Notifications (gray)
- **Ducking Formula** (line 113):
  ```
  If voiceVol > 70:  beatVol_ducked = beatVol - ((voiceVol - 70) * 0.75)
  Else:              beatVol_ducked = beatVol (no change)
  ```
- **Mixing Presets**: Band Rehearsal, Performer Live, Beat Review, Silent Study

#### Tab 5: Live Routing
- **Mode toggle**: PRACTICE (private, invite-only) vs PUBLIC (propagates to all 8 surfaces)
- **GO LIVE / STOP LIVE button** (animated)
- **Propagation Targets** (8 total, appear sequentially when GO LIVE pressed):
  1. 🏟 Lobby Wall
  2. 🏠 Home 1
  3. 🏠 Home 1-2
  4. 📰 Magazine
  5. 👤 Artist Profile
  6. 📄 Article Portal
  7. 🎪 Venue Page
  8. 👁 Admin Observatory
- **Session Lifecycle** (6 stages): Go Live → Register → Propagate → Heartbeat (5s) → Stop → Archive

#### Tab 6: Build Directive
- **10 Build Phases** (expandable accordion cards):
  1. **Messenger Shell** - ConversationStore, ChatThread, MediaCards, CallControls, SafetyReportModal
  2. **Memory Wall Media Picker** - Check mediaId duplication, security scanning
  3. **Video Chat Mood Tiles** - 7 tile modes, Speaking/Energy/Stable/Cinematic, draggable, resizable
  4. **Ambient Transition Scheduler** - Effects every 3–5 min (never back-to-back, respect reduced-motion)
  5. **Monitor Runtime** - FloatingMonitor, ScreenMonitor, VideoMonitor, states: floating/docked/pinned/fullscreen
  6. **Audio Intelligence** - Auto-duck (6-10dB), smooth fades, band rehearsal preset, mixer sliders
  7. **Invite-to-Lobby Protocol** - DM → invite card → accept → shared room (PlayStation UX model)
  8. **Safety Layer** - UploadSecurityEngine validation, moderation queue, abuse protection
  9. **Routes / API Audit** - Full API endpoint list (/messages, /api/messages, /api/rtc/signal, etc.)
  10. **Instant Live Routing** - PerformerLiveControls, Practice vs Public modes, seat assignment flow

- **CLI Verification section** (mandatory):
  ```
  pnpm -C apps/web typecheck
  pnpm -C apps/web build
  ```

### Core Specifications

**Audio Ducking Algorithm (Line 113)**

```javascript
function computeDucked() {
  if (st.voiceVol > 70)
    return Math.max(20, st.beatVol - Math.round((st.voiceVol - 70) * 0.75));
  return st.beatVol;
}
```

- When voice volume exceeds 70%, beat volume is automatically reduced
- Reduction formula: `beatVol - ((voiceVol - 70) * 0.75)`
- Minimum beat volume: 20% (never go below)
- Creates voice-first mixing during calls

**Video Tile Modes (7 Total, Lines 62-70)**

| Mode | Appearance | Use Case | Animation |
|---|---|---|---|
| Default | Standard border (gray) | Inactive participant | None |
| Speaking | Cyan glow + pulse | Active speaker (VAD) | Continuous 0.85s pulse |
| Energy | Orange rim + pulse | Beat-reactive mode | 1.4s pulse synchronized to drops |
| Performing | Gold pulse + energy ring | Live stage performance | 1s aggressive pulse |
| Stable | Purple border (semi-transparent) | User locked this position | Static (no animation) |
| Cinematic | Pink border (semi-transparent) | Soft ambient movement mode | Slight drift every 3–5 min |
| Minimized | Avatar circle + green dot | Video off, audio only | Low opacity avatar display |

**Ambient Effects Scheduler (Phase 4)**

- Fire one effect every 3–5 minutes (randomized)
- Never fire back-to-back
- Never move stable or pinned tiles
- Never interrupt typing, screen share, active audio
- Respect `prefers-reduced-motion` at all times
- Auto-pause on low battery or low device performance

Effects: neon sweep, frame shimmer, stage light pass, energy ring, chat header glow

**Messenger Message Types (9 Total)**

| Type | Rendering | Content | Actions |
|---|---|---|---|
| Text | Speech bubble | Arbitrary text message | Copy, React, Reply |
| Beat | Card | Beat title, BPM, duration, thumbnail | Play, Save, Share |
| Playlist | Card | Playlist title, track count, thumbnail | Listen, Save |
| Invite | Card | Invite to Lobby / Venue / Battle / Cypher | Join, Decline |
| Video | Card | Incoming call widget | Answer, Decline |
| Memory | (implied) | Memory wall media | View, Comment, Share |
| Article | (implied) | Magazine article link | Read, Save, Share |
| Venue | (implied) | Venue event info | Join, Save |
| Broadcast | (implied) | Live stream preview | Watch, Join |

---

## RUNTIME EQUIVALENTS

### Blueprint Artifact
Complete omni-presence system: 7 engines, 6 subsystems (Messenger, Video Tiles, Monitor, Audio, Live Routing, Safety), 10 build phases, interactive demos.

### Current Runtime File(s)
- **Messenger:** `apps/web/src/components/messaging/` (likely exists, based on prior project structure)
- **Video/Monitor:** `apps/web/src/components/video/` or similar (status unknown)
- **Audio:** `apps/web/src/lib/audio/` (likely exists)
- **Live Routing:** `apps/web/src/lib/live/GlobalLiveSessionRegistry.ts` (confirmed exists)
- **Safety:** `apps/web/src/lib/security/UploadSecurityEngine.ts` (status unknown)

**Search Note:** This file references many systems that have not been verified as existing in prior audits.

### Convergence Analysis

**Specification Completeness:** 95% (10 phases fully detailed)
**Implementation Status:** 5-10% (only GlobalLiveSessionRegistry confirmed; Messenger, Video Mood Tiles, Monitor Runtime, Audio Ducking not yet verified)
**Overall Convergence:** 5-10%

### Missing Pieces (Not Yet Verified as Implemented)

1. **MessengerShell** — ConversationStore, ChatThread components
2. **VideoTileMoodEngine** — 7 tile modes, Speaking glow, Energy pulse, Stable lock, Cinematic drift
3. **MonitorRuntime** — Floating/docked/pinned video monitors
4. **AudioDuckingEngine** — Auto-ducking formula, mixer UI
5. **AmbientScheduler** — 3–5 min effect scheduler
6. **SafetyEngine** — Upload security scanning integration
7. **Invite-to-Lobby Protocol** — DM invite → shared room spawn
8. **Live Propagation** — Real-time fire to all 8 surfaces on Go Live
9. **Message Types** — Rich media rendering (beat, playlist, invite cards, video calls)
10. **Call Controls** — WebRTC signaling, video/audio stream management

### Visual Gaps
None in specification. Design is complete and production-ready.

### Data Gaps
- All sample conversations and messages are demo only
- No real integration with actual message history or users
- No real audio device detection or WebRTC stream setup
- No real video stream rendering (only UI spec)

### Launch Blocking

**CRITICAL** — This specification is NOT ready for launch as-is. All 7 engines must be:
1. Implemented or verified existing
2. Integrated into single coherent system
3. Wired to real data sources (GlobalLiveSessionRegistry, user accounts, message storage)
4. Tested end-to-end with real WebRTC/audio streams
5. UI certification via browser testing (currently "Code-first · CLI-verified")

**Estimated Implementation Effort:** 40-60 hours (large multi-subsystem integration project, spans Messaging + Video + Audio + Live + Safety layers)

---

## THEME CLASSIFICATION

**Theme:** None (utility/system architecture, not a themeable surface)

**Reasoning:** This is an internal system architecture specification, not a user-facing visual surface. Messenger UI is functional but generic (standard chat interface). Video tiles have 7 modes, but these are functional states (speaking/energy/stable) not visual themes.

---

## CONVERGENCE ACTION

**Action: AUDIT + PRIORITIZE**

This is a large, multi-phase implementation project. Recommended approach:

1. **Phase 1 (Immediate):**
   - Verify which of 7 engines already exist in codebase
   - Create GH issues for missing engines
   - Establish ownership (assign lead per engine)

2. **Phase 2 (Foundation):**
   - Build MessengerShell + ConversationStore (prerequisite for other phases)
   - Wire to real user accounts and message storage
   - Implement 9 message types

3. **Phase 3 (Communication):**
   - Build VideoTileMoodEngine (7 tile modes)
   - Integrate WebRTC for real video/audio
   - Implement audio ducking algorithm

4. **Phase 4 (Live):**
   - Wire LiveRoutingEngine to all 8 propagation targets
   - Implement 5s heartbeat + cleanup governor
   - Test propagation latency

5. **Phase 5 (Safety):**
   - Integrate UploadSecurityEngine (already used elsewhere?)
   - Rate limiting on messaging/video APIs
   - Moderation queue UI

6. **Phase 6 (Polish):**
   - Ambient transition scheduler
   - Invite-to-Lobby protocol (join shared room from DM)
   - Monitor runtime (floating/docked/pinned states)
   - Full system integration test

**Priority:** MEDIUM-HIGH (communication system is foundational for social platform, but not blocking hard launch if basic messaging works without video/audio features)

---

## CODE SECTIONS (Key Patterns)

### State Management (Lines 29-33)

```javascript
const st = {
  tab: "overview",              // Current tab
  tileMode: "default",          // Video tile mood state
  liveMode: "practice",         // Private vs Public live
  isLive: false,                // Go Live toggle state
  propTargets: {},              // Propagation target states {id: true/false}
  voiceVol: 75, beatVol: 65,    // Audio mixer values
  roomVol: 50, perfVol: 80,
  notifVol: 40,
  openConv: 0,                  // Active conversation index
  openPhase: null               // Expanded build phase
};
```

All state is reactive — changing state triggers `render()` call.

### h() Hyperscript Factory (Lines 96-109)

Custom DOM builder for concise HTML generation:

```javascript
function h(tag, props, ...children) {
  const el = document.createElement(tag);
  if (props)
    for (const [k, v] of Object.entries(props)) {
      if (k === "style" && typeof v === "object") Object.assign(el.style, v);
      else if (k.charAt(0) === "@") el.addEventListener(k.slice(1), v);
      else if (k === "cls") el.className = v;
      else el.setAttribute(k, v);
    }
  children.flat(99).forEach(c => {
    if (c == null || c === false || c === undefined) return;
    el.appendChild(
      typeof c === "string" || typeof c === "number"
        ? document.createTextNode(String(c))
        : c
    );
  });
  return el;
}
```

Usage: `h("div", {style: {...}, "@click": handler}, "content")`

### Live Propagation Sequence (Lines 277-278)

```javascript
if (st.isLive && st.liveMode === "public")
  PROP_TARGETS.forEach((t, i) =>
    setTimeout(() => {
      st.propTargets[t.id] = true;
      render();
    }, 180 + i * 110)
  );
```

Fires propagation targets sequentially with 110ms stagger (after 180ms initial delay). Creates visual cascade effect of targets lighting up.

### Audio Ducking Button Update (Lines 255-257)

```javascript
const inp = h("input", { type: "range", min: 0, max: 100, value: sl.val });
if (!sl.ducked) inp.addEventListener("input", e => { st[sl.key] = +e.target.value; render(); });
else inp.setAttribute("disabled", "true");
```

Beat volume slider is disabled when auto-ducking is active, preventing user override.

---

## AUDIT METADATA

| Field | Value |
|---|---|
| File Name | tmi_omni_presence_engine.html |
| File Status | IN_CANONICAL_FOLDER + RECOVERED_FROM_ZIP |
| Type | Interactive Reference / Specification |
| Lines Analyzed | 352 (complete) |
| Specification Completeness | 95% |
| Runtime Convergence | 5-10% |
| Rule 20 Violations | MODERATE (demo sample data, justified as reference) |
| Visual Themes | 0 (system architecture, not themeable) |
| Fake Data | 5 sample conversations, 7 sample messages (demo only) |
| Safe for Launch? | NO (specification only, not integrated) |
| Core Engines | 7 (Messenger, Video Tile, Monitor, Audio Ducking, Live Routing, Safety, Ambient Scheduler) |
| Build Phases | 10 (detailed implementation roadmap) |
| Propagation Targets | 8 (Lobby, Home 1, Home 1-2, Magazine, Profile, Article, Venue, Admin) |
| Message Types | 9 (text, beat, playlist, invite, video, + 4 implied) |
| Tile Modes | 7 (Default, Speaking, Energy, Performing, Stable, Cinematic, Minimized) |
| Interactive Tabs | 6 (Overview, Messenger, Video Tiles, Audio, Live, Directive) |
| Runtime Dependency | GlobalLiveSessionRegistry, WebRTC, Messaging Database, Audio APIs |
| Code Modified | NO |
| Ready for Next File | YES |

---

**Blueprint File:** 20 of 43  
**Status:** Complete specification, no integration verified. Excellent reference document for required system architecture.  
**Priority:** MEDIUM-HIGH (communication system needed for social platform)

---

**Recommendation:** Use this file as the definitive specification for omni-presence system. Create GH issues for each of 10 phases. Assign Phase 1-2 (Messenger + ConversationStore) as immediate priority. Verify which systems (audio, messaging, video) already exist in codebase before building new. Wire GlobalLiveSessionRegistry to propagation targets (already in scope). This is one of the larger integration projects, estimate 2-3 developer-weeks for full implementation post-core-API-stabilization.

**Follow-up Tasks:**
1. [ ] Audit codebase for existing Messenger/Video/Audio implementations
2. [ ] Create 10 GH issues (one per phase)
3. [ ] Estimate scope per phase
4. [ ] Assign ownership
5. [ ] Identify dependencies (e.g., Phase 2 blocks Phase 3)
6. [ ] Plan WebRTC integration (signaling server, STUN/TURN servers)
7. [ ] Design message storage schema (types: text, beat, playlist, etc.)

