# TMI GLOBAL COMPONENT, ASSET & ARCHITECTURE PIPELINE — FINAL LOCKED MEGA-BOARD

**STATUS: LOCKED — ALL SECTIONS ARE P0**
**COPILOT: This is your single source of truth. Execute every item. No skips. No placeholders.**

---

## ⚠️ ABSOLUTE MANDATES — READ FIRST, ENFORCE ALWAYS

### NO FRAME RULE
> If any homepage or room content is boxed or center-constrained → **RED. REBUILD REQUIRED.**

### SCREEN FILL RULE
> Does the page fill the entire screen? Are edges alive? Is color reaching the borders? Is there unused black space?  
> If black space exists at edges → **RED.**

### COLOR DOMINANCE RULE
> Black ≤ 30% of any visible screen. Neon color ≥ 70%. If black dominates → **RED.**

### PDF MATCH RULE
> Every page must match or visually exceed the TMI PDF source material. "Close enough" is RED.

### MOTION RULE
> Nothing on screen should feel static. Every background layer moves. Every card breathes. Glow pulses.

### ARTIFACT RULE
> Every image reference from the PDF folder must become a living component, widget, canvas, or interface.  
> **No flat PNG replacements. No static image tags standing in for interactive systems.**

---

## SECTION 0 — GLOBAL VISUAL FOUNDATION

**Vibe:** 80s Magazine Cover + MTV Arcade + Neon City broadcast. Not a website. A world.

### Design Token Source
- File: `apps/web/src/design/tmi/tokens.ts`
- Action: Enforce neon palette — pink `#FF2EAF`, purple `#8B00FF`, orange `#FF6B00`, teal `#00F5D4`, gold `#FFD700`.
- Kill: all `#000000` backgrounds. Replace with `#050510` deep space base minimum.
- File: `packages/hud-theme/src/index.ts`
- Action: Expose `ThemeMode` type: `'neon-classic' | 'gold-takeover' | 'cyber-blue' | 'sponsor-theme' | 'event-takeover' | 'seasonal'`.

### Theme Engine
- New file: `apps/web/src/engines/theme.engine.ts`
- Interface: `IThemeConfig { mode, primaryNeon, secondaryNeon, glowIntensity, particlesEnabled, gridEnabled, gridColor, edgeLightColor }`
- Reads from: `config/tmi_booking_defaults.json`
- Consumed by: every layout, every canvas, every room component.

### Existing Files to Kill Dead Styles In
- `apps/web/src/app/layout.tsx` — remove `max-w-*`, `container`, `mx-auto` from root. Full-bleed only.
- `apps/web/src/index.css` — remove any `body { background: black }` hard-codes. Set `background: var(--tmi-bg-base)`.
- `apps/web/src/styles/` — audit all files. Replace flat dark backgrounds with gradient tokens.

---

## SECTION 1 — ENVIRONMENT, ROOM & VENUE DESIGN SYSTEM (P0 CRITICAL)

This section converts every venue, lobby, arena, and room from a static background into a fully customizable neon world.

### Core System: `EnvironmentControlSystem`
- New file: `apps/web/src/systems/environment/EnvironmentControlSystem.ts`
- Interface: `IEnvironmentConfig { skinId, wallColor, floorPattern, ceilingFX, glowIntensity, particleFX, screenPlacements, seatLayout, stagePreset, lightingPreset, sponsorSkin }`
- Reads skin packs from: `data/environments/`
- Writes active config to: `room-engine.ts` → `SeatBindingEngine` → `scene-engine output`

### Layer System: `EnvironmentLayerStack` (Component)
- New file: `apps/web/src/components/venue/EnvironmentLayerStack.tsx`
- Layer 1 — `AnimatedBackground`: neon gradient + glowing grid + motion streaks.
- Layer 2 — `LightingFXLayer`: `LightRig.tsx` (exists) + `BeamSweep.tsx` (exists) + `StrobeController.tsx` (exists) — tie all three to `DynamicLightingRig` controller.
- Layer 3 — `StructureLayer`: walls, floors, stage geometry artifacts.
- Layer 4 — `ScreensLayer`: jumbotrons, billboards, sponsor screens (use `InteractiveJumbotron`).
- Layer 5 — `SeatsAndPeopleLayer`: `SeatMapRenderer.tsx` (exists) + `AudienceRowWidget` + avatar sprites.
- Layer 6 — `UIOverlayLayer`: HUD, voting bars, host overlay, chat bubbles.
- Wire to: `room-runtime.engine.ts`, `room-layout.engine.ts`, `seat-runtime.engine.ts`, `presence-engine`.

### `RoomCanvas` (Full-Screen World Wrapper)
- New file: `apps/web/src/components/venue/RoomCanvas.tsx`
- Replaces ALL boxed room containers. `width: 100vw; height: 100vh; overflow: hidden; position: relative`.
- Renders `EnvironmentLayerStack` as its base.
- All room routes must use `RoomCanvas` as their outermost element.

### `VenueSkinEditor` (Admin / Artist Environment Control)
- New file: `apps/web/src/components/venue/VenueSkinEditor.tsx`
- Surfaces: neon palette picker, skin swap buttons, lighting preset selector, sponsor skin injector.
- Preloads skin options from: `data/environments/` + `Tmi PDF's/game show and venue skins/` assets.
- Tie to: `venue.engine.ts` → `EnvironmentControlSystem`.

