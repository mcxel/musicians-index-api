# BEAT_MARKETPLACE_SYSTEM.md
## Beat Marketplace — Producers License Beats to Artists
### BerntoutGlobal XXL / The Musician's Index

---

## MARKETPLACE OVERVIEW

Producers can list beats for licensing. Artists browse, preview, and license beats directly on the platform.

## BEAT LISTING FIELDS

| Field | Required | Notes |
|---|---|---|
| Title | ✅ | Beat name |
| Genre | ✅ | Hip Hop, Trap, R&B, Pop, Afrobeat, etc. |
| BPM | ✅ | Tempo |
| Key | ✅ | Musical key |
| Tags | Optional | Mood, vibe, instruments |
| Audio preview | ✅ | 30-second untagged preview (MP3) |
| Tagged demo | ✅ | Full beat with producer tag |
| License types | ✅ | Basic, Premium, Exclusive |
| Price | ✅ | Per license type |

## LICENSE TYPES

| License | Price Range | Usage Rights |
|---|---|---|
| Basic (MP3) | $10–$50 | Non-commercial, streaming up to 10k streams |
| Premium (WAV) | $50–$200 | Commercial, unlimited streams, 1 artist |
| Exclusive | $200–$2000+ | Full exclusive ownership, negotiated |

## BEAT PREVIEW IN ROOMS

Producers can cast their marketplace beats into rooms.
Beat preview in room is tagged (watermarked).
Artist licenses the beat to unlock clean version.

## SEARCH AND DISCOVERY

- Genre filter
- BPM range slider
- Mood tags
- Producer filter
- Price range filter
- "Trending beats" (most previewed this week)
- "New releases" (last 7 days)

## ROUTES
`/beats` — beat marketplace home (browse all)
`/beats/[slug]` — individual beat detail + license purchase
`/producers/[slug]/beats` — producer's beat catalog (already exists)
`/dashboard/beats` — producer beat management dashboard
