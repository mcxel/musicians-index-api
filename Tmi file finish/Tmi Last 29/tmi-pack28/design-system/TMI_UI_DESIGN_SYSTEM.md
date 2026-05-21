# TMI_UI_DESIGN_SYSTEM.md
## The Musician's Index — Complete Visual Design System
### Extracted from Magazine PDFs + Homepage Images

This is the canonical design reference. All Copilot, frontend AI, and developers must match this
exactly. Do NOT drift to generic SaaS styles.

---

## BRAND IDENTITY

```
Platform Name: The Musician's Index (TMI)
Tagline: "This is your stage, be original."
Visual Identity: Live music magazine meets neon arcade meets live TV broadcast
Feel: Electric. Cultural. Loud. Premium but street-level. Alive.
NOT: Corporate SaaS, generic dark dashboard, minimalist startup
```

---

## COLOR SYSTEM

### Primary Palette (required on all surfaces)

```css
:root {
  /* Core dark backgrounds */
  --tmi-bg-void:      #0D0520;   /* deepest background — page root */
  --tmi-bg-deep:      #150830;   /* section backgrounds */
  --tmi-bg-card:      #1E0D3E;   /* card surface */
  --tmi-bg-raised:    #2A1452;   /* elevated cards, drawers */
  --tmi-bg-overlay:   #3D1E78;   /* hover, active overlays */

  /* Neon accent colors (from magazine images) */
  --tmi-cyan:         #00E5FF;   /* primary action, LIVE badges, borders */
  --tmi-cyan-dim:     #00A3B5;   /* secondary cyan */
  --tmi-gold:         #FFB800;   /* labels, rankings, section headers */
  --tmi-gold-bright:  #FFD700;   /* crown, winner, hero accents */
  --tmi-pink:         #FF2D78;   /* hot events, trending, alert */
  --tmi-pink-dim:     #B51F55;   /* secondary pink */
  --tmi-purple:       #7B2FBE;   /* editorial, article, sponsor */
  --tmi-purple-light: #9B4FE8;   /* purple hover/accent */
  --tmi-teal:         #00C896;   /* discovery, genre, green states */
  --tmi-amber:        #FF8C00;   /* warnings, booking, "hot" state */

  /* Text */
  --tmi-text-primary:    #FFFFFF;
  --tmi-text-secondary:  #C8A8E8;  /* muted purple-white */
  --tmi-text-muted:      #7A5F9A;  /* very muted */
  --tmi-text-gold:       #FFB800;
  --tmi-text-cyan:       #00E5FF;

  /* Status */
  --tmi-live-red:     #FF2020;   /* LIVE badge red */
  --tmi-online:       #00FF88;   /* online presence dot */
  --tmi-offline:      #555570;

  /* Border + glow system */
  --tmi-border-card:    1px solid rgba(0, 229, 255, 0.25);
  --tmi-border-active:  1px solid rgba(0, 229, 255, 0.8);
  --tmi-border-gold:    1px solid rgba(255, 184, 0, 0.6);
  --tmi-glow-cyan:      0 0 12px rgba(0, 229, 255, 0.4);
  --tmi-glow-gold:      0 0 12px rgba(255, 184, 0, 0.4);
  --tmi-glow-pink:      0 0 12px rgba(255, 45, 120, 0.4);
}
```

### Color Usage Rules
```
Background page root:      --tmi-bg-void
Section/belt background:   --tmi-bg-deep
Card surface:              --tmi-bg-card (with cyan border)
Elevated/featured card:    --tmi-bg-raised (with gold border + glow)
Section belt label:        --tmi-gold text on --tmi-bg-deep
Primary CTA button:        --tmi-cyan bg with --tmi-bg-void text
Secondary CTA:             transparent with --tmi-cyan border + text
LIVE badge:                --tmi-live-red bg, white text
Rank numbers:              --tmi-gold, large, overlaid on images
Crown/winner:              --tmi-gold-bright with glow
Discovery hexagons:        --tmi-purple, --tmi-teal, --tmi-cyan fills
```

---

## TYPOGRAPHY

