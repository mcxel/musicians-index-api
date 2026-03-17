**What this slice is**
- **Summary**: A client-only vertical slice demonstrating avatar creation → equip/preview → enter Bar Stage room → interact (chat, tips) → recap → share (mock orchestrator). Designed for local testing and handoff.

**Avatar Creation Center**
- **Purpose**: Create and preview avatars, equip props/emotes from local inventory, send loadout to room preview.

**Bar Stage room**
- **Purpose**: Live room demo with stage, audience layout, player widget, props, tips, moderated chat, recap and share UI.

**Recaps**
- **Purpose**: Lightweight recap/save placeholder demonstrating saving and listing recaps within the session.

**share/live-invite**
- **Purpose**: Prepare a share payload and submit a mock share job to the local orchestrator; provides copy-link/summary UI.

**self-heal status**
- **Purpose**: Room health state with `healthy` / `degraded` / `safe-mode` to toggle UI suppression for resilience demos.

**prop effects**
- **Purpose**: Simple prop-family visuals (candle flicker, glow-stick pulse, flashlight beam hint) used in preview & room.

**Routes**
- **/avatar-center**
- **/room/bar-stage**
- **/recaps**

**Session keys**
- **bb_loadout_v1**
- **bb_recaps_v1**
- **bb_latest_tip**
- **bb_latest_chat**
- **bb_room_health_bar-stage**
- **share payload key** (last prepared share payload; persisted locally)

**Custom events**
- **bb:loadout:changed**
- **bb:tip**
- **bb:chat:latest**
- **bb:room:health:changed**
- **bb:tool:share:result**

**What is truly wired**
- **equip flow**: Equip actions persist to `bb_loadout_v1` and emit `bb:loadout:changed`.
- **preview handoff**: Avatar preview reads equipped prop and shows PropEffects in preview.
- **room state handoff**: Room reads `bb_loadout_v1` on entry to render equipped props.
- **moderated chat**: Client-side filtering and `bb:chat:latest` emission are implemented.
- **tip effect**: Tip buttons emit `bb:tip` and `TipEffect` displays transient UI.
- **recap save/read**: `RecapCard` saves to `bb_recaps_v1` and `/recaps` reads that list.
- **share job prepare**: `ShareCard` builds payload and calls the mock orchestrator returning a jobId/result.
- **safe-mode suppression**: `RoomHealthCard` toggles safe-mode which disables nonessential UI.
- **prop visuals**: `PropEffects` implements the candle/glow/flashlight visuals used in preview and room.

**What is still mock/local-only**
- **sessionStorage persistence**: All data stored in sessionStorage only.
- **mock orchestrator**: `toolOrchestrator.ts` simulates job validation and returns mock job results.
- **no auth**: No user authentication or identity binding; ownership is demo-only.
- **no backend save**: No server-side persistence for loadouts, recaps, or jobs.
- **no real replay/video**: Recaps are metadata-only; no real replay capture.
- **no social API posting**: Share is copy-link/summary only; no external API calls.

**Next implementation order**
- **mock recap job via orchestrator**
- **backend persistence for loadout/recaps**
- **auth/user binding**
- **real tool-orchestrator job handling**
- **expand to second venue**

**Best filename**
- **tmi-platform/apps/web/VERTICAL_SLICE_BAR_STAGE_HANDOFF.md**

**Known fixes applied**
- **fixed TipButtons.tsx duplicate export issue**
- **added missing PreviewProp import**
