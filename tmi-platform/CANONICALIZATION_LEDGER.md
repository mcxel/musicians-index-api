# TMI Canonicalization Ledger
## Master Deduplication & Convergence Plan
**Date**: 2026-06-22 (Phase 1 COMPLETE)  
**Priority**: P0 Launch Blocker  
**Owner**: Build Director
**Status**: Phase 1 foundations built ✅ | Phase 2 wiring in progress ⏳

---

---

## PHASE 1: FOUNDATION ENGINES (COMPLETE 2026-06-22)

Three canonical engines created and ready for Phase 2 wiring:

**1. UnifiedDiscoveryEngine.ts** (`apps/web/src/lib/discovery/`)
- Single wrapper around GlobalLiveSessionRegistry  
- Methods: getActiveBattles(), getActiveCyphers(), getActiveChallenges(), getActiveGameShows(), getActiveAudienceRooms(), getTrending()
- Type-based filtering: getByCategory(), getByDisplayName(), getByTitle()
- Engagement: getTrending(), getMostWatched(), getNewest(), getHighestRanked()
- Honest fallback: getOrHonestEmpty() returns real results or { type: 'EMPTY', state: 'no active content' }
- Real-time: subscribeToDiscoveryUpdates() for live updates
- **Key**: No hardcoded data, no fake results, all queries hit GlobalLiveSessionRegistry

**2. AnalyticsEngine.ts** (`apps/web/src/lib/analytics/`)
- Consolidated stats (never hardcoded)
- getPlatformStats(): totalLiveRooms, totalViewers, totalTips, topPerformers, topCategories, audienceByRegion
- getSessionStats(): per-room telemetry (health, bitrate, dropped frames, RTT)
- getHealthMetrics(): stream quality aggregates
- getRevenueSnapshot(): tips-only revenue (real payment from Stripe)
- **Key**: Every stat derives from real data only

**3. AvatarLobbyRuntime.tsx** (`apps/web/src/components/canisters/`)
- Merged avatar display + inventory management
- BPM-synced pulse, three display modes (compact/expanded/fullscreen)
- Embedded inventory panel with equip controls
- **Key**: Canister-ready component combining visual + interaction logic

**4. DiscoveryRailCanonical.tsx** (`apps/web/src/components/discovery/`)
- Reusable discovery tile component for UnifiedDiscoveryEngine
- DiscoveryTile: Single live session card (viewers, title, category, uptime, tips)
- DiscoveryRail: Multi-tile grid with type selector
- **Key**: Fully honest - shows "No active [type]" when empty, never fake

**Typecheck**: All 4 engines pass strict mode (errors fixed: RevenueSnapshot type consistency, unused generic removed)

### DISCOVERY SYSTEMS (Multiple implementations found)
- **Path**: `lib/bots/GlobalDiscoveryBotEngine.ts`
- **Purpose**: Bot-driven discovery recommendations
- **Status**: Duplicate / Supplementary
- **Action**: Retire — functionality absorbed by UnifiedDiscoveryEngine

### System 2: EventDiscoveryEngine
- **Path**: `lib/events/EventDiscoveryEngine.ts`
- **Purpose**: Event-specific discovery
- **Status**: Duplicate / Specialized
- **Action**: Merge into UnifiedDiscoveryEngine (event mode)

### System 3: GlobalRoomDiscoveryEngine
- **Path**: `lib/global/GlobalRoomDiscoveryEngine.ts`
- **Purpose**: Room/venue discovery
- **Status**: Duplicate / Specialized
- **Action**: Merge into UnifiedDiscoveryEngine (room mode)

### System 4: DiscoveryPoolEngine
- **Path**: `lib/discovery-rotation/DiscoveryPoolEngine.ts`
- **Purpose**: Rotational discovery pool
- **Status**: Duplicate / Carousel logic
- **Action**: Retire — functionality absorbed by UnifiedDiscoveryEngine

