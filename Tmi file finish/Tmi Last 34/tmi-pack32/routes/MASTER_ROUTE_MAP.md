# MASTER_ROUTE_MAP.md
## Every Route — Complete Platform Route Registry
### BerntoutGlobal XXL / The Musician's Index

---

## PUBLIC ROUTES

### Magazine + Editorial
```
/                          Homepage portal (magazine-first)
/magazine                  Magazine front — "Welcome to TMI Magazine"
/magazine/front            Same as /magazine
/magazine/featured         Featured performer article
/magazine/news             News billboard
/magazine/interviews       Interview archive
/magazine/reviews          Review archive
/magazine/tutorials        Tutorials archive
/magazine/trending         Trending editorial
/magazine/local            Local artist editorial
/magazine/events           Event editorial
/articles                  All articles
/articles/[slug]           Article page (ALWAYS includes station link)
/news                      News hub
/news/[slug]               News story
/editorial                 Editorial department page
```

### Profiles
```
/artists                   Artist directory
/artists/[slug]            Artist public profile (alias for /profile/artist/[slug])
/profile/artist/[slug]     Artist profile (with station link, earnings badge if owner)
/profile/fan/[slug]        Fan profile
/profile/producer/[slug]   Producer profile
/profile/dj/[slug]         DJ profile
/profile/band/[slug]       Band/group profile
/fans                      Fan directory
```

### Stations (use "Stations" not "Channels")
```
/stations                  Station directory
/stations/create           Create a station
/stations/[slug]           Station home (hub with sub-nav)
/stations/[slug]/schedule  Station schedule
/stations/[slug]/live      Station live session
/stations/[slug]/archive   Station archive
/stations/[slug]/sponsors  Station sponsors
/stations/[slug]/advertisers Station advertisers
/stations/[slug]/analytics Station analytics
/stations/[slug]/store     Station store (future, feature-flagged)
```

### Live + Lobby + Rooms + Party
```
/lobby                     Live lobby (viewers_asc sort — discovery-first)
/lobby/rooms               All active rooms
/lobby/party               Party browser
/lobby/room/[id]           Specific room
/live                      Live hub
/live/[roomId]             Active room (arena/battle/cypher/etc.)
/live/stage                Performer stage view
/live/backstage            Backstage
/live/chat                 Chat panel
/live/queue                Queue management
/live/replay               Replay/VOD
/party                     Public party browser
/party/create              Create party
/party/[partyId]           Party lobby
/party/[partyId]/invite    Party invite page
/shows                     Show archive
/shows/[id]                Show detail
/shows/[id]/replay         Show replay
```

### Discovery + Explore
```
/discover                  Discovery page
/explore                   Explore (broad discovery)
/search                    Search results
/trending                  Trending across platform
/recommended               Personalized recommendations
/featured                  Featured by editorial team
/genres/[genre]            Genre hub
/tags/[tag]                Tag hub
```

### Clips + Media
```
/clips                     Clip browser
/clips/[id]                Clip detail + share panel
/archive                   Platform archive
/replay/[id]               Replay player
```

### Contest + Games
```
/contest                   Contest browser
/contest/create            Create contest
/contest/[id]              Contest detail
/contest/[id]/entries      Contest entries
/contest/[id]/vote         Voting
/contest/[id]/leaderboard  Live leaderboard
/contest/[id]/results      Final results
/contest/[id]/bracket      Bracket view
/games                     Game browser
/games/trivia              Trivia lobby
/games/name-that-tune      Name That Tune lobby
/games/deal-or-feud        Deal or Feud lobby
/games/beat-challenge      Beat Challenge lobby
/games/[type]/[sessionId]  Active game session
/rankings                  Season rankings
/hall-of-fame              Hall of Fame / Winner Hall
/billboard                 Top 10 Charts billboard
```

### Commerce + Economy
```
/beats                     Beat Marketplace
/beats/[slug]              Beat detail + license
/wallet                    Wallet dashboard
/credits                   Fan credits
/earnings                  Earnings (logged in)
/earnings/history          Earnings history
/payouts                   Payout history
```

### Future Commerce (feature-flagged OFF)
```
/store                     Creator store browser
/store/[slug]              Artist store
/shop/[creatorSlug]        Artist shop (alias)
/products/[slug]           Product detail
/checkout                  Checkout (future)
/library                   My library (future)
/purchases                 My purchases (future)
/orders                    My orders (future)
```