### `SeatLayoutEditor`
- New file: `apps/web/src/components/seating/SeatLayoutEditor.tsx`
- Builds on existing: `SeatMapRenderer.tsx`, `SeatMap.ts` (arena), `room-seat-map.engine.ts`, `seat-reservation.engine.ts`.
- Features: drag-drop seat zones, VIP zone painter, standing room toggle, capacity visualizer.
- Outputs: JSON seat config → `SeatBindingEngine`.

### `StageBuilder`
- New file: `apps/web/src/components/stage/StageBuilder.tsx`
- Controls: stage size, lighting rig positions, jumbotron placement, host zone, performer zones.
- Builds on: `StageCurtain.tsx` (exists), `LightRig.tsx` (exists).
- Wire to: `room-template.engine.ts`, `room-instance-factory.engine.ts`.

### Room Presets (Scene Packs)
- New file: `apps/web/src/systems/environment/ScenePresetLoader.ts`
- Preset IDs: `concert-arena`, `cypher-ring`, `lounge-club`, `vip-room`, `outdoor-stage`, `studio-session`, `game-show-floor`, `dance-party-world`, `sponsor-takeover-arena`.
- Each preset contains: `IEnvironmentConfig` + motion timing + color palette.
- Load via: `RoomSceneBackground.tsx` (exists) + `ScenePickerPanel.tsx` (exists) — upgrade both to consume presets.

### Route Coverage (Venue / Room)
All routes must use `RoomCanvas` + `EnvironmentLayerStack`:
- `apps/web/src/app/venue/[slug]/lobby/`
- `apps/web/src/app/venue/[slug]/arena/` (upgrade existing `apps/web/src/components/arena/ArenaViewer.tsx`)  
- `apps/web/src/app/venue/[slug]/cypher/`
- `apps/web/src/app/venue/[slug]/backstage/`
- `apps/web/src/app/venue/[slug]/vip-lounge/`
- `apps/web/src/app/room/[id]/` — all room sub-routes
- `apps/web/src/app/audience-room/`
- `apps/web/src/app/lobby/`
- `apps/web/src/app/stages/`
- `apps/web/src/app/world/`

---

## SECTION 2 — HOMEPAGE VISUAL ENGINE (THE 5 WORLDS)

**Source Assets:** `Tmi Homepage 1-5`, `The Musician's Index Magazine images.pdf`, `The Musician fini.pdf`

### `HomepageVisualEngine`
- New file: `apps/web/src/engine/HomepageVisualEngine.tsx`
- Controls: background layer, energy layer, content canvas, motion timing, theme mode.
- All 5 homepage routes load this engine as their base before rendering any content.

### Layer Structure (Enforce on ALL 5 Homepages)
- **Layer 1 — Background (ALWAYS MOVING):** `AnimatedGradientBG` — neon gradients, glowing perspective grid, animated light streaks, subtle particles/confetti.
- **Layer 2 — Energy Layer:** `EnergyGlowPulse` — glow pulses, rotating color wash, ambient flicker, animated shapes (triangles, zig-zags, sparks).
- **Layer 3 — Content (MAGAZINE STYLE):** `EditorialCanvas` — big typography, layered covers, overlapping elements, edges bleeding off screen.
- **Layer 4 — Motion:** floating cards, hover expansions, cinematic transitions, `CinematicPageFlipper`.

### Homepage Components (New)
- `apps/web/src/components/home/FullscreenWrapper.tsx` — enforces `100vw × 100vh`, no scroll clipping, translates theme tokens.
- `apps/web/src/components/home/AnimatedGradientBG.tsx` — CSS keyframes + Framer Motion gradient orbs.
- `apps/web/src/components/home/EnergyGlowPulse.tsx` — ambient particle emitter layer.
- `apps/web/src/components/home/EdgeLightingBorder.tsx` — corners glow, borders shimmer, color pulses travel across screen edges.
- `apps/web/src/components/home/KineticTitle.tsx` — animated text flicker, glow typography, kinetic entry.
- `apps/web/src/components/home/BleedCard.tsx` — card designed to stretch and bleed off viewport edge.
- `apps/web/src/components/home/JumpingSectionCanvas.tsx` — dynamic sections that shift position based on real-time billboard/data feed.
- `apps/web/src/components/home/LiveBroadcastFeedWidget.tsx` — auto-playing HLS stream cards embedded in homepage.

### Homepage Routes (Upgrade Each)
- `apps/web/src/app/home/cover/page.tsx` → Homepage 1: PDF Cover — big hero, magazine bleed layout.
- `apps/web/src/app/home/magazine/page.tsx` → Homepage 2: Discovery/Editorial — asymmetric, overlapping, edge-bleeding.
- `apps/web/src/app/home/live/page.tsx` → Homepage 3: Live Venue/Broadcast — concert scene pack, heavy energy layer.
- `apps/web/src/app/home/social/page.tsx` → Homepage 4: Social — floating cards, glow pulses, hover expand.
- `apps/web/src/app/home/control/page.tsx` → Homepage 5: Control — 1980s neon synthwave control panel, full bleed.
- Wire to: `homepage-data.adapter.ts` (exists), `billboard.engine.ts` (exists).

### Dynamic Headlines
- `DynamicHeadlineScroller` — animated glow text rotating through live artist/event headlines.
- Feeds from: `billboard.engine.ts`.

---

## SECTION 3 — MAGAZINE SYSTEM (MONTHLY ISSUES + ROTATION)

