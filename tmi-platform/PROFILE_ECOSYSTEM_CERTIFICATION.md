# PROFILE ECOSYSTEM CERTIFICATION
**TMI Platform — Profile Operating Systems + Canister Integration Audit**  
**Date:** 2026-06-15 | **Priority:** P0 | **Rule 15 Applied**

---

## Architecture Statement

Per Marcel Dickens: TMI profiles are NOT pages. They are operating environments.

```
Profile IS:   identity + media + memories + messages + bookings + store + avatar + inventory + lobby
Profile IS NOT: photo + bio
```

All 11 canisters (Rule 15) must be embeddable in every profile type.  
Upload pipeline (Rule 1): one upload feeds profile → article → magazine → discovery → home pages.

Blueprint refs: `tmi_memory_wall_sponsor_booking_canisters.html`, `tmi_playlist_engine_complete.html`, `tmi_3d_character_system.html`, `tmi_complete_all_four_dashboards_v2.html`

---

## UNIVERSAL PROFILE INFRASTRUCTURE

| Component | File | Status |
|---|---|---|
| `ProfileLobbyRuntime` | `components/lobby/ProfileLobbyRuntime.tsx` | ✅ |
| `StickyStage` (pinned video) | `components/stage/StickyStage.tsx` | ✅ |
| `AvatarLobbyCanvas` (3D canvas) | `components/lobby/AvatarLobbyCanvas.tsx` | ✅ |
| `MemoryWall` | `components/memory/MemoryWall.tsx` | ✅ |
| `PerformerMediaLibrary` | `components/media/PerformerMediaLibrary.tsx` | ✅ |
| `PlaylistEngine` | `components/media/PlaylistEngine.tsx` | ✅ |
| `AvatarCreator` | `components/AvatarCreator.tsx` | ✅ |
| `InventoryPanel` | `components/InventoryPanel.tsx` | ✅ |
| `PersonaSwitcher` | `components/hud/PersonaSwitcher.tsx` | ✅ |
| `MultiPersonaEngine` | `lib/identity/MultiPersonaEngine.ts` | ✅ |
| `DiscoveryRail` | `components/discovery/DiscoveryRail.tsx` | ✅ |

ProfileLobbyRuntime role colors: fan=#00FFFF, artist=#FF2DAA, performer=#FFD700, venue=#00FF88, sponsor=#AA2DFF, promoter=#FF9500, writer=#FF6B35

---

## CANISTER SYSTEM STATUS

Canonical location: `components/canisters/`  
Currently only `ActivityTimelineCanister.tsx` exists there. All others must be built from existing source implementations.

| Canister | Source Implementation | Build Status | Embedding Status |
|---|---|---|---|
| PlaylistCanister | `components/media/PlaylistEngine.tsx` | 🔲 Wrap | 🔲 |
| MemoryWallCanister | `components/memory/MemoryWall.tsx` | 🔲 Wrap | 🔲 |
| BookingCanister | `lib/bookings/` or new | 🔲 | 🔲 |
| MessagingCanister | `app/messages/` pages | 🔲 Wrap | 🔲 |
| StoreCanister | `components/economy/BeatMarketplaceShell.tsx` | 🔲 Wrap | 🔲 |
| AvatarCreationCenter | `components/AvatarCreator.tsx` | 🔲 Wrap | 🔲 |
| AvatarWorkspace | Avatar 3D composer + face scan | 🔲 | 🔲 |
| InventoryCanister | `components/InventoryPanel.tsx` | 🔲 Wrap | 🔲 |
| PublicLobbyCanister | `components/lobby/TMILobbyWall.tsx` | 🔲 Wrap | 🔲 |
| PrivateLobbyCanister | `components/lobby/LiveLobbyDrawer.tsx` | 🔲 Wrap | 🔲 |
| LiveLobbyWallCanister | `components/media/BillboardLiveWall.tsx` | 🔲 Wrap | 🔲 |
| ActivityTimelineCanister | `components/canisters/ActivityTimelineCanister.tsx` | ✅ | 🔲 Embed in profiles |

---

## 1. PERFORMER PROFILE ECOSYSTEM

### Routes
| Route | Status |
|---|---|
| `/performers/[slug]` | ✅ |
| `/performers/[slug]/dashboard` | ✅ |
| `/hub/performer` | ✅ |
| `/performer/studio` | ✅ |
| `/articles/performer/[slug]` | ✅ |

