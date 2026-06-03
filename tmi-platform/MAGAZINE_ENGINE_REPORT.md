# MAGAZINE_ENGINE_REPORT (Sprint 1B Audit — Inventory Only)

Status: Audit-only  
Date: 2026-06-02  
Lens: Story-first content + live discovery + participation handoff

## Canonical magazine engine targets (proposed)
- MagazineEngine
- CrownOrbitEngine
- AnalyticsEngine
- RewardsEngine (for spotlight/fame tie-ins)

---

## Magazine / Editorial Inventory

| File Path | Purpose | Dependencies | Active Routes | Current System | Proposed Canonical Engine | Class |
|---|---|---|---|---|---|---|
| `apps/web/src/app/magazine/page.tsx` | Magazine landing/index | article listing components | `/magazine` | Magazine index page | MagazineEngine | KEEP |
| `apps/web/src/app/magazine/issues/page.tsx` | Issue listing | issue data source | `/magazine/issues` | Issue listing | MagazineEngine | KEEP |
| `apps/web/src/app/magazine/issue/[id]/page.tsx` | Issue detail surface | issue/article modules | `/magazine/issue/[id]` | Issue detail | MagazineEngine | KEEP |
| `apps/web/src/components/magazine/MagazineEditorialSpread.tsx` | Editorial spread visual/layout | editorial data props | magazine/article surfaces | Editorial spread component | MagazineEngine | KEEP |
| `apps/web/src/app/articles/page.tsx` | Generic article index | article queries/routes | `/articles` | Article index | MagazineEngine | MERGE |
| `apps/web/src/app/articles/[slug]/page.tsx` | Generic article detail | slug resolver/content source | `/articles/[slug]` | Article detail | MagazineEngine | MERGE |
| `apps/web/src/app/articles/performer/[slug]/page.tsx` | Performer article profile/story | performer data/article content | `/articles/performer/[slug]` | Performer article route | MagazineEngine + Profile tie-in | KEEP |
| `apps/web/src/app/articles/artist/[slug]/page.tsx` | Artist article | artist article modules | `/articles/artist/[slug]` | Artist editorial | MagazineEngine | KEEP |
| `apps/web/src/app/articles/news/[slug]/page.tsx` | News article detail | news data source | `/articles/news/[slug]` | News detail | MagazineEngine | KEEP |
| `apps/web/src/components/home/Home1CoverPage.tsx` | Broadcast header/story belt | badges/cta/story states | `/home/1` | Home story masthead | CrownOrbitEngine + MagazineEngine | MERGE |
| `apps/web/src/components/home/TmiMagazineOrbitalUnderlay.tsx` | Tabloid underlay + orbital stack | motion/visual data | `/home/1` | Orbital underlay | CrownOrbitEngine + MagazineEngine | KEEP |
| `apps/web/src/components/home/HomeVisualTruth.tsx` | Home editorial/visual narrative section | home content blocks | home surfaces | Visual narrative module | MagazineEngine | MERGE |
| `apps/web/src/components/home/Home1PlatformBelt.tsx` | Content/action belt | home feed summaries | home surfaces | Home belt | CrownOrbitEngine + MagazineEngine | MERGE |
| `apps/web/src/app/admin/articles/page.tsx` | Admin article management page | admin article APIs | `/admin/articles` | Editorial admin | AnalyticsEngine + MagazineEngine ops | MERGE |
| `apps/web/src/app/admin/magazine/page.tsx` | Admin magazine controls | admin feed/settings | `/admin/magazine` | Magazine admin | AnalyticsEngine + MagazineEngine ops | MERGE |
| `apps/web/src/app/admin/editorial/page.tsx` | Editorial administration | admin editorial APIs | `/admin/editorial` | Editorial admin | AnalyticsEngine + MagazineEngine ops | MERGE |
| `Homapge and battle challange and cyphers/TMI_MagazinePageSystem_CopilotDirective.md` | Magazine system design directive | editorial architecture notes | reference asset | Spec doc | MagazineEngine policy source | KEEP |
| `Homapge and battle challange and cyphers/tmi_home1_complete_magazine_orbital_underlay.html` | Home1 magazine/orbital spectacle reference | static html/css/js | reference asset | Design language source | CrownOrbitEngine + MagazineEngine blueprint | REIMAGINE |
| `Homapge and battle challange and cyphers/tmi_home1_orbital_with_underlay_panels.html` | Orbital + panel variant reference | static html/css/js | reference asset | Design variant | CrownOrbitEngine blueprint | REIMAGINE |
| `Homapge and battle challange and cyphers/tmi_complete_all_four_dashboards_v2.html` | Multi-dashboard reference with editorial/telemetry motifs | static html/css/js | reference asset | Design/UX concept | Analytics + Magazine UI blueprint | REIMAGINE |

---

## Editorial channels / issue system notes
- Magazine and article routes are split across `/magazine/*` and `/articles/*`.
- Recommendation: keep both route families but unify content model under MagazineEngine adapters.
- Issue-level + channel-level routing should attach to one canonical editorial dispatcher.

## Entertainment First notes
- Static editorial pages with no participation handoff (e.g., no room entry, no vote, no live next-step) should be REIMAGINE candidates.
- Home1 story surfaces (belt/orbit/underlay) should feed users into live actions:
  - challenge
  - battle
  - cypher
  - watch/live rooms
  - spotlight performers

## Risk level if touched
- Medium: route/content taxonomy (`/magazine/*` + `/articles/*`)
- Medium: Home1 story layers (must preserve containment from Golden build)
- Low/Medium: admin editorial operations pages

## Constraint confirmation
- Inventory/classification only.
- No deletion, no file movement, no refactor implementation in this phase.
