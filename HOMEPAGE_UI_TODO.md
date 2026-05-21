# TMI Homepage UI - Copilot Implementation Tasks

This document breaks down the TMI PDF Design System extraction into small, actionable tasks for GitHub Copilot. 
**Rule:** Execute these tasks sequentially. Do not combine steps to avoid payload size limits.

## COPILOT RULE: ALL HOMEPAGES MUST MATCH THE PDF SYSTEM

Do not use generic dashboard patterns.

Use the TMI PDF folder, Gemini's extracted design system, and this file as the visual source of truth.

All 5 homepages must preserve:
- neon editorial belt structure
- asymmetrical card layout
- layered collage feel
- motion and glow
- draggable card-canvas behavior
- live-looking visual hierarchy

Validation gate before homepage expansion:
- `apps/web` typecheck and production build must pass
- `apps/api` build must pass
- regressions outside storefront slice must be fixed first

## Phase 1: Foundation (Design Tokens & Systems)
- [ ] **Task 1.1: Create Design Tokens**
  - File: `packages/ui-system/src/design-tokens.ts` (or equivalent in your structure)
  - Define color palette (Void Black, Studio Obsidian, Neon Cyan, Magenta Pulse, Gold, etc.)
  - Define typography hierarchy (Oswald/Anton for Display, Inter for Body, JetBrains Mono for Data)
  - Define spacing system (Base 8px, Micro 4/8/12px, Macro 16/24px, Belt 48/64px)
  - Define border treatments, shadows, and glow values

- [ ] **Task 1.2: Create Motion Presets**
  - File: `packages/ui-system/src/motion-presets.ts`
  - Define Framer Motion variants for page load (staggered fade-up)
  - Define hover effects (lift, border color change, glow)
  - Define pulse animations (live indicators, high-XP glows)

- [ ] **Task 1.3: Document Visual Rules**
  - File: `packages/ui-system/src/visual-rules.md`
  - Document the rules for background layering, card layering, and out-of-bounds editorial imagery.

## Phase 2: Shells & Routing
- [ ] **Task 2.1: Create Base Routes**
  - Files:
    - `/app/home/cover/page.tsx`
    - `/app/home/magazine/page.tsx`
    - `/app/home/live/page.tsx`
    - `/app/home/social/page.tsx`
    - `/app/home/control/page.tsx`
  - Action: Create basic React components returning a placeholder container for each.

- [ ] **Task 2.2: Create Global Homepage Wrapper**
  - Action: Implement the Void Black + Ambient Glow background layer and subtle 1px structural grid lines.

- [ ] **Task 2.3: Create Navigation Rail**
  - Action: Build a simple HUD/rail to switch between the 5 homepage routes.

## Phase 3: Core UI Components (Card System)
- [ ] **Task 3.1: Build Card Canvas**
  - Component: `CardCanvas.tsx`
  - Action: Build the container for the drag-and-drop background grid.

- [ ] **Task 3.2: Build Draggable Card Wrapper**
  - Component: `DraggableCard.tsx`
  - Action: Implement spring physics for drag-and-snap. Apply default glassmorphic styling and hover lift/glow from tokens.

- [ ] **Task 3.3: Build Presentation Cards (Mock UI)**
  - Components:
    - `FeatureArtistCard.tsx` (Large/Hero, editorial typography, cut-out imagery)
    - `ArticleCard.tsx` (Vertical, text-heavy)
    - `LiveRoomCard.tsx` (Square/Horizontal, neon LIVE badge, sound wave)
    - `ProfileCard.tsx` (Square, avatar, role badge, quick actions)
    - `MessagePreviewCard.tsx` (Horizontal list item)
    - `BillboardCard.tsx` (Square/Large, holographic, progress bars)
  - Action: Build UI shells with hardcoded mock data matching the PDF aesthetic.

## Phase 4: Layout Assembly & Motion (The Polish)
- [ ] **Task 4.1: Assemble Cover Page**
  - Action: Integrate `FeatureArtistCard`, `BillboardCard`, and Live Ticker. Apply staggered load animations.

- [ ] **Task 4.2: Assemble Magazine Page**
  - Action: Build the asymmetric grid with Editorial, Discovery, and Marketplace Belts. Place Article and Feature cards.

- [ ] **Task 4.3: Assemble Live Page**
  - Action: Build Live Now, Up Next, and Battles/Cyphers sections. Populate with `LiveRoomCard`s.

- [ ] **Task 4.4: Assemble Social Page**
  - Action: Build Notifications, Friends/Fans Grid, and Messages sidebar using Profile and Message cards.

- [ ] **Task 4.5: Assemble Control Page**
  - Action: Build System Health, Bot Missions, and Layout Debugger sections.

## Phase 5: Data & System Engines
- [ ] **Task 5.1: Create Layout Maps**
  - Files: `homepage-layout-map.ts` and `magazine-slot-map.ts`
  - Action: Define the grid coordinates and saved layout states for the 5 pages.

- [ ] **Task 5.2: Implement Debug/Mock Toggles**
  - Action: Add a "why is this person in this slot?" debug overlay and a toggle for mock vs. live data states.

- [ ] **Task 5.3: API Integration Preparation**
  - Action: Define the props interfaces for all cards to easily swap mock data with real API hooks (`useLiveRooms`, `useMessages`) when backend wiring resumes.