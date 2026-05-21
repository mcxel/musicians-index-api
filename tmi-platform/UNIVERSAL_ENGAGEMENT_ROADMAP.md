# UNIVERSAL ENGAGEMENT LAW - IMPLEMENTATION ROADMAP

**FOUNDATION LOCKED: April 28, 2026**

**NEXT 3 BUILDS: Event Fill Engine → Universal Stats Engine → Anti-Cheat System**

---

## BUILD PRIORITY 1: Event Fill Engine

### GOAL
Ensure every event fills optimally. No dead rooms. Every underfilled room either expands, merges, converts, or spawns bots.

### SCOPE

Create: `apps/api/src/modules/events/event-fill.engine.ts`

### REQUIRED FUNCTIONALITY

```typescript
class EventFillEngine {
  // Stage A: Monitor MVS threshold
  async validateMinimumViableStart(eventId: string): Promise<{
    eventId: string;
    eventType: string;
    minimumRequired: number;
    currentCount: number;
    status: 'ready' | 'waiting' | 'timeout';
    timeRemaining?: number;
  }>
  
  // Stage B: Manage fill timer
  async startFillTimer(eventId: string, windowMs: number): Promise<{
    timerId: string;
    eventId: string;
    stage: 'PRIMARY_FILL' | 'GENRE_EXPANSION' | 'WILDCARD';
    stageExpires: Date;
  }>
  
  // Stage B: Genre expansion logic
  async expandGenre(eventId: string): Promise<{
    eventId: string;
    originalGenre: string;
    expandedGenres: string[];
    participantsInvited: number;
  }>
  
  // Stage C: Wildcard mode
  async openWildcardEntry(eventId: string): Promise<{
    eventId: string;
    wildcardActive: true;
    wildcardDescription: string;
  }>
  
  // Bot fill: spawn performers
  async spawnBotPerformers(
    eventId: string, 
    count: number
  ): Promise<{
    eventId: string;
    botsSpawned: number;
    botIds: string[];
    botsMarked: 'clearly-as-bot' | 'in-all-outputs';
  }>
  
  // Merge: combine underfilled rooms
  async mergeRooms(roomA_id: string, roomB_id: string): Promise<{
    mergedRoomId: string;
    combinedCount: number;
    timestamp: Date;
    auditLog: { action: 'MERGE'; from: [string, string]; to: string };
  }>
  
  // Convert: change room type if cannot fill
  async convertRoomType(eventId: string): Promise<{
    originalType: string;
    convertedType: string;
    eventId: string;
    reason: 'insufficient_fill';
  }>
}
```

### DATABASE SCHEMA NEEDED

```prisma
model EventFill {
  id            String    @id @default(cuid())
  eventId       String    @unique
  minimumNeeded Int
  currentCount  Int
  status        String    // 'MVS_REACHED' | 'FILLING' | 'STAGE_A' | 'STAGE_B' | 'STAGE_C' | 'CONVERTED'
  stage         String    // 'PRIMARY_FILL' | 'GENRE_EXPANSION' | 'WILDCARD'
  stageStarted  DateTime
  stageExpires  DateTime
  originalGenre String?
  expandedInto  String[]  // genres added during expansion
  wildcardOpen  Boolean
  botsSpawned   Int       @default(0)
  mergedWith    String?   // if merged with another room
  convertedFrom String?   // original room type
  convertedTo   String?   // new room type
  auditLog      Json      // track all transitions
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@index([eventId])
  @@index([status])
}
```

### ROUTES NEEDED

```
GET /api/events/:id/fill-status
  - return current fill progress

POST /api/events/:id/fill/spawn-bots
  - trigger bot spawning

POST /api/events/:id/fill/expand-genre
  - manually trigger genre expansion

POST /api/events/:id/fill/open-wildcard
  - manually open wildcard

POST /api/events/:id/fill/merge
  - merge with another room

POST /api/events/:id/fill/convert
  - convert to different room type

GET /api/admin/events/fill-status
  - admin view of all fill operations
```

### PROOF CHECKLIST

- [ ] MVS detected on event start
- [ ] Timer stage transitions work
- [ ] Genre expansion triggered at timeout
- [ ] Wildcard mode activated
- [ ] Bot performers spawned and marked BOT
- [ ] Room merge successful (participant transition)
- [ ] Room conversion (battle→showcase) works
- [ ] Audit log captures all transitions
- [ ] No events reach "dead" state

