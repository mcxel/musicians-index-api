# MASTER_ROUTE_AND_PAGE_MAP.md
## Every Route, Page, and Screen — Complete Platform Map
### BerntoutGlobal XXL / The Musician's Index

---

## PUBLIC ROUTES (No auth required)

### Homepage + Discovery
```
/                          → TMI Magazine Cover + Belt Homepage
/live                      → Live World (lobby wall only)
/lobby                     → Full Lobby Wall (viewers_asc)
/discover                  → Discovery page (genres, trending, new)
/search?q=                 → Search results
/feed                      → Activity feed (personalized after auth)
/random                    → Jump to random active room
/rankings                  → Season rankings
/hall-of-fame              → Winner Hall
/billboard                 → Billboard Top 10 Charts
```

### Profiles (Public)
```
/artists/[slug]            → Artist profile page
/artists/[slug]/about      → Artist extended bio
/artists/[slug]/media      → Media vault
/artists/[slug]/events     → Artist events
/artists/[slug]/fan-club   → Fan club landing
/artists/[slug]/beats      → Producer beat listings
/artists/[slug]/articles   → Artist-authored articles
/artists/[slug]/store      → Artist digital store
/producers/[slug]          → Producer profile
/fans/[username]           → Fan profile
/venues/[slug]             → Venue profile
/groups/[slug]             → Group/band profile
```

### Editorial / Articles
```
/editorial                 → Magazine homepage (all article categories)
/editorial/[slug]          → Article page
/editorial/category/[cat]  → Category: music-news, tabloid, local, interviews, science
/editorial/topic/[topic]   → Topic tag page
/news                      → Breaking music news ticker page
/interviews                → Interview archive
/studio-recaps             → Cypher/session recaps
```

### Events + Shows
```
/events                    → Event calendar
/events/[slug]             → Event detail + ticket purchase
/shows/[id]                → Live show room
/shows/[id]/replay         → Show replay/VOD
/tickets/[eventId]         → Ticket purchase page
```

### Games + Competitions
```
/games                     → Game browser
/games/trivia              → Trivia lobby
/games/name-that-tune      → Name That Tune lobby
/games/deal-or-feud        → Deal or Feud lobby
/games/beat-challenge      → Beat Challenge lobby
/games/lyric-cipher        → Lyric Cipher lobby
/games/[sessionId]         → Active game session
/competitions              → Competition browser
/competitions/[slug]       → Competition detail + bracket
/competitions/[slug]/register → Registration page
/seasons                   → Seasons overview
/seasons/[slug]            → Season rankings
```

### Rooms
```
/rooms/[roomId]            → Room (arena/battle/cypher/producer/watch-party/game/etc.)
/rooms/[roomId]/replay     → Room replay
```

### Commerce
```
/beats                     → Beat Marketplace
/beats/[slug]              → Beat detail + license
/store                     → Platform store
/store/[artistSlug]        → Artist store
/merch/[artistSlug]        → Artist merch
```

### Party
```
/party                     → Public party browser
/party/create              → Create party
/party/[partyId]           → Party lobby
/party/[partyId]/invite    → Invite page
```

### Advertiser / Sponsor (Public)
```
/advertise                 → Advertiser overview
/advertise/packages        → Pricing and packages
/advertise/homepage        → Homepage ad products
/advertise/articles        → Article ad products
/advertise/shows           → Show/live ad products
/advertise/games           → Game ad products
/advertise/rooms           → Room ad products
/advertise/examples        → Creative examples
/advertise/pricing         → Full pricing table
/sponsors                  → Sponsor overview
/partners                  → Partner page
/local-ads                 → Local business advertising
/brand-safe                → Brand safety policy
```

### Informational
```
/about                     → About TMI / BerntoutGlobal
/artists/apply             → Artist application
/help                      → Help center
/help/[topic]              → Help article
/support                   → Support form
/community-guidelines      → Community guidelines
/terms                     → Terms of service
/privacy                   → Privacy policy
/careers                   → Jobs
/status                    → Platform status page
```

---

## AUTH ROUTES

```
/login                     → Sign in
/register                  → Create account
/register/artist           → Artist signup
/register/fan              → Fan signup
/register/venue            → Venue signup
/register/sponsor          → Sponsor signup
/onboarding                → Post-signup onboarding
/onboarding/profile        → Profile setup step
/onboarding/preferences    → Genre/interest preferences
/onboarding/follow         → Suggested artists to follow
/forgot-password           → Password reset request
/reset-password/[token]    → Password reset form
/verify-email/[token]      → Email verification
```

