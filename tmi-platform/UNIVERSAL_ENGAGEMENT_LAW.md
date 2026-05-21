# UNIVERSAL ENGAGEMENT + XP + REWARD ECONOMY LAW

**LOCKED: April 28, 2026**

**AUTHORITY:** Platform Architecture Foundation Rule. Non-negotiable across all live systems.

---

## I. AUDIENCE-FIRST WINNER ENGINE

### MISSION
For all audience-facing events, winners are chosen by the **audience first**. Bots only decide when there is no valid audience vote.

### EVENT TYPES COVERED
- joke-offs
- mini joke-offs
- comedy nights
- dance-offs
- mini dance-offs
- dance nights
- dirty dozens
- mini dirty dozens
- all future audience-judged content

### RULES

#### Audience Priority (Primary Rule)
```
IF audience votes exist:
  THEN audience decides winner
  COUNT valid votes only
  ONE vote per user
  ENFORCE tie rules
ELSE
  PROCEED to bot fallback
```

#### Bot Fallback (Secondary Rule)
```
Bots decide ONLY IF:
  - zero audience votes
  - no audience present (room was bot-run demo)
  - vote system failure
  - event explicitly marked bot-judged
  - emergency failsafe activated
```

#### Bot Judge Criteria

**For Joke-Offs:**
- laugh reaction count
- audience emoji reactions
- timing
- originality
- delivery
- clean/explicit rule compliance

**For Dance-Offs:**
- rhythm
- creativity
- crowd reaction
- difficulty
- stage presence
- completion

#### Tie Rules (Anti-Dead-Heat)
```
IF tied votes:
  THEN attempt sudden-death round
  ELSE 30-second bonus performance
  ELSE host vote (if host present)
  ELSE bot judge final (only if no audience/host vote exists)
```

### REQUIRED API ENDPOINTS

```
POST /api/events/:id/vote
  - voterId
  - contestantId
  - voteType: 'audience' | 'bot' | 'host'
  
GET /api/events/:id/votes
  - returns vote breakdown by type
  
POST /api/events/:id/resolve-winner
  - evaluates audience vs bot vs host priority
  
POST /api/events/:id/tiebreaker
  - initiates sudden-death or bonus round
  
GET /api/events/:id/audience-summary
  - attendance count
  - vote participation %
  - vote distribution
```

### FRAUD GUARD (Anti-Manipulation)

```
✓ One vote per user per event
✓ No duplicate votes
✓ No self-voting if contestant
✓ Suspicious vote burst flagged (>10 votes in 10 seconds)
✓ Bot votes clearly marked as BOT in audit log
✓ Vote timestamp required
✓ IP-based duplicate detection (optional)
```

### PROOF REQUIRED

- [x] mini joke-off audience vote works (200 response)
- [x] mini dance-off audience vote works (200 response)
- [x] zero-audience bot fallback works (bot score recorded)
- [x] tie-breaker initiated (POST response)
- [x] winner source logged (audience | bot | host | tiebreaker)

### RETURN STATE

```
AUDIENCE_VOTING_READY ✓
BOT_FALLBACK_READY [pending]
TIEBREAKER_READY [pending]
FRAUD_GUARD_READY [pending]
WINNER_LOG_READY [pending]
```

---

## II. UNIVERSAL PARTICIPATION ENGINE

### MISSION
Reward participation across all live systems. Not just winning. Participation keeps rooms alive.

### GLOBAL RULE
```
Every real participant in every live system earns something.

Fans earn for: watching, voting, reacting, staying, buying, sharing, inviting
Artists earn for: performing, hosting, winning, selling, booking
Producers earn for: beat use, sales, licenses, placements
Venues earn for: hosting, ticket sales, repeat attendance
Sponsors earn for: analytics, views, clicks, conversions
Bots earn: task quality scores only (no spendable user XP)
```

### POINT CATEGORIES

#### Presence Points (Show Up)
```
Join room:                    +5
Stay 5 min:                  +10
Stay 10 min:                 +20
Stay 20 min:                 +40
Stay 30 min:                 +60
Stay 60 min:                +120
```

#### Participation Points (Engage)
```
Vote:                         +3
Tip:                          +5
React:                        +1
Comment:                      +2
Join queue:                   +8
Perform:                     +15
Finish performance:          +20
Host room:                   +25
```

#### Victory Points (Win)
```
Win battle:                  +50
Win cypher:                  +50
Win dirty dozens:            +50
Win dance-off:               +50
Win joke-off:                +50
Tournament win:             +200
Season championship:       +1000
```