- Route: `apps/web/src/app/magazine/issue/[month]/page.tsx`
- Layout: `MagazineReaderLayout` — full-screen, cinematic page-flip reader.
- Component: `CinematicPageFlipper` — high-res interactive magazine reader with `page-flip.engine.ts` (exists).
- Component: `MagazineCover.tsx` (exists) — upgrade to full-screen bleed cover with animated foil effect.
- Existing engine: `magazine-layout.engine.ts`, `horizontal-magazine.engine.ts`, `profileMagazine.engine.ts` — all must feed the reader.
- Bot: `MagazineRotationBot` — `apps/web/src/engines/weekly-rotation.engine.ts` (exists) — extend to handle monthly issue rotation, auto-publishes cover, auto-archives old issues.
- Editorial content: feeds from `apps/web/src/app/editorial/`, `apps/web/src/app/articles/`, `apps/web/src/app/issues/`.

---

## SECTION 4 — ARTIFACT ENGINE (IMAGES → LIVING COMPONENTS)

**Mission:** Every image from `Tmi PDF's` becomes an editable, theme-aware, data-driven component.

- New file: `apps/web/src/systems/artifacts/ArtifactEngine.ts`
- Interface: `IArtifact { id, type: 'stage' | 'seat' | 'screen' | 'billboard' | 'prop' | 'avatar' | 'skin', config, animationHooks, sponsorInjectionPoints, themeTokens }`

### Core Artifacts
- `apps/web/src/systems/artifacts/StageArtifact.tsx` — lighting props, animation hooks, sponsor injection, performer zones.
- `apps/web/src/systems/artifacts/SeatArtifact.tsx` — interactive, ownership-aware, animated crowd reactions, tier-colored.
- `apps/web/src/systems/artifacts/ScreenArtifact.tsx` — plays video, renders ads, reacts to `billboard.engine.ts` events.
- `apps/web/src/systems/artifacts/BillboardArtifact.tsx` — live rotator fed by `AdRotationLogic` / `spotlight-rotation.engine.ts` (exists).
- `apps/web/src/systems/artifacts/PropArtifact.tsx` — draggable, dropper-compatible prop spawned by `EmoteWheel`.
- `apps/web/src/systems/artifacts/AvatarArtifact.tsx` — wraps `AvatarSprite.tsx` (exists) with full `IAvatarRig` theme + emote state.

---

## SECTION 5 — ACCOUNTS, SIGNUPS, PROFILES & SUBSCRIPTIONS

**Source Assets:** `Advertiser Sign up.png`, `Fan Sign up.png`, `Performer Sign up.png`, `Sponsor Sign up.png`, `Adminisratation Hub.jpg`, `Advertiser and sponser hub.jpg`, `season Pass.jpg`

### Layouts (Full-Screen Immersive)
- `SignupFlowCanvas` — full bleed, `RoleSelectionBubble` floating over `AnimatedGradientBG`.
- `DashboardHubCanvas` — neon arcade control panel aesthetic, no white backgrounds.

### Components
- `apps/web/src/components/home/RoleSelectionBubble.tsx` — animated floating bubbles: Fan / Performer / Sponsor / Venue.
- `apps/web/src/components/economy/SeasonPassWidget.tsx` — holographic tilt card: Bronze / Silver / Gold / Platinum / Diamond.
- `apps/web/src/components/admin/NeonAdminPanel.tsx` — retro-futuristic data tables, upgrade existing `apps/web/src/components/admin/` files.
- `apps/web/src/components/ui/SignupFormCard.tsx` — glassmorphic, glowing borders, no standard gray inputs.

### Routes
- `apps/web/src/app/auth/fan/`, `/auth/performer/`, `/auth/sponsor/`, `/auth/advertiser/`
- `apps/web/src/app/hub/admin/`, `/hub/fan/`, `/hub/performer/`, `/hub/sponsor/`
- `apps/web/src/app/season-pass/` (exists — upgrade to `SeasonPassWidget`)
- Subscription tiers: `apps/web/src/app/pricing/` — wire `subscriptionBenefits.engine.ts` (exists) + `profileTier.engine.ts` (exists).
- Access gate: every paid route must call `AccessEngine` — Gold bypass vs $1 entry, config from `config/tmi_booking_defaults.json`.

---

## SECTION 6 — HOSTS, AVATARS, CLOTHING, PROPS & EMOTES

**Source Assets:** `Host 1-4.png`, `Julius.png`, `Record Ralph.jpg`, `Tiana monday night stage host.jpg`, `Bebo.jpg`, `BobbleHead Avatar extras 1-3.jpg`

### Components
- `apps/web/src/components/avatar/AvatarCustomizerWidget.tsx` (upgrade `AvatarCreator.tsx` exists) — full-screen mirror, equip clothing, props, test emotes live.
- `apps/web/src/components/arena/AvatarSprite.tsx` (exists) — upgrade: bobblehead mode, expression blink, `LipSyncIndicator`.
- `apps/web/src/components/host/HostBroadcastOverlay.tsx` — transparent corner overlay, host image, speech bubble, `LipSyncIndicator`.
- `LipSyncIndicator` — glowing audio wave under avatar, synced to `lip-sync-engine`.
- `EmoteWheel` — radial menu in room, fires emote events to `room-interaction.engine.ts` (exists).
- `PropDropper` — live room prop spawner, uses `PropArtifact`.

### Routes
- `apps/web/src/app/avatar/studio/` (exists — upgrade to full-screen customizer)
- `apps/web/src/app/avatar-builder/` (exists — wire to `AvatarArtifact`)
- `apps/web/src/app/avatar-center/` (exists)
- `apps/web/src/app/my-closet/` (exists — neon wardrobe UI)
- `apps/web/src/app/my-emotes/` (exists — animated emote grid)
- `apps/web/src/app/my-props/` (exists — prop inventory)
- `apps/web/src/app/my-loadout/` (exists — full loadout editor)