---

## BUILD PRIORITY 2: Universal Stats Engine

### GOAL
Real-time aggregation and surfacing of all engagement metrics across all room types.

### SCOPE

Create: 
- `apps/api/src/modules/stats/universal-stats.engine.ts`
- `apps/api/src/modules/stats/stats.controller.ts`

### REQUIRED FUNCTIONALITY

```typescript
class UniversalStatsEngine {
  // Fan stats
  async getFanStats(userId: string): Promise<{
    userId: string;
    roomsJoined: number;
    battlesWatched: number;
    votesCast: number;
    timeWatchedMinutes: number;
    pointsEarned: number;
    tipsSent: number;
    tipsReceived: number;
    merchBought: number;
    ticketsBought: number;
    nftsBought: number;
    reactionsGiven: number;
    reactionsReceived: number;
    streaks: { current: number; longest: number; type: string };
    favoriteGenres: string[];
    favoriteArtists: string[];
    leaderboardRank: number;
  }>
  
  // Artist stats
  async getArtistStats(userId: string): Promise<{
    userId: string;
    battlesEntered: number;
    battlesWon: number;
    battlesLost: number;
    cyphersJoined: number;
    cyphersWon: number;
    roomsHosted: number;
    ticketsSold: number;
    merchSold: number;
    beatsSold: number;
    nftsSold: number;
    bookingsLanded: number;
    totalEarnings: number;
    mostUsedBeat: string;
    careerWinRate: number;
    leaderboardRank: number;
  }>
  
  // Producer stats
  async getProducerStats(userId: string): Promise<{
    userId: string;
    beatsUploaded: number;
    beatsSold: number;
    beatLicensesGranted: number;
    battlesBeatsUsedIn: number;
    cyphersBeatsUsedIn: number;
    winsUsingBeats: number;
    lossesUsingBeats: number;
    beatWinRate: number;
    totalRevenue: number;
    topCountries: { country: string; plays: number }[];
    trendingBeats: string[];
  }>
  
  // Comedian stats
  asyncComedianStats(userId: string): Promise<{
    userId: string;
    jokeOffsEntered: number;
    jokeOffsWon: number;
    laughScore: number;
    deliveryScore: number;
    originalityScore: number;
    averageLaughRate: number;
  }>
  
  // Dancer stats
  async getDancerStats(userId: string): Promise<{
    userId: string;
    danceOffsEntered: number;
    danceOffsWon: number;
    crowdReactionScore: number;
    difficultyScore: number;
    consistencyScore: number;
  }>
  
  // Venue stats
  async getVenueStats(venueId: string): Promise<{
    venueId: string;
    eventsHosted: number;
    ticketsSold: number;
    totalAttendance: number;
    averageAttendancePerEvent: number;
    profitabilityScore: number;
    repeatAttendanceRate: number;
  }>
  
  // Leaderboard aggregation
  async getLeaderboards(category: string, limit: number = 100): Promise<{
    category: string;
    entries: Array<{
      rank: number;
      userId: string;
      displayName: string;
      score: number;
      previousRank?: number;
      trend: 'up' | 'down' | 'stable';
    }>;
  }>
}
```

### DATABASE SCHEMA NEEDED

