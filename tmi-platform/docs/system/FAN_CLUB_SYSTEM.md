# FAN_CLUB_SYSTEM.md
## Fan Clubs — Artist Membership Communities
### BerntoutGlobal XXL / The Musician's Index

---

## WHAT IS A FAN CLUB

Every artist on TMI gets a fan club page automatically.
Fans can join, tier up, and unlock exclusive perks.

## FAN CLUB TIERS

| Tier | Price | Perks |
|---|---|---|
| Free Member | $0 | Follow artist, see public posts |
| Supporter | $2.99/mo | Early room notifications, supporter badge |
| VIP | $9.99/mo | Backstage pass invites, exclusive previews, VIP badge |
| Platinum | $24.99/mo | Direct message artist, priority queue access, Platinum badge |

## ARTIST FAN CLUB DASHBOARD

Artists see:
- Total member count by tier
- New members this week
- Revenue from memberships
- Ability to post exclusive content (fan-club-only)
- Send messages to fan club members

## FAN CLUB CONTENT TYPES

Artists can post to their fan club:
- Text updates (fan-club-only posts)
- Exclusive audio previews (not public)
- Backstage pass invites (VIP+ tier only)
- Early access to room schedule
- Behind-the-scenes content

## ROUTES
`/fan-club/{artistSlug}` — public fan club landing page
`/fan-club/{artistSlug}/join` — join/upgrade flow
`/fan-club/{artistSlug}/feed` — member-only feed (auth required)
`/dashboard/fan-clubs` — artist fan club management
