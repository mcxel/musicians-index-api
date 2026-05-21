# HOMEPAGE_SYSTEM_COMPLETE.md
## All Three Home Pages — Full Specification
## Based on: Tmi_Homepage_1.png / Tmi_Homepage_2.png / Tmi_Homepage_3.png

---

## PLATFORM SLOGAN: "This is your stage, be original."

---

# HOME PAGE 1 — THE MAGAZINE COVER

## What It Is
The front cover of the digital magazine.
Rotates weekly around the #1 Crown Winner at center.
Artists ranked #2–#10+ orbit the center like a real magazine cover collage.
This is NOT a navigation page. It is a COVER.

---

## LAYOUT (From Tmi_Homepage_3.png)

```
╔══════════════════════════════════════════╗
║  THE MUSICIAN'S INDEX (masthead)         ║
║  "Who took the crown this week?"         ║
╠══════════════════════════════════════════╣
║                                          ║
║   #2        [LOGO CENTER]      #6        ║
║                                          ║
║   #5   #4   [#1 ARTIST]   #7   #3       ║
║              CENTER                      ║
║   #3        Weekly Cyphers!    #6        ║
║                                          ║
╠══════════════════════════════════════════╣
║  ⚡ Weekly Cyphers! — Who took the crown?║
╚══════════════════════════════════════════╝
```

---

## COVER ELEMENTS

### Center (#1 Crown Winner)
- Large portrait (full face)
- Animated 6-second motion clip
- Crown glow animation
- Rank badge `#1`
- Genre tag
- Points / weekly score
- "Crown Holder This Week" label

### Surrounding Artists (#2–#10)
- Smaller portraits around the center
- 3-second micro-motion loops
- Rank numbers in corners
- Hover → play motion preview
- Click → open artist preview lobby (NOT profile directly)

### Cover Text (Magazine Style)
- "Who took the crown this week?"
- Issue title: "Current Week"
- Weekly Cyphers callout
- Comic-style insert (funny/fun teaser — corner panel)
- Sponsor/brand mark (bottom)

---

## COVER NAVIGATION RULES

