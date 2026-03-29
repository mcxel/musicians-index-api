# SYSTEM_BINDING_TABLE.md
## Maps Every System to Its Route, Data Source, and Role Access

---

## BINDING TABLE

| System | Repo Folder | UI Route | API Route | Data Source | Role Access |
|---|---|---|---|---|---|
| Cast Bible | `docs/cast/core` | N/A | N/A | docs | Admin only |
| Host Rotation | `docs/cast/systems` | `/shows/[id]` | `GET /api/cast/host` | DB events | Big Ace |
| Julius Engine | `docs/cast/julius` | All pages | N/A | Config | All roles |
| VEX System | `docs/cast/vex` | `/shows/[id]` | `POST /api/vex/trigger` | Show engine | Big Ace |
| Show Engine | `docs/cast/shows` | `/shows/[id]` | `GET /api/shows/[id]` | DB shows | All roles |
| Audio Engine | `docs/cast/audio` | All pages | `GET /api/audio/[show]` | Audio assets | All roles |
| Venue Engine | `docs/cast/venues` | `/rooms/[id]` | `GET /api/venues/[id]` | DB venues | All roles |
| Dashboard | `apps/web/src/app/(dashboard)` | `/dashboard` | `GET /api/dashboard/overview` | DB + logs | Roles |
| Marcel Dashboard | `apps/web/src/app/(dashboard)` | `/dashboard/marcel` | `GET /api/dashboard/overview` | Scoped | Marcel |
| Suggestions | `apps/api/src/modules/dashboard` | `/dashboard` | `POST /api/dashboard/suggestion` | DB | Marcel, Advisor |
| Commands | `apps/api/src/modules/dashboard` | `/dashboard` | `POST /api/dashboard/command` | Queue | Marcel |

---

# ROUTE_TO_SYSTEM_MATRIX.md
## What Each Page Route Uses

---

## ROUTE BINDINGS

| Route | Systems Active | Host? | Julius? | VEX? | Audio? |
|---|---|---|---|---|---|
| `/` | Magazine engine, Live Cover | No | Passive | No | Ambient |
| `/preview` | Preview stack wall | No | Explorer | No | Ambient |
| `/shows/[id]` | Show engine, Venue, Cast | Host | Crowd mode | If elimination | Full |
| `/artists/[slug]` | Artist hub | No | Helper | No | Minimal |
| `/articles/[slug]` | Article engine | No | Quiet | No | Minimal |
| `/billboard` | Billboard engine | No | Helper | No | Ambient |
| `/rooms/[id]` | Venue engine | Host (if show) | Context | If show | Full |
| `/dashboard` | Dashboard engine | No | No | No | None |
| `/dashboard/marcel` | Scoped dashboard | No | No | No | None |
| `/onboarding` | Onboarding system | No | Helper | No | Welcome |
| `/store` | Store engine | Julius | Helper | No | Ambient |

---

# HOST_TO_ROUTE_BINDINGS.md
## Where Each Host Appears in the App

---

| Host | Primary Route | Secondary Routes | Never Appears On |
|---|---|---|---|
| Bobby Stanley | `/shows/deal-or-feud` | `/shows/battles/*`, `/shows/cyphers/*` | Dashboard, articles |
| Timothy Hadley | `/shows/circles-squares` | `/shows/battles/*`, `/shows/cyphers/*` | Dashboard, articles |
| Meridicus James | `/shows/monthly-idol` | `/shows/battles/*`, `/shows/cyphers/*` | Dashboard, articles |
| Aiko Starling | `/shows/monthly-idol` | `/shows/battles/*`, `/shows/cyphers/*` | Dashboard, articles |
| Zahra Voss | `/shows/monthly-idol` | `/shows/battles/*` | Dashboard, articles |
| Nova Blaze | `/shows/monday-night` | All rotation shows | Dashboard, articles |
| Julius | All routes | Context-aware mode | None (floating everywhere) |
| VEX | `/shows/monday-night` | Any show with elimination | Non-show pages |

---

# MASTER_CANON_INDEX.md
## Official Registry of All Approved Systems

---

## CAST — APPROVED
- [x] Bobby Stanley
- [x] Timothy Hadley
- [x] Meridicus James
- [x] Aiko Starling
- [x] Zahra Voss
- [x] Nova Blaze
- [x] Julius (AR meerkat)
- [x] VEX-9 (Stage Sweeper Robot)

## SHOWS — APPROVED
- [x] Deal or Feud 1000
- [x] Circles & Squares
- [x] Monthly Idol
- [x] Marcel's Monday Night Stage
- [x] Battles (singer, drummer, dancer, comedian, pianist)
- [x] Cyphers
- [x] Dirty Dozen

## VENUE TYPES — APPROVED
- [x] Amphitheater
- [x] Concert Hall
- [x] Arena
- [x] Basement
- [x] Warehouse
- [x] Bar
- [x] Night Club
- [x] VIP Room
- [x] Cypher Arena
- [x] Battle Stage
- [x] Prize Showroom
- [x] Vault Room
- [x] Trophy Hall

## SYSTEMS — APPROVED
- [x] Show Engine
- [x] Audio Engine
- [x] Venue Engine
- [x] Host Chatbot Engine
- [x] Julius Behavior Engine
- [x] VEX Costume Engine
- [x] Host Rotation Engine
- [x] Cast Memory Core
- [x] Cast Analytics
- [x] Wardrobe Engine
- [x] Performance Budget System
- [x] Fallback Hierarchy
- [x] Role/Permission System

## BOTS — APPROVED
- [x] Build Gate Bot
- [x] Route Binding Bot
- [x] Contract Bot
- [x] Proof Gate Bot
- [x] Performance Budget Bot
- [x] Visual Drift Bot
- [x] Julius Timing Bot
- [x] VEX Costume Bot
- [x] Host Rotation Bot
- [x] Cast Director Bot
- [x] Audio Director Bot

---

*System Binding Table + Route Matrix + Canon Index v1.0 — BerntoutGlobal XXL*
