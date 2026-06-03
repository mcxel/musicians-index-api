# ROUTE_TRUTH_TABLE

## Flow Lock Pass (Home 1 + Orbital + World Lobby)

| Current Route | Current Component | Target Route | Target Component | Status |
|---|---|---|---|---|
| `/rooms/challenge-arena` | Legacy room entry (manual/legacy seat flows possible) | `/challenge` | Challenge entry shell (flow-lock canonical) | TO PATCH |
| `/rooms/challenge-arena?autoSeat=1` | `Home1CoverPage`, `TmiMagazineOrbitalUnderlay`, `WorldLobbySection` links | `/challenge` | Challenge entry shell (flow-lock canonical) | TO PATCH |
| `/rooms/cypher?autoSeat=1` | `Home1CoverPage`, `TmiMagazineOrbitalUnderlay`, `WorldLobbySection` links | `/rooms/cypher?autoSeat=1` | ArenaEventShell-backed room | KEEP |
| `/battles/live` | `TmiMagazineOrbitalUnderlay`, `WorldLobbySection` links | `/battles/live` | ArenaEventShell-backed battle route | KEEP |
| `/rooms/world-concert?autoSeat=1` | `WorldLobbySection` venue card | `/rooms/world-concert?autoSeat=1` | ArenaEventShell-backed room | KEEP |
| `/rooms/monthly-idol?autoSeat=1` | `WorldLobbySection` venue card | `/rooms/monthly-idol?autoSeat=1` | ArenaEventShell-backed room | KEEP |
| `/rooms/dirty-dozens?autoSeat=1` | `WorldLobbySection` venue card | `/rooms/dirty-dozens?autoSeat=1` | ArenaEventShell-backed room | KEEP |
| `/rooms/monday-stage?autoSeat=1` | `WorldLobbySection` venue card | `/rooms/monday-stage?autoSeat=1` | ArenaEventShell-backed room | KEEP |
| `/rooms/world-dance-party?autoSeat=1` | `WorldLobbySection` venue card | `/rooms/world-dance-party?autoSeat=1` | ArenaEventShell-backed room | KEEP |
| `/live/rooms` | `WorldLobbySection` bottom nav | `/live/rooms` | Live room index | KEEP |
| `/rooms/world-dance-party` (no autoSeat) | `WorldLobbySection` bottom nav | `/rooms/world-dance-party?autoSeat=1` | ArenaEventShell-backed room (auto-seat) | TO PATCH |
| `/rankings` | rankings route (SSR deploy-failing path per report) | `/rankings` | rankings route with flat links / valid handlers | TO PATCH (separate file audit required) |

## Notes

- ArenaEventShell must remain the sole venue interior renderer.
- No Home 1 CTA should point to legacy lobby-shell or manual seat-grid entry paths.
- Middleware currently does not strip unknown params and should permit `autoSeat=1` as-is.
