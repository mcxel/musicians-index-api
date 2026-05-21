# MASTER_ROUTE_INDEX.md
## Every Route on the Platform — Public, Protected, Admin

---

## PUBLIC ROUTES

### World / Discovery
| Route | Page Shell | Status |
|---|---|---|
| `/` | HomepageCover (Page 1) | PARTIAL |
| `/live` | HomepageLiveWorld (Page 2) | PARTIAL |
| `/editorial` | HomepageEditorial (Page 3) | PARTIAL |
| `/live-world-extended` | LiveWorldExtendedShell | MISSING |
| `/lobby` | LobbyShell | MISSING |
| `/lobby/wall` | LobbyWallPanel | MISSING |
| `/lobby/random` | RandomJoinGateway | MISSING |
| `/discover` | DiscoveryPageShell | MISSING |
| `/calendar` | EventCalendarShell | MISSING |
| `/leaderboards` | LeaderboardsShell | PARTIAL |
| `/archive` | ArchiveShell | MISSING |
| `/world-map` | WorldMapShell | MISSING |
| `/cities` | CitiesListShell | MISSING |
| `/cities/[slug]` | CitySceneShell | MISSING |
| `/scenes` | ScenesShell | MISSING |
| `/trending` | TrendingShell | MISSING |
| `/genres` | GenresShell | MISSING |
| `/premieres` | PremieresShell | MISSING |
| `/seasons` | SeasonsShell | MISSING |
| `/rankings` | RankingsShell | MISSING |
| `/awards` | AwardsShell | MISSING |
| `/hall-of-fame` | HallOfFameShell | MISSING |
| `/results` | ResultsShell | MISSING |
| `/highlights` | HighlightsShell | MISSING |
| `/tournaments` | TournamentsShell | MISSING |

### Artist / Producer
| Route | Page Shell | Status |
|---|---|---|
| `/artists/[slug]` | ArtistProfileHub | PARTIAL |
| `/artists/[slug]/media` | ArtistMediaPage | MISSING |
| `/artists/[slug]/articles` | ArtistArticlesPage | MISSING |
| `/artists/[slug]/battles` | ArtistBattlesPage | MISSING |
| `/artists/[slug]/cyphers` | ArtistCyphersPage | MISSING |
| `/artists/[slug]/bookings` | ArtistBookingsPage | MISSING |
| `/artists/[slug]/sponsors` | ArtistSponsorsPage | MISSING |
| `/artists/[slug]/timeline` | ArtistTimelinePage | MISSING |
| `/producers/[slug]` | ProducerProfileHub | MISSING |
| `/producers/[slug]/beats` | ProducerBeatsPage | MISSING |
| `/producers/[slug]/collabs` | ProducerCollabsPage | MISSING |

### Venues / Events
| Route | Page Shell | Status |
|---|---|---|
| `/venues/[slug]` | VenuePageShell | MISSING |
| `/venues/[slug]/rooms` | VenueRoomsPage | MISSING |
| `/venues/[slug]/schedule` | VenueSchedulePage | MISSING |
| `/venues/[slug]/archive` | VenueArchivePage | MISSING |
| `/events/[slug]` | EventPageShell | MISSING |
| `/events/[slug]/watch` | EventWatchPage | MISSING |
| `/events/[slug]/recap` | EventRecapPage | MISSING |
| `/events/[slug]/results` | EventResultsPage | MISSING |
| `/events/[slug]/bracket` | EventBracketPage | MISSING |

