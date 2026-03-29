# Route / Data / Role Bindings

This table maps existing major routes to UI surfaces, data sources, role access, related documentation packs, and proof gates.

## Role Control Baseline

- Big Ace: full control.
- Marcel Dickens: analytics + suggestions + safe command requests only.
- Jay Paul Sanchez: analytics + suggestions only.

## Route Binding Matrix

| Route | UI surface | Data source | Role access | Related docs pack | Proof gate |
|---|---|---|---|---|---|
| `/` | Home/dashboard entry | server-rendered app state + public content APIs | Public | `docs/venues`, `docs/live` | Page load + no console error |
| `/hub` | Hub aggregator | app server state | Authenticated user | `docs/final-system` | Route render + auth redirect checks |
| `/auth` | Auth gateway | auth providers/session endpoints | Public | `docs/cast` (host behavior around auth prompts) | login/register success |
| `/dashboard` | Main dashboard router | session + role context | Authenticated user | `docs/final-system` | role route routing works |
| `/dashboard/admin` | Admin dashboard | privileged analytics + control APIs | Big Ace full; Marcel safe command only; Jay read/suggest only | `docs/cast`, `docs/final-system` | role guard + restricted actions |
| `/dashboard/artist` | Artist dashboard | artist profile + performance/contest data | Artist, Admin | `docs/venues`, `docs/live` | artist auth + data render |
| `/dashboard/fan` | Fan dashboard | audience/feed/game state | Fan, Admin | `docs/live`, `docs/venues` | fan auth + feed render |
| `/contest` | Contest entry surface | contest APIs (`/api/contest/*`) | Public/auth depending component | `docs/venues/tmi-rooms`, `docs/live` | contest page smoke |
| `/contest/qualify` | Qualification flow | sponsor + qualification APIs | Authenticated artist/admin | `docs/venues`, `docs/final-system` | qualify flow pass |
| `/contest/leaderboard` | Contest ranking board | leaderboard endpoints + cached metrics | Public | `docs/live`, `docs/final-system` | leaderboard data present |
| `/contest/host` | Host stage page | host cue/event streams | Host/admin roles | `docs/cast`, `docs/live` | cue render + state sync |
| `/contest/sponsors` | Sponsor discovery | sponsor APIs | Artist/admin | `docs/venues`, `docs/final-system` | sponsor list load |
| `/contest/admin` | Contest admin control | contest admin APIs | Big Ace full; Marcel safe-only; Jay read/suggest-only | `docs/cast`, `docs/final-system` | admin permission matrix |
| `/contest/admin/contestants` | Contestant review queue | contest admin APIs | Big Ace full; Marcel/Jay read+suggest | `docs/final-system` | restricted write actions |
| `/contest/admin/sponsors` | Sponsor approvals queue | sponsor admin APIs | Big Ace full; Marcel/Jay read+suggest | `docs/final-system` | restricted approve actions |
| `/contest/admin/reveal` | Winner/admin reveal | reveal event + state data | Big Ace full; limited view by role | `docs/live`, `docs/final-system` | reveal flow smoke |
| `/contest/rules` | Rules static/managed page | static docs + CMS source | Public | `docs/venues` | content render |
| `/contest/season/[seasonId]` | Season landing | season API + content | Public/auth | `docs/venues`, `docs/live` | dynamic route render |
| `/contest/season/[seasonId]/archive` | Season archive | season archive API | Public | `docs/live`, `docs/final-system` | archive render |
| `/games` | Game hub | game metadata + session state | Authenticated/public by feature | `docs/live`, `docs/venues` | game page smoke |
| `/streamwin` | Stream-and-win flow | stream/game services | Authenticated user | `docs/live`, `docs/final-system` | stream flow smoke |
| `/room/bar-stage` | Venue room experience | room engine + crowd/state feeds | Authenticated | `docs/venues/tmi-rooms`, `docs/live` | room render + seat anchor checks |
| `/articles/[slug]` | Article detail | article content APIs | Public | `docs/live` (event tie-ins), `docs/venues` | article render |
| `/artists` | Artist directory | artist list APIs | Public | `docs/venues` | directory load |
| `/onboarding` | Onboarding router | onboarding state APIs | Authenticated new users | `docs/final-system`, `docs/cast` | onboarding step progression |
| `/onboarding/artist` | Artist onboarding | profile + onboarding APIs | Artist/admin | `docs/final-system` | artist onboarding proof |
| `/onboarding/fan` | Fan onboarding | profile + onboarding APIs | Fan/admin | `docs/final-system` | fan onboarding proof |
| `/admin` | Legacy admin entry | admin services | Big Ace full; Marcel safe-only; Jay analytics-only | `docs/final-system` | role guard |
| `/admin/promos` | Promotion controls | promo APIs | Big Ace full; Marcel suggest/safe requests | `docs/live`, `docs/final-system` | promotion controls restricted |
| `/admin/refunds` | Refund workflows | billing/refund APIs | Big Ace full; Marcel/Jay analytics + suggestions | `docs/final-system` | refund permissions |

## Binding Notes

- This file is route-level documentation binding only; no code routing was changed in this pass.
- Data source labels are logical source groups; endpoint-level wiring remains a later implementation step.
- Apply one-surface-at-a-time wiring after Cloudflare install/build configuration is stable.