```css
/* Font stack — must use Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Oswald:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');

:root {
  /* Display font — section headers, large titles, belt labels */
  --tmi-font-display:  'Bebas Neue', 'Impact', sans-serif;

  /* Heading font — card titles, feature headlines */
  --tmi-font-heading:  'Oswald', 'Arial Narrow', sans-serif;

  /* Body font — articles, descriptions, UI text */
  --tmi-font-body:     'Inter', sans-serif;
}

/* Type scale */
.tmi-display-xl    { font: 700 72px/1 var(--tmi-font-display); letter-spacing: 2px; }
.tmi-display-lg    { font: 700 48px/1 var(--tmi-font-display); letter-spacing: 2px; }
.tmi-display-md    { font: 700 36px/1 var(--tmi-font-display); letter-spacing: 1px; }
.tmi-heading-xl    { font: 700 28px/1.2 var(--tmi-font-heading); }
.tmi-heading-lg    { font: 600 22px/1.3 var(--tmi-font-heading); }
.tmi-heading-md    { font: 600 18px/1.3 var(--tmi-font-heading); }
.tmi-label         { font: 600 11px/1 var(--tmi-font-heading); letter-spacing: 1.5px; text-transform: uppercase; }
.tmi-body          { font: 400 15px/1.6 var(--tmi-font-body); }
.tmi-body-sm       { font: 400 13px/1.5 var(--tmi-font-body); }
.tmi-rank-number   { font: 700 28px/1 var(--tmi-font-display); color: var(--tmi-gold); }
```

---

## DECORATIVE SYSTEM (from magazine images)

### Lightning Bolts
```
Used throughout as energy/accent decorations
Color: --tmi-gold or --tmi-cyan
Sizes: 12px (scattered bg), 20px (mid), 32px (hero)
Rotation: random -15deg to +15deg for organic feel
Placement: corners, between sections, inside belt backgrounds
Unicode: ⚡ or SVG path
```

### Triangle Confetti
```
Scattered triangles in:
  - --tmi-gold (most common)
  - --tmi-pink
  - --tmi-cyan
  - --tmi-purple
Sizes: 6px to 14px
Rotation: random
Used as: background texture on active/featured cards
```

### Rank Number Overlays
```
Position: bottom-left or bottom-center of artist photo cards
Font: --tmi-font-display, 32-48px
Color: --tmi-gold
Stroke: 2px dark outline for legibility on photos
```

### Neon Border Glow
```
Default card: border: var(--tmi-border-card)
Active/featured card: 
  border: var(--tmi-border-active)
  box-shadow: var(--tmi-glow-cyan)
Gold/winner card:
  border: var(--tmi-border-gold)
  box-shadow: var(--tmi-glow-gold)
```

### Genre Hexagons (Discovery Belt)
```
Shape: Regular hexagon (CSS clip-path or SVG)
Size: 80px-120px
Colors: rotate through --tmi-purple, --tmi-teal, --tmi-cyan, --tmi-pink
Text: genre name, --tmi-font-display, white, centered
Arrangement: honeycomb offset grid
Hover: scale(1.05) + glow effect
```

---

## HOMEPAGE BELT STRUCTURE (from magazine images)

The homepage is divided into named "belts" — horizontal sections with gold label headers.

```
Belt 1: LIVE WORLD (Activity Belt)
  - Main Preview Lobby (large featured card)
  - Lobby Wall (artist grid — viewers_asc sort)
  - Join Random Room (star CTA)

Belt 2: EDITORIAL (Content Belt)
  - Article Feature (large card, left)
  - Music News ticker (scrolling headlines)
  - Interviews card
  - Studio Recaps card

Belt 3: DISCOVERY (Curation Belt)
  - Genre Cluster (hexagon honeycomb)
  - Top 10 Charts list
  - Weekly Playlists / Index Picks
  - A-Z Artist Directory

Belt 4: PLATFORM & MARKETPLACE (Commerce Belt)
  - The Store / Featured Merch
  - Booking Portal
  - My Achievements
  - Sponsor Spotlight / Powered By

Belt 5: DISCOVERY (Trends & Events Belt)  
  - World Premieres countdown timer
  - Event Calendar
  - Undiscovered Boost card
  - Cypher Arena gateway
  - Stream & Win score

Belt 6: ADVERTISER (Paid Inventory Belt)
  - Sponsor Spotlight
  - Featured Advertiser tiles
  - Local/Geo ads
  - Brand Showcase
```

---

## CARD COMPONENT SYSTEM

### Standard Artist Card
```css
.tmi-card-artist {
  background: var(--tmi-bg-card);
  border: var(--tmi-border-card);
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}
.tmi-card-artist:hover {
  border: var(--tmi-border-active);
  box-shadow: var(--tmi-glow-cyan);
}
/* Rank number overlay */
.tmi-card-artist .rank {
  position: absolute;
  bottom: 8px;
  left: 8px;
  font-family: var(--tmi-font-display);
  font-size: 32px;
  color: var(--tmi-gold);
  text-shadow: 2px 2px 0 #0D0520, -1px -1px 0 #0D0520;
}
/* LIVE badge */
.tmi-live-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background: var(--tmi-live-red);
  color: white;
  font-family: var(--tmi-font-heading);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  padding: 3px 8px;
  border-radius: 4px;
}
```

