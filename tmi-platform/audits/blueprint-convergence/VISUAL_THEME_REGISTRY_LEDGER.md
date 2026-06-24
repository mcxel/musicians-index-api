# VISUAL THEME REGISTRY LEDGER

**Purpose:** Track reusable visual styles, animations, room aesthetics, avatar skins, and monitor designs across all 43 blueprint files. One canonical runtime per system; unlimited optional themes.

**Canonicalization Rule:** Extract best visuals from competing files; preserve as themes; remove only fake data and duplicate logic.

---

## Theme Inventory

### HOME 1 THEMES

| Theme Name | Source File | Visual Layer | Default? | Seasonal? | Status | Dependencies | Notes |
|---|---|---|---|---|---|---|---|
| neon_world | FILE_09 | Neon underlay blobs (pink/gold/cyan/purple) | YES | NO | APPROVED | GlobalLiveSessionRegistry | 4 animated blobs, 0.55 opacity, 9s/12s/15s/18s keyframes |
| tabloid_underlay | FILE_09 | Magazine card scrolling behind orbital | YES | YES | APPROVED | MAGAZINE_ISSUE_1 | Opacity 0.38, depth layering |
| orbital_electric | FILE_09 | SVG orbital with 10 cards at 36° | YES | NO | APPROVED | PerformerRegistry | 40s rotation, center hub |
| billboard_city | [TBD] | [TBD] | NO | NO | PENDING_AUDIT | [TBD] | [TBD] |
| magazine_glow | [TBD] | [TBD] | NO | YES | PENDING_AUDIT | [TBD] | [TBD] |

### HOME 2 THEMES

| Theme Name | Source File | Visual Layer | Default? | Seasonal? | Status | Dependencies | Notes |
|---|---|---|---|---|---|---|---|
| [TBD] | [TBD] | [TBD] | [TBD] | [TBD] | PENDING_AUDIT | [TBD] | [TBD] |

### HOME 3 THEMES

| Theme Name | Source File | Visual Layer | Default? | Seasonal? | Status | Dependencies | Notes |
|---|---|---|---|---|---|---|---|
| [TBD] | [TBD] | [TBD] | [TBD] | [TBD] | PENDING_AUDIT | [TBD] | [TBD] |

### HOME 4 THEMES

| Theme Name | Source File | Visual Layer | Default? | Seasonal? | Status | Dependencies | Notes |
|---|---|---|---|---|---|---|---|
| [TBD] | [TBD] | [TBD] | [TBD] | [TBD] | PENDING_AUDIT | [TBD] | [TBD] |

### HOME 5 THEMES

| Theme Name | Source File | Visual Layer | Default? | Seasonal? | Status | Dependencies | Notes |
|---|---|---|---|---|---|---|---|
| [TBD] | [TBD] | [TBD] | [TBD] | [TBD] | PENDING_AUDIT | [TBD] | [TBD] |

### AVATAR THEMES

| Theme Name | Source File | Character Type | Default? | Seasonal? | Status | Dependencies | Notes |
|---|---|---|---|---|---|---|---|
| bobblehead_realistic | FILE_10 | Ultra-realistic bobblehead (head 2.5x scale) | YES | NO | APPROVED | Face Identity Engine | PBR textures, recognizable likeness target: 85-95% |
| [TBD] | [TBD] | [TBD] | [TBD] | [TBD] | PENDING_AUDIT | [TBD] | [TBD] |

### ROOM/VENUE THEMES

| Theme Name | Source File | Room Type | Default? | Seasonal? | Status | Dependencies | Notes |
|---|---|---|---|---|---|---|---|
| [TBD] | [TBD] | [TBD] | [TBD] | [TBD] | PENDING_AUDIT | [TBD] | [TBD] |

### MONITOR/BROADCAST THEMES

| Theme Name | Source File | Panel Type | Default? | Seasonal? | Status | Dependencies | Notes |
|---|---|---|---|---|---|---|---|
| [TBD] | [TBD] | [TBD] | [TBD] | [TBD] | PENDING_AUDIT | [TBD] | [TBD] |

---

## Theme Application Rules

**One Theme Active at a Time**
- Runtime selects one theme per route/room/event
- No visual overlap or conflicting styles
- Theme selection: route param, user preference, event type, or seasonal logic

**Theme Fallback Chain**
1. Route/Event override (explicit theme selection)
2. User preference (profile setting)
3. Seasonal theme (if time-based)
4. Default theme (canonical)

**Performance Budget**
- No theme > 500KB additional assets
- No theme adds > 50ms render cost
- Mobile themes tested at 60fps

---

## Files Contributing to Theme Registry

| File | System | Themes Found | Action |
|---|---|---|---|
| FILE_09 | Home 1 | neon_world, tabloid_underlay, orbital_electric | APPROVED — defaults locked |
| FILE_10 | Avatar | bobblehead_realistic | APPROVED — runtime approved |
| FILE_11-43 | [TBD] | [TBD] | PENDING_AUDIT |

---

## Canonicalization Decisions

### Home 1
- **Canonical Runtime:** Home1CoverPage.tsx (orbit + sidebar + ticker + stats)
- **Default Theme:** neon_world + tabloid_underlay + orbital_electric
- **Optional Themes:** [TBD from Files 11-43]
- **Fake Data Removed:** ✅ (viewer counts, sponsor data, promoter names)

### Avatar System
- **Canonical Runtime:** AvatarRuntime (face scan + rigging + animation)
- **Default Theme:** bobblehead_realistic
- **Optional Themes:** [TBD from FILE_10+]
- **Fake Data Status:** ✅ (approved; no fake data in spec)

---

## Files Audited to Date

- FILE_01: ✅ Audited
- FILE_02: ✅ Audited
- FILE_03: ✅ Audited
- FILE_04: ✅ Audited
- FILE_05: ✅ Audited
- FILE_06: ✅ Audited
- FILE_07: ✅ (duplicate of FILE_06)
- FILE_08: ✅ Audited
- FILE_09: ✅ Audited (Full spec, 3 approved themes extracted)
- FILE_10: 🔄 IN_PROGRESS
- FILE_11-43: ⏳ PENDING

---

**Last Updated:** 2026-06-23
**Audit Lead:** Claude 
**Status:** 20.9% complete (9/43 files)
**Next:** FILE_10 completion + FILES_11-43 systematic audit
