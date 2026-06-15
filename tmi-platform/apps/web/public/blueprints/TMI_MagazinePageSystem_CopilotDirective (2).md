# TMI MAGAZINE PAGE SYSTEM — COPILOT BUILD DIRECTIVE
# Based on BerntoutGlobal reference images (img00001–img00085)
# All pages use the same design system. Build as blank structural templates.
# Real content fills in via EditorialQueueEngine + BroadcastRotationEngine.

---

## DESIGN SYSTEM (LOCK THESE — DO NOT DEVIATE)

### Colors
```ts
export const TMI_COLORS = {
  bg:      '#1a0a2e',   // main dark purple background
  bgDark:  '#0a1628',   // darker navy for cards
  bgCard:  '#0D1B2A',   // card background
  orange:  '#FF6B00',   // primary neon orange (headlines, CTAs)
  gold:    '#FFD700',   // gold (prizes, crowns, earnings)
  cyan:    '#00D4FF',   // teal-cyan (live, tech, secondary CTA)
  pink:    '#FF2DAA',   // hot pink (artist A, battles, love)
  teal:    '#00A896',   // soft teal (game night, watch party)
  purple:  '#6B2FB3',   // mid purple (editorial blocks)
  darkTeal:'#1A4A6A',   // dark teal content blocks
  navy:    '#0D1B2A',   // deep navy (card bg)
  red:     '#CC2200',   // LIVE badge, alerts
  magenta: '#8B1A8B',   // secondary purple
};
```

### Typography
```ts
// HEADLINES: Impact or 'Arial Black' — never use a web-safe serif
// SUBHEADS:  'Inter' font-weight: 900, letter-spacing: .15em
// BODY:      'Inter' font-weight: 400
// LABELS:    'Inter' font-weight: 900, font-size: 7-8px, ALL CAPS, letter-spacing: .2em
```

### Geometric Shapes (clip-path)
```ts
export const TMI_SHAPES = {
  hex:    'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
  pent:   'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
  tagR:   'polygon(15% 0%, 100% 0%, 100% 100%, 15% 100%, 0% 50%)',
  tagL:   'polygon(0% 0%, 85% 0%, 100% 50%, 85% 100%, 0% 100%)',
  blob:   'polygon(3% 0%, 97% 2%, 100% 97%, 0% 100%)',
  slash:  'polygon(0% 0%, 90% 0%, 100% 100%, 10% 100%)',
  shield: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
  oct:    'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
  jagg:   'polygon(0% 5%, 93% 0%, 100% 94%, 7% 100%)',
};
```

### Confetti Scatter (every page background)
Place 20–28 scattered colored triangles using clip-path polygon, absolutely positioned,
opacity 0.5, pointer-events: none. Colors: orange, gold, cyan, pink, teal rotating.

### Neon Glow Effects
- text-shadow: 0 0 10px {color}99, 0 0 20px {color}55
- box-shadow: 0 0 12px {color}66 on bordered cards
- LIVE badge: background: #CC2200, box-shadow: 0 0 12px #CC220088

---

## PAGE 1: ARTICLES PAGE
**Route:** `/articles` and all channel sub-routes
**File:** `apps/web/src/app/articles/page.tsx`
**Reference:** img00002.jpg, img00083.jpg, img00084.jpg, img00085.jpg

### Layout
```
┌──────────────────────────────────────────────────────┐
│              ARTICLES  (orange headline)              │
│                orange gradient divider                │
├──────────────┬───────────────────┬───────────────────┤
│ BLOB BLOCK   │  VIDEO ARTICLE    │  PENTAGON BLOCK   │
│ [News Lead]  │  ┌─────────────┐  │  [Headline Story] │
│              │  │ video thumb │  │                   │
│ PENTAGON     │  └─────────────┘  │  FAN POLL BOX     │
│ [Artist      │  [title]          │  Option A  42%    │
│  Spotlight]  │  [MUSIC NEWS]pill │  Option B  36%    │
│              │  [Watch Article]  │  Option C  22%    │
│ SLASH BLOCK  │  HEX BLOCK        │  [Read Article]   │
│ [Sponsor Ad] │  [Industry News]  │                   │
│              │  BLOB (Ad Slot)   │  TAGL (Sponsor)   │
└──────────────┴───────────────────┴───────────────────┘
│  RED BAR: ADVERTISE WITH US · SPONSOR SLOT | FULL PAGE │
└──────────────────────────────────────────────────────┘
```

