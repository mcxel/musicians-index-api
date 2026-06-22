# DISCOVERY CERTIFICATION REPORT

Date: 2026-06-22
Scope: live visibility on Home/Billboard/Discovery/Fan HQ/Performer HQ

## WORKING
- Live session registration/listing is centralized in [apps/web/src/app/api/live/go/route.ts](apps/web/src/app/api/live/go/route.ts) and includes discoverability verification before reporting success.
- Fan HQ pulls live sessions from /api/live/go and surfaces current live tile in [apps/web/src/components/fan/FanHQShell.tsx](apps/web/src/components/fan/FanHQShell.tsx).
- Fan discovery dock polls /api/live/go and routes users into live rooms in [apps/web/src/components/hubs/DiscoveryDockPanel.tsx](apps/web/src/components/hubs/DiscoveryDockPanel.tsx).
- Performer opportunity dock polls /api/live/go for battle/cypher/challenge room opportunities in [apps/web/src/components/hubs/OpportunityDockPanel.tsx](apps/web/src/components/hubs/OpportunityDockPanel.tsx).

## PARTIALLY WORKING
- Viewer count rendering in discovery is now corrected to non-misleading values, but there are still multiple discovery/lobby surfaces in repo that may diverge from canonical dock behavior over time.
- Fan hub route currently returns the new shell immediately in [apps/web/src/app/hub/fan/page.tsx](apps/web/src/app/hub/fan/page.tsx), leaving legacy code below return unreachable. Runtime works, but file-level clarity is reduced.

## BROKEN
- None observed in canonical /api/live/go discovery flow.

## MISSING
- One explicit route ledger enforcing a single canonical discovery implementation across older legacy components/routes is still missing.

## CERTIFICATION STATUS
- Pass with risk. Discovery is functional in canonical HQ docks and live registry path, with residual duplication/unreachable-code risk.
