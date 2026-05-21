# UNIVERSAL ECONOMY SPINE - COMPLETE SYSTEM ARCHITECTURE

**LOCKED: April 28, 2026**

**STATUS: Ready for P1 implementation**

**VISION: Build the strongest retention engine in entertainment. Participation → Stats → XP → Rewards → Store → Vault → Replay → Retention**

---

## I. FOUNDATION DOCUMENTS (LOCKED)

### 1. Universal Participation Law
**File:** `UNIVERSAL_PARTICIPATION_LAW.md`
**Purpose:** Defines what counts as participation for every role
**Key Rule:** Everyone earns. Participation counts. Not just winning.

**Coverage:**
- Fan participation sources (20+ ways to earn)
- Artist participation sources (20+ ways to earn)
- Producer participation sources (12+ ways to earn)
- Comedian participation sources
- Dancer participation sources
- Venue participation sources
- Point categories (5 separate buckets)
- Point multipliers (streaks, events, tiers)
- Anti-farm rules (9 protection mechanisms)
- Achievement categories (25+ achievements)

### 2. Julius Meerkat Challenge Engine
**File:** `JULIUS_CHALLENGE_ENGINE.md`
**Purpose:** Live engagement interruption bot that keeps rooms alive
**Key Rule:** Active interruption with trivia, polls, predictions, speed questions, challenges

**Coverage:**
- Trivia system (5 categories, 1000+ questions needed)
- Poll challenges (audience voting)
- Speed questions (5-10 second timer)
- Room challenges (user-generated content)
- Prediction challenges (who will win)
- Julius mechanics (appearance, frequency, interruption rules)
- Admin controls (pause, mute, difficulty)
- Anti-cheat (9 fraud prevention rules)
- Required routes (18 endpoints)
- Required DB models (9 models)

### 3. Universal Missions System
**File:** `UNIVERSAL_MISSIONS_SYSTEM.md`
**Purpose:** Daily/weekly/monthly goals that drive retention
**Key Rule:** Clear goals, achievable targets, daily engagement habit

**Coverage:**
- Daily missions (5-8 per role, 30-60 min estimated time)
- Weekly missions (6-8 per role, 3-5 hours estimated)
- Monthly missions (8-10 per role, 20-40 hours estimated)
- Seasonal missions (limited-time, 2-3 per season)
- Achievement missions (one-time permanent)
- Reward scaling by completion level
- Progression difficulty tiers
- Anti-padding rules (prevent farming)
- Required routes (11 endpoints)
- Required DB models (4 models)

### 4. Universal Economy Spine
**File:** `UNIVERSAL_ECONOMY_SPINE.md`
**Purpose:** Complete retention loop chain
**Key Rule:** The 9-stage cycle from participation to retention

**Coverage:**
- The complete participation → stats → XP → rewards → store → vault → replay → retention loop
- Participation sources (all entry points)
- Stats calculation (real-time)
- XP accumulation (role-specific)
- Reward granting (achievements, cosmetics)
- Store access (discovery, monetization)
- Vault delivery (digital + physical)
- Replay access (replay content, chat replay)
- Social proof (leaderboards, cosmetics)
- Retention hooks (psychology)
- Complete flow example (fan progression)
- Database models (14 models)
- Success metrics (target KPIs)

---

## II. NEW BOT TEAMS REGISTERED FOR THE RETENTION SPINE

Added in the retention-spine pass:

1. **Travel Bot** - Travel XP, explorer progression, region and room movement
2. **Discovery Bot** - First-time artist, genre, venue, beat, and producer discovery
3. **Support Bot** - Creator support chain rewards for tips, merch, tickets, beats, NFTs, shares, and referrals
4. **Loyalty Bot** - Day, week, month, year, and venue loyalty progression
5. **Prediction Bot** - Platform-wide prediction leagues and leaderboards
6. **Quiz Bot** - Global quiz leagues across music, dance, comedy, production, history, instruments, and culture
7. **Season Bot** - Seasonal championships and prestige rewards
8. **Mentor Bot** - Mentor XP, ratings, teaching progression, booking boosts
9. **Academy Bot** - Learning XP, certifications, and pro-room unlocks
10. **Protection Bot** - License locking, delivery vault protection, fulfillment safeguards, refund logic
11. **History Bot** - Universal history indexes and role-specific history pages