---

## DASHBOARD ROUTES (Auth required)

### Artist Dashboard
```
/dashboard                 → Role-based redirect
/dashboard/artist          → Artist overview
/dashboard/artist/rooms    → My rooms + schedule
/dashboard/artist/media    → Media upload + management
/dashboard/artist/articles → Article authoring
/dashboard/artist/bookings → Booking requests
/dashboard/artist/fan-club → Fan club management
/dashboard/artist/beats    → Beat management
/dashboard/artist/store    → Store management
/dashboard/artist/earnings → Earnings + payouts
/dashboard/artist/analytics → Performance analytics
```

### Fan Dashboard
```
/dashboard/fan             → Fan overview
/dashboard/fan/following   → Following list
/dashboard/fan/fan-clubs   → My fan club memberships
/dashboard/fan/activity    → Activity history
/dashboard/fan/achievements → Achievements
/dashboard/fan/stream-win  → Stream & Win score
```

### Advertiser Dashboard
```
/dashboard/advertiser      → Campaign overview
/dashboard/advertiser/campaigns → Active campaigns
/dashboard/advertiser/creatives → Creative assets
/dashboard/advertiser/billing → Billing + invoices
/dashboard/advertiser/analytics → Performance data
/dashboard/advertiser/slots → Booked slots
```

### Shared Dashboard
```
/wallet                    → Wallet + balance
/credits                   → Fan credits
/notifications             → Notification center
/settings                  → Account settings
/settings/profile          → Profile settings
/settings/privacy          → Privacy settings
/settings/notifications    → Notification preferences
/settings/billing          → Payment methods
/settings/account          → Account + deletion
/family                    → Family account management
/family/accounts           → Child accounts
```

---

## ADMIN ROUTES (Admin role required)

```
/admin                     → Admin overview
/admin/command-center      → Global Command Center (6 panels)
/admin/homepage            → Homepage belt editor
/admin/editorial           → Editorial queue
/admin/rooms               → Room management
/admin/shows               → Show management
/admin/contests            → Contest management
/admin/games               → Game management

/admin/advertisers         → Advertiser accounts
/admin/campaigns           → All campaigns
/admin/slots               → Slot inventory
/admin/approvals           → Creative approval queue
/admin/pricing             → Pricing editor
/admin/house-ads           → House ad manager
/admin/brand-safety        → Brand safety + blacklist

/admin/finance             → Finance overview
/admin/finance/profit      → Weekly profit snapshots
/admin/finance/payouts     → Owner payout history
/admin/finance/reserves    → Reserve management
/admin/finance/revenue     → Revenue breakdown
/admin/finance/owner-settings → Payout destinations
/admin/finance/tax         → Tax export

/admin/users               → User management
/admin/moderation          → Moderation queue
/admin/reports             → Report management
/admin/bots                → Bot status + manual triggers
/admin/feature-flags       → Feature flag management
/admin/analytics           → Platform analytics
/admin/logs                → System logs
/admin/emergency           → Emergency controls
```

---

## API ROUTES (apps/api/)

All defined in Pack 25 API_CONTRACTS.md + Pack 28 additions:

### New API Routes from Pack 28
```
GET  /api/home/composition          → Homepage belt data
GET  /api/home/cover                → Current week cover data
GET  /api/editorial/articles        → Article list
GET  /api/editorial/[slug]          → Article detail + ad slots
GET  /api/games/sessions            → Active game sessions
POST /api/games/sessions            → Create game session
GET  /api/games/sessions/[id]       → Game session state
POST /api/games/sessions/[id]/join  → Join game session
GET  /api/party                     → Public party list
POST /api/party                     → Create party
GET  /api/party/[id]               → Party state
POST /api/party/[id]/join          → Join party
GET  /api/ads/slot/[slotId]        → Get ad for slot
POST /api/ads/campaigns             → Create ad campaign (ADVERTISER)
GET  /api/ads/campaigns/[id]       → Campaign status
POST /api/ads/campaigns/[id]/approve → Approve campaign (ADMIN)
GET  /api/ads/analytics/[campaignId] → Campaign analytics
POST /api/stream-and-win/event     → Record Stream & Win event
GET  /api/stream-and-win/score     → Get user score
```
