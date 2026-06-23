# RUNTIME EXPERIENCE GAPS

### 1. Transition Jitters
*   **Gap:** Moving from a 2D profile page into the 3D `AudienceScene` causes a harsh DOM repaint flash.
*   **Recommendation:** Implement `TheaterCurtainShell.tsx` (which exists in the codebase) to wrap the `LiveRoomRoute`. The curtain should stay closed with a "Loading Venue..." spinner until the WebRTC feed and Canvas are fully mounted, then animate open.

### 2. No-Stream Edge Case
*   **Gap:** When a `LiveRoom` ends, users are left staring at a frozen `MaskedVideoTile` or an abrupt 404 redirect.
*   **Recommendation:** Wire the `/api/live/end` route to trigger a pusher event. When received, `MaskedVideoTile` should transition to a "Broadcast Ended" state, and overlay a CTA: *"Watch Replay"* or *"Return to Arena"*.

### 3. The Empty State Problem
*   **Gap:** On `PerformerProfilePage`, if there are no battles, the text just says "No battles yet — join a battle". 
*   **Recommendation:** Empty states must be visual marketing. Show a ghosted-out championship belt with a glowing CTA button: "ENTER THE ARENA" instead of standard muted text.

### 4. Audio Ducking UX
*   **Gap:** `OmniPresenceEngine` proves audio ducking works under the hood (Voice > Beat). However, performers have no visual feedback in the *Studio UI* that their mic is successfully ducking their backing track.
*   **Recommendation:** Add an EQ visualizer widget to the Performer Studio HUD that visually shows the beat waveform shrinking when the vocal waveform spikes.