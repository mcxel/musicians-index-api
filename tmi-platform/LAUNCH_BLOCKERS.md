# TMI LAUNCH BLOCKERS
**CRITICAL PATH TO REVENUE ONLY**

These loops MUST be verified end-to-end (Database → API → UI → Admin Dashboard).

- [ ] **Environment Loop:** Resolve `ECONNREFUSED` on Playwright tests (Dev Server vs Playwright port mismatch).
- [ ] **Deployment Truth:** Verify `Local SHA == GitHub SHA == Production SHA` to ensure we aren't serving stale builds.
- [ ] **Auth Loop:** Verify `Signup` → `Auth Persistence` → `Dashboard Entry`.
- [ ] **Auth Loop:** Verify `Login` → `Session Verification`.
- [ ] **Revenue Loop:** Validate `Ticket Purchase` → `Stripe Webhook` → `Ledger Entry`.
- [ ] **Revenue Loop:** Validate `Tip Performer` → `Transaction Log` → `Admin Dashboard` reflects tip.
- [ ] **Revenue Loop:** Validate `Sponsor Placement` → `Ad Engine` → appears in `Home 4`.
- [ ] **Streaming Loop:** `Host Go-Live` → `WebRTC Ingest` → Appears on `Home 3` Live Wall.
- [ ] **Broadcast Refactor:** Prototype `BroadcastLobbyWall(feedType)` to replace disparate/duplicate homepage walls.

*Note: If an issue does not directly block Signups, Logins, Streaming, Payments, or Admin Visibility, move it to POST_LAUNCH_BACKLOG.md.*