### Rooms
| Route | Page Shell | Status |
|---|---|---|
| `/arena` | ArenaRoomShell | SHELL |
| `/battle` | BattleRoomShell | SHELL |
| `/cypher` | CypherRoomShell | SHELL |
| `/cypher/mini` | MiniCypherRoomShell | SHELL |
| `/producer-room` | ProducerRoomShell | SHELL |
| `/watch-room` | WatchRoomShell | SHELL |
| `/listening-party` | ListeningPartyRoomShell | SHELL |
| `/workshop-room` | WorkshopRoomShell | SHELL |
| `/interview-room` | InterviewRoomShell | SHELL |
| `/sponsor-room` | SponsorRoomShell | SHELL |
| `/backstage` | BackstageRoomShell | MISSING |
| `/green-room` | GreenRoomShell | MISSING |
| `/soundcheck` | SoundcheckRoomShell | MISSING |
| `/premiere-room` | PremiereRoomShell | MISSING |
| `/awards-room` | AwardsRoomShell | MISSING |
| `/collab-room` | CollabRoomShell | MISSING |
| `/writing-room` | WritingRoomShell | MISSING |

### Platform Info
| Route | Status |
|---|---|
| `/features` | MISSING |
| `/how-it-works` | MISSING |
| `/for-artists` | MISSING |
| `/for-producers` | MISSING |
| `/for-venues` | MISSING |
| `/for-sponsors` | MISSING |
| `/press` | MISSING |
| `/partners` | MISSING |

### Support / Policy
| Route | Status |
|---|---|
| `/help` | MISSING |
| `/support` | MISSING |
| `/status` | MISSING |
| `/report` | MISSING |
| `/appeals` | MISSING |
| `/safety` | MISSING |
| `/terms` | MISSING |
| `/privacy` | MISSING |
| `/community-guidelines` | MISSING |
| `/content-policy` | MISSING |
| `/rights-and-usage` | MISSING |

---

## PROTECTED ROUTES (Auth Required)

| Route | Role | Status |
|---|---|---|
| `/dashboard` | Any auth | PARTIAL |
| `/dashboard/fan` | Fan | PARTIAL |
| `/dashboard/artist` | Artist | PARTIAL |
| `/artist-dashboard` | Artist | MISSING |
| `/producer-dashboard` | Producer | MISSING |
| `/fan-dashboard` | Fan | MISSING |
| `/venue-dashboard` | Venue operator | MISSING |
| `/sponsor-dashboard` | Sponsor | MISSING |
| `/messages` | Any auth | MISSING |
| `/announcements` | Any auth | MISSING |
| `/invites` | Any auth | MISSING |
| `/requests` | Any auth | MISSING |
| `/collabs` | Any auth | MISSING |
| `/billing` | Any auth | MISSING |
| `/subscriptions` | Any auth | MISSING |
| `/onboarding/artist` | Artist | PARTIAL |
| `/onboarding/fan` | Fan | PARTIAL |

---

## ADMIN ROUTES (Big Ace Only)

| Route | Status |
|---|---|
| `/admin` | PARTIAL |
| `/admin/command-center` | MISSING |
| `/admin/rooms` | MISSING |
| `/admin/venues` | MISSING |
| `/admin/events` | MISSING |
| `/admin/watchdogs` | MISSING |
| `/admin/incidents` | MISSING |
| `/admin/recovery` | MISSING |
| `/admin/sponsors` | MISSING |
| `/admin/feature-flags` | MISSING |
| `/admin/bots` | MISSING |
| `/admin/logs` | MISSING |
| `/admin/health` | MISSING |
| `/admin/crown` | MISSING |
| `/admin/emergency` | MISSING |

---

---

# MASTER_ENGINE_INDEX.md
## Every Engine on the Platform — Owner, Status, Dependencies

---

## CORE RUNTIME ENGINES (All Complete or Near-Complete)

| Engine | Provider | Status | Used By |
|---|---|---|---|
| Audio Engine | AudioProvider | ✅ COMPLETE | Stream & Win, HUD, Preview, Rooms |
| HUD Engine | HudRuntimeProvider | ✅ COMPLETE | All surfaces |
| Shared Preview Engine | SharedPreviewProvider | ✅ COMPLETE | Rooms, Artist profiles, Venues |
| Turn/Queue Engine | TurnQueueProvider | ✅ COMPLETE | Battle, Cypher, Arena |
| Room Watchdog Engine | RoomWatchdogProvider | ✅ COMPLETE | All live rooms |
| Session Recovery Engine | SessionRecoveryProvider | ✅ COMPLETE | All live surfaces |
| Room Infrastructure Engine | RoomInfrastructureProvider | ✅ COMPLETE | All room families |
| Digital Venue Twin Engine | DigitalVenueTwinProvider | ✅ COMPLETE | Venue rooms |