### Engines (Existing — Verify Wired)
- `apps/web/src/engines/avatar/` — must be wired to `AvatarArtifact`.
- `apps/web/src/engines/host.engine.ts`, `host-runtime.engine.ts`, `julius.engine.ts`, `host-script.engine.ts` — `HostAIBot` auto-cueing must be active.
- `apps/web/src/engines/character.registry.ts` — all PDf characters (Julius, Ralph, Tiana, Bebo, Hosts 1-4) must be registered.

---

## SECTION 7 — CONCERTS, BATTLES, SHOWS, CYPHERS & VOTING

### Components
- `apps/web/src/components/game/BattleTurnTimer.tsx` — neon countdown clock, fires `battleSchedule.engine.ts` events.
- `apps/web/src/components/vote/LiveVotingWidget.tsx` (upgrade existing `vote/`) — real-time neon bar chart, WebSocket-fed.
- `apps/web/src/components/winners/WinnerCoronationFX.tsx` — confetti particles, neon spotlight, cinematic overlay, crown drop animation.
- `apps/web/src/components/contest/ContestRulesModal.tsx` — glowing full-screen overlay.
- `apps/web/src/components/live/GoingLiveCountdown.tsx` — pre-show neon countdown sequence.
- `apps/web/src/components/live/BroadcastActivationFX.tsx` — "YOU ARE NOW LIVE" full-screen takeover animation.

### Routes
- `apps/web/src/app/shows/[id]/live/` (exists)
- `apps/web/src/app/cypher/` (exists — wire `BattleTurnTimer`)
- `apps/web/src/app/contests/` (exists)
- `apps/web/src/app/competitions/` (exists)
- `apps/web/src/app/battles/` (add if missing)
- `apps/web/src/app/voting/[id]/` (add if missing — wire `LiveVotingWidget`)
- `apps/web/src/app/winners/` (exists — wire `WinnerCoronationFX`)
- `apps/web/src/app/winner-hall/` (exists)
- `apps/web/src/app/live/` (exists)
- `apps/web/src/app/stream-win/`, `apps/web/src/app/streamwin/` (exists)

### Engines (Existing — Verify Wired)
- `battleSchedule.engine.ts`, `game-runtime.engine.ts`, `show.engine.ts`, `show-timeline.engine.ts`, `show-mode.engine.ts`, `tryout.engine.ts`, `rehearsal.engine.ts`, `curtain.engine.ts`, `curtain-timeline.engine.ts`.

---

## SECTION 8 — GOING LIVE SYSTEM

- Component: `GoingLiveDashboard` in `apps/web/src/app/live/` — pre-flight checklist UI, neon green "READY" indicators.
- `LiveVideoRouting` — WebRTC/HLS pipeline: `apps/web/src/components/live/` + `apps/web/src/engines/video-layout.engine.ts` (exists) + `multi-camera.engine.ts` (exists).
- `AudioMixerNode` — spatial audio for cyphers/lobbies: `apps/web/src/components/` + `AudioProvider.tsx` (exists, upgrade).
- `stream-layout-rotation.engine.ts` (exists) — feed active streams to homepage `LiveBroadcastFeedWidget`.
- `camera-angle.engine.ts` (exists) — wire to `CameraRig.ts` (arena, exists).

---

## SECTION 9 — BILLBOARD & GLOBAL TICKET NETWORK

### Components
- `apps/web/src/components/billboard/WorldConcertCard.tsx` — live preview card: artist video, live badge, join price pill (`$1 JOIN` vs `FREE WITH GOLD`), crowd count, sponsor badge.
- `apps/web/src/components/billboard/VenueEventCard.tsx` — venue card: preview, genre, location, capacity, ticket price tier badge.
- `apps/web/src/components/billboard/BillboardFilterBar.tsx` — near me, worldwide, genre, date, price, live vs upcoming.
- `apps/web/src/components/billboard/PerformerBubbleCard.tsx` — venue talent match floating bubble: avatar, talent type, distance, fan rating, booking price, match ribbons.

### Routes
- `apps/web/src/app/billboard/` (exists — upgrade to `WorldConcertCard` grid)
- `apps/web/src/app/billboards/world-concerts/` (add)
- `apps/web/src/app/billboards/venues/` (add — Global Ticket Board)
- `apps/web/src/app/events/` (exists), `apps/web/src/app/events/[slug]/`
- `apps/web/src/app/tickets/` (exists), `apps/web/src/app/my-tickets/` (exists)
- `apps/web/src/app/venue/signup/`, `/venue/[slug]/talent-suggestions/`, `/venue/[slug]/booking-calculator/`
- `apps/web/src/app/admin/talent-rotation/`, `/admin/global-billboard/`, `/admin/live-ledger/`, `/admin/concert-access-rules/`

### Engines (Existing — Verify Wired)
- `billboard.engine.ts`, `billboardLinking.engine.ts`, `venue.engine.ts`, `venue-booking.engine.ts`.
- `ticket.engine.ts`, `ticket-inventory.engine.ts`, `ticket-lifecycle.engine.ts`, `ticket-fee.engine.ts`, `ticket-sales-analytics.engine.ts`.
- `seat-reservation.engine.ts`, `seat-runtime.engine.ts`.
- `finance-payout.engine.ts`, `finance-ledger.engine.ts`, `stripe-payments.engine.ts`, `stripe-webhooks.engine.ts`.
- `revenue-split.engine.ts` — must enforce splits from `config/tmi_booking_defaults.json`.

