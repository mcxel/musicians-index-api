# Route Ownership Map

This document maps all major routes in the TMI Platform, their purpose, owner system, and tracks their readiness for simulation and visual completion.

| Route | Purpose | Owner System | Simulation Covered | Button Audit | Visually Complete |
| :--- | :--- | :--- | :---: | :---: | :---: |
| `/home/1`..`/home/5` | Curated editorial homepages (Motion cards, live pulse) | Editorial Engine | ❌ | ❌ | ✅ (Pending Visual QA) |
| `/store/tracks` | Primary storefront for track sales | Commerce Engine | ❌ | ❌ | ⚠️ |
| `/store/works` | Storefront for works & props | Commerce Engine | ❌ | ❌ | ⚠️ |
| `/store/instrumentals` | Storefront for instrumentals | Commerce Engine | ❌ | ❌ | ⚠️ |
| `/beats/marketplace` | General beat market & discovery | Commerce Engine | ❌ | ❌ | ⚠️ |
| `/beats/auctions` | Live multi-bid auctions for beats | Auction Engine | ❌ | ❌ | ❌ |
| `/rooms/cypher/*` | Live turn-based performance rooms | Presence/Live Engine | ❌ | ❌ | ⚠️ |
| `/rooms/battles/*` | Competitive voting/judging rooms | Presence/Live Engine | ❌ | ❌ | ⚠️ |
| `/rooms/world-dance-party` | High-capacity global social event space | Presence/Live Engine | ❌ | ❌ | ❌ |
| `/fan/[slug]/lobby` | Fan-specific landing and social hub | Social Engine | ❌ | ❌ | ⚠️ |
| `/performer/[slug]/hub` | Performer dashboard and performance hub | Social Engine | ❌ | ❌ | ⚠️ |
| `/stations/[slug]` | Dedicated station landing and broadcast view | Broadcast Engine | ❌ | ❌ | ❌ |
| `/live/preview-board` | Active streams & rooms directory | Live Engine | ❌ | ❌ | ⚠️ |
| `/wallet` | Financial center (Fake/Real economy) | Finance/Economy | ❌ | ❌ | ⚠️ |
| `/tickets` | Upcoming event access management | Commerce Engine | ❌ | ❌ | ❌ |
| `/season-pass/progression` | Tiered progression & unlocks | Progression Engine | ❌ | ❌ | ❌ |
| `/sponsors/*` | Placements and analytics for sponsors | Advertiser Engine | ❌ | ❌ | ❌ |
| `/admin/simulation` | Primary Simulation Control Center | Admin/QA Engine | ❌ | ❌ | ❌ |
| `/admin/rankings` | Manual override & chart supervision | Admin/Editorial | ❌ | ❌ | ❌ |
| `/admin/issues` | Content lifecycle & issue sprints | Admin/Editorial | ❌ | ❌ | ❌ |
| `/admin/support` | Ticket triage & bot routing logs | Admin/Support | ❌ | ❌ | ❌ |

## Missing & Broken Links Audit
- **Simulation Control Center**: Routes do not exist yet (`/admin/simulation/*`).
- **Auction Engine**: Needs deep simulation coverage (`/beats/auctions`).
- **Stations**: Routes (`/stations/*`) require visual and wiring pass.
