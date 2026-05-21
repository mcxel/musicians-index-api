# ACTIVITY_FEED_SYSTEM.md
## Social Activity Feed — What's Happening Now
### BerntoutGlobal XXL / The Musician's Index

---

## FEED OVERVIEW

The activity feed shows personalized platform activity:
- Artists you follow going live
- Battle results from artists you follow
- New beats from producers you follow
- Fan club updates from artists you're a member of
- Crown changes
- New articles featuring artists you follow

## FEED ALGORITHM

Feed is ordered by: recency + relationship weight

| Activity | Weight |
|---|---|
| Live room starts (followed artist) | 10 |
| Battle result (followed artist) | 8 |
| Crown change | 7 |
| New beat from followed producer | 6 |
| Fan club post (member) | 6 |
| New article | 5 |
| Artist tier change | 4 |
| New follower of someone you follow | 2 |

Stale feed items (>48h) are collapsed into "Earlier".

## FEED CARD TYPES

Each activity type has its own card component:
- `LiveStartCard` — "Artist X just went live"
- `BattleResultCard` — "[X] defeated [Y] in Battle Room"
- `BeatDropCard` — "[Producer] dropped a new beat"
- `CrownChangeCard` — "[X] just earned the Crown"
- `ArticleCard` — "Featured: [X] in this week's issue"
- `FanClubPostCard` — "[Artist] posted to fan club"

## ROUTES
`/feed` — personalized activity feed