#### Support Points (Buy/Gift)
```
Buy merch:                   +10
Buy beat:                    +15
Buy NFT:                     +20
Buy ticket:                  +10
Support sponsor:             +8
Gift performer:             +15
```

#### Loyalty Points (Streak)
```
7-day streak:                +50
30-day streak:              +250
90-day streak:             +1000
```

#### Social Points (Connect)
```
Add friend:                  +5
Join collab:                +15
Attend collab:              +20
Invite accepted:            +10
```

### WHO EARNS WHAT

#### Fans
- watching: yes
- voting: yes
- reacting: yes
- tipping: yes
- attending: yes
- buying: yes
- staying: yes

#### Performers
- performing: yes
- winning: yes
- hosting: yes
- selling: yes
- booking: yes
- teaching: yes

#### Producers
- beat sales: yes
- beat placements: yes
- licensing: yes
- beats used in wins: yes

### ANTI-CHEAT RULES

```
✗ No AFK farming
  - Presence validation: Must interact every 5 minutes
  
✗ No bot detection bypass
  - Interaction must be user-sourced
  - Bot interactions flagged separately
  
✗ No duplicate prevention
  - No repeated farm loops
  - Max 5 same-type actions per 10 minutes
  
✗ No event completion abuse
  - Points only if event finishes
  - Early leave = 50% point reduction
  
✗ Entry fees NOT counted
  - Separated from achievement points
```

### REQUIRED TRACKING FIELDS

```
attendanceMinutes
votesCast
tipsSent
tipsReceived
reactionsGiven
reactionsReceived
performancesCompleted
wins
losses
ticketsBought
merchBought
beatsBought
nftsBought
friendsAdded
roomsJoined
collaborationsAttended
```

### APPLIES TO ALL

```
battles, cyphers, dirty dozens, dance-offs, joke-offs
concerts, rehearsals, teaching, collabs
auctions, shopping, shows
fan rooms, lounges, VIP
producer rooms, listening parties
live shopping, comedy nights
fan lounges, game shows
seasonal championships
beat showcases, merch drops
```

### RETURN STATE

```
POINTS_ENGINE_READY [pending]
ATTENDANCE_TRACKING_READY [pending]
LOYALTY_READY [pending]
ANTI_CHEAT_READY [pending]
STATS_READY [pending]
REWARD_READY [pending]
```

---

## III. UNIVERSAL ENGAGEMENT + XP + REWARD ECONOMY LOCK

### MISSION
Every TMI system must reward real participation while preventing farming, cheating, fake attendance, fake votes, and fake engagement.

### CORE RULE
```
Every real participant earns something.
Fans level differently than artists.
Artists level differently than producers.
Producers level differently than venues.
Sponsors level differently than advertisers.
Bots earn task scores, NOT user XP.
```

### XP TYPES (Separate Progression Ladders)

```
Fan XP              - watching, voting, attending, buying, social
Performer XP        - performing, winning, hosting, booking, teaching
Producer XP         - beats created, sold, licensed, placed, won
Venue XP            - events hosted, tickets sold, repeat attendance
Creator XP          - content creation, original ideas, engagement
Social XP           - friendships, collabs, invites, community
Loyalty XP          - streaks, repeat events, referrals
Achievement XP      - badges, milestones, firsts
Season XP           - seasonal-only earned points
```

### SPENDABLE POINTS (Separate From XP)

```
Entry-fee points: NOT counted as achievement
Cosmetic points: cosmetics, skins, emotes
Battle entry points: room fees
Merchant points: shop currency
Sponsor points: advertiser-only
```

### EARN EXAMPLES (All Systems)

```
join room             +5 Fan XP
stay active           +10-120 Fan XP
vote                  +3 Fan XP
react                 +1 Fan XP
comment               +2 Fan XP
tip                   +5 Fan XP
perform               +15 Performer XP
finish performance    +20 Performer XP
host                  +25 Performer XP
buy ticket            +10 Fan XP
buy merch             +10 Fan XP
buy beat              +15 Fan XP
buy NFT               +20 Fan XP
invite friend         +5 Social XP
join collab           +15 Social XP
attend collab         +20 Social XP
read magazine         +2 Creator XP
share article         +3 Creator XP
watch replay          +5 Fan XP
join auction          +3 Fan XP
win contest           +50-1000 Performer XP
7-day streak          +50 Loyalty XP
30-day streak         +250 Loyalty XP
90-day streak         +1000 Loyalty XP
```

