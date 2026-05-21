# Issue Sprint Map

Maps the exact flow of an "Issue Cycle" (Magazine/Platform Content refresh). This represents the sequence executed during a 12x Accelerated Issue Sprint.

## 1. Population & Content Generation
- New Fan/Performer signups generated.
- Profiles completed (bios, avatars).
- Performers upload new works, tracks, and beats.
- Article draft generation (Simulated text/images).

## 2. Platform Activity Phase
- Bots generate heavy room activity, battles, and cyphers.
- Voting and reaction volumes surge.
- Tips and purchases happen rapidly via fake wallets.

## 3. Ranking & Editorial Phase
- `top10-ranking.engine` calculates new Top 10 based on Phase 2.
- #1 Artist is crowned.
- Feature slots and recap slots assigned.

## 4. Placement & Publishing Phase
- Magazine Cover candidate selected.
- Article placement propagated to `/home/*`.
- Sponsor placeholders replaced with simulated ad buys.
- Issue surfaces rotated and marked `Live`.

## 5. Expiration & Archival Phase
- Fast-forward timeline.
- Retire completed issue state.
- Retain #1 artist for 3 months (simulated hold).
- Archive old recaps.

## Audit Findings
- **Data Boundary:** This entire sprint MUST run in a `simulation_only` database schema/table set to avoid corrupting real editorial issues.
- **Engine Missing:** `magazine-issue-placement.engine` and `issue-sprint.engine` are currently unwritten.
