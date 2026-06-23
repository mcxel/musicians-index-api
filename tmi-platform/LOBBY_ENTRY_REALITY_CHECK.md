# LOBBY ENTRY REALITY CHECK
**Date:** 2026-06-15 | **Phase:** P0.5 Verification Pass

This document verifies whether previously reported "Dead Clicks" and "Audience Bypasses" are still present in the codebase, or if they have already been patched with `UniversalLobbyEntry` / `LobbyEntryFlow`.

## Verification Results

| ID | Surface / Target | Audit Claim | Codebase Reality (Current State) | Status |
|:---|:---|:---|:---|:---|
| 1 | **Billboard Live Wall** (`BillboardLiveWall.tsx`) | `window.location.href` | Imports `LobbyEntryFlow`, uses `setActiveFlowRoom`, and manages the 5-step modal correctly. | ✅ **FIXED** (Audit Stale) |
| 2 | **Performer Profile "ENTER ROOM"** (`performer/profile/page.tsx`) | `<Link href="/live/rooms/...">` | Still uses `<Link href={\`/live/rooms/${user.liveRoomId...}\`}>`. Bypasses audience flow. | 🔴 **NOT FIXED** |
| 3 | **Performer Profile "ENTER THE ARENA"** (`performer/profile/page.tsx`) | `<Link href="/battles">` | Still uses `<Link href="/battles">`. Bypasses specific battle entry flow. | 🔴 **NOT FIXED** |
| 4 | **Magazine Article "WATCH LIVE"** (`articles/performer/[slug]/page.tsx`) | `<Link href="/live/rooms/...">` | Still uses raw `<Link>` tags for live room CTAs. | 🔴 **NOT FIXED** |
| 5 | **Home 1 Orbital Nodes** (`Home1CoverPage.tsx`) | `<Link href="/articles/performer/[slug]">` | Central crown holder and orbital nodes link directly to articles, bypassing room discovery. | 🔴 **NOT FIXED** |
| 6 | **Stream & Win Radio** (`streamwin/page.tsx`) | Server Redirect | Uses `redirect("/rooms/live-concert")`. Immediate bypass. | 🔴 **NOT FIXED** |
| 7 | **Venue Active Event Cards** | Bypass / Dead click | Lacks standard entry card wrapper. | 🔴 **NOT FIXED** |

---

## Executive Summary & Next Targets

The core `BillboardLiveWall`, `Home 3`, and `Games Discovery Network` surfaces have been successfully certified and are running the `LobbyEntryFlow`.

The immediate remaining **P0.5 Room Entry** launch blockers are:
1. **Performer Profile:** "WATCH LIVE" / "ENTER ROOM"
2. **Magazine Articles:** "WATCH LIVE"
3. **Venue Profiles:** Active Event Cards

These specific targets must be wrapped in `UniversalLobbyCard` or integrated with `LobbyEntryFlow` to ensure no user bypasses the ticket gates or the 3D seat assignment.