# Simulation Scenario Catalog

Defines the exact scenarios the Simulation Command Center can launch, either at 1x (human speed) or 12x (workflow speed).

## Normal Speed Scenarios (1x)
1. **Empty World Warmup:** Populates rooms and homepage slots with idle bots to prevent empty states. (Room fill & confidence bots).
2. **Battle Night:** Heavy population in `/rooms/battles/*`. Bots cheer, boo, tip, vote, and select winners. Tests split votes and upsets.
3. **Cypher Night:** Heavy population in `/rooms/cypher/*`. Bots rotate in and out, perform, react, generating room energy.
4. **Social Loop Day:** Focuses on `/fan/*/lobby`. Bots message, invite, become friends, join rooms via invites, and video chat.
5. **Full Scene Occupancy:** Bots fill audience seats, front row, lobbies, and performer boxes, testing visual scaling and seat logic.

## Accelerated Scenarios (12x)
6. **Full Issue Sprint (A & B):** End-to-end magazine cycle. Signups -> Onboarding -> Content Gen -> Top 10 -> Magazine Placement -> Sponsor Fill.
7. **Crown Propagation Sprint:** Specifically tests #1 artist demotion/promotion. Fast-forwards 3-month retention hold to verify fallback logic.
8. **Security Drill:** Bots attempt rapid login, failure, recovery, biometric checks, and generate complaint routing data.
9. **Sponsor Day:** Sponsor bots aggressively fill ad slots, test placements, rotate creatives, and distribute fake prizes.
10. **Commerce Day:** Mass purchasing. Bots buy tracks, instrumentals, works, props, emotes. Exhausts inventory to test "Sold Out" states.
11. **Support Storm:** Injects hundreds of fake complaints. Tests the intake -> classify -> fix router -> Big Ace escalation loop.
12. **Failure Injection Sprint:** Intentionally tests sold-out items, expired auctions, tied votes, fake login attacks, and broken sponsor creatives.