### Belt Section Header
```css
.tmi-belt-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.tmi-belt-label {
  font-family: var(--tmi-font-display);
  font-size: 22px;
  color: var(--tmi-gold);
  letter-spacing: 2px;
}
.tmi-belt-subtitle {
  font-family: var(--tmi-font-body);
  font-size: 14px;
  color: var(--tmi-text-secondary);
}
.tmi-belt-header::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, var(--tmi-gold) 0%, transparent 100%);
  opacity: 0.4;
}
```

### Feature Preview Card (Live World)
```css
.tmi-card-preview {
  background: var(--tmi-bg-card);
  border: 2px solid var(--tmi-cyan);
  box-shadow: var(--tmi-glow-cyan);
  border-radius: 12px;
  aspect-ratio: 16/9;
  overflow: hidden;
  position: relative;
}
.tmi-card-preview .title {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(13,5,32,0.95) 0%, transparent 100%);
  padding: 24px 16px 16px;
  font-family: var(--tmi-font-heading);
  font-size: 18px;
  color: white;
}
```

### CTA Star Button (Join Random Room)
```css
.tmi-star-cta {
  background: radial-gradient(circle, var(--tmi-pink) 0%, var(--tmi-purple) 100%);
  border: 2px solid var(--tmi-pink);
  box-shadow: var(--tmi-glow-pink);
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  font-family: var(--tmi-font-display);
  font-size: 16px;
  color: white;
  cursor: pointer;
  text-align: center;
}
```

### Countdown Timer
```css
.tmi-countdown {
  background: var(--tmi-bg-card);
  border: var(--tmi-border-gold);
  box-shadow: var(--tmi-glow-gold);
  border-radius: 12px;
  padding: 20px;
}
.tmi-countdown .timer {
  font-family: var(--tmi-font-display);
  font-size: 42px;
  color: var(--tmi-cyan);
  letter-spacing: 4px;
}
.tmi-countdown .label {
  font-family: var(--tmi-font-heading);
  font-size: 13px;
  color: var(--tmi-gold);
  letter-spacing: 2px;
  text-transform: uppercase;
}
```

---

## NAVIGATION HEADER (from Homepage Image 2)

```
Left:  THE MUSICIAN'S INDEX (Bebas Neue, 24px, gold)
Center: "ISSUE: CURRENT WEEK" | "WEEKLY CROWN WINNER: [Artist] CROWN(glowing)"
Right: Search icon | Bell icon | Profile avatar
Background: --tmi-bg-deep with bottom border: 1px solid rgba(255,184,0,0.3)
```

```css
.tmi-nav {
  background: var(--tmi-bg-deep);
  border-bottom: 1px solid rgba(255, 184, 0, 0.3);
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.tmi-nav .logo {
  font-family: var(--tmi-font-display);
  font-size: 22px;
  color: var(--tmi-gold);
  line-height: 1;
}
.tmi-nav .logo span {
  display: block;
  font-size: 14px;
  color: var(--tmi-cyan);
}
.tmi-nav .crown-winner {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--tmi-font-heading);
  font-size: 13px;
  color: var(--tmi-text-secondary);
}
.tmi-nav .crown-badge {
  background: var(--tmi-gold);
  color: var(--tmi-bg-void);
  font-weight: 700;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 20px;
  animation: crown-pulse 2s infinite;
}
@keyframes crown-pulse {
  0%, 100% { box-shadow: 0 0 6px var(--tmi-gold); }
  50% { box-shadow: 0 0 18px var(--tmi-gold), 0 0 32px rgba(255,184,0,0.3); }
}
```

---

## COVER PAGE (from Homepage Image 1)

The cover page is a collage of artist portraits with rank numbers, lightning bolts, and the TMI logo.

```
Layout: 3x3 grid of artist portrait photos
Center: largest/featured artist (crown holder)
Each cell: artist photo + rank number overlay
Background: --tmi-purple and --tmi-teal geometric shapes
Top: THE MUSICIAN'S INDEX logo (Bebas Neue, centered)
Sub: "Who took the crown this week?" (gold)
Bottom bar: "Weekly Cyphers! Who took the crown this week?" (gold on purple)
Decorative: lightning bolts, triangles, confetti scattered throughout
```

---

## SCREEN/WIDGET AD FORMAT (for games, rooms, shows)

