# MASTER_DATA_AND_EVENT_MAP.md
## What Powers Every Card, What Updates It, What Breaks It

---

## HOMEPAGE 1 (COVER) DATA SOURCES

| Card | Data Source | Update Trigger | Fallback |
|---|---|---|---|
| Crown Card (#1) | `GET /api/crown/current` | Crown Bot Sunday midnight | Show last known #1 |
| Artist Ring (#2–10) | `GET /api/rankings/top10` | Crown Bot | Show static rank list |
| Comic Insert | `GET /api/issues/current/comic-insert` | Weekly (Big Ace approved) | Show "Coming soon" placeholder |
| Cover tagline | `GET /api/issues/current` | Weekly issue publish | Show default tagline |
| Masthead/issue name | Issue config | Weekly issue publish | "Current Week" |

## HOMEPAGE 2 (LIVE WORLD) DATA SOURCES

| Card | Data Source | Update Trigger | Fallback |
|---|---|---|---|
| Main Preview Lobby | `GET /api/live/featured` | Every 30s | Standby state |
| Lobby Wall | `GET /api/live/all?sort=viewers_asc` | Every 15s | Empty state |
| World Premiere countdown | `GET /api/events/premiere/next` | Event schedule | "No premiere scheduled" |
| Event Calendar | `GET /api/events/upcoming` | Content publish | Empty calendar |
| Undiscovered Boost | `GET /api/discovery/boost-artist` | Discovery Bot every 15min | Empty state |
| Cypher Arena status | `GET /api/rooms?type=cypher` | Real-time | "No battles active" |
| Stream & Win score | `GET /api/points/stream-score` | Real-time stream | Cached last value |

## HOMEPAGE 3 (EDITORIAL) DATA SOURCES

| Card | Data Source | Update Trigger | Fallback |
|---|---|---|---|
| Article Feature | `GET /api/articles/featured` | Weekly editorial publish | Empty skeleton |
| News Ticker | `GET /api/news/latest` | News Bot hourly | Last cached news |
| Interviews | `GET /api/articles?type=interview&limit=1` | Weekly | Empty state |
| Studio Recaps | `GET /api/articles?type=recap&limit=1` | Post-cypher | Empty state |
| Genre Cluster | Static config + `GET /api/genres/active` | Config change | All 6 genres static |
| Top 10 Charts | `GET /api/rankings/charts` | Rankings Bot daily | Cached chart |
| Weekly Playlists | `GET /api/playlists/featured` | Weekly | Empty state |
| Store | `GET /api/store/featured` | Manual publish | Empty state |
| Achievements (user) | `GET /api/users/[id]/achievements` | Real-time | 0 pts placeholder |
| Sponsor Spotlight | `GET /api/sponsors/active?placement=homepage3` | Campaign active | Fallback sponsor card |

---

# HOMEPAGE_PROOF_GATES.md
## Pass All of These Before Copilot Can Call Homepages "Done"

---

## HOMEPAGE 1 PROOF GATES

- [ ] Crown Card loads with correct #1 artist portrait
- [ ] Crown Card 6-second motion clip plays (muted by default)
- [ ] Artists #2–#10 render in ring layout around center
- [ ] #2–#10 show rank numbers in corners
- [ ] #2–#10 micro-motion loops play (3 seconds)
- [ ] Comic Insert panel renders in correct corner position
- [ ] Comic Insert content matches current week's approved insert
- [ ] Cover tagline reads "Who took the crown this week?"
- [ ] Issue name shows "Current Week" (or real issue name)
- [ ] Corner peel interaction triggers → page transitions to Homepage 2
- [ ] Bottom page strip shows pages 1, 2, 3 with current highlighted
- [ ] Page strip click works (all 3 pages)
- [ ] Crown rotation: after 8 weeks, Crown Bot forces new #1 ✅
- [ ] Homepage 1 crown state persists after page refresh

## HOMEPAGE 2 PROOF GATES

- [ ] Main Preview Lobby shows live artist video (or standby state)
- [ ] `● LIVE` badge pulses red when stream is active
- [ ] Lobby Wall shows 8 artist thumbnails
- [ ] **CRITICAL: Lobby Wall artists sorted least-viewers-first**
- [ ] Artist with 0 viewers is in position 1 of Lobby Wall
- [ ] Join Random Room button navigates to a random active room
- [ ] World Premieres countdown ticks correctly (not frozen)
- [ ] Event Calendar shows correct upcoming events
- [ ] Undiscovered Boost shows artist with lowest total views
- [ ] Cypher Arena Gateway opens cypher room list
- [ ] Stream & Win score updates as music plays
- [ ] Standby mode activates when no active streams
- [ ] "Please Stand By" shows in standby mode

## HOMEPAGE 3 PROOF GATES

- [ ] Article Feature card shows correct featured article
- [ ] Article Feature click opens the article
- [ ] News Ticker scrolls with real headlines
- [ ] Interviews card shows latest interview
- [ ] Studio Recaps shows latest recap
- [ ] Genre Cluster hexagons: all 6 genres render
- [ ] Genre Cluster: click Hip Hop → opens Hip Hop genre page
- [ ] Top 10 Charts shows ranked list (not placeholder)
- [ ] Weekly Playlists "Index Picks" opens correct playlist
- [ ] Store featured merch renders
- [ ] My Achievements shows user's current score
- [ ] Booking Portal link works
- [ ] Sponsor Spotlight respects timing rules (not covering cover art)
- [ ] Sponsor Spotlight fallback renders if no active campaign

## SHARED PROOF GATES (All 3 Pages)

- [ ] Shared Header renders on all 3 pages
- [ ] Crown badge in header matches current crown winner
- [ ] Search icon opens search
- [ ] Notification bell shows unread count
- [ ] Profile icon links to user profile
- [ ] Card positions persist after page refresh (logged-in user)
- [ ] Layout resets on demand ("Reset Layout" option works)
- [ ] Reduced motion mode: no animations, instant page transitions
- [ ] Mobile: all belts scroll vertically
- [ ] Mobile: swipe left/right changes homepage
- [ ] Status Footer renders with coordinates + signal

---

# FAILURE_STATE_AND_FALLBACK_MATRIX.md
## What the Platform Does When Things Break

---

## RULE: The Platform Never Shows a Blank Page or Crashes

| Failure | User Sees | System Does |
|---|---|---|
| Auth expired | "Session ended" → redirect to login | Preserve intended destination |
| Crown API down | Last known #1 from cache | Log error, alert Big Ace |
| No live rooms | Standby mode on Homepage 2 | 80s "Please Stand By" card |
| Stream offline | "Stream unavailable" overlay | Julius helper message |
| Article not found | Clean 404 page, suggest homepage | Log 404 event |
| Artist not found | Clean 404 page, suggest discovery | Log 404 event |
| Countdown expired | "This release is now live" | Open release page |
| Sponsor data missing | Fallback sponsor card (house ad) | Log sponsor miss |
| Lobby Wall empty | "No artists live right now" | Suggest upcoming events |
| Stream & Win API down | Hide widget | Don't show error to user |
| Discovery API down | Sort by most recent join date | Log degraded mode |
| Face scan fails | "Try again or skip" | Offer manual avatar builder |
| Audience overflow | Route to overflow venue | Notify user: "You're in overflow" |
| Bot failure | Bot logs error, page falls to static | Mechanic Bot auto-scales |
| Issue not published | Show previous issue | Log missing publish |
| Daily Spin unavailable | Show timer for next spin | Don't block other actions |
| Broadcaster silent | Music plays without commentary | Director Bot activates fallback |
| VHS shader fails | Platform renders without shader | No visual error shown |
| Low performance mobile | Auto lite-mode | Notify user once |
| Session restore fails | Fresh session, same destination | Log recovery miss |

---

# MASTER_LOGGING_AND_OBSERVABILITY_MAP.md
## Every Event the Platform Tracks

---

## HOMEPAGE EVENTS

| Event | Data Logged |
|---|---|
| `homepage.view` | page (1/2/3), user tier, timestamp |
| `card.move` | card_id, old_pos, new_pos, page |
| `card.click` | card_id, card_type, destination, timestamp |
| `page.flip` | from_page, to_page, method (peel/strip/swipe) |
| `corner.peel` | page, direction |
| `crown.view` | crown_artist_id, week_number |

## LIVE EVENTS

| Event | Data Logged |
|---|---|
| `room.join` | room_id, artist_id, venue_tier, user_tier |
| `room.leave` | room_id, watch_duration_seconds |
| `preview.lobby.open` | artist_id, from_page |
| `join.random.room` | room_id, result |
| `stream.start` | artist_id, venue_id, timestamp |
| `stream.end` | duration, peak_viewers, tips_total |

## ECONOMY EVENTS

| Event | Data Logged |
|---|---|
| `tip.sent` | amount, artist_id, event_id |
| `points.earned` | amount, action, user_id |
| `subscription.upgraded` | old_tier, new_tier, user_id |
| `spin.result` | reward_type, reward_value, user_id |
| `stream.points.accrued` | minutes, points, playlist_id |

## BOT EVENTS

| Event | Data Logged |
|---|---|
| `bot.run` | bot_id, trigger, duration_ms, result |
| `bot.fail` | bot_id, error, fallback_used |
| `crown.rotation` | outgoing_artist, incoming_artist, week |
| `discovery.sort.updated` | count_artists, timestamp |
| `loot.drop` | event_id, winner_user_id, reward |

## ERRORS

| Event | Data Logged |
|---|---|
| `route.404` | path, referrer, user_id |
| `api.error` | endpoint, status_code, user_id |
| `performance.degraded` | fps, device_type, action |
| `bot.escalation` | bot_id, issue, escalated_to |

---

# MASTER_CONTENT_OWNERSHIP_AND_APPROVALS.md
## Who Controls What — The Company Chain of Command

---

| Content Area | Creates | Approves | Can Override |
|---|---|---|---|
| Homepage cover copy | Algorithm/Editorial Bot | Marcel (suggests), Big Ace (approves) | Big Ace |
| Comic insert content | Comic Bot generates candidates | Big Ace | Big Ace |
| Crown rotation | Crown Bot | Automatic | Big Ace |
| Issue theme | Marcel (suggests) | Big Ace | Big Ace |
| Featured articles | Interview Bot drafts | Editorial Team + Big Ace | Big Ace |
| Sponsor placements | Sponsors submit | Big Ace (approve) | Big Ace |
| Sponsor creative | Sponsors submit | Big Ace (approve) | Big Ace |
| Ranking overrides | Algorithm | Big Ace only | Big Ace |
| Artist verification | Artist submits | Admin review | Big Ace |
| Event scheduling | Artists | Calendar Bot (conflict check) | Big Ace |
| Broadcaster voice config | Voice Clone Bot | Big Ace | Big Ace |
| Bot configuration | Framework | Big Ace | Big Ace |
| Platform announcements | Marcel (drafts) | Big Ace | Big Ace |
| Emergency broadcasts | Big Ace only | — | — |
| Feature flags | Framework | Big Ace | Big Ace |

---

# COPILOT_WIRING_ONLY_LIST.md
## What Claude Owns, What Copilot Must Wire

---

## CLAUDE COMPLETE (DO NOT REWIRE)

All spec/design/architecture documents in:
- All 12 packs (tmi-pack1 through tmi-pack12)
- All system contracts and TypeScript interfaces
- All bot manifests
- All config file schemas
- All route definitions
- All proof gate checklists

---

## COPILOT WIRES — NOW (After Cloudflare Green)

| File | What Copilot Does |
|---|---|
| `apps/web/src/app/(magazine)/page.tsx` | Wire crown API, ring layout, comic insert |
| `apps/web/src/app/(magazine)/live/page.tsx` | Wire live events API, lobby sort |
| `apps/web/src/app/(magazine)/editorial/page.tsx` | Wire articles, charts, genres, sponsors |
| `HomepageHeader.tsx` | Wire auth state, crown badge |
| `CrownCard.tsx` | Wire crown state API, motion clip |
| `LobbyWall.tsx` | Wire to live API with discovery-first sort |
| `CountdownCard.tsx` | Wire events API |
| `SponsorSpotlightCard.tsx` | Wire sponsor API + fallback |
| `StreamAndWinCard.tsx` | Wire points API |
| `apps/api/src/services/crown.service.ts` | Implement crown calculation + rotation |
| `apps/api/src/services/discovery.service.ts` | Implement discovery-first sort |
| `apps/api/src/services/broadcaster.service.ts` | Wire TTS engine |

---

## BLOCKED UNTIL CLOUDFLARE GREEN

Everything above is blocked until:
- `musicians-index-api` Cloudflare build = ✅ GREEN
- `musicians-index-web` Cloudflare build = ✅ GREEN
- Smoke tests pass (/, /register, /login → 200)

---

## BLOCKED UNTIL FURTHER WIRING

| File | Blocked By |
|---|---|
| `AudienceStadium.tsx` | Needs 3D engine setup, blocked until rooms wired |
| `FaceScanCapture.tsx` | Needs MediaPipe integration, Phase 3 |
| `BroadcasterVoice.tsx` | Needs TTS service + event system, Phase 4 |
| `EmergencyBanner.tsx` | Needs emergency service + auth, Phase 2 |
| Avatar Creator UI | Phase 3+ |
| Hall of Fame page | Needs crown history data, Phase 2 |

---

# SPONSOR_PRESENTATION_ENGINE.md
## How Sponsors Appear — Rules, Timing, Placement

---

## PLACEMENT MAP

| Surface | Allowed? | Format | Rules |
|---|---|---|---|
| Homepage 1 (Cover) | YES | Bottom strip only | Never covers artist portraits |
| Homepage 2 (Live) | YES | Side card or bottom | Never covers live preview |
| Homepage 3 (Editorial) | YES | Marketplace belt | Full card, clearly labeled |
| Live events (during) | YES | Lower-third (brief) | Max 10s, not over artist |
| Live events (intermission) | YES | Full card or 15s bumper | Only between acts |
| Winner reveal moment | NO | Banned | Never at winner moment |
| Crown rotation | NO | Banned | Never at crown handover |
| Artist portraits | NO | Banned | Never covering faces |

## TIMING RULES

- Minimum 60 seconds between sponsor appearances on same page
- Live events: sponsor max 2 per hour
- Sponsor animation: max 8 seconds, then static
- Lower-thirds: max 10 seconds, then fade
- No autoplay audio on sponsors (ever)

## FALLBACK

If no active campaign for a surface:
- Show "house ad" (platform promotion)
- Or show empty card with platform branding
- Never show broken/empty boxes

---

# FAN_SUPPORTER_SUPERFAN_SYSTEM.md
## Fan Tiers — How Fan Loyalty Is Tracked and Rewarded

---

## FAN TIERS

| Tier | Name | Requirements | Perks |
|---|---|---|---|
| 1 | Fan | Follow artist | Basic access to fan club |
| 2 | Supporter | Follow + 500 pts + 3 events attended | Priority seating preference |
| 3 | Superfan | 5,000 pts + 10 events + $50+ tips | Inner Circle access, exclusive content |
| 4 | VIP | Gold subscription + follow | Backstage access, artist chat |
| 5 | Founding Member | Artist invites (early) | Lifetime badge, all perks |

## WHAT ARTISTS SEE

- Total fan count per tier
- New followers today
- Top 10 tippers (week/month/all-time)
- Fan club tier breakdown chart
- Geographic fan distribution
- Fan retention rate (came back for second event?)

## WHAT SPONSORS SEE

- Artist's total verified fan count
- Fan tier breakdown (quality signal)
- Average tips per event (engagement signal)
- Fan growth rate (momentum signal)
- Fan audience demographic (age ranges, not PII)

## FAN PROFILE WIDGET

On fan's own profile:
- Fan clubs they belong to (with tier badges)
- Artists they follow
- Points balance
- Achievements
- Listening history (if public)

---

*Data Map + Proof Gates + Failures + Logging + Ownership + Wiring List + Sponsor + Fan v1.0*
*BerntoutGlobal XXL / The Musician's Index*