### **CANONICAL CHOICE: GlobalLiveSessionRegistry**
- **Path**: `lib/broadcast/GlobalLiveSessionRegistry.ts`
- **Purpose**: Single source of truth for ALL live sessions
- **Status**: ✅ Canonical
- **Why**: 
  - Already has full metadata (title, category, avatar, viewer count, etc.)
  - Already powers HQ monitors
  - Subscription model exists (`onSessionsChanged`)
  - Used by multiple surfaces already
- **New Responsibility**: Be the ONLY discovery source for:
  - Live events (concerts, streams)
  - Battles
  - Cyphers
  - Challenges
  - Game shows
  - Audience rooms

### UNIFIED DISCOVERY ENGINE (New)
- **Path**: `lib/discovery/UnifiedDiscoveryEngine.ts` (TO CREATE)
- **Purpose**: Query wrapper around GlobalLiveSessionRegistry
- **Methods**:
  ```typescript
  // All methods read from GlobalLiveSessionRegistry
  
  // Filter by type
  getActiveLiveStreams()
  getActiveBattles()
  getActiveCyphers()
  getActiveChallenges()
  getActiveGameShows()
  getActiveAudienceRooms()
  
  // Filter by category/genre
  getByGenre(genre: string)
  getByInstrument(instrument: string)
  getByRegion(region: string)
  
  // Filter by engagement
  getTrending(limit: number)
  getMostWatched(limit: number)
  getNewest(limit: number)
  
  // Fallback to real data
  getOrHonestEmpty(query)
    // Returns matching results OR { type: 'EMPTY', state: 'no active content' }
  ```

---

## AVATAR SYSTEMS (Multiple implementations found)

### System 1: AvatarCreationCenter
- **Path**: `components/AvatarCreator.tsx`
- **Status**: Functional avatar creation
- **Action**: Canonical (creator interface)

### System 2: AvatarLobbyCanvas (multiple versions)
- **Paths**: 
  - `components/lobbies/AvatarLobbyCanvas.tsx` (CANONICAL — 3D ready, BPM pulse)
  - `components/3d/AvatarLobbyCanvas.tsx` (RETIRE)
  - Other avatar component variants
- **Action**: Keep `components/lobbies/AvatarLobbyCanvas.tsx`, retire others

### System 3: InventoryPanel
- **Path**: `components/InventoryPanel.tsx`
- **Status**: Avatar wearables/props inventory
- **Action**: Canonical (keep as-is)

### **CANONICAL CHOICE: AvatarLobbyCanvas + InventoryPanel**
- **Merge**: Create `AvatarLobbyRuntime` component that combines both
- **New Responsibility**: 
  - Seating logic
  - Emote system
  - Prop access
  - Avatar customization panel
  - Lobby environment rendering

---

## MEDIA SYSTEMS (Multiple implementations found)

### System 1: MonitorSatelliteSystem
- **Path**: `components/canisters/MonitorSatelliteSystem.tsx`
- **Status**: Audience pulse + metrics
- **Action**: Retire (functionality → UniversalViewportEngine)

### System 2: BillboardLiveWall
- **Path**: `components/media/BillboardLiveWall.tsx`
- **Status**: Discovery tile grid
- **Action**: Canonical (keep, update to use UnifiedDiscoveryEngine)

### System 3: MotionPosterPlayer
- **Path**: `components/media/MotionPosterPlayer.tsx`
- **Status**: Video/motion poster playback
- **Action**: Canonical (keep as-is)

### System 4: Independent media players (in various HQ/profile components)
- **Action**: Retire (use UniversalViewportEngine instead)

### **CANONICAL CHOICE: UniversalViewportEngine**
- **Path**: `components/viewport/UniversalViewportEngine.tsx` (PARTIALLY BUILT)
- **New Responsibility**: 
  - SINGLE media surface for all 9 modes
  - Orchestrate all media playback
  - Own all video/audio/playlist rendering
  - Replace MonitorSatelliteSystem + independent media players

---

## MESSAGING SYSTEMS (Multiple implementations found)

### System 1: InboxPanel
- **Path**: `components/messaging/InboxPanel.tsx`
- **Status**: Direct message inbox
- **Action**: Canonical

