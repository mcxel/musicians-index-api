# Wiring Index

This file maps imported documentation packs to intended wiring surfaces, with explicit state markers.

## Docs Packs

| Docs path | Scope | State |
|---|---|---|
| `tmi-platform/docs/cast` | Existing cast docs + prior `tmi-cast` import | partial |
| `tmi-platform/docs/cast/tmi-cast2` | New cast2 pack (hosts/Julius/VEX/governance supporting docs) | partial |
| `tmi-platform/docs/venues/tmi-rooms` | Room-first venue and tier docs | partial |
| `tmi-platform/docs/live/tmi-live-finish12` | Live venue/event docs (copy A) | imported |
| `tmi-platform/docs/live/tmi-live-last10` | Live venue/event docs (copy B) | imported |
| `tmi-platform/docs/final-system/tmi-final` | Sync/state/failure/deploy/final-control docs | partial |
| `tmi-platform/docs/source-material/imported/2026-03-20` | Raw source files and zips (not wired) | imported |

## Mapping Intent

- `docs/cast` → host system, Julius, VEX, governance, role-control specs.
- `docs/venues` → room packs, seating maps, sightlines, stage/screen, room evolution.
- `docs/live` → cypher, battle, livestream venue patterns and live production flow.
- `docs/final-system` → global state, realtime sync, failure handling, deployment/test matrices.
- `docs/source-material/imported/2026-03-20` → raw references and archives only.

## Approval State

### Approved (for documentation staging)
- Pack placement under `docs/cast`, `docs/venues`, `docs/live`, `docs/final-system`.
- Raw source preservation under `docs/source-material/imported/2026-03-20`.

### Partial (needs normalization/review before code wiring)
- `docs/cast` and `docs/cast/tmi-cast2` contain partial/inconsistent coverage.
- `docs/venues/tmi-rooms` currently lacks a distinct `diamond-tier` folder.
- `docs/final-system/tmi-final` contains broad docs but not yet route/component bound.

### Not Yet Wired
- No direct code binding applied in this pass.
- No route-level or API-level code refactors performed in this pass.
- No deployment config files were rewritten in this pass.

## Role Lock (Governance)

- Big Ace: full control.
- Marcel Dickens: analytics + suggestions + safe command requests only.
- Jay Paul Sanchez: analytics + suggestions only.
