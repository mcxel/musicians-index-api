# TMI Blueprint Certification Ledger
# Source: `Homapge and battle challange and cyphers/` (35 files)
# Updated: 2026-06-15

| Blueprint File | Purpose | Canonical Runtime Location | Installed? | Wired? | Visual Match % | Missing / Gap |
|---|---|---|---|---|---|---|
| `tmi_home1_complete_80s_magazine_final.html` | Home 1 full visual spec | `components/home/Home1CoverPage.tsx` | ✅ | ✅ | 95% | — |
| `tmi_home1_orbital_with_underlay_panels.html` | Orbital + tabloid underlay spec | `components/home/Home1CoverPage.tsx` | ✅ | ✅ | 95% | — |
| `tmi_orbital_toggleable_panels.html` | Left/right orbital panel toggles | `components/home/Home1CoverPage.tsx` | ✅ | ✅ | 90% | Panel toggle state persistence |
| `Home1CoverPage.tsx` | Blueprint canonical component | `components/home/Home1CoverPage.tsx` | ✅ | ✅ | 95% | — |
| `TMI_HOMEPAGE_NETWORK_DIRECTIVE.md` | Master spec for all 6 homepages | Reference doc | ✅ | N/A | N/A | Certification per-homepage pending |
| `tmi_billboard_live_lobby_wall_system.html` | Billboard Live Lobby Wall spec | `components/media/BillboardLiveWall.tsx` | ✅ | ✅ | 85% | Live stream preview (fallback tiles ok) |
| `BillboardLiveWall.tsx` | Blueprint canonical component | `components/media/BillboardLiveWall.tsx` | ✅ | ✅ | 95% | — |
| `MaskedVideoTile.tsx` | Blueprint canonical component | `components/live/MaskedVideoTile.tsx` | ✅ | ✅ | 95% | avatarUrl bug fixed 2026-06-15 |
| `AudienceScene.jsx` | 3D audience seating system | `components/live/AudienceScene.tsx` | ✅ | ⚠️ | 70% | JSX→TSX migration; wired to theater/lobby routes |
| `OmniPresenceEngine.tsx` | Presence/session broadcast engine | `components/presence/OmniPresenceEngine.tsx` | ✅ | ⚠️ | 75% | Full venue runtime wiring incomplete |
| `OmniDashboards.tsx` | Admin + HUD dashboard panels | `components/hud/OmniDashboards.tsx` (HUD), `components/admin/OmniDashboards.tsx` (admin) | ✅ | ✅ | 85% | See CANONICAL_COMPONENT_LEDGER for duplicates |
| `tmi_games_discovery_network_page.html` | Games discovery network spec | `components/tmi/games/GameNightHub.tsx` → `app/games/page.tsx` | ✅ | ✅ | 80% | Visual tile motion/preview layer |
| `tmi_magazine_all_page_templates.html` | Magazine page templates | `app/magazine/` routes | ✅ | ⚠️ | 70% | Live inserts not wired; 3D page turn missing |
| `tmi_3d_page_turn_engine.html` | Magazine 3D page turn animation | Not yet installed | ❌ | ❌ | 0% | Needs component extraction + magazine wiring |
| `tmi_arena_triangle_battles_cyphers_challenges.html` | Battle/Cypher/Challenge arena spec | `app/battles/`, `app/cypher/`, `app/challenges/` | ✅ | ⚠️ | 75% | AudienceScene seating not wired in all arenas |
| `tmi_memory_wall_sponsor_booking_canisters.html` | Memory Wall + Sponsor booking | `app/memories/` | ⚠️ | ❌ | 40% | Full retention loop (ticket→attend→capture→share) not complete |
| `tmi_playlist_engine_complete.html` | Playlist engine spec | `app/playlist/` | ⚠️ | ⚠️ | 65% | Mixtape mode, share mode, referral tracking missing |
| `tmi_omni_presence_engine.html` | Presence engine visual spec | `components/presence/OmniPresenceEngine.tsx` | ✅ | ⚠️ | 70% | Venue runtime full loop |
| `tmi_complete_all_four_dashboards_v2.html` | Fan/Performer/Venue/Admin dashboards | `app/dashboard/`, `app/fan/`, `app/performers/` | ⚠️ | ⚠️ | 65% | Profile ecosystem not fully closed |
| `tmi_five_admin_hubs_complete.html` | 5 admin hub panels | `app/admin/` routes | ✅ | ⚠️ | 75% | Live room monitor wall; revenue wall |
| `tmi_signups_hubs_season_pass_complete.html` | Signup + onboarding + season pass | `app/signup/`, `app/onboarding/` | ✅ | ⚠️ | 70% | Season pass flow incomplete |
| `tmi_3d_character_system.html` | Avatar character system | `app/avatar/`, `app/avatar-builder/` | ⚠️ | ⚠️ | 60% | Face scan → texture → avatar pipeline |
| `tmi_3d_theater_audience_scene.html` | 3D theater audience spec | `components/live/AudienceScene.tsx` | ✅ | ⚠️ | 65% | Bot seating, emote system |
| `TMI_TheaterAudience_3D.html` | Theater audience scene v2 | `components/live/AudienceScene.tsx` | ✅ | ⚠️ | 65% | Mirrors above |
| `TMI_MASTER_COMPLETION_MANIFEST_v1.md` | Platform completion manifest | Reference doc | ✅ | N/A | N/A | Use for sprint prioritization |
| `TMI_MagazinePageSystem_CopilotDirective.md` | Magazine assembly directive | Reference doc | ✅ | N/A | N/A | Magazine wiring sprint needed |
| `TMI_MagazinePageSystem_CopilotDirective (2).md` | Magazine directive v2 | Reference doc | ✅ | N/A | N/A | Same as above |
| `VENUE_SYSTEM_README.md` | Venue system architecture | `lib/venues/VenueRegistry.ts` | ✅ | ✅ | 85% | Venue skins; shared audience system |
| `tmi_all_files_inventory.csv` | Original file inventory | Reference doc | ✅ | N/A | N/A | Superseded by this ledger |
| `preview_converted_all.html` | Visual preview reference | Reference doc | ✅ | N/A | N/A | Use for visual audit |
| `articles-performer-slug-page.tsx` | Performer article page blueprint | `app/articles/performer/[slug]/page.tsx` | ✅ | ✅ | 100% | — |
| `components.jsx` | Blueprint component fragments | Multiple locations | ⚠️ | ⚠️ | — | Audit needed per fragment |
| `page.tsx` | Generic page blueprint | Various routes | ⚠️ | ⚠️ | — | Confirm which route this targets |
| `route.ts` | API route blueprint | `app/src/route.ts` (untracked) | ⚠️ | ❌ | — | Verify target + install |
| `tmiTokens.js` | Design tokens | `apps/web/src/tmiTokens.js` (untracked) | ⚠️ | ❌ | — | Wire into tailwind config or CSS vars |

---

## Summary Counts
- ✅ Fully installed + wired: **17**
- ⚠️ Partial / needs wiring: **15**
- ❌ Not installed: **3** (`tmi_3d_page_turn_engine`, `route.ts`, `tmiTokens.js`)

## Priority Gaps (launch-critical order)
1. `tmiTokens.js` → wire design tokens into global CSS
2. `route.ts` → identify target route, install
3. Memory Wall full loop (`ticket→attend→capture→share→return`)
4. Magazine 3D page turn engine
5. Avatar pipeline (face scan → texture → audience seat)
6. Profile ecosystem closure (fan/performer/venue dashboards fully linked)
