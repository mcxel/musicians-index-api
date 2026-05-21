# MASTER_EXECUTION_MATRIX.md
## Every World, Route, Bot, and Money Flow — Complete Tracking
### BerntoutGlobal XXL / The Musician's Index

Status: ✅ Designed | 🔧 Needs Wiring | ⚠️ Not Started | ✓ Launch Ready

---

## DISCOVERY / LOBBY WORLD

| Feature | Route | Provider | API | DB | WS Event | Status |
|---|---|---|---|---|---|---|
| Homepage (Crown + Cover) | / | RoomInfrastructure | getHomeData | Room | — | ✅ |
| Live World (Lobby) | /live | RoomInfrastructure | getRoomList(viewers_asc) | Room, Viewer | room:viewer_count | ✅ |
| Lobby Wall | /lobby | RoomInfrastructure | getRoomList(viewers_asc) | Room | room:viewer_count | 🔧 |
| Discovery | /discover | none | getDiscovery | Artist, Room | — | 🔧 |
| Search | /search | none | /api/search | Index | — | 🔧 |
| Random Page | /random | none | getRandomPage | various | — | ⚠️ |

## PROFILE WORLD

| Feature | Route | Provider | API | DB | Diamond? | Status |
|---|---|---|---|---|---|---|
| Artist Profile | /artists/[slug] | none (SSR) | getArtistProfile | Profile | YES for Marcel/BJ | 🔧 |
| Producer Profile | /producers/[slug] | none (SSR) | getProducerProfile | Profile | — | 🔧 |
| Artist Media | /artists/[slug]/media | none | getArtistMedia | Media | — | ⚠️ |
| Artist Fan Club | /fan-club/[slug] | none | /api/fan-clubs | FanClub | — | 🔧 |

## LIVE ROOM WORLD

| Feature | Route | Provider | API | DB | WS Events | Status |
|---|---|---|---|---|---|---|
| Arena Room | /arena | RoomInfrastructure, Audio, Preview, Queue | /api/rooms/* | Room, Roster | room:* | 🔧 |
| Battle Room | /battle | + BattleRoom | /api/battles/* | Battle | battle:* | 🔧 |
| Cypher Room | /cypher | + CypherRoom | /api/rooms/* | Room, Roster | room:* | 🔧 |
| Producer Room | /producer-room | + ProducerBeat | /api/rooms/* | Room, Beat | room:* | 🔧 |

## ECONOMY WORLD

| Feature | Route | Provider | API | DB | Stripe | Status |
|---|---|---|---|---|---|---|
| Tips in rooms | in-room | none (hook) | /api/tips/* | Tip, Wallet | PaymentIntent | 🔧 |
| Wallet dashboard | /wallet | WalletProvider | /api/wallet | Wallet, Transaction | Connect payout | 🔧 |
| Fan credits | /credits | WalletProvider | /api/credits | Wallet | PaymentIntent | 🔧 |
| Fan club subs | /fan-club/* | none | /api/fan-clubs | FanClub, Membership | Subscription | 🔧 |
| Beat licensing | /beats | none | /api/beats | Beat, BeatLicense | PaymentIntent | 🔧 |
| Ticket purchase | /events/* | none | /api/tickets/* | Ticket | PaymentIntent | 🔧 |
| Payout onboarding | /wallet | WalletProvider | /api/wallet/payout-* | Wallet, Payout | Connect Express | 🔧 |

## COMPETITION WORLD

| Feature | Route | Provider | API | DB | Bot | Status |
|---|---|---|---|---|---|---|
| Seasons | /seasons | none | /api/seasons | Season, RankEntry | season-management-bot | 🔧 |
| Competitions | /competitions | none | /api/competitions | Competition | competition-bracket-bot | 🔧 |
| Rankings | /rankings | none | /api/rankings | RankEntry | ranking-update-bot | 🔧 |
| Hall of Fame | /hall-of-fame | none | /api/hall-of-fame | SeasonAward | — | ⚠️ |

## EDITORIAL WORLD

| Feature | Route | ISR TTL | API | Bot | Status |
|---|---|---|---|---|---|
| Magazine Homepage | /editorial | 1h | /api/editorial | content-rotation-bot | 🔧 |
| Article | /editorial/[slug] | 1h | /api/editorial/:slug | — | 🔧 |
| News | /news/* | 30min | /api/news | breaking-news-bot | ⚠️ |

## SAFETY / FAMILY WORLD

| Feature | Route | Auth | Check | Bot | Status |
|---|---|---|---|---|---|
| Family Dashboard | /family | PARENT | — | — | ⚠️ |
| Kid Performer Approval | /family/accounts | PARENT | — | ParentApprovalBot | ⚠️ |
| Kid communication | global | CHILD | canSendMessage() | KidSafetyBot | 🔧 |
| Ticket anti-bot | ticket purchase | any | purchaseCheck() | — | 🔧 |

## OWNER PROFIT TRACKING

| Item | Schedule | Manual Action | Status |
|---|---|---|---|
| Revenue collected | Real-time | — | 🔧 |
| Artist splits calculated | Per transaction | — | 🔧 |
| Platform net profit | Weekly Sunday midnight | — | ⚠️ |
| Owner distribution (Marcel, Jay Paul) | Weekly | Big Ace confirms via /admin/finance | ⚠️ |
| PayPal transfer | Weekly | Big Ace initiates manually | ⚠️ |

---

## LEGEND
✅ Designed and built
🔧 Designed, needs Copilot wiring
⚠️ Shell exists, needs both design and wiring
✓ Wired, proved, launch ready