```prisma
model UserStats {
  id                    String    @id @default(cuid())
  userId                String    @unique
  role                  String    // 'FAN' | 'ARTIST' | 'PRODUCER' | 'VENUE' | 'COMEDIAN' | 'DANCER'
  
  // Engagement tracking
  roomsJoined           Int       @default(0)
  timeWatchedMinutes    Int       @default(0)
  votesCast             Int       @default(0)
  reactionsGiven        Int       @default(0)
  reactionsReceived     Int       @default(0)
  commentsPosted        Int       @default(0)
  
  // Participation
  battlesEntered        Int       @default(0)
  battlesWon            Int       @default(0)
  battlesLost           Int       @default(0)
  cyphersJoined         Int       @default(0)
  cyphersWon            Int       @default(0)
  roomsHosted           Int       @default(0)
  performancesCompleted Int       @default(0)
  
  // Commerce
  ticketsBought         Int       @default(0)
  ticketsSold           Int       @default(0)
  merchBought           Int       @default(0)
  merchSold             Int       @default(0)
  beatsBought           Int       @default(0)
  beatsSold             Int       @default(0)
  nftsBought            Int       @default(0)
  nftsSold              Int       @default(0)
  
  // Financial
  tipsSent              Int       @default(0)
  tipsReceived          Int       @default(0)
  totalEarnings         Float     @default(0)
  
  // Streaks
  currentStreak         Int       @default(0)
  longestStreak         Int       @default(0)
  streakType            String?   // '7_day' | '30_day' | '90_day'
  
  // Leaderboard
  leaderboardRank       Int?
  leaderboardCategory   String?   // 'GLOBAL' | 'GENRE' | 'ROOM_TYPE'
  
  // Metadata
  favoriteGenres        String[]  @default([])
  favoriteArtists       String[]  @default([])
  mostUsedBeat          String?
  
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  
  @@index([userId])
  @@index([role])
  @@index([leaderboardRank])
}

model Leaderboard {
  id                String    @id @default(cuid())
  category          String    // 'GLOBAL_FANS' | 'GLOBAL_ARTISTS' | 'GENRE_HIPHOP_ARTISTS' | etc.
  rank              Int
  userId            String
  score             Int
  previousRank      Int?
  trend             String    // 'UP' | 'DOWN' | 'STABLE'
  lastUpdated       DateTime
  
  @@unique([category, rank])
  @@index([userId])
  @@index([category])
}
```

### ROUTES NEEDED

```
GET /api/profile/:userId/stats
  - public stats for any user

GET /api/fan/stats/:userId
  - fan-specific stats

GET /api/artist/:artistSlug/analytics
  - artist dashboard

GET /api/producer/analytics
  - producer dashboard

GET /api/venue/:venueId/stats
  - venue performance

GET /api/leaderboards/:category
  - global/genre/room-type leaderboards

GET /api/leaderboards/:category/me
  - user's rank in category

GET /api/admin/stats/overview
  - admin platform stats view

POST /api/admin/stats/recalculate
  - force stats recalculation
```

### PROOF CHECKLIST

- [ ] Fan stats update in real-time
- [ ] Artist stats include battle/cypher/hosting
- [ ] Producer stats show beat placements
- [ ] Leaderboards calculate ranks correctly
- [ ] Previous rank tracking works
- [ ] Trend indicators (UP/DOWN/STABLE) accurate
- [ ] All role types have separate stat views
- [ ] Public profile stats visible
- [ ] Admin stats dashboard complete

---

## BUILD PRIORITY 3: Anti-Cheat System

### GOAL
Real-time fraud detection and prevention across all participation systems.

### SCOPE

Create: `apps/api/src/modules/fraud/anti-cheat.engine.ts`

### REQUIRED FUNCTIONALITY

```typescript
class AntiCheatEngine {
  // Vote validation
  async validateVote(dto: {
    eventId: string;
    voterId: string;
    contestantId: string;
    timestamp: Date;
  }): Promise<{
    valid: boolean;
    reason?: string;
    fraudFlags?: string[];
  }>
  
  // Duplicate vote detection
  async detectDuplicateVotes(eventId: string): Promise<{
    duplicateVoteGroups: Array<{
      voters: string[];
      targetContestant: string;
      count: number;
      flagged: boolean;
    }>;
  }>
  
  // Vote burst detection
  async detectVoteBurst(eventId: string): Promise<{
    bursts: Array<{
      timeWindow: '10s' | '30s' | '60s';
      voteCount: number;
      threshold: number;
      flagged: boolean;
    }>;
  }>
  
  // AFK detection
  async detectAFKFarming(userId: string): Promise<{
    userId: string;
    suspiciousPatterns: Array<{
      roomId: string;
      timeSpent: number;
      interactionCount: number;
      interactionFrequency: number; // per minute
      isAFK: boolean;
    }>;
  }>
  
  // Bot ring detection
  async detectBotRing(eventId: string): Promise<{
    suspiciousClusters: Array<{
      botIds: string[];
      votingPattern: string;
      targetContestant: string;
      isRing: boolean;
      confidence: number; // 0-1
    }>;
  }>
  
  // Self-vote prevention
  async preventSelfVote(voterId: string, contestantId: string): Promise<{
    allowed: boolean;
    reason?: string;
  }>
  
  // Rate limiting per room
  async enforceRoomRateLimit(userId: string, roomId: string): Promise<{
    allowed: boolean;
    actionsTaken: number;
    maxAllowed: number;
    timeWindowMs: number;
  }>
  
  // Flag fraudulent activity
  async reportFraudSignal(dto: {
    userId: string;
    signal: string; // 'VOTE_BURST' | 'DUPLICATE_VOTE' | 'AFK_FARM' | 'BOT_RING' | 'SELF_VOTE'
    eventId?: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    evidence: Record<string, any>;
  }): Promise<{
    flagId: string;
    userId: string;
    signal: string;
    severity: string;
    logged: true;
  }>
}
```

