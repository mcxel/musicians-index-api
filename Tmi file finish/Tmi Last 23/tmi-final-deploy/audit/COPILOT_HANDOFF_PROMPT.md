# COPILOT_HANDOFF_PROMPT.md
## Copy This Entire Prompt to Copilot When Ready
### BerntoutGlobal XXL / The Musician's Index

---

```
COPILOT HANDOFF — THE MUSICIAN'S INDEX / BERNTOUTGLOBAL XXL

Repo root: C:\Users\Admin\Documents\BerntoutGlobal XXL\tmi-platform

TRUTH HIERARCHY:
1. Repo behavior = behavior truth
2. PDF magazine pages = visual truth
3. docs/system/ = architecture and platform law truth

ALL 16 ARCHITECTURE PACKS ARE NOW COMPLETE.
Planning is done. You are in WIRING PHASE ONLY.

PACK 16 HAS BEEN MERGED INTO THE REPO. All files are in place at:
- docs/system/ — 75+ atomic authority docs
- docs/system/bots/ — 10 bot specs + manifest
- apps/web/src/components/ — 76 split component shells
- apps/web/src/app/ — 100 new page route shells

FINAL DEPLOYMENT DOCS ARE ALSO IN docs/system/:
- FINAL_ENVIRONMENT_MATRIX.md
- DEPLOYMENT_COMPATIBILITY_SYSTEM.md
- NEXTJS_PRODUCTION_RUNTIME_SPEC.md
- RENDER_API_DEPLOYMENT_SPEC.md
- CLOUDFLARE_AND_PROXY_COMPATIBILITY.md
- NODE_AND_BUILD_CONTRACT.md
- ENV_VARIABLE_CONTRACT.md
- ADVERTISING_SYSTEM.md / SPONSORSHIP_SYSTEM.md

YOUR JOB: Wire systems in strict priority order. Do not redesign anything.

WIRING PRIORITY ORDER:

P0 — FIX CLOUDFLARE BUILD FIRST (ACTIVE BLOCKER):
Root cause: @tmi/hud-runtime workspace packages don't have dist/ during build
Fix A: Add to tmi-platform/apps/web/package.json:
  "scripts": { "prebuild": "pnpm -C ../../packages/hud-runtime build && pnpm -C ../../packages/hud-theme build && pnpm -C ../../packages/platform-kernel build" }
Fix B: Add to tmi-platform/apps/web/next.config.js:
  transpilePackages: ['@tmi/hud-runtime','@tmi/hud-theme','@tmi/platform-kernel']
Proof: Cloudflare Pages build shows SUCCESS for musicians-index-web

P1 — AFTER BUILD IS GREEN:
1. Wire artist slug route: apps/web/src/app/artists/[slug]/page.tsx
   → useArtistProfile(slug) from DB
   → Verify DiamondTierBadge shows for Marcel and B.J. M Beat's
   → CRITICAL: Diamond must show for both permanently

2. Wire lobby wall discovery sort: apps/web/src/components/lobby/LobbyWallPanel.tsx
   → useRoomList({ sort: 'viewers_asc', limit: 8 })
   → CRITICAL: position 1 ALWAYS = artist with fewest viewers
   → CRITICAL: 0 viewers = position 1

3. Wire countdown engine: apps/web/src/components/lobby/CountdownCard.tsx
   → useCountdown(targetDate, onExpire)
   → Numbers must animate on every tick
   → Color shift at <30s (gold) and <10s (red)

4. Wire room infrastructure to room page shells:
   → apps/web/src/app/arena/page.tsx → ArenaRoomShell
   → apps/web/src/app/cypher/page.tsx → CypherRoomShell
   → Connect RoomInfrastructureProvider to each

5. Wire SharedPreviewStagePanel into rooms:
   → Connect SharedPreviewProvider.openPreview() to artist trigger
   → Verify: all room participants see same source simultaneously
   → Verify: preview never covers performer face

6. Wire feature flags panel:
   → apps/web/src/app/admin/feature-flags/page.tsx → KillSwitchPanel
   → Connect to packages/platform-kernel/src/feature-flags.ts
   → Verify: flag changes propagate within 60s

7. Wire admin command center:
   → apps/web/src/app/admin/command-center/page.tsx → GlobalCommandCenterShell
   → Connect all 6 panel slots to their runtime hooks

P2 — AFTER P1 IS PROVEN:
8. Wire billing/subscription (Stripe webhooks)
9. Wire asset upload pipeline (R2 storage)
10. Wire analytics events per ANALYTICS_EVENT_TAXONOMY.md

WHAT NOT TO DO:
- Do NOT redesign any component
- Do NOT change the UI visual language
- Do NOT reorder provider chain in layout.tsx (it's already correct)
- Do NOT touch auth/onboarding flows that are already working
- Do NOT touch middleware.ts
- Do NOT commit without proof passing

PLATFORM LAWS (NEVER VIOLATE):
1. Discovery-first: 0 viewers = position 1 in lobby wall
2. Permanent Diamond: Marcel Dickens and B.J. M Beat's — forever
3. Preview non-interference: never covers performer face or turn timer
4. Brand words: Berntout, BerntoutGlobal, Berntout Perductions — never auto-corrected
5. One audio owner: AudioProvider only
6. One preview owner: SharedPreviewProvider only
7. One turn owner: TurnQueueProvider only
8. Marcel = analytics + suggestions only (no destructive actions)
9. Big Ace = full platform control

FOR EVERY BLOCKER RETURN:
1. Current status
2. Root cause
3. Minimum safe fix
4. Better structural fix
5. Best long-term fix
6. Fallback
7. Rollback
8. Exact files to edit
9. Exact proof commands
10. What this unlocks next

"This is your stage, be original." — BerntoutGlobal LLC
```
