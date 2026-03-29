# COPILOT EXECUTION PACK — WIRING PHASE
## BerntoutGlobal XXL — TMI Platform
## Effective: 2026-03-23

Use this pack as the next build instruction set.

---

## EXECUTION LAW

We are wiring systems, not building isolated pages.

Authority docs:
- `docs/system/UNIVERSAL_WIRING_LAW.md`
- `docs/system/MASTER_WIRING_MAP.md`
- `docs/system/PDF_UI_DESIGN_SYSTEM.md`
- `docs/system/COMPONENT_LIBRARY_SPEC.md`
- `docs/system/LAYOUT_TEMPLATE_LIBRARY.md`
- `docs/system/SURFACE_TYPE_SYSTEM.md`

---

## PHASE 1 (DO NOW)

### Slice 1 — Audio Singleton Hard Wire
Scope: `apps/web/src/app/streamwin/page.tsx`
Tasks:
1. Remove local audio state ownership (`isPlaying` etc.)
2. Use `useAudio()` from `AudioProvider`
3. Keep same UI, no redesign
4. Validate cross-route persistence behavior
5. Add minimal proof (play/pause/next with provider state)

Constraints:
- smallest patch
- no unrelated file changes
- no visual redesign

### Slice 2 — Artist Slug Route
Scope: `apps/web/src/app/artists/[slug]/page.tsx`
Tasks:
1. Create slug route
2. Fetch artist by slug from existing API layer
3. Render profile hub with real data
4. Add loading/empty/error state
5. Keep style aligned with profile hub template

### Slice 3 — Homepage Belt Wire
Scope: `apps/web/src/app/page.tsx`
Tasks:
1. Replace disconnected hero shell with belt entry surface
2. Wire `HomepageLiveCover` / `PromotionalHub`
3. Preserve existing page composition
4. Add loading fallback for belt data

---

## PHASE 2 (NEXT)

1. HUD runtime provider wire-up in `layout.tsx`
2. Magazine route -> `MagazineLayout` + `IssueEngine` connection
3. Stream & Win -> points hook (ledger credit)
4. Leaderboard module wiring

---

## QUALITY GATE (EVERY SLICE)

For each slice, return:
- First broken wire closed
- Chain links completed
- What remains partial
- Proof method used
- Rollback path

No slice is marked complete unless it passes the 12-link chain.