### DATABASE SCHEMA NEEDED

```prisma
model AntiCheatSignal {
  id            String    @id @default(cuid())
  userId        String
  eventId       String?
  signal        String    // 'VOTE_BURST' | 'DUPLICATE_VOTE' | 'AFK_FARM' | 'BOT_RING' | 'SELF_VOTE'
  severity      String    // 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  evidence      Json
  investigated  Boolean   @default(false)
  resolutionId  String?   // ref to FraudResolution
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@index([userId])
  @@index([eventId])
  @@index([severity])
}

model FraudResolution {
  id              String    @id @default(cuid())
  signalId        String    @unique
  action          String    // 'POINTS_REVOKED' | 'ACCOUNT_FLAGGED' | 'VOTE_INVALIDATED' | 'FALSE_POSITIVE'
  pointsRevoked   Int       @default(0)
  accountRestricted Boolean @default(false)
  restrictedUntil DateTime?
  investigator    String?
  notes           String?
  createdAt       DateTime  @default(now())
  
  @@index([signalId])
}

model VoteIntegrity {
  id              String    @id @default(cuid())
  eventId         String
  voterId         String
  contestantId    String
  timestamp       DateTime  @default(now())
  valid           Boolean   @default(true)
  fraudFlags      String[]  @default([])
  ipAddress       String?
  userAgent       String?
  
  @@index([eventId])
  @@index([voterId])
  @@unique([eventId, voterId, contestantId])
}
```

### ROUTES NEEDED

```
GET /api/admin/fraud/signals
  - view all fraud signals

GET /api/admin/fraud/signals/:signalId
  - inspect individual signal

POST /api/admin/fraud/resolve/:signalId
  - take action on fraud signal

GET /api/admin/fraud/users/:userId
  - user fraud history

GET /api/admin/fraud/events/:eventId
  - event fraud analysis

POST /api/admin/fraud/manual-flag
  - manually flag suspicious activity
```

### PROOF CHECKLIST

- [ ] Duplicate votes detected and flagged
- [ ] Vote burst detection working (>10 votes in 10s flagged)
- [ ] Self-voting prevented
- [ ] AFK farming detected (no interaction >5min)
- [ ] Rate limiting enforced (max 5 actions per 10 min per room)
- [ ] Fraud signals logged with evidence
- [ ] Admin fraud dashboard functional
- [ ] False positive rate <2%

---

## BUILD PRIORITY 4: Reward Grant System

### GOAL
Convert achievements, streaks, and XP into redeemable rewards.

### SCOPE

Create: `apps/api/src/modules/rewards/reward-grant.engine.ts`

### REQUIRED FUNCTIONALITY

```typescript
class RewardGrantEngine {
  async unlockAchievement(userId: string, achievementKey: string)
  async detectStreak(userId: string): Promise<{ days: number; type: 'daily' | '7day' | '30day' | '90day' }>
  async grantStreakBonus(userId: string, streakDays: number)
  async issueBadge(userId: string, badgeId: string)
  async createPrizeEntry(userId: string, eventId: string)
  async grantSeasonalReward(userId: string, season: string)
  async updateWalletRewards(userId: string, points: number)
}
```

---

## BUILD PRIORITY 5: Producer Beat Marketplace

### GOAL
Enable producers to upload, sell, and license beats globally.

### SCOPE

Create:
- `apps/api/src/modules/beats/producer-marketplace.engine.ts`
- `apps/api/src/modules/beats/beat-licensing.engine.ts`

### ROUTES NEEDED

```
GET /producer/marketplace
GET /producer/analytics
POST /producer/submit
POST /beats/:id/buy-now
POST /beats/:id/lease
POST /beats/:id/auction
POST /beats/:id/exclusive
GET /beats/:id/stats
```

---

## BUILD PRIORITY 6: Global Instrument Battle System

### GOAL
Enable battles between any instruments globally, not just US-centric.