From the Cover, users can jump to:
- "Start Reading Issue" → Homepage 2
- "Enter Live World" → Homepage 3  
- Weekly Crown Winner profile (click #1)
- Genre quick-links (bottom strip)

Users CANNOT jump to:
- Random article pages directly
- Deep artist pages without going through issue

---

## COVER COLOR SYSTEM (From Mockup)
- Background: Purple + Teal + Gold geometric shapes
- Artist portraits: cutout collage style
- Accent: Lightning bolts ⚡, triangles ▲
- Text: Bold, high-contrast, magazine poster font
- Numbers: Large, colored rank numbers

---

## CROWN ROTATION RULE (LOCKED)

```
RULE 1: Artist can hold #1 for MAX 8 weeks (2 months)
RULE 2: After 8 weeks → forced rotation to #2
RULE 3: Original #1 drops to #2 or #3
RULE 4: Cannot immediately reclaim #1 — must wait 4 weeks
RULE 5: System tracks: times at #1 per year → awards
```

### Yearly Crown Award
| Times at #1/Year | Award |
|---|---|
| 1–2 times | Bronze Crown Badge |
| 3–4 times | Silver Crown Badge |
| 5+ times | Gold Crown Badge + Hall of Fame nomination |
| 8+ times | Platinum Crown + Artist of the Year |

### Crown Transition Animation
```
1. Current #1 begins "glowing down"
2. Crown floats to new #1
3. New #1 center portrait expands
4. Confetti burst
5. All surrounding portraits reposition
6. Celebration sound plays
7. Homepage updates live
```

---

# HOME PAGE 2 — LIVE WORLD (ACTIVITY HUB)

## What It Is
The real-time pulse of the platform.
What's happening RIGHT NOW.
Dark background, high-energy, neon-accented.
(From Tmi_Homepage_2.png)

---

## LAYOUT (From Tmi_Homepage_2.png)

```
╔══════════════════════════════════════════════════╗
║  [LOGO]  Issue: Current Week  [Crown] [🔍][🔔][👤]║
╠══════════════════════════════════════════════════╣
║  LIVE WORLD (ACTIVITY BELT)         ⚡           ║
╠═══════════════════════════╦══════════════════════╣
║  MAIN PREVIEW LOBBY       ║  LOBBY WALL           ║
║  [● LIVE] Big artist card ║  [LIVE][LIVE][LIVE]  ║
║  Full video preview       ║  [LIVE][LIVE][LIVE]  ║
║  with performer visible   ║  [LIVE][LIVE][LIVE]  ║
╠═══════════════════════════╩════════╦═════════════╣
║   #1    #2                         ║  JOIN        ║
║                                    ║  RANDOM      ║
║                                    ║  ROOM ⭐     ║
╠══════════════════════════════════════════════════╣
║  DISCOVERY BELT (Trends & Events)               ║
╠═══════════════════════════╦══════════════════════╣
║  WORLD PREMIERES           ║  EVENT CALENDAR      ║
║  Upcoming exclusive drop   ║  Concerts            ║
║  01:14:32:05 countdown     ║  Saturday            ║
║  [album art preview]       ║  Wednesday           ║
╠═══════════════════════════╩══════════════════════╣
╠═══════════════════════════╦══════════════════════╣
║  UNDISCOVERED BOOST        ║  CYPHER ARENA        ║
║  New Artist of the Day!    ║  GATEWAY             ║
║  [artist portrait]         ║  Go to 1v1 battles   ║
╠═══════════════════════════╩══════════════════════╣
║   #5    ⚡      STREAM & WIN     Score: 0:50  #3  ║
╚══════════════════════════════════════════════════╝
```

---

## PAGE 2 SECTIONS

### Live World Activity Belt (Top)
- **Main Preview Lobby**: Large card, live artist performing, `● LIVE` badge
- **Lobby Wall**: 8-grid of live artist thumbnails
- **Join Random Room**: Star-shaped button, drops user into random stream

### Discovery Belt (Middle)
- **World Premieres**: Countdown timer card, upcoming exclusive release
- **Event Calendar**: Scheduled concerts + listening parties list

### Boost + Arena Belt (Lower)
- **Undiscovered Boost**: New Artist of the Day — must be least-viewed artist
- **Cypher Arena Gateway**: Button to 1v1 battle rooms

### Stream & Win Strip (Bottom)
- Score counter, points earned from watching

---

## LOBBY WALL SORTING RULE

**CRITICAL — DISCOVERY FIRST:**
```
Position 1: Artist with 0 viewers (completely undiscovered)
Position 2: Artist with 1–5 viewers
Position 3: Artist with 5–20 viewers
Position 4–6: Artists with 20–100 viewers
Position 7–8: Artists with 100+ viewers
```

**The most popular artists are at the BOTTOM, not the top.**
This is the discovery engine.

---

## PAGE 2 COLOR SYSTEM
- Background: Dark purple/black with neon accents
- Cards: Dark with bright colored borders
- Accent colors: Hot pink, electric cyan, gold yellow
- Live badges: Pulsing red
- Numbers: Large, bright, magazine-style

---

# HOME PAGE 3 — EDITORIAL + DISCOVERY + MARKETPLACE

## What It Is
The magazine content + platform tools page.
Editorial journalism + genre discovery + marketplace.
(From Tmi_Homepage_1.png — the 80s style mockup)

---

## LAYOUT (From Tmi_Homepage_1.png)

```
╔═══════════════════════════════════════════════════════╗
║  [LOGO]  Issue: Current Week  [Crown] [🔍][🔔][👤]    ║
╠═══════════════════════════════════════════════════════╣
║  EDITORIAL BELT (Content)                             ║
╠═══════════════════╦═══════════════╦═══════════════════╣
║  ARTICLE FEATURE  ║  MUSIC NEWS   ║  INTERVIEWS       ║
║  [Portrait photo] ║  Headline 1,  ║  THE INDEX SPEAKS ║
║  ARTICLE FEATURE: ║  Headline 2,  ║  Interview with.. ║
║  A Deep Dive into ║  Headline 3,  ╠═══════════════════╣
║  Indie Rock       ║  Headline 4   ║  STUDIO RECAPS    ║
║                   ║               ║  CYPHER HIGHLIGHTS║
║                   ║               ║  WEEKLY WRAP-UP   ║
╠═══════════════════╩═══════════════╩═══════════════════╣
║  DISCOVERY BELT (Curation)                            ║
╠══════════════════╦════════════════╦════════════════════╣
║  GENRE CLUSTER   ║  TOP 10 CHARTS ║  WEEKLY PLAYLISTS ║
║  [Hexagon shapes]║  1. Artist     ║  INDEX PICKS      ║
║  POP    HIP HOP  ║  2. Ecanimory  ╠════════════════════╣
║  ROCK   GENRE    ║  3. Artist     ║  A-Z ARTIST       ║
║  R&B    CLUSTER  ║  4. Mazz       ║  DIRECTORY        ║
║  JAZZ ELECTRONIC ║  5. Artist R&B ║  Link             ║
║                  ║  6. Electronic ║                   ║
╠══════════════════╩════════════════╩════════════════════╣
║  PLATFORM & MARKETPLACE BELT                          ║
╠═════════════════╦══════════════════════╦═══════════════╣
║  THE STORE      ║  BOOKING PORTAL      ║  MY           ║
║  [T-shirt image]║  Venues we listen    ║  ACHIEVEMENTS ║
║  FEATURED MERCH ║  and Olta Langos     ║  CURRENT:     ║
║                 ║                      ║  850 pts      ║
╠═════════════════╩══════════════════════╩═══════════════╣
║  SPONSOR SPOTLIGHT with High-end Ad    POWERED BY:    ║
║                                        [RETRO LOGO]   ║
╚═══════════════════════════════════════════════════════╝
```

---

## PAGE 3 SECTIONS

### Editorial Belt (Top)
- **Article Feature**: Featured weekly deep-dive article
- **Music News**: Scrolling headline ticker
- **Interviews**: "The Index Speaks" interview card
- **Studio Recaps**: Cypher highlights + weekly wrap-up

### Discovery Belt (Middle)
- **Genre Cluster**: Hexagon shape navigation tiles (Hip Hop, Pop, Rock, R&B, Jazz, Electronic)
- **Top 10 Charts**: Real-time ranked list
- **Weekly Playlists**: "Index Picks" curated list
- **A-Z Artist Directory**: Full roster link

### Platform & Marketplace Belt (Bottom)
- **The Store**: Featured merch item
- **Booking Portal**: Venue booking gateway
- **My Achievements**: Current points score
- **Sponsor Spotlight**: Premium ad placement

---

## PAGE 3 COLOR SYSTEM
- Background: Purple + Teal + Gold (matches Cover)
- Genre hexagons: Different colors per genre (pink/purple/teal/cyan/gold)
- Text: Bold poster-style
- Cards: Neon border treatment
- Editorial: Magazine-dark aesthetic

---

# SHARED HEADER (ALL THREE PAGES)

The same header appears on all 3 pages:
```
[THE MUSICIAN'S INDEX logo] [Issue: Current Week] [Weekly Crown Winner glow badge] [🔍 Search] [🔔 Notifications] [👤 Profile Icon]
```

---

# PAGE NAVIGATION STRIP (BOTTOM)

Bottom of every homepage:
```
[← Previous Page]  [1] [2] [3]  [Next Page →]
         ● ○ ○  (current page indicator)
```

Page peel corner: top-right corner peel reveals next page.

---

# THREE-PAGE SYSTEM RULES

| Rule | Detail |
|---|---|
| Scroll | Vertical within each page |
| Page flip | Bottom strip OR corner peel to move between 1/2/3 |
| Swipe | Left/right swipe changes homepage (mobile) |
| Bookmark | System saves which homepage user was on |
| Resume | Returns to last-viewed homepage on next visit |
| Jump allowed | To Live Lobby, Games, Profile, Dashboard, Store |
| Jump NOT allowed | Random deep article pages from cover |

---

*Homepage System v1.0 — BerntoutGlobal XXL / The Musician's Index*