These bots extend the previously locked stats, participation, Julius, reward, replay, and vault layers into a full retention spine.

---

## III. IMPLEMENTATION ROADMAP (11 Weeks)

**File:** `UNIVERSAL_ECONOMY_SPINE_ROADMAP.md`

### Phase Order
```
P1  — Universal Stats Engine (Week 1-2)
P2  — Participation Ledger (Week 1-2 parallel)
P3  — Julius Challenge Engine (Week 2-3)
P4  — Reward Grant Engine (Week 3-4)
P5  — Travel Engine (Week 4-5)
P6  — Discovery Engine (Week 4-5)
P7  — Prediction Engine (Week 5-6)
P8  — Loyalty Engine (Week 5-6)
P9  — Missions System (Week 6-7)
P10 — Store / Vault Chain (Week 7-8)
P11 — History Engine (Week 8-9)
P12 — Seasonal Engine (Week 9-10)
```

### Critical Path
```
Week 1-2: P1 + P2 (Stats + Participation foundation)
Week 2-3: P3 (Julius engagement loop)
Week 3-4: P4 (Rewards lock retention)
Week 4-5: P5 + P6 (Travel + Discovery)
Week 5-6: P7 + P8 (Prediction + Loyalty)
Week 6-10: P9-P12 (Mission, store/vault, history, seasonal completion)
```

---

## IV. REQUIRED DATABASE MODELS (Total: 35+)

### Participation & Stats
```
UserStats
Leaderboard
StatHistory
ParticipationLedger
ParticipationSession
Attendance
Heartbeat
```

### Engagement & Challenges
```
JuliusChallenge
TriviaQuestion
PollQuestion
PredictionEntry
ChallengeAnswer
ChallengeResult
```

### Achievements & Rewards
```
Achievement
AchievementUnlock
Cosmetic
CosmeticOwned
RewardGrant
RewardMultiplier
```

### Missions
```
Mission
MissionProgress
MissionReward
SeasonalMission
```

### Systems
```
TravelLedger
DiscoveryLedger
SupportLedger
LoyaltyLedger
PredictionLedger
QuizLedger
VenueLoyalty
HistoryIndex
Reputation
SkillTree
SkillProgress
Vault
VaultItem
```

### Economy
```
CreatorSplit
Royalty
LicenseGrant
```

### Safety
```
FraudFlag
AntiCheatSignal
FraudResolution
VoteIntegrity
```

---

## V. REQUIRED API ROUTES (100+)

### Stats & Leaderboards (8 routes)
```
GET /api/profile/:userId/stats
GET /api/profile/:userId/stats/breakdown
GET /api/leaderboards/fan
GET /api/leaderboards/artist
GET /api/leaderboards/producer
GET /api/leaderboards/:category/trending
GET /api/admin/stats/overview
```

### Participation Ledger (4 routes)
```
POST /api/participation/record
GET /api/profile/:userId/participation-history
GET /api/profile/:userId/sessions
GET /api/admin/participation/audit
```

### Travel / Discovery / Loyalty / History (10 routes)
```
GET /api/travel
GET /api/profile/:userId/travel
GET /api/discovery
GET /api/profile/:userId/discovery
GET /api/support
GET /api/loyalty
GET /api/predictions
GET /api/quizzes
GET /api/history
GET /api/admin/travel
```

### Julius Challenges (16 routes)
```
GET /api/julius/challenges
POST /api/julius/trivia
POST /api/julius/trivia/:id
GET /api/julius/predictions
POST /api/julius/predictions
GET /api/julius/polls
POST /api/julius/polls/:id/vote
GET /api/julius/leaderboards/challenges
GET /api/julius/leaderboards/speed
GET /api/julius/leaderboards/predictions
GET /api/julius/history/:userId
GET /api/admin/julius
POST /api/admin/julius/settings
GET /api/admin/julius/fraud
GET /api/admin/julius/analytics
```

### Missions (6 routes)
```
GET /api/missions
GET /api/missions/daily
GET /api/missions/weekly
GET /api/missions/monthly
GET /api/missions/seasonal
GET /api/admin/missions
```

### Rewards & Achievements (4 routes)
```
GET /api/achievements
GET /api/profile/:userId/achievements
POST /api/admin/rewards/unlock
GET /api/profile/:userId/inventory
```