### Content Block Types (map to EditorialQueueEngine.getByChannel())
- `NEWS ARTICLE` — pulls from `channel: 'music'|'world'|'tech'|'science'|'love'|'lifestyle'|'business'|'culture'|'winners'`
- `VIDEO ARTICLE` — article with `mediaType: 'video'`, shows video thumb + Watch button
- `ARTIST SPOTLIGHT` — pulls performer with highest `weeklyRank` in channel
- `FAN POLL` — pulls from `PollEngine.getActivePoll(channel)`
- `SPONSOR AD (Full Page)` — `SponsorAdEngine.getSlot('full-page')`
- `SPONSOR AD (Segment)` — `SponsorAdEngine.getSlot('segment')`

### Article Tile Component: `<ArticleTileGeo>`
Props:
```ts
{
  shape: keyof typeof TMI_SHAPES;
  bg: string;
  border: string;
  article: {title, excerpt, channel, writer, slug, mediaUrl, mediaType};
  size: 'sm' | 'md' | 'lg';
}
```

---

## PAGE 2: CYPHER ARENA / SONG CHALLENGE / BATTLE PAGE
**Route:** `/cypher`, `/battles`, `/challenges/[type]`
**File:** `apps/web/src/app/cypher/page.tsx`
**Reference:** img00082.jpg

### Challenge Types (all use same template)
```ts
export const CHALLENGE_TYPES = [
  'cypher',           // rap freestyle
  'battle',           // song vs song
  'song-challenge',   // "Challenge Your Song Here"
  'dirty-dozen',      // comedy roast
  'dance-off',        // dance battle
  'joke-off',         // comedy battle
  'freestyle',        // open mic freestyle
  'beat-battle',      // producer vs producer
  'rap-battle',       // bars only
  'sing-off',         // vocal competition
  'comedy-set',       // full comedy set battle
  'dance-battle',     // choreography battle
];
```

### Layout
```
┌──────────────────────────────────────────────────────┐
│  CYPHER ARENA  (cyan headline)                       │
│  [SONG vs SONG] [BATTLE] [DIRTY DOZEN] [DANCE-OFF]  │
│  [JOKE-OFF] [CHALLENGE YOUR SONG] pills              │
├──────────────────────────────────────────────────────┤
│ ┌── CHALLENGE YOUR SONG HERE — SONG FOR SONG ──────┐ │
│ │ ┌─────────────┐   VS   ┌─────────────┐          │ │
│ │ │ [VIDEO A]   │  🔥👏  │ [VIDEO B]   │          │ │
│ │ │ [ARTIST A]  │        │ [ARTIST B]  │          │ │
│ │ │ 76%  ████░  │        │ 24%  ██░░░  │          │ │
│ │ └─────────────┘        └─────────────┘          │ │
│ └──────────────────────────────────────────────────┘ │
│  [FAN VIDEO TILES row — 6 fans watching]             │
│  [$ TIP] [▶ PLAY] [🔥 FIRE] [♥ LOVE] [127 watching] │
├──────────────────────────────────────────────────────┤
│  CHALLENGE TYPES → SELECT                            │
│  [CYPHER][BATTLE][SONG CHALLENGE][DIRTY DOZEN]...    │
└──────────────────────────────────────────────────────┘
```