---

## SECTION 10 — ECONOMY: SPONSORS, ADVERTISERS, PRIZES, XP & REWARDS

### Components
- `apps/web/src/components/economy/GiftedSurpriseDrop.tsx` — neon loot box falls into crowd, randomized reward reveal, advertiser-funded animation pipeline.
- `apps/web/src/components/sponsor/PopUpSponsorBanner.tsx` — in-world holographic sponsor placement (upgrade existing `sponsor/` components).
- `apps/web/src/components/economy/AchievementBadge.tsx` — unlockable glowing animated emblems.
- `apps/web/src/components/economy/XpProgressBar.tsx` — leveling meter with neon fill animation.
- `apps/web/src/components/economy/PrizeRevealFX.tsx` — cinematic prize reveal, feeds `prize.engine.ts` pipeline.
- `apps/web/src/components/economy/SponsorTakeoverOverlay.tsx` — full-screen sponsor mode skin, feeds `ThemeManager` with sponsor color palette.

### Routes
- `apps/web/src/app/sponsor/` (exists), `/sponsor-dashboard/` (exists)
- `apps/web/src/app/sponsors/` (exists), `/advertiser/` (exists), `/advertisers/` (exists)
- `apps/web/src/app/rewards/` (exists), `/rewards/claim/`
- `apps/web/src/app/achievements/` (exists)
- `apps/web/src/app/leaderboards/` (exists)
- `apps/web/src/app/winners/`, `/winner-hall/` (both exist)
- `apps/web/src/app/prizes/` (add if missing — wire all `prize-*.engine.ts` files)

### Engines (Existing — Verify Wired)
- `prize.engine.ts`, `prize-fulfillment.engine.ts`, `prize-intake.engine.ts`, `prize-inventory.engine.ts`, `prize-placement.engine.ts`, `prize-policy.engine.ts`, `prize-randomization.engine.ts`, `prize-scheduler.engine.ts`, `prize-source.engine.ts`.
- `achievement.engine.ts`, `ad.engine.ts`, `ad-pricing.engine.ts`, `artist-sponsorship.engine.ts`, `sponsor-benefits.engine.ts`, `sponsorship-floor.engine.ts`, `sponsorship-pricing.engine.ts`, `sponsorship-subscription.engine.ts`, `sponsorSurface.registry.ts`.
- `rewards/rewards.engine.ts` (package exists), `economy.engine.ts`, `performer-monetization.engine.ts`.
- `spotlight-rotation.engine.ts`, `placement-inventory.engine.ts`.

---

## SECTION 11 — PRESENCE, WORLD FEEL & ENERGY ENGINES

These are what make the world feel ALIVE.

### `PresenceEngine`
- New file: `apps/web/src/systems/presence/PresenceEngine.ts`
- Controls: avatars appearing/leaving, crowd reactions, ambient crowd movement, energy level visualization.
- Wire to: `fan-lobby.engine.ts` (exists), `lobby.engine.ts` (exists), `party-lobby.engine.ts` (exists), `big-ace-presence.engine.ts` (exists).

### `EnergyEngine`
- New file: `apps/web/src/systems/presence/EnergyEngine.ts`
- Controls: glow intensity relative to crowd size, music-sync brightness pulses, `CrowdPulseLights.tsx` (exists — upgrade), hype meter.
- Wire to: `room-runtime.engine.ts`, `show-mode.engine.ts`.

### `SceneStateEngine`
- New file: `apps/web/src/systems/presence/SceneStateEngine.ts`
- States: `idle → warmup → live → hype-peak → winner → cooldown → post-show`.
- Each state drives: lighting preset swap, FX intensity, color wash, `WinnerCoronationFX` trigger.
- Wire to: `show-timeline.engine.ts` (exists), `event-timeline.engine.ts` (exists), `curtain.engine.ts` (exists).

### `CrowdSimulation`
- New file: `apps/web/src/systems/presence/CrowdSimulation.ts`
- Drives: bot avatar movement in seats, cheering reactions, wave effect across `SeatArtifact` rows.
- Powers: bot testing for 20-fan crowd simulation.

---

## SECTION 12 — RANKING, XP, SEASON PASSES & FAN LEVELS

- `apps/web/src/app/leaderboards/` (exists) — upgrade with `XpProgressBar`, animated rank cards.
- `apps/web/src/app/season-pass/` (exists) — upgrade with `SeasonPassWidget` full holographic render.
- `apps/web/src/app/fan-club/` (exists) — wire fan tier benefits from `subscriptionBenefits.engine.ts`.
- `apps/web/src/app/top-10/` (exists) — neon animated top-10 leaderboard, `spotlight-rotation.engine.ts` fed.
- Engines: `profileTier.engine.ts`, `prestige-visual.engine.ts`, `subscriptionBenefits.engine.ts`, `FanLevelingEngine` (extend `achievement.engine.ts`).

---

## SECTION 13 — SHOP, STORE, COLLECTIBLES & MARKETPLACE

- `apps/web/src/app/store/` (exists), `/marketplace/` (exists), `/collectibles/` (exists)
- `apps/web/src/app/my-closet/`, `/my-emotes/`, `/my-props/`, `/my-loadout/`, `/my-reaction-wheel/` (all exist)
- Upgrade: `storefront/` components — neon arcade shop aesthetic, animated item cards, hover spotlight.
- Wire: `store.engine.ts` (exists), `placement-inventory.engine.ts` (exists).
- Add: `ShopItemArtifact.tsx` — every shop item is an animated artifact, not a static image.