### Collaboration (4 routes)
```
POST /api/collab
GET /api/collab
POST /api/collab/:id/join
GET /api/collab/:id/agreement
```

### Mentor (4 routes)
```
GET /api/mentor
POST /api/mentor/:id/book
GET /api/mentor/:id/schedule
GET /api/mentor/:id/students
```

### Matchmaking (5 routes)
```
POST /api/matchmaking/queue
GET /api/matchmaking/status
POST /api/matchmaking/accept
POST /api/matchmaking/decline
GET /api/admin/matchmaking/analytics
```

### Vault & Store (8 routes)
```
GET /api/vault
GET /api/vault/cosmetics
GET /api/vault/nfts
GET /api/vault/beats
GET /api/vault/history
GET /api/store/cosmetics
POST /api/store/purchase
GET /api/admin/rewards/analytics
```

---

## VI. ECONOMY BUCKETS (CRITICAL SEPARATION)

**5 separate point buckets to prevent inflation:**

### 1. Engagement Points
- Non-spendable
- Used for rank/leaderboard calculation
- Shows total engagement
- Public display
- Example: 5000 engagement points = player is #47 globally

### 2. Reward Points
- Spendable on store
- Limited daily earn cap (500 max)
- Convertible to cosmetics, skins, emotes
- Transferable (limited)
- Example: 150 reward points → 1 legendary skin

### 3. Entry Points
- Used for entering competitions
- Event-specific
- Non-transferable
- Capped per event
- Example: 10 entry points to enter battle tournament

### 4. Achievement Points
- Earned on achievement unlock only
- Used for achievement level
- Non-spendable
- Display only
- Example: 500 achievement points = 5 major achievements unlocked

### 5. XP (Level Progression)
- Role-specific (Fan/Artist/Producer/etc)
- Separate progression per role
- Used for leveling
- Determines access/perks
- Example: 1000 Artist XP = Level 15 Artist

**Rule: These MUST stay separate or economy breaks**

---

## VII. ANTI-FARM PROTECTIONS (9 Rules)

```
1. AFK Detection
   - Must interact every 5 minutes
   - Passive earning stops after 5min

2. Spam Detection
   - Max 10 same-type actions per minute
   - Repeated patterns flagged

3. Duplicate Answer Detection
   - One answer per question per user per event
   - Repeats flagged

4. Bot Abuse Detection
   - Activity signature analysis
   - Unusual patterns detected
   - IP rotation caught

5. Idle Penalties
   - Earning stops after 20 min inactivity
   - Resume on next interaction

6. Collusion Detection
   - Vote pattern analysis
   - Coordinated voting flagged

7. Vote Ring Detection
   - User clustering analyzed
   - >5 votes from same source in 10 sec = flagged

8. Fake Attendance Detection
   - Video/microphone/camera presence checks
   - Blockchain presence verification (future)

9. Fast-Click Detection
   - Superhuman click rates flagged
   - Impossible answer speed caught
```

---

## VIII. SUCCESS METRICS (Target KPIs)

### By End of P4 (Week 4):
```
✓ 30% of users in stats/leaderboard top 50%
✓ Julius running in 80% of active rooms
✓ 20% of users earned at least one achievement
✓ Engagement time +40%
✓ Daily active users +25%
```

### By End of P7 (Week 6):
```
✓ 60% of users engaged with all core systems
✓ Matchmaking reduces wait time by 50%
✓ Collaboration rooms: 200+ collaborations/week
✓ Mentor system: 500+ mentor bookings/week
✓ 7-day retention: +50%
✓ 30-day retention: +35%
```

### By End of P15 (Week 11):
```
✓ Complete economy spine operational
✓ Platform engagement 3x baseline
✓ ARPU $25-40/month
✓ 7-day retention: 50%+
✓ 30-day retention: 35%+
✓ Creator adoption: 70%+
✓ MAU growth: 100%+ MoM
✓ Transaction volume: 10k+/day
```

---

## IX. SYSTEM INTEGRATIONS

### What Feeds What

```
Participation Ledger → Stats Calculation
Stats → Leaderboards
Leaderboards → Social Proof
Julius Challenges → Participation Points
Participation Points → Stats Update
Stats Update → Achievement Unlock Triggers
Achievement Unlock → Reward Grant
Reward Grant → Cosmetics Drop
Cosmetics → Store Available Items
Store → Vault Contents
Vault Contents → User Identity/Status
Status → Motivation to Return
Return → More Participation (Loop Complete)
```

