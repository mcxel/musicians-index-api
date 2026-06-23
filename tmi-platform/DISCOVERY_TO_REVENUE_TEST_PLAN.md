# DISCOVERY TO REVENUE: END-TO-END TEST PLAN
**Date:** 2026-06-15 | **Phase:** P0.5 / P1 Final Certification Script

This is the exact sequence that must be tested to certify the platform for Soft Launch. It proves that the "One Live Session → Many Surfaces" rule is working, the Universal Entry Flow is un-bypassed, and money can successfully move.

## The Golden Loop Test

### 1. The Trigger (Go Live)
- [ ] Actor A (Performer) logs in.
- [ ] Actor A navigates to `/performer/studio`.
- [ ] Actor A clicks `🔴 GO LIVE`.
- [ ] **Verify:** `api/live/go` returns 200 OK.
- [ ] **Verify:** `GlobalLiveSessionRegistry` adds Actor A to active sessions.

### 2. The Propagation (Discovery)
- [ ] Actor B (Fan) opens an incognito window.
- [ ] Actor B navigates to `Home 1`. **Verify:** Actor A appears in the Live Monitor belt.
- [ ] Actor B navigates to `Home 1-2`. **Verify:** Actor A appears in the Billboard Live Wall.
- [ ] Actor B navigates to `Home 3`. **Verify:** Actor A appears in the Live World Grid.
- [ ] Actor B navigates to `/magazine`. **Verify:** If an article features Actor A, the static image is replaced by a live `MaskedVideoTile`.

### 3. The Entry (Join Lobby)
- [ ] Actor B clicks Actor A's live card on `Home 1`.
- [ ] **Verify:** The `UniversalLobbyEntry` modal appears (Preview).
- [ ] Actor B clicks `JOIN LOBBY`.
- [ ] **Verify:** Access Check evaluates (Free/Paid/Diamond).
- [ ] **Verify:** Seat Assignment executes (e.g., Row G, Seat 12).
- [ ] **Verify:** `AudienceScene` loads in the background of the modal.
- [ ] Actor B clicks `ENTER ROOM`.

### 4. The Immersion (Audience)
- [ ] **Verify:** Actor B arrives at `/live/rooms/[id]`.
- [ ] **Verify:** `TheaterCurtainShell` opens smoothly.
- [ ] **Verify:** Real-time WebRTC audio/video of Actor A is playing.

### 5. The Monetization (Spend)
- [ ] Actor B clicks the `$ TIP` button in the HUD.
- [ ] **Verify:** Stripe Checkout modal opens.
- [ ] Actor B completes test payment.
- [ ] **Verify:** Webhook fires and updates the DB Ledger.
- [ ] **Verify:** A tip animation plays on Actor A's screen.

### 6. The Retention (Return)
- [ ] Actor A clicks `⏹ END SHOW`.
- [ ] **Verify:** Actor B's screen transitions to "Broadcast Ended" state.
- [ ] **Verify:** Actor B is prompted to save a Memory or view the Leaderboard.
- [ ] **Verify:** Actor A is removed from `GlobalLiveSessionRegistry` and disappears from Home 1-5.