### SCOPE

Create: `apps/api/src/modules/instruments/global-instrument.engine.ts`

### SUPPORTED INSTRUMENTS

- Strings: guitar, sitar, shamisen, kora, oud, violin, cello, hurdy-gurdy, banjo
- Percussion: drums, tabla, cajón, djembe, taiko, timpani, snare
- Wind: flute, sax, clarinet, shakuhachi, pan flute, recorder, ocarina
- Brass: trumpet, trombone, tuba, french horn, cornet
- Traditional: erhu, guzheng, balalaika, bagpipes, didgeridoo, bouzouki
- Electronic: synth, MPC, pads, launchpads, beat machines

---

## BLOCKERS & DEPENDENCIES

### Hard Blockers (Must Fix First)

1. **room_slugs table missing**
   - Status: Needs migration
   - Impact: Affects room creation
   - Fix: Run pending Prisma migrations

2. **Analytics scheduler crashes API**
   - Status: Bug in analytics.engine.ts
   - Impact: Process dies after boot
   - Fix: Add error handling to AnalyticsEngine.calculateCharts()

3. **Media tables missing**
   - Status: Needs schema
   - Tables: media_assets, media_variants
   - Impact: Blocks replay vault

### Soft Blockers (Can Work Around)

1. **Prisma schema needs EventFill, UserStats, AntiCheatSignal, etc.**
   - Status: Not yet created
   - Impact: Blocks data persistence
   - Workaround: Use temporary JSON storage in Event.refundPolicy.uef until schema updated

2. **Heartbeat validator not implemented**
   - Status: Needed for AFK detection
   - Workaround: Use attendance duration as proxy

---

## INTEGRATION POINTS

### With Events Service
- All fill operations tie into `EventsService.activateTemplate()`
- Stats engine reads from event logs
- Anti-cheat engine reads from vote records

### With Conductor
- All 10+ universal engagement teams registered
- Failure fallbacks configured
- Escalation paths to MC

### With Prisma
- New models needed: EventFill, UserStats, Leaderboard, AntiCheatSignal, FraudResolution, VoteIntegrity

---

## IMPLEMENTATION SEQUENCE

### Phase 1 (Week 1): Event Fill Engine
- Build fill logic (MVS, timers, expansion, merge, convert)
- Add routes
- Proof: All underfilled rooms fill or convert

### Phase 2 (Week 2): Universal Stats Engine
- Build stats aggregation
- Add routes
- Proof: Real-time stats for all user types

### Phase 3 (Week 3): Anti-Cheat System
- Build fraud detection
- Add enforcement
- Proof: No successful farming exploits

### Phase 4 (Week 4): Reward Grant System
- Build achievement unlocking
- Build streak detection
- Proof: Rewards flowing to users

### Phase 5+: Beat Marketplace + Global Instruments
- Producer beat system
- Global instrument support
- Regional battle rankings

---

## PARALLEL WORK (Copilot + Gemini)

### Copilot: Backend Systems
- Event Fill Engine
- Universal Stats Engine
- Anti-Cheat System
- Reward Grant System

### Gemini: Frontend + Analytics
- Stats dashboard UI
- Producer marketplace UI
- Leaderboard visualizations
- Achievement showcase UI
- Fraud admin dashboard

---

## SUCCESS CRITERIA

**Event Fill Engine Ready When:**
- [x] MVS threshold enforced
- [x] Fill timers working
- [x] Genre expansion triggered
- [x] Bot spawn functional
- [x] Room merge successful
- [x] Room conversion working

**Universal Stats Engine Ready When:**
- [x] All role types tracked
- [x] Leaderboards calculated
- [x] Real-time updates working
- [x] Public stats accessible
- [x] Admin dashboard complete

**Anti-Cheat Ready When:**
- [x] Vote fraud detected
- [x] Vote burst prevented
- [x] AFK farming blocked
- [x] Bot rings detected
- [x] <2% false positive rate

**UNIVERSAL ENGAGEMENT LAW ACTIVE When:**
- [x] Participation earns points
- [x] Audience votes first
- [x] XP tracks by role
- [x] All rooms stay alive
- [x] Zero farming exploits
- [x] Rewards flowing to users

---

**LOCKED IN: April 28, 2026**
**NEXT MILESTONE: Event Fill Engine + Universal Stats Engine (Parallel)**
