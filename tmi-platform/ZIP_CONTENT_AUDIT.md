# TMI — ZIP Content Audit
# "Homapge and battle challange and cyphers" ZIP
# Audited: 2026-06-15

Reality check: Installed ≠ Wired ≠ Visible. This document tracks each ZIP asset against what actually exists in the repo.

Legend: ✅ Yes | ⚠️ Partial | ❌ No

---

## Section 1 — React Component Files (from ZIP)

| Asset | In ZIP | Installed in Repo | Wired (imported + rendered) | Visible |
|-------|--------|-------------------|-----------------------------|---------|
| `Home1CoverPage.tsx` | ✅ | ✅ `components/home/Home1CoverPage.tsx` | ✅ Used by `app/home/1/page.tsx` | ✅ |
| `BillboardLiveWall.tsx` | ✅ | ✅ 2 non-legacy copies exist | ⚠️ `home/BillboardLiveWall.tsx` re-exports from `media/` — but **Home 1-2 does NOT import it** | ❌ Not on Home 1-2 |
| `OmniPresenceEngine.tsx` | ✅ | ✅ 3 non-legacy copies: `hud/`, `admin/`, `presence/` | ⚠️ Wired into profile pages; **not wired into any homepage** | ⚠️ Profile only |
| `OmniDashboards.tsx` | ✅ | ✅ 4 copies: `hud/`, `admin/`, `dashboard/`, `home/` | ⚠️ Unclear which is canonical; not imported from homepage routes | ⚠️ Admin only |
| `MaskedVideoTile.tsx` | ✅ | ✅ 3 copies: `home/`, `live/`, `media/` | ✅ `live/MaskedVideoTile.tsx` is imported by `BroadcastDeckWall` | ⚠️ Broadcast only |
| `AudienceScene.jsx` | ✅ | ✅ Installed as `live/AudienceScene.jsx` AND `live/AudienceScene.tsx` (CONFLICT) | ⚠️ `.tsx` version used by Home 5, battles, arena pages | ❌ Not on Home 1-2 |
| `articles-performer-slug-page.tsx` | ✅ | ✅ `app/articles/performer/[slug]/page.tsx` | ✅ Wired | ✅ |
| `components.jsx` | ✅ | ✅ `components/live/components.jsx` | ❌ Not found in any import | ❌ |
| `tmiTokens.js` | ✅ | ⚠️ DUPLICATE: `src/tmiTokens.js` AND `components/live/tmiTokens.js` | ❌ Neither imported by homepage | ❌ |
| `page.tsx` (from ZIP) | ✅ | ⚠️ Stray at repo root `/page.tsx` — not inside apps/web | ❌ Not routed | ❌ |
| `route.ts` (from ZIP) | ✅ | ⚠️ Stray at `apps/web/src/route.ts` — empty file, not inside any app/ route | ❌ Dead file | ❌ |

---

## Section 2 — HTML Blueprint Files (from ZIP)

These are visual specs. They define what should be built. They are NOT React components.
Status = whether a React component implementing this blueprint exists.

