# ENGINE DEPENDENCY ORDER
## BerntoutGlobal XXL — TMI Platform
## Effective: 2026-03-23 | Status: LOCKED EXECUTION AUTHORITY

---

## PURPOSE

Prevent architecture drift by enforcing the only valid engine build order.
No engine may be marked COMPLETE before all listed dependencies are wired.

Authority references:
- `UNIVERSAL_WIRING_LAW.md`
- `MASTER_WIRING_MAP.md`
- `PDF_UI_DESIGN_SYSTEM.md`
- `COMPONENT_LIBRARY_SPEC.md`
- `LAYOUT_TEMPLATE_LIBRARY.md`
- `SURFACE_TYPE_SYSTEM.md`
- `SHARED_PREVIEW_STAGE_SYSTEM.md`
- `VOICE_MEDIA_MIX_ARCHITECTURE.md`
- `REAL_VENUE_SYSTEM.md`

---

## GLOBAL RULES

1. Build in dependency order only.
2. If upstream engine is PARTIAL, downstream engine is automatically PARTIAL.
3. No visual-first stubs without wiring chain completion.
4. Every engine must satisfy the 12-link chain before promoted to COMPLETE.
5. Every engine must match PDF UI authority before promoted to COMPLETE.

---

## PHASED ENGINE ORDER

## Phase 1 — Core Runtime Wiring (Foundation)

These engines must be completed first:

1. **Audio Engine**
2. **HUD / Global State Engine**
3. **Notification Engine (basic runtime)**
4. **Artist/Profile Engine (`/artists/[slug]`)**
5. **Homepage Belt Engine**
6. **Magazine Engine**
7. **Points / Rewards Engine (core)**
8. **Leaderboard Engine**

### Why this phase first
- Provides global runtime owners (audio + hud + notification)
- Unlocks core platform identity surfaces (homepage + profile + magazine)
- Establishes economy baseline (points + leaderboard)

---

## Phase 2 — Rooms / Arena / Cypher Infrastructure

9. **Room Infrastructure Engine**
10. **Shared Preview Stage Engine**
11. **Turn / Queue Engine**
12. **Cypher Engine**
13. **Battle Engine**
14. **Producer Engine**
15. **Matchmaking Engine**
16. **Archive / Legacy Engine (room recaps, clips, replay)**

### Why this phase second
- Depends on stable runtime from Phase 1
- Requires shared media + queue + role controls to avoid room chaos
- Produces live participation loops and replay value

---

## Phase 3 — World / Venue / Event Systems

17. **Venue Engine**
18. **Event Engine**
19. **World Map / Location Engine**
20. **Booking Engine**

### Why this phase third
- Room stack must exist before venue/event mapping is meaningful
- Converts rooms into real-world-operable environments
- Introduces operator workflows and schedule-driven behavior

---

## Phase 4 — Economy / Sponsors / Growth / Launch

21. **Sponsor / Campaign Engine**
22. **Commerce / Merch Engine**
23. **Mission / Achievement Engine**
24. **Discovery Engine**
25. **Social Graph Engine**
26. **Collaboration Engine**
27. **Analytics / Intelligence Engine**
28. **Feature Flag / Operator Engine**
29. **Bot Automation Engine**
30. **Launch / Onboarding Runtime**

### Why this phase fourth
- Monetization/growth systems require stable live and world layers
- Analytics and bots are force multipliers only after signal paths exist
- Launch is final verification state, not an early milestone

---

## DETAILED ENGINE DEPENDENCY MATRIX

| Engine | Must Wait For |
|---|---|
| Audio Engine | none (Phase 1 start) |
| HUD Engine | Audio Engine |
| Notification Engine | HUD Engine |
| Artist/Profile Engine | HUD Engine, Notification Engine |
| Homepage Belt Engine | Artist/Profile Engine |
| Magazine Engine | Homepage Belt Engine |
| Points/Rewards Engine | Magazine Engine |
| Leaderboard Engine | Points/Rewards Engine |
| Room Infrastructure Engine | Leaderboard Engine |
| Shared Preview Stage Engine | Room Infrastructure Engine |
| Turn/Queue Engine | Shared Preview Stage Engine |
| Cypher Engine | Turn/Queue Engine |
| Battle Engine | Cypher Engine |
| Producer Engine | Battle Engine |
| Matchmaking Engine | Producer Engine |
| Archive/Legacy Engine | Matchmaking Engine |
| Venue Engine | Archive/Legacy Engine |
| Event Engine | Venue Engine |
| World Map/Location Engine | Event Engine |
| Booking Engine | Venue Engine, Event Engine |
| Sponsor/Campaign Engine | Booking Engine |
| Commerce/Merch Engine | Sponsor/Campaign Engine |
| Mission/Achievement Engine | Points/Rewards Engine, Commerce/Merch Engine |
| Discovery Engine | Matchmaking Engine, Archive/Legacy Engine |
| Social Graph Engine | Artist/Profile Engine, Discovery Engine |
| Collaboration Engine | Social Graph Engine, Producer Engine |
| Analytics/Intelligence Engine | Discovery Engine, Booking Engine, Sponsor/Campaign Engine |
| Feature Flag/Operator Engine | Analytics/Intelligence Engine |
| Bot Automation Engine | Feature Flag/Operator Engine |
| Launch/Onboarding Runtime | Bot Automation Engine |

---

## GATING CHECKS (PER ENGINE)

An engine cannot advance unless all gates are true:

1. Wiring law pass (12-link chain)
2. Route + provider + API + DB connected
3. HUD integration declared
4. A/V integration declared (if applicable)
5. Points integration declared (if applicable)
6. Admin/operator path wired
7. Logging + telemetry events emitted
8. Proof test present
9. Rollback/fallback path documented
10. PDF UI conformity pass

---

## STOP CONDITIONS (NO PROGRESS ALLOWED)

Stop downstream work if any of the following are true:
- Audio state is split across multiple owners
- HUD provider is missing
- `/artists/[slug]` route not wired
- Homepage belts are not live-connected
- Room queue lock or media lock is not enforced
- Venue mappings are missing for venue-tied rooms
- Feature flags are absent for newly introduced room modes

---

## CURRENT EXECUTION TARGET (LOCKED)

Immediate sequence:
1. Audio singleton patch (`streamwin/page.tsx` -> `useAudio()`)
2. HUD runtime provider wiring
3. `/artists/[slug]` route creation
4. Homepage belt wiring

No jump to room-world-economy layers until these four are complete.

---

## COMPLETION DEFINITION

The platform is only considered "operationally complete" when:
- all 30 engines are at COMPLETE status,
- each engine passes dependency gates,
- and first-live lifecycle is verified end-to-end:
  - first artist onboard
  - first fan onboard
  - first room session
  - first battle/cypher
  - first booking
  - first sponsor campaign
  - first event recap/archive
  - bot rotations active

---

Owner: Big Ace
No modifications without explicit approval.