### Key CTA: "Challenge Your Song Here"
```tsx
// Sticky banner inside the arena
<div className="tmi-challenge-banner">
  ▶ CHALLENGE YOUR SONG HERE
  — SONG FOR SONG · WORK FOR WORK · VIDEO FOR VIDEO
</div>
```

### Data Sources
- `BattleEngine.getActiveBattle(roomId)` → Artist A, Artist B, vote counts
- `VoteEngine.getPercentages(battleId)` → live vote percentages
- `WebRTCService.getStream(performerId)` → live video feed

---

## PAGE 3: PROMOTIONAL HUB
**Route:** `/hub/promo`
**File:** `apps/web/src/app/hub/promo/page.tsx`
**Reference:** img00001.jpg

### Layout
```
PROMOTIONAL HUB  (gold headline)
pink/gold/cyan gradient divider

2x2 GRID of PerformerCards:
┌─────────────────┬─────────────────┐
│ [LIVE · 213]    │ [LIVE · 98]     │
│ [VIDEO TILE]    │ [VIDEO TILE]    │
│ [Performer A]   │ [Performer B]   │
│ [Session Desc]  │ [Session Desc]  │
│ 157 reacts 🔥   │ 243 reacts 🔥   │
│ [Join Now]      │ [Join Now]      │
│ [Watch] [Hype]  │ [Watch] [Hype]  │
├─────────────────┼─────────────────┤
│ [LIVE · 145]    │ [offline]       │
│ ...             │ ...             │
└─────────────────┴─────────────────┘
```

### Data Source
- `BroadcastRotationEngine.getLivePerformers(limit: 4)` → live feeds
- `MaskedVideoTile` for each performer slot (WebRTC stream or avatar fallback)

---

## PAGE 4: AUDIENCE ROOM / VIDEO GRID
**Route:** `/rooms/[roomId]/audience`
**File:** `apps/web/src/app/rooms/[roomId]/audience/page.tsx`
**Reference:** img00007.jpg

### Layout
```
AUDIENCE ROOM  (pink headline)
VIDEO GRID · Everyone watching LIVE

4x3 GRID of audience video tiles:
[LIVE] 👤  👤  👤  👤
       👤  [QUEUE] 👤  👤
[LIVE] 👤  👤  👤  👤
       👤  👤  👤  (empty)

[Chat message bar]
[◀ TIP]  [👍 ❤️ 🎵]  [▶]  [🔍 🔄]
```

### Component: `<AudienceVideoGrid>`
Props: `{ roomId, maxTiles: 12, showChat: boolean }`

---

## PAGE 5: ROOMS DIRECTORY
**Route:** `/rooms`
**File:** `apps/web/src/app/rooms/page.tsx`
**Reference:** img00025.jpg

### Layout
```
ROOMS DIRECTORY  (orange headline)

Filter pills: [Genre] [Mode] [Venue] [Hype] [Starting Soon ▼]

Sections:
[FEATURED TONIGHT] → orange CTA bar
[RISING ROOMS]     → cyan CTA bar
[YOUR FOLLOWED ARTISTS LIVE NOW] → gold CTA bar

3-column ROOM CARDS:
┌──────────┬──────────┬──────────┐
│ HIP HOP  │ DJ/DANCE │ R&B      │
│ [thumb]  │ [thumb]  │ [thumb]  │
│ 48% Bar  │ 66% Hall │ 43% Arena│
│ 982 view │ 1.2k view│ 682 view │
│ [JOIN]   │ [JOIN]   │ [JOIN]   │
│ [PREVIEW]│ [PREVIEW]│ [8 queue]│
└──────────┴──────────┴──────────┘
```

### Data Source
- `RoomDirectoryEngine.getRooms({ filters })` → all active rooms
- Sort: featured → rising → followed → rest

---

## PAGE 6: LIVE CIPHER ROOMS
**Route:** `/rooms/cipher`
**File:** `apps/web/src/app/rooms/cipher/page.tsx`
**Reference:** img00020.jpg