### Canister Integration in Performer Profile
| Canister | Position in Profile | Status |
|---|---|---|
| PlaylistCanister | After bio — performer's full song library | 🔲 Wire |
| MemoryWallCanister | Fan moments captured during live shows | 🔲 Wire |
| BookingCanister | "Book this Performer" section | 🔲 Wire |
| MessagingCanister | "Message" quick action → DM thread | 🔲 Wire |
| StoreCanister | Merch + Beat Vault embedded | 🔲 Wire |
| AvatarCreationCenter | Performer avatar → displayed in AudienceScene | 🔲 Wire |
| LiveLobbyWallCanister | "Related Live Rooms" at bottom | 🔲 Wire |

### Commerce Actions
| Button | Destination | Status |
|---|---|---|
| Tip | Tip modal → Stripe → `TipJarWidget` | 🔲 |
| Join Fan Club | `/fan-club/[slug]` | 🔲 |
| Book | BookingCanister inline | 🔲 |
| Merch | StoreCanister inline | 🔲 |
| Watch Live (if live) | LobbyEntryFlow → `/live/rooms/[id]` | ✅ |
| Follow | Auth → follow state | 🔲 |
| Message | MessagingCanister → DM | 🔲 |

### Upload → Everywhere Pipeline
| Stage | Status |
|---|---|
| Dashboard Upload → PerformerRegistry | ✅ |
| Registry → Profile PlaylistCanister | 🔲 Wire |
| Profile → Article page | ✅ |
| Article → Magazine | ✅ |
| Magazine → DiscoveryRail | ✅ |
| DiscoveryRail → Home 1-5 | ✅ |
| PlaylistCanister → Lobby (playable) | 🔲 Wire |
| PlaylistCanister → Magazine article embed | 🔲 Wire |

---

## 2. FAN PROFILE ECOSYSTEM

### Routes
| Route | Status |
|---|---|
| `/fan/[slug]` | ✅ |
| `/fan/[slug]/dashboard` | ✅ |
| `/fan/[slug]/feed` | ✅ |
| `/fan/[slug]/memories` | ✅ |
| `/fan/[slug]/theater` | ✅ |
| `/fan/[slug]/tickets` | ✅ |
| `/hub/fan` | ✅ |

### Canister Integration in Fan Profile
| Canister | Purpose | Status |
|---|---|---|
| PlaylistCanister | Fan's saved + curated playlists | 🔲 |
| MemoryWallCanister | Holographic moment captures | 🔲 |
| MessagingCanister | Fan DMs to performers | 🔲 |
| AvatarCreationCenter | Create/edit bobblehead avatar | 🔲 |
| AvatarWorkspace | Dress up, pose, face scan integration | 🔲 |
| InventoryCanister | Emotes, props, collectibles | 🔲 |
| PublicLobbyCanister | Join next live room from profile | 🔲 |
| LiveLobbyWallCanister | See what's live now | 🔲 |

---

## 3. WRITER PROFILE ECOSYSTEM

### Routes
| Route | Status |
|---|---|
| `/profile/writer/[slug]` | ✅ |
| `/writer/profile` | ✅ |
| `/hub/writer` | ✅ |

### Canister Integration
| Canister | Purpose | Status |
|---|---|---|
| PlaylistCanister | Writer's curated tracks (editorial playlist) | 🔲 |
| MemoryWallCanister | Interview moments, event captures | 🔲 |
| MessagingCanister | Contact writer / pitch articles | 🔲 |

---

## 4. VENUE PROFILE ECOSYSTEM

### Routes
| Route | Status |
|---|---|
| `/venues/[slug]` | 🔲 Verify |
| `/venues/dashboard` | ✅ |
| `/venues/designer` | ✅ |
| `/hub/venue` | ✅ |

### Canister Integration
| Canister | Purpose | Status |
|---|---|---|
| PlaylistCanister | Venue soundtrack / house music | 🔲 |
| MemoryWallCanister | Past show moments | 🔲 |
| BookingCanister | "Book This Venue" — performer-facing | 🔲 |
| MessagingCanister | Contact venue | 🔲 |
| LiveLobbyWallCanister | All active rooms at this venue | 🔲 |
| PublicLobbyCanister | Venue's active public lobby | 🔲 |
| PrivateLobbyCanister | Backstage / green room | 🔲 |

---

## 5. SPONSOR PROFILE ECOSYSTEM

### Routes
| Route | Status |
|---|---|
| `/profile/sponsor/[slug]` | ✅ |
| `/sponsors` | ✅ |
| `/hub/sponsor` | ✅ |
| `/advertising` | ✅ |