### Data Flow Dependencies

```
User Action
    ↓
Participation Record (append-only)
    ↓
Stats Calculation (real-time)
    ↓
Leaderboard Update
    ↓
Achievement Check
    ↓
Reward Grant (if threshold met)
    ↓
Cosmetic Added to Inventory
    ↓
User Notification
    ↓
User applies cosmetic
    ↓
Visible on profile
    ↓
Motivation to earn more
    ↓
Back to User Action (Retention Loop)
```

---

## X. ROLLOUT STRATEGY

### Alpha Phase (Week 1-2: P1 + P2)
```
Availability: Internal testing, 10% of users
Features: Stats, Participation Ledger
Metrics: Track calculation accuracy, latency
Risks: Stats calculation errors, lag
```

### Beta Phase (Week 2-4: P1-P4)
```
Availability: 50% of users
Features: Stats, Participation, Julius, Rewards
Metrics: Engagement, retention, fraud signals
Risks: Fraud gaming, server load, false unlocks
```

### Gamma Phase (Week 4-7: P1-P7)
```
Availability: 90% of users
Features: All previous + Collaboration + Mentor + Matchmaking
Metrics: All systems, creator adoption
Risks: Revenue split accuracy, booking abuse
```

### Production (Week 7-11: P8-P15)
```
Availability: 100% of users
Features: Complete economy spine
Metrics: All systems at scale
```

---

## XI. CRITICAL SUCCESS FACTORS

1. **Stats Must Be Real-Time**
   - Users need to see progress immediately
   - Leaderboards must update live
   - No more than 1 second latency

2. **Julius Must Be Non-Intrusive**
   - Never blocks main event
   - Always dismissible
   - Optional sound
   - Should enhance, not distract

3. **Rewards Must Be Visible**
   - Achievements announced immediately
   - Cosmetics applied instantly
   - Status changes visible to others
   - FOMO drives engagement

4. **Points Must Stay Separate**
   - 5 separate buckets critical
   - No cross-conversion
   - Different earning rates
   - Prevents inflation

5. **Anti-Cheat Must Be Active**
   - Real-time fraud detection
   - False positives <1%
   - Auto-reversals on detection
   - Manual escalation path

6. **Creator Monetization Must Work**
   - Revenue splits auditable
   - Payments reliable
   - Transparent calculation
   - On-time payouts

---

## XII. CRITICAL BLOCKERS RESOLVED

- ✅ Event Closure Layer (6 engines complete)
- ✅ Unified Event Architecture (no new families)
- ✅ Audit Logging (append-only, forensic-ready)
- ✅ Conductor Bot Registry (26 teams registered)
- ✅ Universal Laws (locked in place)
- ✅ Points Economy Structure (5 buckets defined)
- ✅ Anti-Farm Protections (9 rules designed)

---

## XIII. NEXT STEPS (IMMEDIATE)

### Copilot (Right Now)
```
1. Create apps/api/src/modules/stats/universal-stats.engine.ts
   - Implement fan stats calculation
   - Implement artist stats calculation
   - Implement producer stats calculation
   
2. Create apps/api/src/modules/stats/stats.controller.ts
   - Implement GET /api/profile/:userId/stats
   - Implement GET /api/leaderboards/:category
   
3. Add UserStats, Leaderboard models to Prisma schema
4. Run migrations
5. Test stats calculation against real events
```

### Gemini (Right Now - Parallel)
```
1. Create apps/api/src/modules/participation/participation-ledger.service.ts
   - Implement recording system
   - Implement audit trail
   
2. Create apps/api/src/modules/participation/participation.controller.ts
   - Implement GET /api/profile/:userId/participation-history
   
3. Add ParticipationLedger model to Prisma schema
4. Test recording against real events
```

### Combined (Week 1 End)
```
- Build routes for P1 + P2
- Verify stats accuracy
- Verify participation recording
- Load test at 1000 concurrent users
- Ready for Julius (P3) in Week 2
```

---

**LOCKED IN: Universal Economy Spine Complete System Architecture**

**STATUS: Ready for P1 implementation**

**TARGET: Complete 15-phase build in 11 weeks**

**VISION: Create the strongest retention engine in entertainment**

**LAUNCH DATE: May 9, 2026 (11 weeks from April 28)**
