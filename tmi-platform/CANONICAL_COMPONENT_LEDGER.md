# TMI Canonical Component Ledger
# Resolves duplicate component locations
# Updated: 2026-06-15

## Rule: When importing, ALWAYS use the Canonical path. Never import from Deprecated paths.

---

| Component | Canonical Path | Deprecated Copies | Used By | Notes |
|---|---|---|---|---|
| `BillboardLiveWall` | `@/components/media/BillboardLiveWall` | `@/components/home/BillboardLiveWall` (unused), `@/components/home/legacy-bulk-import/BillboardLiveWall` | `app/home/1-2/page.tsx`, `app/home/3/` via Home3LiveWorldSurface | canonical imports from `live/MaskedVideoTile` + `PERFORMER_REGISTRY` |
| `MaskedVideoTile` | `@/components/live/MaskedVideoTile` | `@/components/home/MaskedVideoTile` (unused), `@/components/media/MaskedVideoTile`, `@/components/home/legacy-bulk-import/MaskedVideoTile` | `components/media/BillboardLiveWall` | avatarUrl bug fixed 2026-06-15 |
| `AudienceScene` | `@/components/live/AudienceScene` (`.tsx`) | `@/components/home/legacy-bulk-import/AudienceScene` (`.jsx`) | `app/home/3/` via Home3LiveWorldSurface | TSX version is canonical; JSX in legacy folder is frozen |
| `OmniPresenceEngine` | `@/components/presence/OmniPresenceEngine` | `@/components/admin/OmniPresenceEngine`, `@/components/hud/OmniPresenceEngine`, `@/components/home/legacy-bulk-import/OmniPresenceEngine` | Check per-consumer | `presence/` is the most specific canonical path |
| `OmniDashboards` (HUD) | `@/components/hud/OmniDashboards` | `@/components/home/OmniDashboards`, `@/components/home/legacy-bulk-import/OmniDashboards`, `@/components/dashboard/OmniDashboards` | HUD overlay | Use `hud/` for the floating HUD panel |
| `OmniDashboards` (Admin) | `@/components/admin/OmniDashboards` | same as above | Admin mission control | Use `admin/` for the full admin dashboard version |
| `LiveLobbyWallCanister` / `MixedLobbyWall` | `@/components/canisters/LiveLobbyWallCanister`, `@/components/lobby/MixedLobbyWall` | `@/components/lobby/TMILobbyWall`, `@/components/live/TMILobbyWall` (both orphaned, zero imports) | 5+ real pages (profile/fan, profile/performer, profile/venue, profile/sponsor, magazine/article) via MixedLobbyWall; LiveLobbyWallCanister wired separately | Verified 2026-06-23: both `TMILobbyWall.tsx` copies are 100% `Math.random()` fake seats/chat/occupancy, near-byte-identical, **zero importers anywhere in the repo**. Canonical replacements already fetch real data from `GlobalLiveSessionRegistry`/`/api/homepage/live` and use honest empty states. Hold deletion until A1 certification passes (per Rule 21 — don't delete mid-certification even when the replacement is verified), then remove during the Phase B convergence sweep. |

---

## Deprecated Files — Safe to Remove (no active imports)

```
apps/web/src/components/home/BillboardLiveWall.tsx       — no imports found
apps/web/src/components/home/MaskedVideoTile.tsx         — no imports found
apps/web/src/components/media/MaskedVideoTile.tsx        — verify before removing
apps/web/src/components/lobby/TMILobbyWall.tsx           — no imports found; verified 2026-06-23; hold until post-A1 convergence sweep
apps/web/src/components/live/TMILobbyWall.tsx            — no imports found; verified 2026-06-23; hold until post-A1 convergence sweep
```

## Frozen — Do Not Modify

```
apps/web/src/components/home/legacy-bulk-import/         — entire folder frozen
```

---

## Import Quick Reference

```ts
// Billboard wall (home, magazine, venue, games)
import BillboardLiveWall from '@/components/media/BillboardLiveWall';

// Individual video tile
import { MaskedVideoTile } from '@/components/live/MaskedVideoTile';

// 3D audience seating
import AudienceScene from '@/components/live/AudienceScene';

// Presence engine (session/room broadcast)
import OmniPresenceEngine from '@/components/presence/OmniPresenceEngine';

// HUD overlay panels
import OmniDashboards from '@/components/hud/OmniDashboards';

// Admin mission control panels
import OmniDashboards from '@/components/admin/OmniDashboards';
```
