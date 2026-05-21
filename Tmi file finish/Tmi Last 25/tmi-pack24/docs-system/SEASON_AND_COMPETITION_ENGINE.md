# SEASON_AND_COMPETITION_ENGINE.md
## Seasons, Competitions, and Bracket Events
### BerntoutGlobal XXL / The Musician's Index

---

## SEASON STRUCTURE

TMI runs quarterly seasons:
- Season duration: 3 months
- Season name: "Season {year} {quarter}" (e.g., "Season 2026 Q1")
- Each season has its own leaderboard

Season lifecycle:
```
Season opens → ranking bot begins tracking
Throughout season → artists accumulate points from battles/cyphers/streams
Final week → "Finals Week" announced
Finals Week → Top-ranked artists compete in Championship events
Season end → Final rankings locked, awards issued
New season opens → Fresh start (carry-over points: 10%)
```

---

## COMPETITION TYPES

| Type | Format | Bracket |
|---|---|---|
| Solo Battle | 1v1, best of 3 rounds | Single elimination |
| Tag Team Battle | 2v2 | Single elimination |
| Grand Cypher | 8–32 artists, round-robin | Rotating turns |
| Producer Showcase | Producers submit beats, artists vote | No bracket |
| Genre Championship | Genre-specific seasonal event | Double elimination |
| Open Mic Tournament | Anyone enters, judges vote | Single elimination |

---

## BRACKET ENGINE

For single/double elimination events:
```
competition-bracket-bot creates bracket on event creation
As battles complete → bracket updates automatically
Losers notified → Winners advance
Finals reached → championship-room-bot creates final room
Winner determined → results-recap-bot fires
Season points awarded
```

---

## POINTS SYSTEM

| Achievement | Points |
|---|---|
| Cypher participation | 5 |
| Cypher win | 20 |
| Battle win | 50 |
| Battle win (top-ranked opponent) | 75 |
| Tournament runner-up | 100 |
| Tournament champion | 200 |
| Season crown earned | 500 |

---

## ROUTES

`/seasons` — season browser (already in Pack 16)
`/seasons/[slug]` — specific season rankings
`/competitions` — competition browser
`/competitions/[slug]` — competition detail + bracket
`/competitions/[slug]/bracket` — bracket view
`/competitions/[slug]/register` — competition registration