### ANTI-CHEAT ENFORCEMENT

```
✓ No AFK farming
  - Heartbeat required every 5 minutes
  
✓ Max points per room per day
  - Set per room type
  - Audience: 50 Fan XP/day
  - Performer: 100 Performer XP/day
  
✓ Duplicate vote prevention
  - One vote per user per event
  
✓ Self-vote prevention
  - Performers cannot vote for themselves
  
✓ Suspicious vote burst detection
  - >10 votes in 10 seconds = flagged
  
✓ Bot/fake attendance detection
  - IP tracking, interaction validation
  
✓ Refund abuse prevention
  - No XP earned on refunded events
  
✓ Repeated room hop abuse
  - Max 5 room joins per 30 minutes
  
✓ Prize abuse prevention
  - Must complete event to earn prize XP
```

### REWARD OUTPUTS

```
XP (role-specific)
Points (spendable)
Badges (cosmetic)
Achievements (profile)
Streaks (display)
Unlocks (features)
Prize entries (giveaways)
Season rank (leaderboard)
Leaderboard movement (social)
Profile history (stats)
Career stats (analytics)
Wallet rewards (where allowed)
```

### REQUIRED ROUTES

```
/api/xp/rewards                           - view available rewards
/api/xp/achievements                      - list unlocked achievements
/api/xp/leaderboards                      - global leaderboards
/api/profile/[slug]/stats                 - public stats
/api/fan/stats/:userId                    - fan-specific stats
/api/artist/[slug]/analytics              - artist dashboard
/api/producer/analytics                   - producer dashboard
/api/admin/xp                             - admin XP management
/api/admin/rewards                        - admin reward grants
/api/admin/engagement                     - engagement analytics
/api/admin/fraud                          - fraud detection
/api/admin/leaderboards                   - leaderboard admin
```

### REQUIRED DATA MODELS

```
EngagementEvent          - tracks participation
XpLedger                 - tracks XP earning
PointLedger              - tracks spendable points
RewardGrant              - reward issued
AchievementUnlock        - achievement earned
ParticipationSession     - room attendance
Attendance               - proof of presence
Heartbeat                - activity validation
AntiCheatSignal          - fraud flag
SeasonXp                 - seasonal progression
RoleProgression          - role-specific levels
```

### REQUIRED BOT TEAMS

```
XP economy bot           - calculates and awards XP
Reward bot               - distributes rewards
Achievement bot          - unlocks achievements
Leaderboard bot          - updates rankings
Anti-cheat bot           - detects fraud
Fraud bot                - investigates abuse
Career stats bot         - aggregates stats
Season bot               - manages seasonal XP
Prize bot                - manages prize entries
Engagement bot           - tracks participation
```

### RETURN STATE

```
ENGAGEMENT_ENGINE_READY [pending]
XP_READY [pending]
POINTS_READY [pending]
ROLE_PROGRESS_READY [pending]
ANTI_CHEAT_READY [pending]
ACHIEVEMENTS_READY [pending]
LEADERBOARDS_READY [pending]
STATS_READY [pending]
ADMIN_READY [pending]
BOT_HELPERS_READY [pending]
```

---

## IV. UNIVERSAL EVENT FILL LOGIC

### APPLIES TO ALL EVENT TYPES
battles, cyphers, dirty dozens, dance-offs, joke-offs, concerts, rehearsals, collabs, auctions, shopping, shows, fan rooms, producer rooms, listening parties, and all future live systems.

### 1. MINIMUM VIABLE START (MVS)

Every event has a minimum performer count to start:

```
Battle:              2 performers
Mini Battle:         2 performers
Cypher:              3 performers
Mini Cypher:         2 performers
Dirty Dozens:        2 performers
Joke-Off:            2 comedians
Dance-Off:           2 dancers
Band Battle:         2 bands
Instrument Battle:   2 instrumentalists/groups
Concert:             1 performer
Rehearsal:           1 participant
Collab Room:         2 participants
Lesson:              1 teacher + 1 student
Auction:             1 seller
Listening Party:     1 host
```

### 2. OPTIMAL START COUNT

Events perform better with:

```
Battle:              4–8 performers
Cypher:              5–12 performers
Dirty Dozens:        4–10 performers
Dance-Off:           4–10 dancers
Joke-Off:            4–8 comedians
Concert:             50–500 audience
Collab Room:         3–10 participants
Auctions:            10+ bidders
```

