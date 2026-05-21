# MASTER_REPO_PLACEMENT_MAP.md
## Exact Repo Path for Every File in the Platform

---

## HOMEPAGE SYSTEM (Pack 11)

| File | Repo Path | Type | Needs |
|---|---|---|---|
| Homepage Cover | `apps/web/src/app/(magazine)/page.tsx` | UI Page | Issue config, crown state |
| Homepage Live World | `apps/web/src/app/(magazine)/live/page.tsx` | UI Page | Live event data |
| Homepage Editorial | `apps/web/src/app/(magazine)/editorial/page.tsx` | UI Page | Issue/article data |
| Shared Header | `apps/web/src/components/tmi/homepage/HomepageHeader.tsx` | UI Component | Auth state, crown data |
| Page Strip | `apps/web/src/components/tmi/homepage/HomepagePageStrip.tsx` | UI Component | Static |
| Corner Peel | `apps/web/src/components/tmi/homepage/CornerPeel.tsx` | UI Component | Motion tokens |
| Crown Card | `apps/web/src/components/tmi/crown/CrownCard.tsx` | UI Component | Crown state API |
| Artist Ring Card | `apps/web/src/components/tmi/crown/ArtistRingCard.tsx` | UI Component | Rankings API |
| Comic Insert | `apps/web/src/components/tmi/homepage/ComicInsert.tsx` | UI Component | Issue config |
| Main Preview Lobby Card | `apps/web/src/components/tmi/live/PreviewLobbyCard.tsx` | UI Component | Live events API |
| Lobby Wall | `apps/web/src/components/tmi/live/LobbyWall.tsx` | UI Component | Live events API (sorted) |
| Join Random Room | `apps/web/src/components/tmi/live/JoinRandomRoom.tsx` | UI Component | Rooms API |
| Countdown Card | `apps/web/src/components/tmi/live/CountdownCard.tsx` | UI Component | Events API |
| Undiscovered Boost | `apps/web/src/components/tmi/discovery/UndiscoveredBoost.tsx` | UI Component | Discovery API |
| Cypher Arena Gateway | `apps/web/src/components/tmi/live/CypherArenaGateway.tsx` | UI Component | Rooms API |
| Stream & Win Card | `apps/web/src/components/tmi/stream/StreamAndWinCard.tsx` | UI Component | Points API |
| Article Feature Card | `apps/web/src/components/tmi/editorial/ArticleFeatureCard.tsx` | UI Component | Articles API |
| News Ticker | `apps/web/src/components/tmi/editorial/NewsTicker.tsx` | UI Component | News API |
| Genre Cluster | `apps/web/src/components/tmi/discovery/GenreCluster.tsx` | UI Component | Genres config |
| Top 10 Charts | `apps/web/src/components/tmi/editorial/TopTenCharts.tsx` | UI Component | Rankings API |
| Sponsor Spotlight | `apps/web/src/components/tmi/sponsor/SponsorSpotlight.tsx` | UI Component | Sponsor API |
| Status Footer (HUD) | `apps/web/src/components/tmi/hud/StatusFooter.tsx` | UI Component | Server status |

---

## ENGINE + SERVICE LAYER

| Service | Repo Path | Calls |
|---|---|---|
| Crown Engine | `apps/api/src/services/crown.service.ts` | DB, bot triggers |
| Discovery Engine | `apps/api/src/services/discovery.service.ts` | DB ranking sort |
| Issue Archive | `apps/api/src/services/issue.service.ts` | DB, archivist-bot |
| Stream & Win | `apps/api/src/services/streamwin.service.ts` | DB points, anti-fraud |
| Broadcaster | `apps/api/src/services/broadcaster.service.ts` | ElevenLabs TTS |
| Lobby Sort | `apps/api/src/services/lobby-sort.service.ts` | Live event state |
| Avatar | `apps/api/src/services/avatar.service.ts` | GLB storage |
| Sponsor | `apps/api/src/services/sponsor.service.ts` | DB campaigns |
| Daily Spin | `apps/api/src/services/spin.service.ts` | DB spin history |

---

## BOT MANIFESTS

All in: `tmi-platform/bots/manifests/`