## HOMEPAGE / DISCOVERY ENGINES

| Engine | Status | Priority |
|---|---|---|
| Crown Engine | PARTIAL | HIGH |
| Discovery Engine (lobby sort) | PARTIAL | HIGH |
| Countdown/Timer Engine | MISSING | HIGH |
| Live World Belt Engine | PARTIAL | HIGH |
| Spotlight Rotation Engine | MISSING | MEDIUM |
| Trending Engine | MISSING | MEDIUM |

## ROOM / LIVE ENGINES

| Engine | Status | Priority |
|---|---|---|
| Stage Director Engine | MISSING | HIGH |
| Live Announcer Engine | MISSING | HIGH |
| Room Flow State Machine | MISSING | HIGH |
| Audience Visibility Engine | MISSING | MEDIUM |
| Scene Restoration Engine | MISSING | HIGH |
| Voice/Media Mix Engine | MISSING | HIGH |
| Random Join/Matchmaking Engine | MISSING | HIGH |
| Adaptive Preview Layout Engine | MISSING | MEDIUM |

## WORLD / SIMULATION ENGINES

| Engine | Status | Priority |
|---|---|---|
| World Simulation Engine | MISSING | MEDIUM |
| Population Role Engine | MISSING | MEDIUM |
| World Map/Location Engine | MISSING | LOW |
| City Scene Engine | MISSING | LOW |
| World Control Engine | MISSING | MEDIUM |

## ECONOMY / BUSINESS ENGINES

| Engine | Status | Priority |
|---|---|---|
| Points/Rewards Engine | PARTIAL | HIGH |
| Sponsorship Campaign Engine | PARTIAL | HIGH |
| Booking/Contract Engine | PARTIAL | MEDIUM |
| Payments/Payout Engine | MISSING | HIGH |
| Commerce/Merch Engine | PARTIAL | MEDIUM |
| Mission/Achievement Engine | MISSING | MEDIUM |
| Ticketing Engine | MISSING | LOW |

## IDENTITY / SOCIAL ENGINES

| Engine | Status | Priority |
|---|---|---|
| Social Connection Graph | PARTIAL | HIGH |
| Trust/Verification Engine | MISSING | MEDIUM |
| Reputation Graph | MISSING | MEDIUM |
| Crew/Collective Engine | MISSING | LOW |

## ARCHIVE / MEMORY ENGINES

| Engine | Status | Priority |
|---|---|---|
| Archive/Legacy Engine | MISSING | MEDIUM |
| Highlight/Clip Engine | MISSING | MEDIUM |
| Timeline/History Engine | MISSING | MEDIUM |
| Live-to-Editorial Bridge | MISSING | LOW |

## MEDIA / RIGHTS ENGINES

| Engine | Status | Priority |
|---|---|---|
| Approved Media Source Engine | MISSING | HIGH |
| Media Library/Upload Engine | MISSING | HIGH |
| Preview Media Quality Engine | MISSING | MEDIUM |
| Thumbnail/Poster Engine | MISSING | MEDIUM |
| Asset Pipeline Engine | MISSING | HIGH |

---

---

# MASTER_BOT_INDEX.md
## All 26+ Bots — Trigger, Owner, Scope, Status

---

## BOT MASTER TABLE

