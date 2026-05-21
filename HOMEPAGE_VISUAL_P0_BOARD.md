# HOMEPAGE VISUAL P0 BOARD (FULL SCREEN NEON)

**CRITICAL MANDATE:** 
You are NOT building a website. You are building a living neon magazine world. 
No standard landing pages. No dashboards. No boxed UIs.

## 1. EXACT FILES TO EDIT

**Global Layout & Architecture:**
- `tmi-platform/apps/web/src/app/layout.tsx` (Remove any `max-w` or container constraints)
- `packages/ui-system/src/design-tokens.ts` (Update color palettes for neon dominance)
- `packages/ui-system/src/motion-presets.ts` (Add continuous background movement and ambient animations)

**The 5 Homepages:**
- `tmi-platform/apps/web/src/app/home/cover/page.tsx`
- `tmi-platform/apps/web/src/app/home/magazine/page.tsx`
- `tmi-platform/apps/web/src/app/home/live/page.tsx`
- `tmi-platform/apps/web/src/app/home/social/page.tsx`
- `tmi-platform/apps/web/src/app/home/control/page.tsx`

**Core Engine:**
- `packages/ui-system/src/components/HomepageVisualEngine.tsx` (New engine for managing background and glow layers)

## 2. EXACT LAYOUT STRUCTURE

**Required Structure (Fix C):**
- **FULL SCREEN TAKEOVER:** Content stretches to all edges.
- **COLOR-FIRST:** Vibrant, saturated backgrounds (not black-first).
- **NO FRAMING:** Zero boxed layouts, no "cards in the middle of darkness."
- **THE CANVAS:** The entire screen is the experience. Elements should bleed off the screen.

## 3. EXACT CSS / MOTION LAYERS

**Layer 1: Background (ALWAYS MOVING)**
- Neon gradients (pink, purple, orange, teal)
- Glowing grid (animated, deep perspective, not flat)
- Animated light streaks
- Subtle particles/confetti

**Layer 2: Energy Layer**
- Glow pulses behind content
- Rotating color wash
- Ambient light flicker
- Animated shapes (triangles, zig-zags, sparks)

**Layer 3: Content (MAGAZINE STYLE)**
- BIG typography
- Layered covers
- Overlapping elements
- Edges bleed into screen

**Layer 4: Motion**
- Slow floating cards
- Glow pulses
- Hover expansion
- Cinematic transitions between sections

**Extra Systems to Integrate:**
- **Theme Modes:** Neon classic, gold takeover, sponsor takeover, event takeover, seasonal.
- **Edge Lighting System:** Corners glow, borders shimmer, color pulses travel across the screen.
- **Dynamic Headlines:** Animated text flicker, glow typography, kinetic titles.
- **Background Scene Packs:** Concert mode, cypher arena, magazine mode, sponsor takeover mode.
- **Audio Layer:** Subtle ambient sound, crowd noise on hover, UI click sounds.

## 4. EXACT COMPONENT SYSTEM

**Visual Engine Components:**
- `FullscreenWrapper` (Manages edge-to-edge rendering)
- `AnimatedGradientBG` (Handles Layer 1 CSS movements)
- `EnergyGlowPulse` (Handles Layer 2 ambient flickers)
- `EdgeLightingBorder` (Manages screen border shimmers and glow)

**Magazine Content Components:**
- `EditorialCanvas` (Base for overlapping UI)
- `KineticTitle` (Animated, large typography)
- `BleedCard` (A card that is designed to stretch and bleed out of view)

## 5. EXACT ORDER TO REBUILD HOMEPAGE 1–5

**Phase 1: The Engine & Global Wrapper**
- Strip out all existing container classes, padding constraints, and black backgrounds.
- Build and apply the `HomepageVisualEngine` across the base layout (Layers 1 & 2).
- Ensure edge lighting and theme modes are operational.

**Phase 2: Rebuild Homepage 1 (Cover / Hero)**
- Implement Layer 3 Magazine Style (BIG typography, layered covers).
- Validate "NO FRAME" and "SCREEN FILL" rules.

**Phase 3: Rebuild Homepage 2 (Magazine / Discovery)**
- Set up the asymmetric, overlapping layout.
- Ensure elements bleed off edges instead of wrapping cleanly inside a box.

**Phase 4: Rebuild Homepage 3 (Live Venue / Broadcast)**
- Implement background scene packs (concert mode, cypher arena).
- Ensure high glow and heavy energy layer presence.

**Phase 5: Rebuild Homepage 4 (Social)**
- Implement floating cards, glow pulses, and hover expansions.

**Phase 6: Rebuild Homepage 5 (Control / Admin)**
- Even admin views must feel like a 1980s neon synthwave control panel, fully filling the screen. No standard dashboards.