### System 2: HeadquartersCommunicationDock
- **Path**: `components/headquarters/HeadquartersCommunicationDock.tsx`
- **Status**: HQ-embedded messaging
- **Action**: Use InboxPanel as backend

### **CANONICAL CHOICE: InboxPanel**
- **New Responsibility**: Single source for all messaging UI
- **Merge**: HeadquartersCommunicationDock → wrapper around InboxPanel

---

## SPONSOR SYSTEMS (Multiple implementations found)

### System 1: SponsorRegistry (performers sponsor products)
- **Path**: `lib/commerce/SponsorRegistry.ts`
- **Status**: Active sponsor slots + zones
- **Action**: Canonical (KEEP)

### System 2: SponsorArtistDiscoveryEngine
- **Path**: `lib/sponsors/SponsorArtistDiscoveryEngine.ts`
- **Status**: Sponsor discovery
- **Action**: Retire (functionality → UnifiedDiscoveryEngine + SponsorRegistry)

### System 3: Fake sponsor cards
- **Locations**: Home 1-2, HQ panels, profile pages
- **Status**: Placeholders showing "$8,000" pricing
- **Action**: REMOVE ALL (replace with real SponsorRegistry + fallback to "Advertise here" CTA)

### **CANONICAL CHOICE: SponsorRegistry + SponsorRail**
- **New Responsibility**: 
  - Real sponsor inventory
  - Local sponsor tier ($25/$50/$100)
  - Major advertiser tier ($2k+)
  - Fallback CTA when no sponsors exist

---

## ANALYTICS SYSTEMS (Multiple implementations found)

### System 1: AnalyticsMiniPanel
- **Path**: `components/tmi/shared/AnalyticsMiniPanel.tsx`
- **Status**: Stats panel
- **Action**: Canonical (KEEP)

### System 2: MonitorSatelliteSystem analytics
- **Path**: `components/canisters/MonitorSatelliteSystem.tsx`
- **Status**: Audience pulse metrics
- **Action**: Retire (functionality → AnalyticsEngine)

### System 3: Local stat widgets
- **Locations**: Various HQ/profile components
- **Status**: Duplicate stat displays
- **Action**: Route to AnalyticsMiniPanel

### **CANONICAL CHOICE: AnalyticsEngine (NEW) + AnalyticsMiniPanel**
- **Path**: `lib/analytics/AnalyticsEngine.ts` (TO CREATE)
- **New Responsibility**: 
  - Compute stats from real sources
  - Feed AnalyticsMiniPanel
  - No hardcoded stats anywhere

---

## PROFILE SYSTEMS (Multiple implementations found)

### Current Locations:
- `/profile/fan/[slug]`
- `/profile/performer/[slug]`
- `/fan/profile`
- `/hub/fan`
- `/hub/performer`
- And variants for each role

### **CANONICAL CHOICE: One ProfileRuntime per role**
- `ProfileRuntime` should be role-aware and tier-aware
- Keep only production paths:
  - `/profile/fan/[slug]` — public fan profile
  - `/profile/performer/[slug]` — public performer profile
  - `/hub/fan` — fan HQ (with role modules)
  - `/hub/performer` — performer HQ (with role modules)
- Redirect/remove all `/dashboard/*`, `/fan/profile`, etc. duplicates

---

## HOMEPAGE SYSTEMS (Fragmentation found)

### Home 1 (Cover)
- **Current**: OrbitCard display from PerformerRegistry
- **Issue**: Shows ranked performers, NOT live sessions
- **Fix**: Wire to GlobalLiveSessionRegistry for live badges

### Home 1-2 (Billboard)
- **Current**: BillboardCard from PerformerRegistry rankings
- **Issue**: Shows static rankings, NOT real live sessions or events
- **White boxes**: Empty discovery placeholders
- **Fix**: Replace ALL white boxes with UnifiedDiscoveryEngine tiles (battles, cyphers, challenges, rooms)