| Blueprint HTML | What It Defines | React Component Built | Wired to Route | Blueprint Parity |
|---------------|-----------------|----------------------|----------------|-----------------|
| `tmi_home1_orbital_with_underlay_panels.html` | Home 1 orbital system + underlay | ✅ `Home1CoverPage.tsx` (1452 lines) | ✅ `/home/1` | ⚠️ Orbital still uses local `GENRE_DATA`, not `PerformerRegistry` |
| `tmi_billboard_live_lobby_wall_system.html` | Home 1-2 Billboard Channel | ⚠️ `app/home/1-2/page.tsx` exists but does NOT use `BillboardLiveWall` component | ✅ `/home/1-2` | ❌ Native tiles only; not matching wall blueprint |
| `tmi_arena_triangle_battles_cyphers_challenges.html` | Home 5 Arena + Battles + Cyphers | ✅ `Home5BattleCypherSurface.tsx` | ✅ `/home/5` | ⚠️ No real competitor data; no PerformerRegistry wiring |
| `tmi_complete_all_four_dashboards_v2.html` | Artist/Fan/Venue/Sponsor dashboards | ✅ Role dashboard pages exist | ✅ `/artist/dashboard`, etc. | ⚠️ Data not registry-driven |
| `tmi_five_admin_hubs_complete.html` | 5 admin hub surfaces | ✅ Admin pages exist | ✅ `/admin/*` | ⚠️ Marcel hub / Micah hub / Overseer deck wiring TBD |
| `tmi_omni_presence_engine.html` | OmniPresence panel system | ✅ `OmniPresenceEngine.tsx` (3 copies) | ⚠️ Profile pages only | ❌ Not on homepage |
| `tmi_games_discovery_network_page.html` | Games network / discovery | ✅ Games pages exist | ✅ `/games` | ⚠️ Not audited |
| `tmi_magazine_all_page_templates.html` | Magazine issue + article templates | ✅ `Home2NewsDeskSurface.tsx` + article routes | ✅ `/home/2`, `/articles/*` | ⚠️ No real article data |
| `tmi_memory_wall_sponsor_booking_canisters.html` | Memory wall + booking UI | ⚠️ Partial | ✅ `/venues/book` | ⚠️ No visual memory wall on homepage |
| `tmi_playlist_engine_complete.html` | Playlist + media player | ✅ Playlist page exists | ✅ `/playlist` | ✅ Wired (from P0 work) |
| `tmi_signups_hubs_season_pass_complete.html` | 6-role signups + season pass | ✅ Auth pages + subscribe page | ✅ `/signup`, `/subscribe` | ⚠️ Role selection wiring TBD |
| `tmi_home1_complete_80s_magazine_final.html` | Full Home 1 tabloid surface | ✅ `Home1CoverPage.tsx` | ✅ `/home/1` | ⚠️ Underlay sizing + banner proportion |
| `tmi_3d_character_system.html` | 3D avatar character rigs | ⚠️ `AudienceScene.tsx` partial | ⚠️ Arena / battles | ❌ Not on homepage |
| `tmi_3d_page_turn_engine.html` | 3D magazine page flip | ❌ Not built as component | ❌ | ❌ |
| `tmi_3d_theater_audience_scene.html` | 3D theater audience | ⚠️ `AudienceScene.jsx` + `.tsx` conflict | ⚠️ Battles/arena only | ❌ |
| `preview_converted_all.html` | Visual reference for all surfaces | Reference only | N/A | N/A |

---

## Section 3 — Stray Files That Need Resolution

These files exist in the repo but are at wrong locations or are orphaned.

| File | Current Location | Issue | Action Needed |
|------|-----------------|-------|---------------|
| `page.tsx` | Repo root (`/page.tsx`) | Not inside `apps/web/src/app/` — not a Next.js route | Delete or move to correct app route |
| `route.ts` | `apps/web/src/route.ts` | Empty file, not inside any `api/` route folder | Delete |
| `UploadPipelineEngine.ts` | Repo root | Should be in `apps/web/src/lib/upload/` | Move or delete (check if a correct version already exists at proper path) |
| `VenueRuntimeShell.tsx` | Repo root | Uses `@react-three/fiber` + `@react-three/drei` (3D) — belongs in `components/venue/` or `components/live/` | Move to correct location |
| `uploadActions.ts` | Repo root | Server action — should be in `apps/web/src/` or `apps/web/src/app/actions/` | Move |
| `tmiTokens.js` | TWO copies: `apps/web/src/tmiTokens.js` AND `apps/web/src/components/live/tmiTokens.js` | Duplicate design tokens — neither imported by homepage | Consolidate to `apps/web/src/lib/tokens/tmiTokens.ts` |
| `components.jsx` | `apps/web/src/components/live/components.jsx` | Generic name, unknown purpose — not imported anywhere | Audit content, rename or delete |

---

## Section 4 — Duplicate Component Problem

These components have multiple competing copies. The homepage surfaces are consuming different versions inconsistently.

| Component | Copies | Canonical (should be) | Homepage Uses | Gap |
|-----------|--------|-----------------------|---------------|-----|
| `BillboardLiveWall` | `home/` (re-export) + `media/` (real) + `components/billboard/` + `live/` | `media/BillboardLiveWall.tsx` | **None on homepage** — Home 1-2 built native tiles | Billboard wall not actually rendering |
| `OmniPresenceEngine` | `hud/` + `admin/` + `presence/` | `hud/OmniPresenceEngine.tsx` | Not on any homepage | OmniPresence not visible on home surfaces |
| `OmniDashboards` | `hud/` + `admin/` + `dashboard/` + `home/` | `hud/OmniDashboards.tsx` | Not wired to homepage | Dashboard panels not on homepage |
| `MaskedVideoTile` | `home/` + `live/` + `media/` | `live/MaskedVideoTile.tsx` | Via BroadcastDeckWall only | Not directly on billboard wall |
| `AudienceScene` | `live/AudienceScene.jsx` + `live/AudienceScene.tsx` | `live/AudienceScene.tsx` | `.tsx` used by arena/battles | `.jsx` version is orphaned conflict |