### Canister Integration
| Canister | Purpose | Status |
|---|---|---|
| MemoryWallCanister | Sponsored events / highlights | 🔲 |
| MessagingCanister | Contact sponsor / propose partnership | 🔲 |
| StoreCanister | Sponsor's giveaways / prize items | 🔲 |
| LiveLobbyWallCanister | Sponsored rooms currently live | 🔲 |

---

## 6. ADMIN / OVERSEER DECK

### Routes
| Route | Status |
|---|---|
| `/admin/*` (20+) | ✅ |
| OmniDashboards | ✅ (4 tabs) |

### Canister Integration in Admin
| Canister | Purpose in Admin | Status |
|---|---|---|
| LiveLobbyWallCanister | Network-wide room overview | 🔲 |
| ActivityTimelineCanister | Platform-wide event feed | ✅ exists / 🔲 embed |
| MessagingCanister | Admin broadcast to users | 🔲 |
| InventoryCanister | Inventory oversight | 🔲 |
| MemoryWallCanister | Platform highlights | 🔲 |

---

## AVATAR SYSTEM — FACE SCAN + BOBBLEHEAD SPEC

Per Marcel Dickens (2026-06-15): Avatars must be ultrarealistic bobblehead characters. Users can scan their face so their avatar looks like them.

### Components
| Component | File | Status |
|---|---|---|
| `AvatarCreator` | `components/AvatarCreator.tsx` | ✅ exists |
| `AvatarAudienceCharacter` | `components/avatar/AvatarAudienceCharacter.tsx` | ✅ |
| `AvatarStageCharacter` | `components/avatar/AvatarStageCharacter.tsx` | ✅ |
| Face scan integration | **MISSING** | ❌ |
| Bobblehead rig | 3D model with oversized head ratio | 🔲 |
| Realistic texture (not cartoon) | Photo-mapped face on stylized body | 🔲 |

### AvatarWorkspace Canister Spec
```typescript
// components/canisters/AvatarWorkspace.tsx
// Capabilities:
// 1. Avatar customization (clothes, accessories, skin)
// 2. Face scan: user photographs face → mapped onto avatar head
// 3. Bobblehead proportions: head 2.5x normal scale
// 4. Ultra-realistic texturing: PBR materials, not flat cartoon
// 5. Pose preview: see avatar as it will appear in AudienceScene
// 6. Save to profile: avatar follows user into every room

// Embedding: fan profile, performer profile, any lobby pre-join screen
```

### Face Scan Pipeline
```
User uploads selfie / uses camera
  → Face detection (facial landmarks)
  → Map to bobblehead UV texture
  → Apply to 3D avatar mesh
  → Preview in AudienceScene seat position
  → Save to user inventory as "My Face Avatar"
  → Appears in all rooms the user joins
```

Face scan is P1 (post soft launch). Bot avatars must still look diverse and realistic at launch.

---

## CERTIFICATION STATUS

| Profile Type | Routes | Canisters | Commerce | Avatar | Overall |
|---|---|---|---|---|---|
| Performer | ✅ | 🔲 | 🔲 | 🔲 | 🔲 |
| Fan | ✅ | 🔲 | 🔲 | 🔲 | 🔲 |
| Writer | ✅ | 🔲 | — | 🔲 | 🔲 |
| Venue | 🔲 | 🔲 | 🔲 | — | 🔲 |
| Sponsor | ✅ | 🔲 | 🔲 | — | 🔲 |
| Admin | ✅ | 🔲 | — | — | 🔲 |

**Overall: Routes confirmed. Canister wrapping is the remaining P1 work. Commerce blocked on Stripe env vars.**

---

## P0 WIRING SEQUENCE

```
1. PlaylistCanister  ← wrap PlaylistEngine.tsx
2. MemoryWallCanister ← wrap MemoryWall.tsx
3. BookingCanister   ← new (lib/bookings/)
4. MessagingCanister ← wrap /messages/ pages
5. StoreCanister     ← wrap BeatMarketplaceShell.tsx
6. AvatarCreationCenter ← wrap AvatarCreator.tsx
7. AvatarWorkspace   ← new (bobblehead + face scan spec)
8. InventoryCanister ← wrap InventoryPanel.tsx
9. LiveLobbyWallCanister ← wrap BillboardLiveWall.tsx
10. PublicLobbyCanister ← wrap TMILobbyWall.tsx
11. PrivateLobbyCanister ← wrap LiveLobbyDrawer.tsx

Then embed in: performer profile → fan profile → live room → magazine
```
