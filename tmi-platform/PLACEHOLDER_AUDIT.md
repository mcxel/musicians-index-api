# PLACEHOLDER_AUDIT

Date: 2026-06-21

## Confirmed Placeholder/Mock Sources

### Home 1-2
- Seed sponsor rail still present in route file.
- Multiple fallback image placeholders still used (acceptable as fallback only).
- Honest empty ranking states are present (good).

### Fan HQ
- Active seed blocks:
  - SEED_BADGES
  - SEED_REWARDS
  - SEED_ARTISTS
  - SEED_VOTED_BATTLES
  - SEED_TRANSACTIONS
  - SEED_SEASON_PASS
- Hardcoded identity still used on route:
  - demo-fan user id references.
- Seeded route cards include non-existent slugs (broken links).

### Performer HQ
- Static monitor fallback image path is used as default.
- Static merch wall sample cards remain (Crown Tee, Beat Pack, NFT Drop with em dash prices).
- Several panels show static counts.

### Fan Profile
- Static stat cards use literal values (0, 0h).
- Activity and upcoming sections are placeholder text blocks (honest, but not connected).

### Performer Profile
- Static stat cards use literal values (rank dash, xp 0, earnings $0).
- Upcoming shows/records are mostly shell states.

## Placeholder Policy
Allowed:
- Honest empty state
- Honest loading state
- Honest error state

Not allowed:
- Seed personas shown as real user data
- Seed rankings shown as live rankings
- Seed route cards linking to non-existent routes
- Fake metrics presented as current platform truth

## P0 Removal Queue
1. Replace all SEED_* Fan HQ blocks with real engine-backed queries.
2. Replace demo-fan hardcoding with authenticated user id propagation.
3. Remove Fan HQ cards that map to missing route slugs.
4. Convert static profile stat cards to real metrics, or explicitly empty placeholders with no fake values.
5. Convert Performer HQ static merch/pricing cards to real store inventory feed or explicit empty inventory state.