---

## SECTION 14 — AUDIO, VIDEO & MEDIA PIPELINES

- `apps/web/src/components/AudioProvider.tsx` (exists) — upgrade to spatial `AudioMixerNode`.
- `apps/web/src/components/AudioPlayer.tsx` (exists) — wire to `AudioMixerNode`.
- `media/media-complete.engine.ts` (package exists) — verify it feeds `LiveBroadcastFeedWidget`.
- `apps/web/src/app/radio/` (exists) — wire to audio engine.
- `apps/web/src/app/clips/` (exists), `/replay/` (exists), `/replays/theater/`
- `replay.engine.ts` (exists) — wire to replay theater route.
- WebRTC/HLS: `LiveVideoRouting` → integrate into `apps/web/src/app/live/` + `video-layout.engine.ts`.

---

## SECTION 15 — BOTS, AUTOMATION & HEALTH

### Bots to Build/Activate
- `ChatModerationBot` — `apps/web/src/components/bots/ChatModerationBot.ts`, filters toxicity, auto-warns, ties to `room-moderation.engine.ts` (exists).
- `SystemHealthMonitorBot` — fires visual in-world warning banners on degradation; wires to `apps/web/src/components/watchdog/` (exists).
- `MagazineRotationBot` — `weekly-rotation.engine.ts` (exists) — extend for monthly magazine.
- `HostAIBot` — `host-script.engine.ts` + `host-response.engine.ts` (both exist) — auto-cueing pipeline active.
- `RevenueAuditBot` — periodically verifies ledger split accuracy vs `tmi_booking_defaults.json`.
- `SeatFraudBot` — `ticket-scanner.engine.ts` + `ticket-reconciliation.engine.ts` (both exist) — prevent duplicate seat assignment.
- `BotCrowdSimulator` — spawns 20 fan bots, 20 performer bots, 20 sponsor bots for integration testing. Must: sit in seats, react, vote, trigger `$1 join` and Gold bypass, test lighting changes.

### Bot Routes
- `apps/web/src/app/bots/` (exists — upgrade)
- `big-ace-*.engine.ts` family (all exist) — Big ACE AI core, verify all cross-site sync, memory, task routing active.

---

## SECTION 16 — ERRORS, WARNINGS & IMMERSIVE BLOCKERS

- `apps/web/src/app/error.tsx` — replace with `NeonGlitchBlocker` — retro scanline error screen, in-world aesthetic.
- `apps/web/src/app/global-error.tsx` — `RetroTestPattern` component — static TV "Technical Difficulties" screen with neon border.
- `apps/web/src/app/not-found.tsx` — "404 — SIGNAL LOST" styled as a scrambled TMI broadcast.
- `apps/web/src/components/error/ErrorBoundary.tsx` (exists) — upgrade to render `NeonGlitchBlocker`.
- `apps/web/src/components/error/error.tsx` (exists) — same upgrade.
- In-world warning banners: `SystemHealthMonitorBot` fires `apps/web/src/components/watchdog/` warning cards.
- Self-healing: `room-overflow-policy.engine.ts`, `room-overflow.engine.ts` (both exist) — cascade to backup shard before showing blocker.

---

## SECTION 17 — INFRASTRUCTURE, ARCHITECTURE & ROUTING

- `apps/web/src/middleware.ts` (exists) — verify route protection for all paid/role-gated routes.
- `apps/web/src/systems/` — new directories: `environment/`, `artifacts/`, `presence/` (per above).
- `packages/core-domain/src/index.ts` (exists) — verify all `IAvatarRig`, `IVenueSkin`, `ISeasonPass`, `IEventConfig`, `IAccessPolicy` interfaces exported.
- `packages/world-system/src/index.ts` (exists) — wire to `EnvironmentControlSystem` output.
- `packages/hud-core/src/index.ts` (exists) — HUD layer must sit above `EnvironmentLayerStack` Layer 5.
- `packages/hud-runtime/src/index.ts` (exists) — runtime HUD updates must respect `SceneStateEngine` state.
- WebSockets: `shard-routing.engine.ts`, `shard.engine.ts` (both exist) — route fan connections to correct room shards.
- `scene-engine` → wire output to Next.js scene route params.
- `event-bus.ts` (core-domain, exists) — verify all engines publish and subscribe correctly.

---

## SECTION 18 — ADDITIONAL ROUTES REQUIRING NEW PAGES

Add these routes if not present, with full TMI neon visual treatment:
- `apps/web/src/app/billboards/world-concerts/`
- `apps/web/src/app/billboards/venues/`
- `apps/web/src/app/battles/[id]/cypher/`
- `apps/web/src/app/voting/[id]/`
- `apps/web/src/app/replays/theater/`
- `apps/web/src/app/prizes/`
- `apps/web/src/app/artist/[slug]/world-concerts/`
- `apps/web/src/app/artist/[slug]/live-offers/`
- `apps/web/src/app/venue/[slug]/talent-suggestions/`
- `apps/web/src/app/venue/[slug]/lineup-builder/`
- `apps/web/src/app/venue/[slug]/booking-calculator/`
- `apps/web/src/app/admin/world-concerts/`
- `apps/web/src/app/admin/global-billboard/`
- `apps/web/src/app/admin/live-ledger/`
- `apps/web/src/app/admin/payout-observatory/`
- `apps/web/src/app/admin/concert-access-rules/`
- `apps/web/src/app/admin/talent-rotation/`
- `apps/web/src/app/admin/exposure-fairness/`
- `apps/web/src/app/my-concert-history/`
- `apps/web/src/app/my-live-access/`

