# BUTTON_LEDGER

Date: 2026-06-21
Scope: audited primary pages and hubs.

## Verified Route Targets

| Source Surface | Action Route | Exists | Status |
|---|---|---|---|
| Fan Profile | /vote | Yes | OK |
| Fan Profile | /season-pass | Yes | OK |
| Fan Profile | /account/deactivate | Yes | OK |
| Fan Profile | /shows | Yes | OK |
| Fan Profile | /rankings | Yes | OK |
| Fan Profile | /achievements | Yes | OK |
| Fan Profile | /fan/theater | Yes | OK |
| Performer Profile | /performer/studio | Yes | OK |
| Performer Profile | /booking | Yes | OK |
| Performer Profile | /dashboard/beats | Yes | Legacy route, keep under watch |
| Performer Profile | /nft/mint | Yes | OK |
| Performer HQ | /messages | Yes | OK |
| Performer HQ | /live/rooms | Yes | OK |
| Performer HQ | /rooms/fan-meetup | Yes | OK |
| Communication Dock | /messages/new | Yes | OK |
| Communication Dock | /video/call/new | Yes | OK |
| Communication Dock | /live/rooms | Yes | OK |

## Broken or At-Risk Route Mappings

| Source Surface | Action Route | Exists | Status |
|---|---|---|---|
| Fan HQ seeded cypher watchlist | /cypher/open-fri-night | No | Broken |
| Fan HQ seeded cypher watchlist | /cypher/s2-qualifier | No | Broken |
| Fan HQ seeded cypher watchlist | /cypher/underground-vol7 | No | Broken |
| Fan HQ seeded show card | /shows/nova-cipher-live | No | Broken |
| Fan HQ seeded show card | /shows/cypher-arena-open | No | Broken |
| Fan HQ seeded show card | /shows/season-2-finals | No | Broken |

## Click Behavior Audit

| Surface | Finding | Severity |
|---|---|---|
| Fan HQ | Primary interactions exist but several point to seeded/nonexistent slugs. | High |
| Performer HQ | Most actions route; several panels still static content cards not wired to real data. | Medium |
| Fan Profile | Buttons route correctly, but many cards contain static values. | Medium |
| Performer Profile | Buttons route correctly, but stats and some content blocks are static. | Medium |

## Required P0 Fixes
1. Replace seeded Fan HQ watchlist and show routes with routes produced from real registries.
2. Keep only route-safe cards from real feeds.
3. For unavailable content, show explicit honest card state instead of seeded cards.