```css
/* Ad tile — game lobby, room sidebar, intermission */
.tmi-ad-widget {
  background: var(--tmi-bg-raised);
  border: var(--tmi-border-gold);
  border-radius: 10px;
  padding: 16px;
  position: relative;
  overflow: hidden;
}
.tmi-ad-widget .ad-label {
  position: absolute;
  top: 8px;
  right: 8px;
  font-family: var(--tmi-font-body);
  font-size: 10px;
  color: var(--tmi-text-muted);
  background: rgba(13,5,32,0.8);
  padding: 2px 6px;
  border-radius: 3px;
}
/* Sponsor strip */
.tmi-sponsor-strip {
  background: linear-gradient(90deg, var(--tmi-bg-deep) 0%, var(--tmi-bg-raised) 50%, var(--tmi-bg-deep) 100%);
  border-top: 1px solid var(--tmi-gold);
  border-bottom: 1px solid var(--tmi-gold);
  padding: 10px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  font-family: var(--tmi-font-heading);
  font-size: 11px;
  color: var(--tmi-gold);
  letter-spacing: 2px;
  text-transform: uppercase;
}
```

---

## ROOM DESIGN SYSTEM

### Cypher/Arena Room
```
Background: --tmi-bg-void with diagonal geometric pattern (purple/teal)
Stage area: centered, oval spotlight effect
Artist tiles: grid arrangement, active performer highlighted with cyan glow
Queue rail: bottom bar showing upcoming performers
Chat panel: right sidebar, dark glass effect
Tip button: gold, pulsing animation when room is hot
```

### Watch Party Room
```
Background: themed scene (club, venue, rooftop — see SCENE SYSTEM below)
Video: center main stage
Audience: grid of avatar faces
Reactions: float up from bottom with physics
```

---

## SCENE SYSTEM (Room Backgrounds)

Room backgrounds are themed scenes:

```
scene-id: 'club-neon'
  bg: dark room with neon purple/cyan light beams
  elements: bar, crowd silhouettes, stage lights
  music-reactive: yes (lights pulse to beat)

scene-id: 'rooftop-city'
  bg: nighttime city skyline, warm amber lights
  elements: city buildings, moon, distant traffic
  
scene-id: 'studio-gold'
  bg: recording studio aesthetic, gold lighting
  elements: mixing board elements, acoustic panels
  
scene-id: 'arena-concert'
  bg: massive concert arena, crowd glow
  elements: stage scaffolding, light rigs
  
scene-id: 'underground-cypher'
  bg: brick wall, graffiti elements
  elements: urban street art, concrete floor
  
scene-id: 'space-dome'
  bg: glass dome with stars visible
  elements: celestial objects, galaxy backdrop
  
scene-id: 'beach-festival'
  bg: sunset beach stage setting
  elements: palm trees, ocean, sunset glow
  
scene-id: 'virtual-grid'  
  bg: tron-like grid pattern, cyber aesthetic
  elements: data streams, glowing lines
```

---

## AVATAR SYSTEM

```
Style: Bold, colorful cartoon avatars (not realistic)
Shapes: Circular crop with colored border (genre/role color)
Artist: Gold border
Fan: Cyan border
Producer: Purple border
DJ: Pink border
Venue: Teal border
Admin/Op: White border with glow
Kid: Rounded square with playful pattern (NOT circular like adults)
```

---

## GAME NIGHT VISUAL STYLE

```
Background: Hot pink/purple with scattered confetti
Game cards: Bold yellow headers, dark bodies
Score display: Big Bebas Neue numbers, animated
Timer: Circular progress bar in cyan
Contestant tiles: Photo with score overlay
Sponsor band: Gold strip across top with "Presented by" + logo
```

---

## MOBILE BOTTOM NAV (5 tabs)

```
Tab 1: 🏠 LIVE  (fire/lightning icon)
Tab 2: 🎤 LOBBY (microphone icon)
Tab 3: 🔍 FIND  (magnifying glass)
Tab 4: 📰 FEED  (newspaper icon)
Tab 5: 👤 ME    (profile circle)
Active: --tmi-cyan icon + label
Inactive: --tmi-text-muted
Background: --tmi-bg-deep
Top border: 1px --tmi-border-card
```

---

## ANIMATION PRINCIPLES

```
Room join:     fade-in + scale from 0.95 → 1.0 (200ms)
Tip received:  coin/emoji float up with physics (800ms)
LIVE badge:    subtle pulse glow every 2s
Crown winner:  gold shimmer sweep animation
Loading:       purple > cyan gradient spinner
Belt section:  slide-in from left on scroll-enter
Rank change:   number flip animation
Artist card hover: lift (translateY(-4px)) + glow intensify
Scene change:  crossfade (400ms)
```
