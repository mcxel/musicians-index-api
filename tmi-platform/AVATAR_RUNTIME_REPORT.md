# TMI Platform — Avatar Runtime Report
Generated: 2026-06-14

The avatar/theater system has two distinct layers. This report separates them clearly.

---

## Layer 1: Crowd Scene (AudienceScene) — STATUS: WIRED ✅

The AudienceScene is a canvas-based 3D crowd renderer. It is NOT about individual avatars — it renders hundreds of pixel-art audience members inside a venue.

### Files
- `components/live/AudienceScene.tsx` — runtime (TypeScript, default export at line 212)
- `components/live/AudienceScene.jsx` — blueprint copy (default export at line 222, coexists without conflict)

### Wired On These Pages
| Page | Import Style | Props | Status |
|---|---|---|---|
| `fan/theater/page.tsx` | Default import | `view="fan" venue={0}` | ✅ WIRED |
| `live/audience/page.tsx` | Via wiring | `view="fan"` | ✅ WIRED |
| `cypher/stage/page.tsx` | Default import | Renders AudienceScene | ✅ WIRED |
| `GoLiveStudio.tsx` | Pre-wired | `view="performer"` at line 588 | ✅ WIRED |

### What It Renders
- Canvas-based 3D venue (Theater / Arena / Club / Outdoor / Boardroom)
- Crowd of pixel humans with skin tone variety
- Phone glow effects, spotlight beams, BPM sync
- Fan view: back-of-head rows looking at stage screen
- Performer view: crowd facing up at you

### What It Does NOT Do
- It does not show individual user avatars with names/equipment
- It does not stream real performer video into the canvas
- BPM sync requires real BPM data to be passed in

---

## Layer 2: Individual Avatar System (HeroRigController) — STATUS: PLACEHOLDER ⚠️

This is the INDIVIDUAL user avatar — the 3D character a specific user controls.

### Files
- `components/avatar/HeroRigController.tsx`
- `lib/avatar/HeroAudienceSpawner.ts`
- `lib/avatar/HeroRegistry.ts`
- `components/avatar/AvatarVenueAnchor.tsx`
- `components/avatar/HeroRigController.tsx`

### Current State
The code has this comment (P12 milestone):
> "P12: Swap renderHero() to load GLB rig from CDN via Three.js / @react-three/fiber"

**Right now:** The `renderHero()` function renders an emoji-based avatar. No GLB/3D models are loaded.

### What "Blog Fallback" Actually Is
When someone visits a profile page like `/fan/[slug]` or `/performers/[slug]`:

**Before this session:** The page was a 27-line stub that showed text content (bio, follower count, static "No recent Memory Shards collected" message) — this IS the "blog-style content fallback" Marcel described.

**After this session fix:** Both profile pages now render `ProfileLobbyRuntime`, which shows a social-hub layout with tabs (Videos, Music, Live, Merch, etc.) — still text/card based, but no longer a flat blog stub.

**3D avatar rendering** requires the P12 unlock: swapping `renderHero()` to load a `.glb` file via `@react-three/fiber`.

---

## The Full Avatar Experience Gap

| Experience Layer | Expected | Actual | Gap |
|---|---|---|---|
| Crowd in venue (AudienceScene) | 3D pixel crowd | ✅ Canvas rendering | None — working |
| Individual profile page | Avatar-based hub | ProfileLobbyRuntime (card layout) | Not 3D — text cards |
| Individual avatar in venue | User's 3D character visible in crowd | Emoji placeholder | P12 GLB swap not done |
| Avatar customization | Cosmetic shop items affect 3D look | Cosmetic shop is UI only | No GLB variant files |
| Avatar movement/positioning | User's avatar follows room actions | Not implemented | Post-P12 |

---

## What Needs to Happen (in order)

### Step 1 — Verify route is not 404 (LOW EFFORT)
`/fan/theater` is wired. `AudienceScene` renders canvas crowd. This is confirmed working at code level.

### Step 2 — Confirm AudienceScene renders in browser (REQUIRES VISUAL AUDIT)
The canvas element renders on mount. On some browsers, `canvas` inside SSR Next.js pages needs `"use client"` — AudienceScene.tsx has `"use client"` at line 1. Should work.

### Step 3 — Wire real BPM data to AudienceScene (MEDIUM)
AudienceScene accepts BPM prop. Find where live music BPM data exists and pipe it in.

### Step 4 — P12: Load GLB character rigs (HIGH — separate milestone)
This is the full 3D avatar system. Requires:
- GLB files on CDN
- `@react-three/fiber` integration in HeroRigController
- Per-user avatar slot assignment
- Cosmetic variant GLB files

**P12 is explicitly scoped as a future milestone in the codebase. Do not attempt until P0-P11 are confirmed visually.**

---

## Immediate Action Items

1. **Visual confirm** — Visit `/fan/theater` in browser to verify AudienceScene canvas renders (not blank)
2. **Verify** `/upgrade` route exists — linked from multiple places in fan/theater page
3. **Wire real audio** to fan/theater playlist (currently fake progress bar)
4. **P8** — Load Orbitron+Exo 2 in `layout.tsx` so arena/home pages get correct fonts without per-page inject
