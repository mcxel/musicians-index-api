# GEMINI SIMULATION & COMPLETION AUDIT REPORT

## Executive Summary
The platform's frontend surface area (Homepages, Rooms, Profiles, Stores, Admin) is structurally vast and ready for rigorous automation. However, the simulation engines, bot behaviors, and fake economy required to *exercise* this surface are currently missing.

This audit maps the exact missing components, routes, and systems needed to complete the Simulation Test Network and close the final operational loops before real users are onboarded.

---

## 1. Missing Pages, Components & Engines

### Administrative UI (Missing)
- `/admin/simulation` (Simulation Command Center)
- `/admin/simulation/scenarios` (Scenario Launcher)
- `/admin/simulation/loops` (Loop Completion Board)
- `/admin/simulation/rankings` (Top 10 Monitor)
- `/admin/simulation/issues` (Issue Sprint Monitor)
- `/admin/simulation/support` (Complaint Routing Monitor)

### Simulation Engines (Missing in `/apps/api/src/modules/simulation/engines/`)
- `simulation-orchestrator.engine.ts`
- `scenario-runner.engine.ts`
- `issue-sprint.engine.ts`
- `top10-ranking.engine.ts`
- `crown-retention.engine.ts`
- `magazine-issue-placement.engine.ts`
- `complaint-routing.engine.ts`
- `button-action.engine.ts`
- `fake-wallet.engine.ts`
- `fake-roomfill.engine.ts`

### Missing Bot Profiles & Seed Scripts
- Fans, Performers, Producers, DJs, Hosts.
- Database scripts: `seed-simulation-users.ts`, `seed-simulation-wallets.ts`.

---

## 2. Missing Chains & Broken Dependencies

- **Data Safety Boundary:** There is no hard sandbox preventing simulation bots from triggering real Stripe endpoints or overwriting real editorial issues. **(Critical Blocker)**
- **Button Visual States:** The system lacks automated verification that buttons enter `Loading`, `Disabled`, or `Sold Out` states under stress.
- **Seat Occupancy Logic:** While rooms exist, the logic for bots to naturally "sit" in audience seats, occupy the front row, or idle without spamming chat is absent.
- **Chat Notification Overlay:** Pop-up chat messages that do not distract from room audio need rules for fade-out, max-stacking, and staging.
- **Action Matrix Completeness:** Deep component-level role blocking (e.g., stopping a Fan from uploading a beat) relies on UI hiding, not always API-level rejections.

---

## 3. Blockers and Fixes

| Blocker | Severity | Fix A (Quick) | Fix B (Standard) | Fix C (Robust) |
| :--- | :--- | :--- | :--- | :--- |
| **Real Data Contamination Risk** | **CRITICAL** | Hardcode bot email checks before API dispatch. | Create a `SimulationMode` flag on all services that bypasses external APIs. | Deploy a fully isolated parallel staging database specifically for the 12x Simulation runs. |
| **No Admin Control Center** | HIGH | Trigger simulation scenarios via terminal CLI scripts. | Build a basic React dashboard with Start/Stop buttons. | Build the full `/admin/simulation` suite with Loop Boards and Scenario Selectors. |
| **Empty Room Syndrome** | HIGH | Inject 5 static dummy users into every room via DB. | Build a simple chron job that rotates users in/out. | Build the `fake-roomfill.engine` with "Confidence Bots" that react and idle naturally. |
| **Untested Top 10 & Crown Logic** | MEDIUM | Manually override DB to test UI propagation. | Write unit tests for the ranking algorithm. | Build `top10-ranking.engine` to simulate months of voting and test 3-month retention hold at 12x speed. |

---

## 4. Priority Order for Implementation (Blackbox Hand-off)

To safely build this out without breaking the current UI, Blackbox should implement in this exact order:

1. **Simulation Command Center & Data Boundary:** Build the admin pages and enforce the fake data sandbox.
2. **Bot Seed Packs & Fake Economy:** Create the accounts and fake wallets.
3. **Room Occupancy + Confidence Bots:** Bring the rooms to life visually (no empty rooms).
4. **Universal Button + Action Audit Engine:** Ensure bots can click everything and catch dead links.
5. **Top 10 / Crown / Magazine Lifecycle:** Wire up the voting, ranking, and editorial propagation.
6. **Accelerated Issue Sprint Runner:** Run the 12x full cycle.
7. **Complaint Routing + Big Ace Escalation:** Build the automated support triage.
8. **Failure Injection + Reset Tools:** Add chaos testing and clean slate tools.

---
**Status:** Gemini Audit Complete. Ready for Blackbox Implementation Phase.