### Layout
```
LIVE CIPHER ROOMS  (gold headline)

Vertical list of room cards:
┌─────────────────────────────────────────────┐
│ [Avatar] Hip-Hop A    [audio waveform] 112BPM │
│          [15 waiting] pill              [JOIN] │
│                                        [WATCH] │
└─────────────────────────────────────────────┘
(repeat for R&B B, Rock C, Hip-Hop D, etc.)
```

---

## PAGE 7: GAME NIGHT
**Route:** `/events/game-night`
**File:** `apps/web/src/app/events/game-night/page.tsx`
**Reference:** img00010.jpg

### Layout
```
MONDAY    WED-SUN    🪙 350    🔔
GAME NIGHT  (pink headline glow)
· FEEL THE GLOW ·

┌──────────────────────┬──────────────────┐
│ ON AIR  [HOST TILE]  │ 8-grid avatars   │
│ 03:21               │                  │
│ Win limited item    │                  │
│ 👑                  │                  │
│ [JOIN QUEUE] [PREV] │                  │
└──────────────────────┴──────────────────┘

3x2 GAME TILES:
[NAME THAT TUNE LIVE] [DEAL OR NO DEAL TIP] [1 vs 10,000]
[COVER ART ZOOM]      [LYRIC FILL 80s]      [DJ MIX-OFF SPONSOR]

SPONSOR MISSION bar
Top Artist last week ticker
```

### Games available
```ts
export const GAME_TYPES = [
  'name-that-tune', 'deal-or-no-deal', 'one-vs-ten-thousand',
  'cover-art-zoom', 'lyric-fill', 'dj-mix-off',
  'word-scramble', 'beat-match', 'karaoke-battle',
];
```

---

## PAGE 8: WATCH PARTY / VENUE PICKER
**Route:** `/events/watch-party`
**File:** `apps/web/src/app/events/watch-party/page.tsx`
**Reference:** img00017.jpg

### Layout
```
JOIN A WATCH PARTY
PICK YOUR VENUE · EARN REWARDS

┌──────────┬────────────────────┬──────────────┐
│ Dive Bar │  LIVE IN CONCERT   │ Host Mic     │
│ 🍺       │  [Main Performer]  │ [ROOM CODE]  │
│ Club     │  👥 852   [JOIN]   │ Skip Ad      │
│ 🎸       │  ••••••••          │ Theme Song   │
│ Rooftop  │                    │ 🎵  📞       │
│ 🌙       │                    │              │
│ Church   │                    │              │
│ ⛪       │                    │              │
└──────────┴────────────────────┴──────────────┘
[Fan avatar row — 5 fans watching from audience]
```

### Venue Types
```ts
export const VENUE_TYPES = ['dive-bar','club','rooftop','church','stadium','arena','theater','outdoor'];
```

---

## PAGE 9: WINNER'S HALL
**Route:** `/winners`
**File:** `apps/web/src/app/winners/page.tsx`
**Reference:** img00009.jpg

### Layout
```
THE WINNER'S HALL
— PRESENTED BY THE MUSICIANS INDEX —
[ THIS WEEK'S CHAMPIONS · LIVE NOW! ]
Top Artists · Top Fans · Top DJs · Top Crews · Sponsor MVPs

┌──────────────────────────┬────────────────────┐
│ [100% ACCURACY] [BEST   │ 👑 [Performer #1]   │
│  STAGE PRESENCE]        │    Charro Ace   4+  │
│  [BEST DJ SET]          │ ⭐ [Performer #2]   │
│                         │    Mia Jay   7 WKS  │
│  [CHAMPION TILE]        │ 👑 [Performer #3]   │
│  [TROPHY 🏆]            │    DJ Blend   +1   │
│                         │ 👑 [Performer #4]   │
│                         │    Lani Flame  +2  │
└──────────────────────────┴────────────────────┘
[VIEW PERFORMANCE] [HEAR HIGHLIGHT] [SEND GIFT]
[Nike logo] [SPONSOR NEXT WEEK'S SHOW]
```

