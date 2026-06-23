# ROOM ENTRY PATCH QUEUE
**Date:** 2026-06-15 | **Phase:** P0.5 Reality Check Pass

**Rule:** Audit → Verify → Patch → Certify. 
Only patch surfaces marked as `NEEDS_PATCH`.

| Surface | Audit Says | Actual Code (Verified) | Status |
| :--- | :--- | :--- | :--- |
| **Performer Profile** | Bypass (`<Link>`) | Verified. Code uses `LobbyEntryFlow` and `setActiveFlowRoom` for both Live Rooms and Arena entry. | ✅ ALREADY_FIXED |
| **Billboard Wall** | Bypass (`window.location`) | Verified. Code uses `LobbyEntryFlow` and `handleJoinClick` inside `BillboardLiveWall.tsx`. | ✅ ALREADY_FIXED |
| **Stream & Win** | Server Redirect | Verified. Code uses `LobbyEntryFlow`. *Note: It forces entry into a single room (`/rooms/live-concert`). If this is supposed to be a Hub, this needs a UX redesign.* | ✅ ALREADY_FIXED |
| **Article Watch Live** | Bypass (`<Link>`) | Unverified. Component `articles/performer/[slug]/page.tsx` is not in the current workspace. | 🟡 NEEDS_PATCH |
| **Venue Active Event** | Bypass | Unverified. Venue Profile components are not in the current workspace. | 🟡 NEEDS_PATCH |

---

## Execution Plan
1. Do not touch Performer Profiles, Billboard Walls, or Stream & Win right now. They are certified as flowing into the Audience experience.
2. Await workspace loading of Magazine Articles and Venue Profiles to verify their exact `<Link>` states before patching them.
3. Maintain strict lane discipline: Revenue (BlackBox) remains the ultimate P0 blocker.