`crown-bot.manifest.json`, `archivist-bot.manifest.json`, `discovery-bot.manifest.json`,
`broadcaster-bot.manifest.json`, `director-bot.manifest.json`, `hype-bot.manifest.json`,
`loot-bot.manifest.json`, `oracle-bot.manifest.json`, `design-bot.manifest.json`,
`guardian-bot.manifest.json`, `qc-bot.manifest.json`, `janitor-bot.manifest.json`,
`metronome-bot.manifest.json`, `accountant-bot.manifest.json`, `mechanic-bot.manifest.json`

---

## CONFIG FILES

| Config | Path |
|---|---|
| Homepage belt registry | `apps/web/src/config/homepage-belts.config.ts` |
| Motion tokens | `packages/hud-theme/src/motion.tokens.ts` |
| Crown config | `apps/web/src/config/crown.config.ts` |
| Discovery sort config | `apps/web/src/config/discovery.config.ts` |
| Sponsor rules | `apps/web/src/config/sponsor-rules.config.ts` |
| Feature flags | `packages/platform-kernel/src/feature-flags.ts` |
| Bot manifests | `bots/manifests/*.manifest.json` |

---

---

# MASTER_ROUTE_TREE.md
## Every Route on the Platform

---

## PUBLIC ROUTES (No auth required)

| Route | Page | Fallback |
|---|---|---|
| `/` | Homepage Cover (Page 1) | Static loading skeleton |
| `/live` | Homepage Live World (Page 2) | Standby state |
| `/editorial` | Homepage Editorial (Page 3) | Static skeleton |
| `/artists/[slug]` | Artist Profile Hub | 404 artist page |
| `/articles/[slug]` | Article Page | 404 article page |
| `/genres/[genre]` | Genre Page | Genre not found |
| `/preview/[artistId]` | Artist Preview Lobby | Artist not live state |
| `/hall-of-fame` | Hall of Fame | Empty hall state |
| `/store` | Store Page | Empty store state |
| `/login` | Login | — |
| `/register` | Register | — |
| `/issues/[issueId]` | Past Issue Archive | Issue not found |

---

## PROTECTED ROUTES (Auth required)

| Route | Role | Onboarding? | Redirect if no auth |
|---|---|---|---|
| `/dashboard` | Any | Required | `/login?next=/dashboard` |
| `/dashboard/fan` | Fan | Required | `/onboarding/fan` |
| `/dashboard/artist` | Artist | Required | `/onboarding/artist` |
| `/dashboard/analytics` | Artist | Required | `/dashboard/artist` |
| `/dashboard/earnings` | Artist | Required | `/dashboard/artist` |
| `/dashboard/schedule` | Artist | Required | `/dashboard/artist` |
| `/dashboard/clips` | Artist | Required | `/dashboard/artist` |
| `/rooms/[id]` | Any auth | Required | `/login` |
| `/stream-and-win` | Any auth | Required | `/login` |
| `/achievements` | Any auth | Required | `/login` |
| `/booking` | Artist | Required | `/dashboard/artist` |
| `/fan-clubs/[artistSlug]` | Any auth | Required | `/login` |
| `/onboarding/artist` | Artist | — | `/dashboard/artist` (if done) |
| `/onboarding/fan` | Fan | — | `/dashboard/fan` (if done) |

---

## ADMIN ROUTES (Big Ace / Marcel / Jay Paul)

| Route | Role | Access Level |
|---|---|---|
| `/admin` | Big Ace | Full control |
| `/admin/moderation` | Big Ace | Full control |
| `/admin/crown` | Big Ace | Crown override |
| `/admin/sponsors` | Big Ace | Approve/manage |
| `/admin/bots` | Big Ace | Start/stop/configure |
| `/admin/emergency` | Big Ace | Emergency controls |
| `/dashboard/operator` | Big Ace | Mission control |
| `/dashboard/analytics-overview` | Marcel + Big Ace | View only for Marcel |
| `/dashboard/suggestions` | Marcel + Jay Paul | Submit only |

---

---

# MASTER_COMPONENT_REGISTRY.md
## Every Reusable Component — Props, States, Pages Used On

---

## SHARED SHELL COMPONENTS

### HomepageHeader
```typescript
Props: { crownWinner: Artist; issueName: string; adminOverride?: AdminOverride }
States: loading, loaded, error
Pages: Homepage 1, 2, 3
Mobile: Compact with hamburger
```