### Sponsors + Advertisers
```
/sponsors                  Sponsor overview
/sponsors/local            Local sponsor matching
/sponsors/tasks            Sponsor tasks
/sponsors/opportunities    Open sponsorships
/sponsors/[id]             Specific sponsor
/advertise                 Advertiser overview
/advertise/packages        Pricing + packages
/advertise/homepage        Homepage ad products
/advertise/articles        Article ad products
/advertise/shows           Show ad products
/advertise/games           Game ad products
/advertise/rooms           Room ad products
/advertise/pricing         Full slot pricing table
/advertise/creative-specs  Creative spec sheet
/advertisers               Advertiser directory
/advertisers/[id]          Specific advertiser
/ads                       Ad library
/stores                    Local business directory
/stores/[slug]             Local store page
/stores/[slug]/artists     Store's sponsored artists
/stores/[slug]/campaigns   Store's campaigns
```

### Social + Notifications
```
/notifications             Notification center
/messages                  Inbox (future)
/feed                      Activity feed
```

### Info
```
/about                     About TMI
/help                      Help center
/help/[topic]              Help article
/support                   Support form
/community-guidelines      Community guidelines
/terms                     Terms of service
/privacy                   Privacy policy
/status                    Platform status
```

---

## AUTH ROUTES
```
/login                     Sign in
/register                  Create account
/register/artist           Artist signup
/register/fan              Fan signup
/register/venue            Venue signup
/register/sponsor          Sponsor signup
/onboarding/admin          Admin onboarding
/onboarding/artist         Artist onboarding
/onboarding/fan            Fan onboarding
/forgot-password           Password reset request
/reset-password/[token]    Password reset
/verify-email/[token]      Email verification
```

---

## DASHBOARD ROUTES (auth required)
```
/dashboard                 Role-based redirect
/dashboard/admin           Admin overview
/dashboard/artist          Artist dashboard (with earnings panel + coaching notes)
/dashboard/fan             Fan dashboard
/dashboard/artist/profile  My profile
/dashboard/artist/station  My station
/dashboard/artist/earnings Earnings panel
/dashboard/artist/payouts  Payout history
/dashboard/artist/revenue  Revenue breakdown
/dashboard/artist/sponsors My active sponsors
/dashboard/artist/sponsor-tasks Sponsor tasks
/dashboard/artist/clips    My clips
/dashboard/artist/media    Media library
/dashboard/artist/analytics Analytics
/dashboard/artist/store    My store (future)
/dashboard/advertiser      Advertiser campaigns overview
/dashboard/advertiser/campaigns Campaign list
/dashboard/advertiser/campaigns/new Create campaign
/dashboard/advertiser/creatives Creative assets
/dashboard/advertiser/billing Billing + invoices
/dashboard/advertiser/analytics Performance data
/settings                  Account settings
/settings/profile          Profile settings
/settings/privacy          Privacy settings
/settings/billing          Billing + subscription
/settings/notifications    Notification preferences
/settings/account          Account + deletion
/family                    Family account management
/family/accounts           Child accounts
```

---

## ADMIN ROUTES (admin role required)
```
/admin                     Admin overview
/admin/command-center      Global Command Center (6 panels)
/admin/homepage            Belt editor
/admin/editorial           Editorial queue
/admin/rooms               Room management
/admin/shows               Show management
/admin/contests            Contest management
/admin/games               Game management
/admin/advertisers         Advertiser accounts
/admin/campaigns           All campaigns
/admin/slots               Slot inventory
/admin/approvals           Creative approval queue
/admin/pricing             Pricing editor
/admin/house-ads           House ad manager
/admin/brand-safety        Brand safety + blacklist
/admin/finance             Finance overview
/admin/finance/profit      Weekly profit snapshots
/admin/finance/payouts     Owner payout history
/admin/finance/reserves    Reserve management
/admin/finance/revenue     Revenue breakdown
/admin/finance/owner-settings Payout destinations
/admin/finance/tax         Tax export
/admin/sales               Sales CRM
/admin/sales/leads         Lead pipeline
/admin/sales/proposals     Proposal list
/admin/sales/contracts     Contract management
/admin/users               User management
/admin/moderation          Moderation queue
/admin/reports             Report management
/admin/bots                Bot status + manual triggers
/admin/pipelines           Pipeline status
/admin/feature-flags       Feature flag management
/admin/analytics           Platform analytics
/admin/logs                System logs
/admin/emergency           Emergency controls
/admin/health              System health dashboard
```