---

## COPILOT EXECUTION CHECKLIST — 7 PHASES

### PHASE 0 — VISUAL FOUNDATION (DO THIS FIRST. NOTHING ELSE BEFORE THIS.)
- [ ] Strip ALL `max-w-*`, `container`, `mx-auto` from `apps/web/src/app/layout.tsx`.
- [ ] Update `apps/web/src/design/tmi/tokens.ts` — enforce neon palette, kill pure black backgrounds.
- [ ] Update `apps/web/src/index.css` — `body` background uses `--tmi-bg-base`, not `#000`.
- [ ] Build `ThemeMode` type in `packages/hud-theme/src/index.ts`.
- [ ] Build `apps/web/src/engines/theme.engine.ts` — `IThemeConfig`, consumes `tmi_booking_defaults.json`.
- [ ] Build `apps/web/src/components/home/FullscreenWrapper.tsx` — `100vw × 100vh`, enforces SCREEN FILL RULE.
- [ ] Build `apps/web/src/components/home/AnimatedGradientBG.tsx` — Layer 1 background.
- [ ] Build `apps/web/src/components/home/EnergyGlowPulse.tsx` — Layer 2 ambient FX.
- [ ] Build `apps/web/src/components/home/EdgeLightingBorder.tsx` — edge glow system.
- [ ] Validate: no dead black edges on any of the 5 homepage routes.

### PHASE 1 — GLOBAL INTERFACES & TYPE CONTRACTS
- [ ] Export `IAvatarRig`, `IVenueSkin`, `ISeasonPass`, `IEventConfig`, `IAccessPolicy`, `IEnvironmentConfig`, `IArtifact` from `packages/core-domain/src/index.ts`.
- [ ] Upgrade `packages/hud-theme/src/index.ts` — full `IThemeConfig` + `ThemeMode` export.
- [ ] Verify `event-bus.ts` publish/subscribe contracts match all engine consumers.

### PHASE 2 — BASE COMPONENTS (THE ATOMS)
- [ ] `KineticTitle.tsx`, `BleedCard.tsx`, `JumpingSectionCanvas.tsx`, `LiveBroadcastFeedWidget.tsx`.
- [ ] `RoleSelectionBubble.tsx`, `SeasonPassWidget.tsx`, `SignupFormCard.tsx`, `NeonAdminPanel.tsx`.
- [ ] `BattleTurnTimer.tsx`, `LiveVotingWidget.tsx`, `WinnerCoronationFX.tsx`, `GoingLiveCountdown.tsx`.
- [ ] `GiftedSurpriseDrop.tsx`, `AchievementBadge.tsx`, `XpProgressBar.tsx`, `PrizeRevealFX.tsx`.
- [ ] `WorldConcertCard.tsx`, `VenueEventCard.tsx`, `BillboardFilterBar.tsx`, `PerformerBubbleCard.tsx`.
- [ ] All components read tier/pricing from `config/tmi_booking_defaults.json` via `theme.engine.ts`.
- [ ] Enforce NO FRAME RULE in every component's CSS: no `border`, no centered `max-w`, no shadow boxing.

### PHASE 3 — ENVIRONMENT & ROOM SYSTEM (THE WORLDS)
- [ ] `EnvironmentControlSystem.ts` — `IEnvironmentConfig`, reads `data/environments/`.
- [ ] `EnvironmentLayerStack.tsx` — 6-layer world renderer.
- [ ] `RoomCanvas.tsx` — full-screen world wrapper, replaces all room containers.
- [ ] `ScenePresetLoader.ts` — 9 presets; upgrade `RoomSceneBackground.tsx` + `ScenePickerPanel.tsx`.
- [ ] `VenueSkinEditor.tsx` — admin palette picker + skin swap + sponsor skin injection.
- [ ] `SeatLayoutEditor.tsx` — drag-drop zones, builds on `SeatMapRenderer.tsx` + `room-seat-map.engine.ts`.
- [ ] `StageBuilder.tsx` — builds on `StageCurtain.tsx` + `LightRig.tsx`, wires to `room-template.engine.ts`.
- [ ] Upgrade `ArenaViewer.tsx` (arena) — consumes `EnvironmentLayerStack`.
- [ ] Apply `RoomCanvas` to routes: `/venue/*/`, `/room/*/`, `/audience-room/`, `/lobby/`, `/stages/`, `/world/`.

### PHASE 4 — HOMEPAGE REBUILD (THE 5 WORLDS)
- [ ] Build `HomepageVisualEngine.tsx` in `apps/web/src/engine/`.
- [ ] Rebuild Homepage 1 (`/home/cover/`) — PDF Cover, full magazine bleed, `KineticTitle`, `BleedCard`.
- [ ] Rebuild Homepage 2 (`/home/magazine/`) — asymmetric overlapping editorial, `JumpingSectionCanvas`.
- [ ] Rebuild Homepage 3 (`/home/live/`) — concert scene pack, `LiveBroadcastFeedWidget`, heavy energy layer.
- [ ] Rebuild Homepage 4 (`/home/social/`) — floating cards, glow pulses, hover expand.
- [ ] Rebuild Homepage 5 (`/home/control/`) — 1980s neon synthwave control panel, full bleed, no dashboard whites.
- [ ] Wire all 5 to `billboard.engine.ts` + `homepage-data.adapter.ts`.
- [ ] Validate SCREEN FILL RULE + COLOR DOMINANCE RULE on all 5 after build.