---

## PAGE 10: ARTIST BOOKING DASHBOARD
**Route:** `/hub/artist/booking`
**File:** `apps/web/src/app/hub/artist/booking/page.tsx`
**Reference:** img00004.jpg

### Layout
```
ARTIST BOOKING DASHBOARD
FIND YOUR NEXT GIG · TRACK EARNINGS

┌──────────────┬──────────────────────┬──────────────┐
│ AVAILABLE    │  [CITY MAP]          │ Would you    │
│ BOOKINGS     │  [STATE MAP]         │ perform @    │
│              │                      │ [VENUE]?     │
│ 1. Club G    │                      │              │
│    $400      │                      │ LAST EARNED  │
│ 2. Riff Rm   │                      │ $[XXX]       │
│    $270      │                      │              │
│ 3. Soul Cab  │                      │ NEXT PAYDAY  │
│    $525      │                      │ ⏱ $[XXX]    │
│ 4. Blast Bts │                      │              │
│    $320      │                      │ [HOTEL?]     │
│              │                      │ [RIDE?]      │
└──────────────┴──────────────────────┴──────────────┘
```

---

## PAGE 11: EDITORIAL CHANNELS (all 14 channels use same template)
**Routes:** `/articles/music`, `/articles/world`, `/articles/tech`, `/articles/science`,
           `/articles/love`, `/articles/lifestyle`, `/articles/business`, `/articles/culture`,
           `/articles/winners`, `/articles/live`, `/articles/cypher`, `/articles/events`,
           `/articles/sponsors`, `/articles/writers`
**File:** `apps/web/src/app/articles/[channel]/page.tsx`

### Channel Definitions
```ts
export const EDITORIAL_CHANNELS = {
  music:     { color: '#FF6B00', layout: 'video-first',   priority: 1.5, icon: '🎤' },
  world:     { color: '#00D4FF', layout: 'journal',       priority: 0.8, icon: '🌍' },
  tech:      { color: '#6B2FB3', layout: 'grid-neon',     priority: 1.0, icon: '💻' },
  science:   { color: '#00A896', layout: 'diagram',       priority: 0.5, icon: '🔬' },
  love:      { color: '#FF2DAA', layout: 'story-cards',   priority: 0.7, icon: '❤️' },
  lifestyle: { color: '#FFD700', layout: 'candid-raw',    priority: 0.9, icon: '✨' },
  business:  { color: '#FFD700', layout: 'pro-finance',   priority: 1.2, icon: '💼' },
  culture:   { color: '#FF2DAA', layout: 'chaos-grid',    priority: 1.1, icon: '🎭' },
  winners:   { color: '#FFD700', layout: 'stats-badge',   priority: 1.3, icon: '🏆' },
  live:      { color: '#CC2200', layout: 'live-stream',   priority: 1.4, icon: '📡' },
  cypher:    { color: '#6B2FB3', layout: 'battle',        priority: 1.3, icon: '⚔️' },
  events:    { color: '#FF6B00', layout: 'event-card',    priority: 1.0, icon: '🎟️' },
  sponsors:  { color: '#FFD700', layout: 'sponsor-hero',  priority: 0.9, icon: '💎' },
  writers:   { color: '#00A896', layout: 'byline-wall',   priority: 0.6, icon: '✍️' },
} as const;
```

### Layout (same 3-column collage for ALL channels)
```
[CHANNEL TABS — all 14 channels]
[CHANNEL NAME] (dynamic color headline)
──────────────────────────────────────
3-col geometric collage (same as Articles page)
with channel-specific accent colors
──────────────────────────────────────
[ADVERTISE WITH US bar]
```

---