### HomepagePageStrip
```typescript
Props: { currentPage: 1 | 2 | 3; onPageChange: (p: number) => void }
States: static
Pages: Homepage 1, 2, 3 (bottom)
```

### CornerPeel
```typescript
Props: { direction: 'next' | 'prev'; onPeel: () => void; reducedMotion?: boolean }
States: idle, peeling, complete
Pages: Homepage 1, 2, 3 (top-right corner)
Motion: MOTION.CORNER_PEEL_MS
```

---

## CANVAS CARD COMPONENTS

### CanvasCard (Base)
```typescript
Props: {
  id: string; variant: CardVariant; draggable?: boolean;
  initialPos?: XY; savedPos?: XY; onPosChange?: (pos: XY) => void;
  children: ReactNode;
}
States: idle, hover, dragging, snapping
Motion: float, tilt, scale on hover
All cards extend this
```

### CrownCard
```typescript
Extends: CanvasCard
Props: { artistId: string; motionClipUrl: string; weekNumber: number; rankNumber: 1 }
States: loading, live, static
Used on: Homepage 1 center
Motion: 6s portrait loop, crown glow pulse
```

### ArtistRingCard
```typescript
Extends: CanvasCard
Props: { artistId: string; rankNumber: 2-10; motionClipUrl?: string }
States: idle, hover (expand), clicking
Used on: Homepage 1 ring
Motion: 3s micro-loop
```

### ComicInsertCard
```typescript
Extends: CanvasCard
Props: { content: ComicInsert; weekNumber: number }
States: static, wobble
Used on: Homepage 1 corner
```

### PreviewLobbyCard (Main)
```typescript
Extends: CanvasCard
Props: { eventId: string; artistId: string; isLive: boolean; previewUrl: string }
States: offline, live, loading
Used on: Homepage 2
Motion: LIVE badge pulse
```

### LobbyWall
```typescript
Props: { artists: Artist[]; sortBy: 'discovery-first' }
States: loading, loaded, empty, standby
Used on: Homepage 2
Rule: ALWAYS sorted least viewers first
```

### CountdownCard
```typescript
Extends: CanvasCard
Props: { eventId: string; targetDate: Date; title: string; albumArt?: string }
States: counting, expired, live-now
Used on: Homepage 2
```

### UndiscoveredBoostCard
```typescript
Extends: CanvasCard
Props: { artistId: string; viewerCount: number }
States: loading, loaded, empty
Used on: Homepage 2
Rule: Must always be lowest-viewed artist
```

### ArticleFeatureCard
```typescript
Extends: CanvasCard
Props: { articleSlug: string; headline: string; authorPortrait: string }
States: loading, loaded
Used on: Homepage 3 editorial belt
```

### GenreClusterCard
```typescript
Props: { genres: Genre[]; onGenreClick: (genre: string) => void }
States: loaded
Shape: Hexagon cluster
Used on: Homepage 3 discovery belt
```

### SponsorSpotlightCard
```typescript
Props: { campaignId: string; fallback?: SponsorFallback }
States: loading, active, fallback, empty
Used on: Homepage 3 marketplace belt
Rules: See SPONSOR_PRESENTATION_ENGINE.md
```

### StreamAndWinCard
```typescript
Extends: CanvasCard
Props: { userId: string; score: number; isStreaming: boolean }
States: idle, active, daily-cap-reached
Used on: Homepage 2 strip, dashboards
```

### AudienceStadium
```typescript
Props: { eventId: string; viewerAvatars: Avatar[]; hypeLevel: number }
States: loading, active, empty, overflow
Rendering: GPU instanced based on viewer count
Used on: All live venue pages
```

### BroadcasterHUD (Artist/Host private)
```typescript
Props: { broadcasterId: BroadcasterId; eventId: string }
States: active, silence-warning, script-ready
Used on: Host view only (not public)
```

### StatusFooter
```typescript
Props: { showCoords?: boolean; showUptime?: boolean; showLiveCount?: boolean }
States: live, standby, offline
Used on: All pages (optional toggle)
```

---

*Repo Placement + Route Tree + Component Registry v1.0 — BerntoutGlobal XXL*
