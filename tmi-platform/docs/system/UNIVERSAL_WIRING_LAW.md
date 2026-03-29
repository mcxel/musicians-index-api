# UNIVERSAL WIRING LAW
## BerntoutGlobal XXL — The Musician's Index Platform
## Effective: 2026-03-23 | Authority: Big Ace | Status: LOCKED

---

## THE LAW

Every display, interface, widget, component, engine, and A/V surface must be connected through the **real platform wiring stack**.

**Nothing ships as a floating UI shell.**

---

## REQUIRED WIRING CHAIN — ALL 12 LINKS MUST BE PRESENT

Every platform system must be able to answer YES to every link in this chain:

| # | Link | What It Means |
|---|------|---------------|
| 1 | **Route** | A real URL exists — Next.js App Router page file at the correct path |
| 2 | **Layout/Shell Mount** | The page is wrapped by the correct providers in `layout.tsx` or a nested layout |
| 3 | **Component Tree** | A real, non-stub component is imported and rendered by the route |
| 4 | **Shared State / Provider** | A context provider or global state store feeds the component — not local-only state |
| 5 | **API / Data Contract** | A real API endpoint serves live data — not hardcoded arrays or mock objects |
| 6 | **Database Model or Config Source** | A Prisma model, FeatureFlag, or config record backs the API |
| 7 | **Loading State** | Component renders a loading skeleton/indicator while data is fetching |
| 8 | **Empty State** | Component renders a correct empty-state UI when no data is returned |
| 9 | **Error / Degraded State** | Component handles API errors and network failures gracefully |
| 10 | **Logging / Telemetry** | Events, errors, and key actions are logged via the platform `logger` |
| 11 | **Proof Test** | A proof function, test, or gate verifies the system is operating correctly |
| 12 | **Rollback / Fallback Path** | A fallback exists if the system degrades — feature flag disable, cached response, or hardcoded safe default |

If **any one link is missing**, the system status is `PARTIAL`, not `COMPLETE`.

---

## A/V WIRING LAW

Audio and video must **not** be mounted ad hoc per page.  
They must use shared runtime providers/singletons.

### Audio — Required Wiring

| Check | Rule |
|-------|------|
| Single audio owner | `AudioProvider` is mounted once in `layout.tsx` — never duplicated per page |
| `useAudio()` mandatory | Every component that controls playback must import and use `useAudio()` from `AudioProvider` — never manage local `isPlaying` state in parallel |
| Cross-route persistence | Playback state, current track, and playlist survive route changes because the provider is in the root layout |
| Mute/unmute persistence | Mute state lives in `AudioProvider`, not local component state |
| Pause-on-navigate rules | Explicitly configured in provider — not default silent |
| HUD exposure | `AudioProvider` state must be readable by the HUD runtime |
| Profile/save hooks | Save track, reward hook, and add-to-playlist must route through `AudioProvider` context |

### Video — Required Wiring

| Check | Rule |
|-------|------|
| Session owner | One `VideoSessionProvider` per room/session type — not inline per page |
| State persistence | Session join/leave, viewer count, and stream state live in the session provider |
| HUD exposure | Video session state must surface to HUD for operator visibility |
| Room isolation | Video state is scoped to room context — does not bleed across rooms |

---

## COMPONENT WIRING LAW

No component is considered complete unless it is wired to:

- A real parent surface (a route that renders it)
- Real props/contracts (typed interfaces, not `props: any`)
- A real state source (provider context or server action — not hardcoded arrays inside the component)
- A real fallback state (loading + empty + error)
- Real proof coverage (at minimum, a test that the component renders without crashing)

**An orphaned component** — one that exists in the file system but is not imported by any active route or layout — **does not count as built**. It is pending.

---

## ENGINE WIRING LAW

No engine is considered complete unless it is wired to:

- **Frontend route / surface** — the engine result is visible to users
- **API module** — a NestJS controller/service exposes the engine output
- **DB model(s) or explicit config layer** — the engine reads/writes real persistent data
- **Admin / operator controls** — the engine can be paused, overridden, or reconfigured without a code deploy
- **Logs / events** — every engine run or state change emits a log entry
- **Proof gate** — a `buildProof()` or equivalent function can be called to verify engine output is valid

---

## SYSTEM STATUS DEFINITIONS

| Status | Meaning |
|--------|---------|
| `COMPLETE` | All 12 wiring chain links are present and verified |
| `PARTIAL` | Route and at least one component exist, but 1+ chain links are missing |
| `SHELL` | Route and a component exist but the component is a stub/placeholder with no real data |
| `ORPHANED` | Component exists in the file system but is not imported by any active route |
| `MISSING` | No route, no component, no module — nothing exists yet |

---

## ENFORCEMENT RULES

### Copilot Build Rules (effective immediately)

1. **No new floating shells.** Every new component Copilot creates must be simultaneously wired to a real parent route and a real state source.

2. **No hardcoded data arrays in components.** Demo data is only allowed during initial scaffolding — scaffolded stubs must be immediately replaced with `useEffect` + API call + loading/empty/error states.

3. **AudioPlayer must not manage its own isPlaying state.** All playback control flows through `useAudio()`.

4. **No duplicate state.** If `AudioProvider` is mounted, no page may have a parallel `const [isPlaying, setIsPlaying] = useState(false)` for audio. The provider owns that state.

5. **No orphaned engines.** If `IssueEngine.ts` or `MagazineBrain.ts` exist, they must be called by a wired provider or data-fetching layer — not referenced only from proof utilities.

6. **HUD must be wired.** `TmiHud.tsx` must not remain a placeholder. Its first wiring priority is FeatureFlag state + audio playback state.

7. **Every system must declare its wiring status** in `docs/system/PLATFORM_SYSTEM_MAP.md` before any build work begins on it.

8. **Marcel + B.J.M. permanently hold Diamond status.** Any wiring that displays artist tiers must reflect Diamond assignment regardless of computed rank scores.

---

## WIRING AUDIT FORMAT

For every platform system, the audit must return these columns:

| Column | What to Assess |
|--------|---------------|
| Route | Does a real Next.js App Router page file exist at the canonical URL? |
| Page renders? | Does the page return non-stub JSX? |
| Provider mounted? | Is a shared context/provider active for this system? |
| Component connected? | Is a real (non-stub, non-passthrough) component imported and rendered? |
| API exists? | Does a NestJS module with controller + service exist? |
| DB model exists? | Does a Prisma model back the API? |
| HUD linked? | Does the HUD display this system's live state? |
| A/V linked? | Are audio/video behaviors routed through the singleton providers? |
| Loading/empty/error? | Are all three states handled? |
| Logging? | Does the system call `logger.*` on key events? |
| Proof? | Is there a proof function or test gate? |
| Display wired? | Screen-level: is the display visible at a real URL? |
| Interface wired? | Controls: can a user or operator interact with the system? |
| Widgets wired? | Atomic units: are sub-components receiving real props? |
| Engine wired? | Is the system's core logic connected end-to-end? |
| **Status** | COMPLETE / PARTIAL / SHELL / ORPHANED / MISSING |
| **First broken wire** | The earliest link in the chain that is not connected |
| **Minimum safe patch** | The smallest change that connects that wire without breaking other systems |

---

## APPLIES TO ALL SYSTEMS

- Homepage belts
- Magazine spreads
- Artist profile hubs
- Article pages
- Stream & Win
- Live rooms
- Cypher rooms/stages
- Booking dashboard
- Game Night / Deal or Feud
- Sponsor/Ad boards
- Billboard/Leaderboards
- HUD/global overlays
- Admin command surfaces
- Watch/Join/Join-random widgets
- Audience room interfaces
- Audio/video players
- Notification panels
- Points/rewards widgets
- Any UI surface not listed above — the law still applies

---

*This document is LOCKED architecture authority.  
All new system work must comply with this law before code is written.*

*Owner: Big Ace | No modifications without explicit approval.*