| Bot | Trigger | Owner | May Auto-Fix | Cannot Touch | Status |
|---|---|---|---|---|---|
| `crown-bot` | Sun midnight | Big Ace | crown_state, homepage | Design, security | DESIGNED |
| `archivist-bot` | Sun midnight | Big Ace | issues archive | Live data | DESIGNED |
| `discovery-bot` | Every 15min | Algorithm | lobby sort order | Rankings | DESIGNED |
| `broadcaster-bot` | Show start | Framework | audio stream | System config | DESIGNED |
| `director-bot` | During events | Framework | camera signals | Stream encode | DESIGNED |
| `hype-bot` | During events | Framework | VFX triggers | User data | DESIGNED |
| `loot-bot` | Hype > 80% | Big Ace | loot_drop_events | Economy ledger | DESIGNED |
| `oracle-bot` | Daily 9am | Algorithm | polls, trivia | Rankings | DESIGNED |
| `design-bot` | Avatar create | Framework | style suggestions | Avatar save | DESIGNED |
| `guardian-bot` | Continuous | Big Ace | mute, timeout | Crown, rankings | DESIGNED |
| `qc-bot` | Avatar save | Framework | block/approve | User data | DESIGNED |
| `janitor-bot` | Every 5min | Framework | ghost cleanup | Live state | DESIGNED |
| `metronome-bot` | 100ms pulse | Mainframe | sync signal | All state | DESIGNED |
| `accountant-bot` | Real-time | Big Ace | earnings ledger | Payout queue | DESIGNED |
| `mechanic-bot` | FPS monitor | Framework | LOD levels | Core render | DESIGNED |
| `interview-bot` | Weekly | Algorithm | article drafts | Publishing | DESIGNED |
| `news-bot` | Hourly | Algorithm | news drafts | Publishing | DESIGNED |
| `clip-bot` | During events | Framework | clip requests | Stream source | DESIGNED |
| `spin-bot` | On login | Framework | spin results | Earnings | DESIGNED |
| `foley-bot` | During events | Framework | audio pan signals | Stream audio | DESIGNED |
| `empath-bot` | Opt-in live | Framework | avatar expression | Raw video | DESIGNED |
| `rewind-bot` | Event end | Framework | archive package | Live data | DESIGNED |
| `location-bot` | Page load | Framework | HUD coordinates | User location | DESIGNED |
| `experiment-bot` | Weekly | Algorithm | experiment config | Crown, design | DESIGNED |
| `self-review-bot` | Weekly Sun | Algorithm | review report | Any config | DESIGNED |
| `brand-audit-bot` | Weekly Sun | Algorithm | brand compliance | Published content | DESIGNED |
| `editor-bot` | On publish | Algorithm | content quality scores | Brand words | DESIGNED |

## MISSING BOTS (Still Worth Adding)

| Bot | Purpose | Priority |
|---|---|---|
| `stage-director-bot` | Manage room flow, turns, announcements | HIGH |
| `scene-transition-bot` | Control preview window transitions | HIGH |
| `preview-layout-bot` | Optimize preview dock placement | MEDIUM |
| `audience-pulse-bot` | Monitor room energy and reactions | MEDIUM |
| `room-summary-bot` | Generate room recaps | MEDIUM |
| `matchmaking-bot` | Route users to best-fit rooms | HIGH |
| `venue-sync-bot` | Sync digital twin to real venue data | MEDIUM |
| `highlight-capture-bot` | Auto-mark highlight moments | MEDIUM |
| `invite-routing-bot` | Route invites between artists/producers | MEDIUM |
| `results-recap-bot` | Generate battle/event results pages | HIGH |
| `ranking-update-bot` | Update leaderboards after events | HIGH |
| `support-triage-bot` | Route support requests | LOW |
| `safety-escalation-bot` | Escalate moderation incidents | HIGH |
| `overlay-priority-bot` | Manage overlay stacking conflicts | MEDIUM |
| `seed-data-refresh-bot` | Keep demo world data fresh | LOW |
| `world-simulation-bot` | Manage population and occupancy | MEDIUM |
| `compliance-check-bot` | App store/legal compliance checks | MEDIUM |
| `billing-integrity-bot` | Audit subscription/payment events | HIGH |
| `load-spike-bot` | Alert on traffic spikes | MEDIUM |
| `migration-safety-bot` | Validate DB migrations before apply | HIGH |

---

*MASTER_ROUTE_INDEX + MASTER_ENGINE_INDEX + MASTER_BOT_INDEX v1.0*
*BerntoutGlobal XXL / The Musician's Index*
