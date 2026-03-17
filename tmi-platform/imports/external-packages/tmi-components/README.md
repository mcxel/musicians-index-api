# TMI — THE MUSICIAN'S INDEX
## BerntoutGlobal Live Digital Magazine Component System
### Complete Build Package — All Pages from PDF Analysis

---

## 🚀 QUICK START

```bash
# In VS Code terminal, cd into this folder:
cd tmi-components

# Install dependencies:
npm install
# or
pnpm install

# Start dev server:
npm run dev
# Opens at http://localhost:3001
```

---

## 📁 COMPLETE FILE STRUCTURE

```
tmi-components/
├── index.html                           # Entry HTML with Google Fonts
├── vite.config.js                       # Vite dev server config
├── package.json                         # React + Vite dependencies
│
└── src/
    ├── main.jsx                         # React root mount
    ├── App.jsx                          # Master page router (nav + page switcher)
    ├── App.css                          # App shell styles (topbar, nav, pagebar)
    │
    ├── styles/
    │   ├── tokens.css                   # MASTER DESIGN TOKENS (colors, spacing, fonts)
    │   └── globals.css                  # Global base styles, utilities, animations
    │
    ├── hooks/
    │   ├── useLivePhoto.js              # 3-second Live Photo portrait motion hook
    │   └── useBioRotation.js           # Artist bio rotation engine + React hook
    │
    └── components/
        ├── hub/
        │   ├── PromotionalHub.jsx       # PDF Page 1: Live artist cards 2×2 grid
        │   └── PromotionalHub.css
        │
        ├── articles/
        │   ├── ArticlesHub.jsx          # PDF Page 2: Collage mosaic, fan polls, sponsors
        │   └── ArticlesHub.css
        │
        ├── admin/
        │   ├── AdminCommandHUD.jsx      # PDF Page 3: Global Admin Command HUD
        │   └── AdminCommandHUD.css
        │
        ├── booking/
        │   ├── ArtistBookingDashboard.jsx  # PDF Pages 4-5: Map booking, gig list, payday
        │   └── ArtistBookingDashboard.css
        │
        ├── billboard/
        │   ├── BillboardBoard.jsx       # PDF Page 6: Scroll banner, ranked artist cards
        │   └── BillboardBoard.css
        │
        ├── audience/
        │   ├── AudienceRoom.jsx         # PDF Pages 7+15: Video tile grid, chat, reactions
        │   └── AudienceRoom.css
        │
        ├── games/
        │   ├── GameNightHub.jsx         # PDF Page 10: Show schedule, game tiles, avatars
        │   └── GameNightHub.css
        │
        ├── shows/
        │   ├── WinnersHall.jsx          # PDF Page 9: Champion board, trophy, rank cards
        │   ├── WinnersHall.css
        │   ├── DealOrFeud.jsx           # PDF Pages 12-14: Game show stage, audience wall
        │   └── DealOrFeud.css
        │
        └── sponsor/
            ├── SponsorBoard.jsx         # Motocross jacket sponsor board + popup + carousel
            └── SponsorBoard.css
```

---

## 🎨 DESIGN SYSTEM (from PDF analysis)

### Color Palette
| Token | Value | Use |
|---|---|---|
| `--neon-orange` | `#FF6B00` | Primary actions, titles, revenue |
| `--neon-amber` | `#FFB800` | Secondary gold, CTAs |
| `--neon-cyan` | `#00D4FF` | Borders, maps, info |
| `--neon-pink` | `#FF1493` | Live badges, game show titles |
| `--neon-gold` | `#FFD700` | Billboard, rankings, trophies |
| `--neon-magenta` | `#D400FF` | Ads, Law Bubble |
| `--bg-void` | `#050810` | Deepest background |
| `--bg-dark` | `#0a0d1a` | Main background |

### Typography
- **Display**: Black Ops One (titles, game names)
- **Heading**: Exo 2 (artist names, cards)
- **Label**: Orbitron (badges, stats, HUD labels)
- **Mono**: Share Tech Mono (live counters, code)

### Tier System
| Tier | Color | Use |
|---|---|---|
| Free | `#00BFFF` light blue | Basic access |
| Bronze | `#CD7F32` | Entry paid |
| Gold | `#FFD700` | Mid tier |
| Platinum | `#E5E4E2` | Premium |
| Diamond | `#B9FF2FF` glow | Top tier |

---

## 🧩 COMPONENT GUIDE

### PromotionalHub
Live artist broadcast cards. Props: `artists[]` array.
- LIVE badge with pulse animation
- Live Photo 3s motion on hover
- Join Now / Watch Highlight / Hype buttons
- Tier badges per artist

### ArticlesHub
Magazine mosaic layout. Props: `articles[]` array.
- 3-column asymmetric grid
- Fan poll widgets with vote bars
- Law Bubble ad widgets
- Sponsor logo bar

### AdminCommandHUD
Global platform control. No props needed.
- Animated USA heat map with glow dots
- Revenue counter with flash animation
- Bot activity bar chart
- Head Bot pulsing orb (ONLINE/OFFLINE)
- Run Diagnostics / Execute Patch / Override buttons

### ArtistBookingDashboard
Map-based gig finder. Props: `gigs[]`, `pins[]`.
- Interactive SVA USA map with pink pins
- Gig list with venue/city/pay
- Payday panels
- Hotel/Ride utility buttons

### BillboardBoard
Artist ranking chart. Props: `rankings[]`, `mode`.
- Scroll/parchment header with founding badge
- Top 3 featured portrait cards with Live Photo
- List rows for ranks 4+
- Week/Month/All-Time tabs