### PHASE 5 — ARTIFACT ENGINE, MAGAZINE & ECONOMY
- [ ] `ArtifactEngine.ts` — `IArtifact`, factory method.
- [ ] `StageArtifact.tsx`, `SeatArtifact.tsx`, `ScreenArtifact.tsx`, `BillboardArtifact.tsx`, `PropArtifact.tsx`, `AvatarArtifact.tsx`.
- [ ] `CinematicPageFlipper` — wire `page-flip.engine.ts`, `magazine-layout.engine.ts`.
- [ ] `MagazineRotationBot` — extend `weekly-rotation.engine.ts` for monthly issues.
- [ ] `GiftedSurpriseDrop.tsx` + `SponsorTakeoverOverlay.tsx` — wire `AdRotationLogic`, `sponsorSurface.registry.ts`.
- [ ] `PrizeRevealFX.tsx` — wire all 9 `prize-*.engine.ts` files.
- [ ] `SeasonPassWidget.tsx` — wire `subscriptionBenefits.engine.ts` + `AccessEngine` ($1 vs Gold bypass).

### PHASE 6 — PRESENCE, BOTS & ENGINE WIRING (THE BRAIN)
- [ ] `PresenceEngine.ts` — wire to `fan-lobby.engine.ts`, `big-ace-presence.engine.ts`.
- [ ] `EnergyEngine.ts` — wire to `CrowdPulseLights.tsx`, `room-runtime.engine.ts`.
- [ ] `SceneStateEngine.ts` — states wired to `show-timeline.engine.ts`, `curtain.engine.ts`, `WinnerCoronationFX` trigger.
- [ ] `CrowdSimulation.ts` — bot crowd test: 20 fans, 20 performers, 20 sponsors.
- [ ] `ChatModerationBot` — activate `room-moderation.engine.ts`.
- [ ] `SystemHealthMonitorBot` — activate `watchdog/` warning banners.
- [ ] `SeatMapCanvas` → `SeatBindingEngine` → `seat-runtime.engine.ts` wired end-to-end.
- [ ] `BillboardEngine` → `VotingEngine` → `RewardClaimEngine` → real API endpoints verified.
- [ ] `revenue-split.engine.ts` → reads split percentages from `config/tmi_booking_defaults.json`.
- [ ] `stripe-payments.engine.ts` + `stripe-webhooks.engine.ts` → ledger sync verified.
- [ ] All new system dirs registered in `packages/world-system/src/index.ts`.

---

## FILE CHAIN SUMMARY (ALL NEW FILES)

```
apps/web/src/
  engine/
    HomepageVisualEngine.tsx        ← Homepage world manager
  engines/
    theme.engine.ts                 ← Theme config + neon palette
  systems/
    environment/
      EnvironmentControlSystem.ts   ← Room/venue world controller
      ScenePresetLoader.ts          ← 9 scene presets
    artifacts/
      ArtifactEngine.ts             ← Image → living component factory
      StageArtifact.tsx
      SeatArtifact.tsx
      ScreenArtifact.tsx
      BillboardArtifact.tsx
      PropArtifact.tsx
      AvatarArtifact.tsx
    presence/
      PresenceEngine.ts             ← Avatar/crowd presence
      EnergyEngine.ts               ← Glow/hype intensity
      SceneStateEngine.ts           ← idle→live→winner states
      CrowdSimulation.ts            ← Bot crowd testing
  components/
    home/
      FullscreenWrapper.tsx
      AnimatedGradientBG.tsx
      EnergyGlowPulse.tsx
      EdgeLightingBorder.tsx
      KineticTitle.tsx
      BleedCard.tsx
      JumpingSectionCanvas.tsx
      LiveBroadcastFeedWidget.tsx
      RoleSelectionBubble.tsx
    venue/
      EnvironmentLayerStack.tsx     ← 6-layer world renderer
      RoomCanvas.tsx                ← Full-screen world wrapper
      VenueSkinEditor.tsx
    seating/
      SeatLayoutEditor.tsx
    stage/
      StageBuilder.tsx
    billboard/
      WorldConcertCard.tsx
      VenueEventCard.tsx
      BillboardFilterBar.tsx
      PerformerBubbleCard.tsx
    economy/
      GiftedSurpriseDrop.tsx
      AchievementBadge.tsx
      XpProgressBar.tsx
      PrizeRevealFX.tsx
      SeasonPassWidget.tsx
      SponsorTakeoverOverlay.tsx
    game/
      BattleTurnTimer.tsx
    vote/
      LiveVotingWidget.tsx           ← Upgrade existing
    winners/
      WinnerCoronationFX.tsx
    live/
      GoingLiveCountdown.tsx
      BroadcastActivationFX.tsx
    error/
      NeonGlitchBlocker.tsx
      RetroTestPattern.tsx
    bots/
      ChatModerationBot.ts
      SystemHealthMonitorBot.ts
      BotCrowdSimulator.ts
      RevenueAuditBot.ts
      SeatFraudBot.ts
    host/
      HostBroadcastOverlay.tsx
    avatar/
      LipSyncIndicator.tsx
      EmoteWheel.tsx
      PropDropper.tsx
    ui/
      SignupFormCard.tsx
    admin/
      NeonAdminPanel.tsx
```