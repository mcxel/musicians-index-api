# P0.5 UNIVERSAL LOBBY ENTRY CERTIFICATION
**Date:** 2026-06-15 | **Phase:** Production Truth / Integration Audit

**Standard:** Every live discovery card MUST route through: 
`Preview` → `Join Lobby` → `Seat Assignment` → `AudienceScene` → `Room`

## Surface Certification Matrix

| Surface | Click Target | Preview | Join Lobby | Seat Assign | AudienceScene | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Home 1 (Cover)** | Orbital Nodes | ❌ No | ❌ No | ❌ No | ❌ No | 🔴 **BYPASS** (Routes to Article) |
| **Home 1 (Cover)** | "ENTER LIVE ARENA" | ❌ No | ❌ No | ❌ No | ❌ No | 🔴 **BYPASS** (Direct Route) |
| **Home 1-2 (Billboard)** | Video Tiles | ❌ No | ❌ No | ❌ No | ❌ No | 🔴 **BYPASS** (`window.location.href`) |
| **Home 1-2 (Billboard)** | "JOIN LOBBY" CTA | ❌ No | ❌ No | ❌ No | ❌ No | 🔴 **BYPASS** (Direct Route) |
| **Home 2 (Magazine)** | Article CTAs | ❌ No | ❌ No | ❌ No | ❌ No | 🔴 **BYPASS** (Direct Route) |
| **Home 3 (Live World)** | Lobby Wall Grid | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | 🟢 **WIRED** |
| **Home 3 (Live World)** | Main Preview | ❌ No | ❌ No | ❌ No | ❌ No | 🔴 **BYPASS** (Generic browse link) |
| **Home 4 (Marketplace)**| Sponsor Power Panels | ❌ No | ❌ No | ❌ No | ❌ No | 🔴 **DEAD CLICK** / Stub |
| **Home 5 (Arena)** | CypherBelt Cards | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | 🟢 **WIRED** |
| **Billboard Live Wall** | Generic Implementation | ❌ No | ❌ No | ❌ No | ❌ No | 🔴 **BYPASS** (Raw `<Link>` tags) |
| **Games Discovery Hub** | All Game Cards | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | 🟢 **WIRED** |
| **Performer Profiles** | "ENTER ROOM" | ❌ No | ❌ No | ❌ No | ❌ No | 🔴 **BYPASS** (Direct Route) |
| **Performer Profiles** | "ENTER THE ARENA" | ❌ No | ❌ No | ❌ No | ❌ No | 🔴 **BYPASS** (Direct to `/battles`) |
| **Fan Profiles** | "ENTER THE ARENA" | ❌ No | ❌ No | ❌ No | ❌ No | 🔴 **BYPASS** (Direct Route) |
| **Writer Profiles** | Article Links | ❌ No | ❌ No | ❌ No | ❌ No | 🔴 **DEAD CLICK** (No profile model) |
| **Sponsor Profiles** | Sponsored Rooms | ❌ No | ❌ No | ❌ No | ❌ No | 🔴 **DEAD CLICK** (No profile model) |
| **Venue Profiles** | Active Events | ❌ No | ❌ No | ❌ No | ❌ No | 🔴 **DEAD CLICK** (No profile model) |
| **Battles (Main)** | Battle Match Grid | ❌ No | ❌ No | ❌ No | ❌ No | 🔴 **BYPASS** (Direct Route) |
| **Cyphers (Main)** | Cypher Schedule | ❌ No | ❌ No | ❌ No | ❌ No | 🔴 **BYPASS** (Direct Route) |
| **Challenges (Main)** | Challenge Cards | ❌ No | ❌ No | ❌ No | ❌ No | 🔴 **BYPASS** (Direct Route) |
| **Monthly Idol** | Game Card | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | 🟢 **WIRED** (via Games Hub) |
| **Monday Night Stage** | Game Card | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | 🟢 **WIRED** (via Games Hub) |
| **Deal or Feud 1000** | Featured Card | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | 🟢 **WIRED** (via Games Hub) |
| **Name That Tune** | Game Card | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | 🟢 **WIRED** (via Games Hub) |
| **Circle and Squares** | Game Card | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | 🟢 **WIRED** (via Games Hub) |
| **World Dance Party** | Game Card | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | 🟢 **WIRED** (via Games Hub) |
| **Stream & Win** | Top Navigation | ❌ No | ❌ No | ❌ No | ❌ No | 🔴 **BYPASS** (Redirects instantly) |

---

## Systemic Vulnerability Identified
The `UniversalLobbyEntry` component successfully encapsulates the 5-step flow, but it is currently **isolated to the Games Hub and Home 3**.

The platform's highest-traffic entry points (Home 1, Home 1-2 Billboard, and Performer Profiles) are hardcoded with raw navigation links (e.g., `window.location.href = '/live/rooms/' + p.id`). 

**Consequence:** Users arriving from the primary landing pages bypass the Access Check entirely, meaning paid/ticketed rooms can currently be entered for free by directly manipulating the URL or clicking a legacy tile.