### Home 2 (Magazine)
- **Current**: Article tiles
- **Issue**: None (already real data)
- **Keep**: As-is

### Home 3 (Live World)
- **Current**: Likely using BillboardLiveWall or EventReel
- **Issue**: Possibly showing stale data
- **Fix**: Wire exclusively to GlobalLiveSessionRegistry

### Home 4 (Marketplace)
- **Current**: Sponsor/advertiser inventory
- **Issue**: May have fake pricing
- **Fix**: Use SponsorRegistry only + real ticket inventory

### Home 5 (Arena)
- **Current**: Event cards
- **Issue**: Possibly showing past/fake events
- **Fix**: Wire to GlobalLiveSessionRegistry (battles, cyphers, challenges only)

---

## RETIREMENT CHECKLIST

### DELETE (safe to remove, no other code depends)
- [ ] `components/3d/AvatarLobbyCanvas.tsx` (old avatar component)
- [ ] `lib/discovery-rotation/DiscoveryPoolEngine.ts` (carousel logic superseded)
- [ ] `lib/bots/GlobalDiscoveryBotEngine.ts` (functionality moved to UnifiedDiscoveryEngine)
- [ ] `lib/sponsors/SponsorArtistDiscoveryEngine.ts` (functionality moved to UnifiedDiscoveryEngine)
- [ ] `components/canisters/MonitorSatelliteSystem.tsx` (functionality moved to UniversalViewportEngine)
- [ ] Fake sponsor card components (replace with real SponsorRegistry)

### MARK LEGACY (keep but don't use)
- [ ] `lib/events/EventDiscoveryEngine.ts`
- [ ] `lib/global/GlobalRoomDiscoveryEngine.ts`

### MERGE (consolidate into canonical)
- [ ] HeadquartersCommunicationDock → InboxPanel
- [ ] Profile duplicates → Single ProfileRuntime

---

## BUILD ORDER

### Phase 1: Foundation (2 hours)
1. Create `UnifiedDiscoveryEngine.ts` (wrapper around GlobalLiveSessionRegistry)
2. Create `AnalyticsEngine.ts` (wrapper around real data sources)
3. Create `AvatarLobbyRuntime.tsx` (merge AvatarLobbyCanvas + InventoryPanel)

### Phase 2: Wiring (3 hours)
1. Update Home 1-2 to use UnifiedDiscoveryEngine (replace white boxes)
2. Update Home 3 to use GlobalLiveSessionRegistry (live events only)
3. Update Home 5 to use GlobalLiveSessionRegistry (battles/cyphers/challenges only)
4. Update HQ monitors to use UniversalViewportEngine

### Phase 3: Removal (1 hour)
1. Delete retired systems
2. Redirect old profile routes
3. Remove fake sponsor cards

### Phase 4: Verification (1 hour)
1. Typecheck
2. Build
3. Visual audit (no white boxes)

**Total**: ~7 hours

---

## SUCCESS CRITERIA

✅ No white placeholder tiles on any homepage  
✅ Every discovery tile shows real live content or honest empty state  
✅ All homepages read from GlobalLiveSessionRegistry  
✅ No duplicate discovery systems in codebase  
✅ ProfileRuntime is the ONLY profile engine  
✅ UniversalViewportEngine is the ONLY media surface  
✅ AvatarLobbyRuntime is the ONLY avatar lobby  
✅ InboxPanel is the ONLY messaging UI  
✅ SponsorRegistry is the ONLY sponsor inventory  
✅ AnalyticsEngine is the ONLY stats source  
✅ Typecheck passes  
✅ Build passes  
✅ All button routes verified

---

## DEPENDENCIES RESOLVED

- GlobalLiveSessionRegistry (exists, canonical)
- UnifiedDiscoveryEngine (to create)
- AnalyticsEngine (to create)
- AvatarLobbyRuntime (to create)
- UniversalViewportEngine (partially exists, needs completion)
- BillboardLiveWall (exists, update only)
- SponsorRegistry (exists, use as-is)
- InboxPanel (exists, use as-is)

