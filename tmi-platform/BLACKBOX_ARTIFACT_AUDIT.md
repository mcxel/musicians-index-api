# BLACKBOX ARTIFACT AUDIT
**Date:** 2026-06-18 | **Phase:** Architectural Convergence & Legacy Purge
**Goal:** Zero visible BlackBox-era UI. Unified cinematic 3D broadcast universe.

## Classification Rules
- **KEEP:** Matches TMI vision (3D Avatar Runtime, Live Lobby Wall, etc.)
- **MERGE:** Duplicate systems doing the same thing.
- **CONVERT:** Useful logic, ugly presentation (preserve API/data, replace UI).
- **PURGE:** Violates TMI design language (SaaS dashboards, generic admin panels, flat cards, placeholder boxes).

---

## 1. Discovery Network (Home Convergence)
| Surface | Classification | Action / Notes |
| :--- | :--- | :--- |
| **Home 1 (Cover)** | **KEEP / CONVERT** | Overall layout is KEEP. Needs final conversion of internal metric cards to remove SaaS feel. |
| **Home 1-2 (Billboard)** | **MERGE** | Merge native flat tiles with canonical `BillboardLiveWall` and `MotionPosterPlayer`. |
| **Home 2 (Magazine)** | **CONVERT** | Data hooks are good. UI needs conversion to pure editorial/magazine layout. |
| **Home 3 (Live World)** | **KEEP** | Heavily integrated with `BroadcastDirectorEngine` and Live Lobby Walls. |
| **Home 4 (Marketplace)** | **CONVERT** | Flat marketplace UI must be converted to a cinematic Sponsor/Booking/Merch ecosystem. |
| **Home 5 (Arena)** | **KEEP** | Uses Arena Triangle and Live Belts. Fits broadcast universe. |

## 2. Hubs & Dashboards
| Surface | Classification | Action / Notes |
| :--- | :--- | :--- |
| **`/dashboard/*` routes** | **PURGE** | All legacy dashboard routes must be strictly purged or reduced to pure redirects. |
| **`/hub/fan`** | **CONVERT / MERGE** | Convert flat stat cards to `Canisters`. Merge `AvatarWorkspace` and `MemoryWall`. |
| **`/hub/performer`** | **CONVERT / MERGE** | Remove flat tables. Enforce `MonitorSatelliteSystem` and `SponsorRacetrack`. |
| **`OmniDashboards.tsx`** | **CONVERT** | The "Admin Hub" tab uses SaaS grid layouts. Convert to `Overseer Deck` mission control panels. |

## 3. Canisters & Widgets
| Component | Classification | Action / Notes |
| :--- | :--- | :--- |
| **`ActionRail`** | **KEEP** | Unified control rail. Single source of truth. |
| **`MonitorSatelliteSystem`** | **KEEP** | Canonical monitor runtime. |
| **`PIPMonitor`** | **PURGE** | Folded into `MonitorSatelliteSystem`. (Already deleted). |
| **`PlaylistEngine`** | **MERGE** | Consolidate multiple playlist versions into `UniversalPlaylistEngine` + `PlaylistCanister`. |
| **`MemoryWall`** | **MERGE** | Consolidate memory captures into `CanonicalEcosystemEngine` + `MemoryWallCanister`. |
| **`TipJarWidget`** | **CONVERT** | Convert flat generic modal into a cinematic in-room overlay. |
| **`SponsorStampWall`** | **CONVERT** | Needs conversion from static grid to NASCAR-racetrack styling. |
| **`Booking System UI`** | **CONVERT** | Remove table/spreadsheet look. Convert to contract/offer visual flow. |

## 4. Media & Presence
| System | Classification | Action / Notes |
| :--- | :--- | :--- |
| **`AudienceScene`** | **KEEP** | Core 3D presence layer. |
| **`PresenceEngine`** | **KEEP** | Fallback manager (Live → Avatar → Poster → Profile). |
| **`MaskedVideoTile`** | **MERGE** | Ensure all standard video tiles are merged to use `PresenceEngine` to prevent black boxes. |
| **Avatar Creator** | **CONVERT** | Convert generic sliders into the 3D `AvatarWorkspace` dressing room. |

## 5. Administrative Surfaces
| Surface | Classification | Action / Notes |
| :--- | :--- | :--- |
| **`/admin/revenue`** | **CONVERT** | Purge flat charts. Convert to `Revenue Wall` broadcast display. |
| **`/admin/users`** | **PURGE** | Generic CRM tables violate design language. |
| **`/admin/jay-paul`** | **CONVERT** | Convert to `Producer HQ` Mission Board. |

---

## Immediate Execution Plan

1. **The Purge:** Strip all remaining UI elements from the legacy `/dashboard` routes to guarantee no SaaS artifacts leak through.
2. **Hub Conversion:** Execute the `CONVERT` order on `/hub/fan` and `/hub/performer` to replace all flat cards and metric grids with the canonical Canister system and Monitor arrays.
3. **Marketplace & Overseer Overhaul:** Convert Home 4 (Marketplace) and the OmniDashboards Admin tab into their final cinematic, broadcast-ready states.