## PAGE 12: GLOBAL ADMIN COMMAND
**Route:** `/admin/command`
**File:** `apps/web/src/app/admin/command/page.tsx`
**Reference:** img00003.jpg

### Layout (dark navy, orange/cyan neon)
```
THE MUSICIAN'S INDEX
GLOBAL ADMIN COMMAND

┌────────────────────────┬──────────────────────┐
│  [US MAP — Bot Nodes]  │ BOT ACTIVITY         │
│                        │ Map Bots ─── ACTIVE  │
│                        │ Booking Bots ─ ACTIVE│
│                        │ Guard Bots ── ACTIVE │
│                        ├──────────────────────┤
│                        │ HEAD BOT             │
│                        │  ○ ONLINE            │
│                        ├──────────────────────┤
│                        │ MAP STATUS   ⚠️       │
├──────────┬─────┬───────┘                      │
│ REVENUE  │ Q   │                              │
│ $$$$$    │ 23  │ ALERTS: 0                    │
│          │     │                              │
└──────────┴─────┴──────────────────────────────┘
[RUN DIAGNOSTICS] [EXECUTE PATCH] [OVERRIDE SYSTEM]
BERNTOUTGLOBAL
```

---

## SHARED COMPONENTS (build once, use everywhere)

### `<TMIGeoBock>` — geometric content container
```tsx
interface TMIGeoBlockProps {
  shape: keyof typeof TMI_SHAPES;
  bg: string;
  border: string;
  label?: string; // top-left micro label
  children: React.ReactNode;
  animate?: boolean; // subtle entrance animation
  onClick?: () => void;
}
```

### `<TMIVideoTile>` — performer/fan video slot
```tsx
interface TMIVideoTileProps {
  streamUrl?: string;       // WebRTC stream
  avatarUrl?: string;       // fallback avatar
  avatarEmoji?: string;     // emoji fallback
  performerName: string;
  isLive: boolean;
  viewerCount?: number;
  border?: string;
  size?: number;
  showActions?: boolean;    // TIP, REACT buttons
  onJoin?: () => void;
}
```

### `<TMIConfetti>` — scattered triangle background
```tsx
// 20-28 colored triangles, absolutely positioned
// clip-path: polygon(50% 0%, 0% 100%, 100% 100%)
// colors: orange, gold, cyan, pink, teal rotating
// opacity: 0.5, pointer-events: none
```

### `<NeonButton>` — glow CTA button
```tsx
interface NeonButtonProps {
  label: string;
  color: string;
  textColor?: string;
  size?: 'sm' | 'md' | 'lg';
  pill?: boolean;
  onClick?: () => void;
}
```

### `<GenrePill>` — colored channel badge
```tsx
interface GenrePillProps {
  channel: keyof typeof EDITORIAL_CHANNELS;
  onClick?: () => void;
  active?: boolean;
}
```

---

## CHALLENGE / SONG ARENA SPECIFIC

### "Challenge Your Song Here" CTA placement
This CTA appears on:
1. Home 1 (orbital hero) — pulsing animated button
2. Performer profile pages — in the action strip
3. Cypher Arena page — as sticky top banner
4. Article pages (music channel) — as sidebar CTA

```tsx
// Animated challenge CTA
<div className="tmi-challenge-cta">
  <div className="challenge-pulse-ring" />
  <button onClick={() => router.push('/challenges/create')}>
    🎤 CHALLENGE YOUR SONG HERE
  </button>
  <div className="challenge-subtitle">
    SONG FOR SONG · WORK FOR WORK · VIDEO FOR VIDEO
  </div>
</div>
```

### Video-based challenge flow (what users have RIGHT NOW)
Users don't need instruments. They use:
1. **Song links** — YouTube, Spotify, SoundCloud URLs
2. **Video links** — TikTok, Instagram, YouTube performance clips