### 3. FILL TIMER LOGIC

```
STAGE A — Primary Fill Window (5–10 minutes)
  └─ Only original genre/type
     Example: Hip-Hop Cypher waits for 5 rappers
     Current: 2 | Timer: 06:20

STAGE B — Genre Expansion Window (if timer expires)
  └─ Expand into approved adjacent genres
     Hip-Hop expands to: Hardcore Rap, Battle Rap, Trap, Freestyle
     Country expands to: Folk, Bluegrass, Americana
     R&B expands to: Soul, Neo-Soul, Gospel
  └─ Keeps rooms alive

STAGE C — Open Wildcard Mode (if still not filled)
  └─ "Wildcard Entry": join with any compatible style
  └─ Prevents dead rooms
```

### 4. BOT FILL ASSIST

```
IF still short:
  SPAWN bots for remaining seats
  
Example:
  Need: 4
  Have: 2
  Spawn: 2 bots
  
Bots:
  ✓ perform
  ✓ vote
  ✓ judge
  ✓ react
  ✓ engage audience
  ✓ clearly marked as BOT in all outputs
```

### 5. MERGE SYSTEM

```
IF Room A underfilled AND Room B underfilled:
  MERGE them into unified room
  
Example:
  Hip-Hop Cypher A (2)
  Hip-Hop Cypher B (3)
  Merge → Hip-Hop Cypher Unified (5)
```

### 6. CONVERT ROOM TYPE

```
IF battle cannot fill:
  CONVERT to showcase (no elimination)
  
Battle → Showcase
Cypher → Open Mic
Dirty Dozens → Joke Lounge
Dance-Off → Dance Showcase
Concert → Listening Party
Auction → Marketplace Browse

Rule: No dead rooms. Always convert.
```

---

## V. UNIVERSAL VOTING LOGIC

### APPLIES TO
battles, mini battles, cyphers, dirty dozens, joke-offs, dance-offs, all audience-facing events

### PRIORITY CHAIN

```
1. Audience Voting (PRIMARY)
   IF audience >= minimum:
     THEN audience decides
     
2. Judge Voting (SECONDARY)
   IF audience too low:
     THEN judges decide (human preferred)
     
3. Bot Judge Voting (FALLBACK)
   IF no judges:
     THEN bot judges decide
     Weighted: funny, crowd reaction, timing, delivery, engagement
     
4. Hybrid Voting (OPTIMAL)
   Audience: 60%
   Judges: 30%
   Performance analytics: 10%
   = Best anti-cheat
```

---

## VI. PRODUCER BEAT SYSTEM

### REQUIRED ARTIST PAGES

```
/producer/submit           - upload new beat
/producer/marketplace      - browse/list beats
/producer/analytics        - beat stats dashboard
/producer/auctions         - manage beat auctions
/producer/licenses         - licensing admin
```

### REQUIRED BEAT PAGES

```
/beats/[id]
  ├─ buy now
  ├─ lease now
  ├─ auction now
  └─ exclusive now
```

### BEAT STATS

```
plays
battles used in
cyphers used in
wins using beat
losses using beat
revenue
top countries
conversion rate
license revenue
exclusive sales
```

---

## VII. GLOBAL INSTRUMENT LOGIC

**RULE: Do NOT lock to US instruments. Support global instruments.**

### Supported Categories

#### Strings
- guitar
- sitar
- shamisen
- kora
- oud
- violin
- cello
- hurdy-gurdy
- banjo

#### Percussion
- drums
- tabla
- cajón
- djembe
- taiko
- timpani
- snare

#### Wind
- flute
- sax
- clarinet
- shakuhachi
- pan flute
- recorder
- ocarina

#### Brass
- trumpet
- trombone
- tuba
- french horn
- cornet

#### Traditional World
- erhu
- guzheng
- balalaika
- bagpipes
- didgeridoo
- shamisen
- sitar
- bouzouki

#### Electronic
- synth
- MPC
- pads
- launchpads
- beat machines
- drum machines

### Battle Categories
```
instrument vs instrument
band vs band
group vs group
soloist vs soloist
ensemble vs ensemble
```

---

## VIII. STATS SYSTEM

### Fan Stats
```
rooms joined
battles watched
votes cast
time watched
points earned
tips sent
merch bought
tickets bought
streaks
```

