# TMI Complete Venue & Lobby System
**BerntoutGlobal · The Musician's Index**

## Live Lobby Walls Built
| Event | Color Theme | Description |
|-------|------------|-------------|
| TMI Live Hub | Red/Gold | Master hub, discovery-first sorting |
| Cypher Arena | Purple/Gold | Drop bars, freestyle, XP per session |
| Battle Grounds | Red/White | 1v1, Best of 5, live judge scoring |
| Challenges | Cyan/Orange | Weekly drops, leaderboard |
| Fan Lives | Pink/Gold | Public go-live, avatar video widgets |
| Live Concerts | Orange/Gold | Full artist show streams |
| World Releases | Cyan/White | World premiere drops, countdowns |
| Monday Night Stage | Blue/Gold | Weekly flagship, 8PM EST |
| World Dance Party | Magenta/Cyan | Global dance floor, DJ sets |
| Dirty Dozens | Green/Gold | 12-round elimination format |
| The Dance Off | Pink/Orange | Crew + solo competition |

## Venue Skins (31 total)
### Theater (4): Classic Theater (FREE), Concert Hall, Lecture Hall, Church Hall
### Arena (3): Stadium Arena, Split Arena, Amphitheater
### Club (2): Luxury Nightclub, Basement Club
### Game Show (10): Box Show Stage, Trivia Arena, Quiz Podiums, Neon Color Studio,
###   Talk Show Lounge, Judging Panel, Neon Podium Stage, Pixel Screen Studio,
###   LED Debate Room, Prize Stage, Purple Studio
### Battle (2): Battle Octagon, Versus Arena
### Cypher (1): Cypher Circle
### Outdoor (3): Festival Stage, City Rooftop, Mountain Amphitheater
### Special (6): Monday Night Stage, Dance Party Floor, World Release Room,
###   Dirty Dozens Arena, Dance Off Stage

## Color Variants (10 per skin)
TMI Red, Deep Purple, Ocean Blue, Gold Rush, Forest, Hot Pink, Teal Storm,
Space Gray, Neon Cyan, Royal

## Purchase System
- PunPoints: 0 (free) to 6,000 pts
- Cash: $0 (free) to $11.99
- Platform Law #5: Big Ace approval required for all cash payouts

## Seating Arrangements
- tiered-rows (theater, concert hall, lecture hall)
- stadium-wrap (arena, 360 seating)
- tables (nightclub, lounge)
- standing (festival, dance floor, outdoor)
- circular (box show, cypher)
- podiums (quiz, trivia, game shows)
- ring-side (battle octagon)
- judging (curved desk, Idol-style)

## Audience Engine
All venues share the same audience engine (AudienceScene.jsx):
- Fan View: back-of-head perspective looking at screen
- Performer View: front-facing crowd looking at you
- Crowd actions: Wave, Jump, Hype, 8 reaction buttons
- Venue types: theater, arena, club, gameshow, battle, cypher, dance, outdoor, release

## File Locations
- TMI_VenueSystem.html — standalone HTML, open in any browser
- AudienceScene.jsx — React component for apps/web
- shared/tmiTokens.js — design tokens
- shared/components.jsx — shared UI primitives

## Platform Laws Active
- Law #1: Discovery-first room sorting (pnpm test:discovery)
- Law #2: Diamond tier hardcoded for Marcel + B.J. M Beat
- Law #5: Big Ace approval for all cash payouts
