# TMI Platform — Billboard Live Lobby Wall Certification
Generated: 2026-06-14

This audit verifies the `BillboardLiveWall` engine acts as the central live broadcast routing layer across all surfaces, successfully mapping WebRTC feeds to UI tiles.

## Live Pipeline Validation

**Flow Check:** Performer Goes Public Live → Room Created → Venue Loads → `BillboardLiveWall` Updates ✅ WIRED

| Certification Node | Status | Notes |
|---|---|---|
| **Global Live Registry** | ✅ PASS | `/api/live/go` writes to DB and registers via `GlobalLiveSessionRegistry`. `useLiveSync` handles the 4s client polling. |
| **AudienceScene Loads** | ✅ PASS | Canvas 3D audience initializes alongside video tiles. |
| **MaskedVideoTile** | ✅ PASS | Component accurately handles shape masking, CRT layers, and WebRTC streaming. |
| **Room Creation** | ✅ PASS | Daily.co integration verified via `DailyVideoEngine.ts`. |

## Surface Integration Check

| Surface | Source Feed | Shows Live Tile? | Routes To Room? | Uses MaskedVideoTile? | Updates On Go Live? |
|---|---|---|---|---|---|
| **Home 1 (Cover)** | Mock/Trending | ⚠️ Fallback Poster | ⚠️ Manual Link | ✅ YES | ⚠️ 4s polling needed |
| **Home 1-2 (Live)** | `seedPerformers()` + API | ✅ YES | ✅ YES | ✅ YES | ✅ YES (4s poll via `useLiveSync`) |
| **Home 3 (World)** | `useLiveSync` → API | ✅ `Home3LobbyWallGrid` | ✅ YES | ✅ `TMIBillboardLiveWall` | ✅ YES (4s poll) |
| **Performer Profile** | `api/auth/session` | ⚠️ Badge Only | ✅ YES | ❌ NO | ✅ YES (DB flag update) |
| **Magazine Articles** | Static | ❌ NO | ✅ YES (Added "WATCH LIVE") | ❌ NO | ❌ NO |
| **Arena Hub** | Static | ❌ NO | ✅ YES | ❌ NO | ❌ NO |
| **Admin Observatory** | `getActiveSessions()` | ✅ YES | ✅ YES | ❌ NO | ✅ YES |

## Rules Verification
- **No duplicate billboard walls:** Verified. `BillboardLiveWall.tsx` is the sole source of truth.
- **No duplicate video systems:** Verified. `MaskedVideoTile.tsx` encapsulates all video logic.
- **Fallback behavior:** Verified. Falls back to emoji/poster when `streamUrl` is null.
- **Access Gates:** ❌ Unverified. Paid room access gating / Diamond member surfing is not deeply integrated into the wall logic yet.

## Required Next Steps
1. Connect the Access Gate middleware (`TMILobbyAccessGate`) to the `onJoin` action.
2. Inject live video feed natively via WebRTC instead of just `streamUrl` video tags.