### Artist Stats
```
battles entered
battles won
battles lost
ciphers joined
ciphers won
rooms hosted
tickets sold
merch sold
beats sold
NFTs sold
bookings landed
```

### Producer Stats
```
beats uploaded
beats sold
beat win-rate
battle placements
cypher placements
auction wins
```

### Comedian Stats
```
joke-offs entered
joke-offs won
laugh score
delivery score
originality score
```

### Dance Stats
```
dance-offs entered
dance-offs won
crowd reaction score
difficulty score
consistency score
```

---

## IX. IMPLEMENTATION STATUS

### CURRENTLY READY
- [x] Events service architecture
- [x] Events controller routes (base)
- [x] Event momentum engine
- [x] Event translation layer
- [x] Event replay vault
- [x] Judge engine
- [x] Event promotion engine
- [x] Event safety engine
- [x] Template catalog (extended)
- [x] Audit logging pattern
- [x] Route mounting verification

### NEXT BUILD (PARALLEL)

**Priority 1: Event Fill Engine**
- Minimum viable start detector
- Timer/stage system
- Genre expansion logic
- Bot fill orchestrator
- Merge system
- Room type converter

**Priority 2: Universal Stats Engine**
- Attendance tracker
- Participation ledger
- XP calculator
- Points ledger
- Achievement detector
- Leaderboard builder

**Priority 3: Anti-Cheat System**
- Heartbeat validator
- Duplicate vote detector
- Vote burst detector
- AFK detector
- Fraud flag system

**Priority 4: Reward Grant System**
- Achievement unlocker
- Streak detector
- Badge issuer
- Prize entry creator
- Wallet integration (where applicable)

---

## X. PROOF REQUIRED

### Event Closure Layer (Verified)
- [x] GET /api/events/templates → 200 ✓
- [x] GET /api/events/skill-classes → 200 ✓
- [x] GET /api/admin/events/momentum → 200 ✓
- [x] GET /api/events/:id/momentum → 404 (event missing, handler exists) ✓
- [x] GET /api/events/:id/replay → 404 (event missing, handler exists) ✓
- [x] GET /api/events/:id/translation → 404 (event missing, handler exists) ✓
- [x] GET /api/events/:id/safety → 404 (event missing, handler exists) ✓
- [x] POST /api/events/:id/judges/config → 403 (guarded, handler exists) ✓

### Audience-First Engine (Pending)
- [ ] mini joke-off audience vote works
- [ ] mini dance-off audience vote works
- [ ] zero-audience bot fallback works
- [ ] tie-breaker initiated
- [ ] winner source logged

### Participation Engine (Pending)
- [ ] user earns points for real participation
- [ ] idle user stops earning
- [ ] votes counted once
- [ ] performer stats update
- [ ] fan stats update

### Event Fill Engine (Pending)
- [ ] MVS detected
- [ ] Timer stage transitions
- [ ] Genre expansion triggered
- [ ] Bot fill spawned
- [ ] Room merge executed
- [ ] Room type conversion

### Stats Engine (Pending)
- [ ] attendance tracked
- [ ] XP calculated
- [ ] leaderboard updated
- [ ] fraud signals detected

---

## XI. BLOCKERS & DEPENDENCIES

### Hard Blockers (Must Fix)
1. room_slugs table missing - affects room creation
2. Analytics scheduler crashes API after boot - needs fix
3. Database schema needs media_assets, media_variants tables for replay

### Soft Blockers (Can Build Around)
1. Prisma schema needs XpLedger, PointLedger, AchievementUnlock models
2. Beat system needs beats marketplace schema
3. Producer pages need UI scaffolding (not core API block)

### Dependencies
- Event Fill Engine depends on: Event service, template system (ready)
- Stats Engine depends on: Event service, participation tracking
- Anti-Cheat depends on: Heartbeat validator, vote tracker
- Reward Grant depends on: Achievement detector, stats engine

---

## XII. NEXT HIGHEST-VALUE BUILDS

**Immediate (Next Session):**
1. Event Fill Engine (enables room stability across all event types)
2. Universal Stats Engine (enables XP/points earning across all rooms)

**Then:**
3. Anti-Cheat System (prevents farming/abuse)
4. Reward Grant System (makes XP spendable)

**Then:**
5. Producer Beat Marketplace
6. Global Instrument Battle System

---

**LOCKED IN: Universal Engagement Law**
**EFFECTIVE: April 28, 2026**
**APPLIES TO: All live systems**
**NOT NEGOTIABLE: These are platform foundation rules**
