# DISCOVERY TO REVENUE CERTIFICATION
**Date:** 2026-06-15 | **Phase:** Soft Launch Readiness Dashboard

**The Golden Standard:** Can a stranger discover it, enter it, interact with it, spend money in it, and come back tomorrow?

## Platform Ecosystem Scorecard

| Surface | Discovery | Join | Watch | Interact | Spend | Return |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Home 1 (Cover)** | ✅ | 🔴 Bypass | 🔴 Bypass | ❌ | ❌ | ❌ |
| **Home 1-2 (Billboard)** | ✅ | 🔴 Bypass | ✅ | ⚠️ Partial | ❌ | ❌ |
| **Home 2 (Magazine)** | ✅ | 🔴 Bypass | ❌ | ❌ | ❌ | ❌ |
| **Home 3 (Live World)** | ✅ | ✅ | ✅ | ✅ | ⚠️ Mocked | ❌ |
| **Home 4 (Marketplace)** | ✅ | ❌ | ❌ | ❌ | 🔴 Blocked | ❌ |
| **Home 5 (Arena)** | ✅ | ✅ | ✅ | ✅ | ⚠️ Mocked | ❌ |
| **Games Discovery** | ✅ | ✅ | ✅ | ✅ | ⚠️ Mocked | ❌ |
| **Profiles (All)** | ✅ | 🔴 Bypass | ⚠️ Partial| ⚠️ Partial | ⚠️ Mocked | ✅ |
| **Magazine Articles** | ✅ | 🔴 Bypass | ❌ | ❌ | ❌ | ❌ |

---

## Legend & Execution Priority

### 1. 🔴 Blocked / Bypass (P0 / P0.5 Priority)
*   **Spend Blocked:** Handled by **BlackBox** (Stripe, Registries). Money physically cannot move.
*   **Join Bypass:** Handled by **Claude / Gemini**. Users are clicking live cards and hitting raw URL redirects instead of the `UniversalLobbyEntry` flow, skipping the ticket gates.

### 2. ⚠️ Partial / Mocked (P0 / P1 Priority)
*   **Spend Mocked:** UI looks correct, but it relies on static arrays. Needs database wiring.
*   **Interact Partial:** The buttons exist, but they don't fire to the `ParticipationLedger`.

### 3. ❌ Missing (P1 / P2 Priority)
*   **Return Missing:** Handled by **Gemini**. The user finishes an event and has no prompt to capture a memory, view their XP gains, or see the leaderboard. They hit a dead end.

---

**Goal:** Turn every row to solid ✅ before soft launch.