```ts
interface ChallengeSubmission {
  type: 'song' | 'video' | 'live';
  url?: string;              // for song/video links
  streamId?: string;         // for live WebRTC
  performerId: string;
  challengeType: typeof CHALLENGE_TYPES[number];
  genre: string;
}
```

### Arena viewing: Video tiles on 2 giant screens
```
Artist A video plays on LEFT screen tile
Artist B video plays on RIGHT screen tile
Audience avatar grid below
Fan voting percentages on right panel
```

---

## PLAYLIST / MUSIC SHARING SYSTEM

### MySpace-style profile playlist
```tsx
// On every performer/fan profile
<TMIProfilePlaylist>
  - Add song links (YouTube, Spotify, SoundCloud)
  - Add video links (TikTok, IG, YouTube)
  - Other users can play from your profile
  - No file upload needed — just URLs
  - Auto-embeds as video players
  - Shows in BillboardLiveWall tiles
</TMIProfilePlaylist>
```

### Universal Video Player tile
```tsx
<TMIUniversalPlayer
  url={link}              // any YouTube/TikTok/Spotify URL
  type="song|video|live"
  performerId={slug}
  showInBillboard={true}  // appears in lobby walls
  size="tile|feature|fullscreen"
/>
```

---

## 80S MAGAZINE OVERLAY SYSTEM (HOME PAGE)

Apply to every page wrapper:

```tsx
// Underlay 1: Paper stock
<div className="tmi-paper-underlay" /> {/* cream #e8d5aa, mix-blend-mode: multiply */}

// Underlay 2: Halftone dots
<div className="tmi-halftone" /> {/* radial-gradient dots, opacity .09 */}

// All content at z-index: 10+

// Overlay 1: Ink grain
<div className="tmi-grain-overlay" /> {/* feTurbulence SVG, mix-blend-mode: multiply */}

// Overlay 2: Gloss sheen
<div className="tmi-gloss" /> {/* diagonal white-to-dark, mix-blend-mode: overlay */}

// Root filter (contrast + saturation boost)
.tmi-root { filter: contrast(1.16) saturate(1.28) brightness(1.02); }
```

### Chromatic shift on ALL display headlines
```tsx
// Wrap every big headline in 3 layers:
<div className="tmi-headline-wrap">
  <div className="tmi-headline-m">{text}</div>  {/* #FF2DAA, -1px offset */}
  <div className="tmi-headline-c">{text}</div>  {/* #00C8FF, +2px offset */}
  <div className="tmi-headline-main">{text}</div> {/* actual color */}
</div>
```

---

## ROTATION SYSTEM

Every page's content tiles rotate via `BroadcastRotationEngine` every 13 seconds:

```ts
const HOME_ROTATION = [
  'live-performer',    // WebRTC stream or avatar
  'news-article',      // EditorialQueueEngine
  'artist-feature',    // performer spotlight
  'sponsor-tile',      // SponsorAdEngine
  'event-tile',        // EventSchedulerEngine
  'fan-lobby',         // FanLobbyWall
  'performer-lobby',   // PerformerLobbyWall
  'challenge-cta',     // "Challenge Your Song" promo
  'winner-spotlight',  // WinnersEngine
  'cypher-live',       // active battle feed
];
```

---

## ACCEPTANCE CRITERIA

When done:
- [ ] All 12 page templates exist as proper Next.js routes
- [ ] Every page uses TMI_COLORS and TMI_SHAPES consistently
- [ ] Confetti triangles appear on every page background
- [ ] No static images — all content slots pull from engines
- [ ] "Challenge Your Song Here" CTA appears on Home 1, profile pages, and Cypher Arena
- [ ] Video/song URL submission works without requiring file upload
- [ ] Every performer card routes to `/articles/performer/[slug]`
- [ ] All pages have the 80s magazine overlay (paper + halftone + grain + gloss)
- [ ] Chromatic headline shift on all display text
- [ ] pnpm -C apps/web typecheck passes
