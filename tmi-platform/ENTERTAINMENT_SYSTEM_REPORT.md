# ENTERTAINMENT_SYSTEM_REPORT (Sprint 1B Audit — Inventory Only)

Status: Audit-only (no deletion/refactor/move)  
Date: 2026-06-02  
Lens: Entertainment First + Audience Choice + Big Screen readiness

## Canonical entertainment engine targets (proposed)
- LiveStageRuntime
- AudiencePresenceEngine
- CrownOrbitEngine
- MagazineEngine
- RewardsEngine
- AnalyticsEngine

---

## Entertainment Inventory

| File Path | Purpose | Dependencies | Active Routes | Current System | Proposed Canonical Engine | Class |
|---|---|---|---|---|---|---|
| `apps/web/src/app/challenges/page.tsx` | Challenge experience entry page | challenge components, route hooks | `/challenges` | Challenge page shell | LiveStageRuntime | MERGE |
| `apps/web/src/app/challenge/page.tsx` | Single challenge destination | challenge runtime modules | `/challenge` | Challenge surface | LiveStageRuntime | KEEP |
| `apps/web/src/app/battles/live/page.tsx` | Live battle destination | battle room and vote logic | `/battles/live` | Battle live surface | LiveStageRuntime + AudiencePresenceEngine | KEEP |
| `apps/web/src/app/rooms/cypher/page.tsx` | Cypher arena room entry | room runtime + cypher logic | `/rooms/cypher` | Cypher arena | LiveStageRuntime + AudiencePresenceEngine | KEEP |
| `apps/web/src/components/live/ArenaImmersivePanel.tsx` | Unified arena immersion panel | live/vibe hooks, overlays | battle/challenge/cypher contexts | Arena UI | AudiencePresenceEngine | MERGE |
| `apps/web/src/components/live/StreamWinRoom.tsx` | Competitive stream room | stream-win APIs and room hooks | `/live/rooms/stream-win` | Competition room | LiveStageRuntime | MERGE |
| `apps/web/src/components/live/LiveLobbyWallGrid.tsx` | Event discovery wall/grid | video tiles/live data | live/lobby routes | Lobby/event grid | AudiencePresenceEngine + CrownOrbitEngine feed | KEEP |
| `apps/web/src/components/home/WorldLobbySection.tsx` | Arena triangle and venue entry | room links, CTA rails | `/home/1` | Discovery/action dock | CrownOrbitEngine + LiveStageRuntime entry | KEEP |
| `apps/web/src/components/home/TmiMagazineOrbitalUnderlay.tsx` | Orbital + underlay spectacle | motion, ranking visuals | `/home/1` | Orbital runtime layer | CrownOrbitEngine | KEEP |
| `apps/web/src/components/home/Home1CoverPage.tsx` | Broadcast-style header + status | badges/CTA links | `/home/1` | Header runtime | CrownOrbitEngine + MagazineEngine | KEEP |
| `apps/web/src/app/magazine/page.tsx` | Magazine index | article modules | `/magazine` | Editorial discovery | MagazineEngine | KEEP |
| `apps/web/src/components/magazine/MagazineEditorialSpread.tsx` | Magazine spread UI | editorial data | magazine/article routes | Editorial spread | MagazineEngine | KEEP |
| `apps/web/src/app/live/rooms/[id]/page.tsx` | Core live room surface | rtc/lobby/live components | `/live/rooms/[id]` | Live room runtime | LiveStageRuntime + VideoSessionEngine | KEEP |
| `apps/web/src/app/live/lobby-wall/page.tsx` | Live lobby wall page | lobby wall grid | `/live/lobby-wall` | Lobby wall route | AudiencePresenceEngine | KEEP |
| `apps/web/src/app/battles/lobby-wall/page.tsx` | Battle discovery wall | battle feeds, tiles | `/battles/lobby-wall` | Battle lobby wall | AudiencePresenceEngine | MERGE |
| `apps/web/src/app/challenges/lobby-wall/page.tsx` | Challenge discovery wall | challenge feeds, tiles | `/challenges/lobby-wall` | Challenge lobby wall | AudiencePresenceEngine | MERGE |
| `apps/web/src/app/cypher/lobby-wall/page.tsx` | Cypher discovery wall | cypher feeds, tiles | `/cypher/lobby-wall` | Cypher lobby wall | AudiencePresenceEngine | MERGE |
| `apps/web/src/app/games/lobby-wall/page.tsx` | Games discovery wall | games feeds/tiles | `/games/lobby-wall` | Games lobby wall | AudiencePresenceEngine | MERGE |
| `apps/web/src/app/admin/observatory/page.tsx` | Live admin observability | admin telemetry APIs | `/admin/observatory` | Passive data-heavy dashboard | AnalyticsEngine + REIMAGINE for participation | REIMAGINE |

---

## Entertainment First notes
- KEEP systems are those directly tied to participation loops:
  - entering arenas
  - watching/interacting in live rooms
  - voting/discovery walls
  - real-time content updates
- MERGE where duplicate discovery walls exist across battle/challenge/cypher/games; unify as AudiencePresenceEngine variants.
- REIMAGINE passive admin/event dashboards so they can drive actionable “what’s happening now” workflows.

## Audience Choice + fame vectors (observed)
- Battle/challenge/cypher routes already establish competitive pathways.
- Home1 orbit + lobby walls can be consolidated into a canonical discovery and ranking narrative.
- Winner/fame mechanics should align into shared RewardsEngine + analytics telemetry.

## Risk level if touched
- High: live room route/runtime (`/live/rooms/[id]`), battle/challenge/cypher routes.
- Medium: discovery wall pages (multiple variants).
- Medium: Home1 spectacle components if containment is bypassed.

## Constraint confirmation
- No code modified/deleted/moved in this report generation.
- Audit-only classification output.