### AudienceRoom
Live video grid room. Props: `audience[]`, `chat[]`.
- Emoji avatar tiles with LIVE/QUEUE states
- Auto-updating chat bubbles
- Tip slider with amount
- Reaction emoji bar

### GameNightHub
Show schedule. No props needed.
- ON AIR countdown timer
- Game tile grid (6 shows)
- 40-avatar audience mosaic
- Sponsor mission bar
- Ticker strip

### WinnersHall
Champion display. No props needed.
- Animated trophy with glow
- Winner cards with crowns
- Sponsor Next Week CTA

### DealOrFeud
Game show interface. No props needed.
- Animated deal door (click to reveal)
- Feud answer board (click rows to reveal)
- Avatar audience wall (100 fans)
- Host with podium glow

### SponsorBoard
Motocross jacket sponsor wall. Props: `sponsors[]`, `artistName`, `isPopup`.
- Title/Platinum/Gold/Silver/Bronze tier hierarchy
- Artist silhouette center
- Animated sponsor carousel (auto-scrolls)
- Click any tile for sponsor modal
- Become a Sponsor CTA

---

## 🎭 LIVE PHOTO SYSTEM

The `useLivePhoto` hook simulates Apple iPhone "Live Photos" — the 3-second motion portraits.

```jsx
import { LivePhotoImage } from '../hooks/useLivePhoto';

// Drop-in animated portrait
<LivePhotoImage
  src="artist-photo.jpg"
  alt="Artist Name"
  className="artist-portrait"
/>
```

**What it does:**
- On hover → starts 3-second animation
- Subtle turn (–0.8° to +1.2°)
- Glances up at artwork
- Looks at viewer
- Looks away slightly
- Returns to rest
- On mouse leave → snaps back

This is the "NFL video" profile photo effect you described.

---

## 🔄 BIO ROTATION SYSTEM

```js
import { useBioRotation } from '../hooks/useBioRotation';

function ArtistPage({ artist }) {
  const { currentBlocks, rotate } = useBioRotation(artist, {
    tier: 'gold',         // free | bronze | gold | platinum | diamond
    rotateInterval: 30000 // rotate every 30s (optional)
  });

  return (
    <div>
      {currentBlocks.map((block, i) => (
        <p key={i}>{block.text}</p>
      ))}
      <button onClick={rotate}>🔄 Read Another Angle</button>
    </div>
  );
}
```

**Tiers:**
- Free → 3 blocks (origin, sound, fan connect)
- Bronze → 4 blocks
- Gold → 5 blocks  
- Platinum → 6 blocks
- Diamond → all blocks (7+)

---

## 📐 INTEGRATION INTO YOUR REPO

### Drop into tmi-platform/apps/web:

1. **Copy the `src/` folder** into your `apps/web/src/components/tmi-magazine/`
2. **Import tokens.css** in your global styles
3. **Use individual components** as needed in your Next.js pages

```tsx
// Example in Next.js page:
import PromotionalHub from '@/components/tmi-magazine/hub/PromotionalHub'
import BillboardBoard from '@/components/tmi-magazine/billboard/BillboardBoard'

export default function MagazinePage() {
  return (
    <div className="magazine-pages">
      <div className="magazine-page"><PromotionalHub /></div>
      <div className="magazine-page"><BillboardBoard /></div>
    </div>
  )
}
```

---

## ✅ EVERYTHING THAT WAS ADDED

### From PDF (all 15 pages matched):
1. ✅ Promotional Hub — live artist broadcast cards
2. ✅ Articles Hub — magazine mosaic with fan polls
3. ✅ Global Admin Command HUD — full neon control center
4. ✅ Artist Booking Dashboard — map + gig list + payday
5. ✅ Booking Map — geo-pinned booking view
6. ✅ Billboard Board — scroll header + ranked portrait cards
7. ✅ Audience Room — video tile grid with chat
8. ✅ Premium Front Row (via AudienceRoom variant) — VR concert
9. ✅ Winners Hall — trophy + champion leaderboard
10. ✅ Game Night Hub — full show schedule
11. ✅ Name That Tune (via GameNightHub tiles)
12. ✅ Deal or Feud 1000 — game show stage
13. ✅ Deal or Feud with sponsor bar
14. ✅ Deal or Feud full audience wall
15. ✅ Audience Room landing

### Added beyond the PDF:
- ✅ Master design token system (CSS variables)
- ✅ Global utility classes (neon text, borders, cards, buttons)
- ✅ Live Photo 3-second portrait motion hook
- ✅ Bio Rotation Engine with tier awareness
- ✅ Sponsor Board with motocross jacket layout
- ✅ Sponsor popup modal
- ✅ Sponsor animated carousel
- ✅ Tier badge system (Free → Diamond)
- ✅ Font system (Black Ops One, Exo 2, Orbitron)
- ✅ Master App Router with nav + page switcher
- ✅ Mobile-responsive layouts
- ✅ LIVE badge pulse animation
- ✅ Float, shimmer, neon-flicker, bounce-in animations
- ✅ Auto-updating chat simulation (AudienceRoom)
- ✅ Countdown timer component
- ✅ Fan Poll widget with vote bars
- ✅ Law Bubble ad widget
- ✅ Hot USA heatmap SVG
- ✅ Bot activity bar charts

---

## 🔗 CONNECT TO YOUR BACKEND

Replace demo data arrays with your API calls:

```jsx
// In PromotionalHub.jsx, replace DEMO_ARTISTS with:
const { data: artists } = useSWR('/api/artists/live', fetcher)

// In BillboardBoard.jsx, replace DEMO_RANKINGS with:
const { data: rankings } = useSWR('/api/charts/weekly', fetcher)
```

---

*Built by Claude for BerntoutGlobal — The Musician's Index*
*Version 1.0 — All pages PDF-matched + supercharged*