---

## Section 5 — Registry Wiring Status

| Surface | PerformerRegistry | VenueRegistry | Data Source Today |
|---------|------------------|---------------|-------------------|
| Home 1 — Crown holder | ✅ `getCrownHolder()` | N/A | Registry |
| Home 1 — Orbital 10 performers | ❌ | N/A | Local `GENRE_DATA` hardcoded array |
| Home 1 — Rankings bar | ❌ | N/A | Hardcoded inline performers |
| Home 1 — Top 10 grid | ❌ | N/A | Hardcoded inline performers |
| Home 1 — Venue rows (SAT/SUN/FRI) | N/A | ❌ | Hardcoded "cypher-arena-1" strings |
| Home 1-2 — Billboard wall | ✅ `PERFORMER_REGISTRY` | N/A | Registry |
| Home 2 — Editorial / Magazine | ❌ | N/A | Hardcoded article stubs |
| Home 3 — Live rooms | N/A | ❌ | Hardcoded room objects |
| Home 5 — Battle competitors | ❌ | N/A | Hardcoded names |
| Profile pages | ❌ | N/A | Not reading from registry |
| Articles — performer slug | ❌ | N/A | Not reading from registry |

---

## Section 6 — Honest Completion Estimate

Based on what is actually in the repo today:

| Area | Installed | Wired | Visible | Completion |
|------|-----------|-------|---------|------------|
| Home 1 — Crown + Underlay + Orbital structure | ✅ | ✅ | ✅ | 85% |
| Home 1 — Orbital registry (real performers) | ✅ Registry exists | ❌ Not connected | ❌ | 30% |
| Home 1-2 — Billboard wall tiles | ✅ Native tiles | ✅ Uses PerformerRegistry | ✅ Renders | 75% — missing BillboardLiveWall component |
| Home 2 — Magazine surface | ✅ | ✅ | ⚠️ Stub data | 65% |
| Home 3 — Live world | ✅ | ✅ | ⚠️ No real room data | 70% |
| Home 4 — Marketplace / ads | ✅ | ✅ | ✅ Sponsor auto-fallback wired | 80% |
| Home 5 — Arena / battles | ✅ | ✅ | ⚠️ No real competitor data | 65% |
| PerformerRegistry → all surfaces | ✅ Registry | ❌ Only wired to Home 1 crown + Home 1-2 | ❌ | 25% |
| VenueRegistry → all surfaces | ✅ Registry | ❌ Not wired anywhere | ❌ | 5% |
| Duplicate components resolved | N/A | ❌ 5 components have 2-4 copies | N/A | 0% |
| Stray files cleaned | N/A | ❌ 7 stray files at root/wrong paths | N/A | 0% |

---

## Section 7 — Priority Fixes for Homepage Convergence

Ordered by impact:

1. **Wire Home 1 orbital to PerformerRegistry** — replace `GENRE_DATA` performers with `getTopPerformers()`. This makes the single biggest visual surface (the spinning orbital) show real data.

2. **Wire Home 1 Rankings bar + Top 10 grid to PerformerRegistry** — same file, ~3 more arrays to replace.

3. **Wire Home 1 venue rows to VenueRegistry** — replace 3 hardcoded venue slugs with `getLiveVenues()`.

4. **Wire BillboardLiveWall into Home 1-2** — the Billboard channel is supposed to use the `BillboardLiveWall` component from the blueprint. Current Home 1-2 has native tiles only.

5. **Delete `AudienceScene.jsx`** — `.tsx` version is canonical. The `.jsx` file is an orphaned conflict risk (two files with same base name in same folder).

6. **Move/delete stray root files** — `page.tsx`, `route.ts`, `UploadPipelineEngine.ts`, `VenueRuntimeShell.tsx`, `uploadActions.ts` sitting at repo root or wrong paths are noise.

7. **Wire Home 5 battle competitors to PerformerRegistry** — replace hardcoded names with `getPerformersByCategory('Battle')`.

8. **Consolidate tmiTokens.js** — two identical copies; pick one path and delete the other.
