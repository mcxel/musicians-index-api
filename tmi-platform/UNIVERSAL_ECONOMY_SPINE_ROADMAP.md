# UNIVERSAL ECONOMY SPINE - IMPLEMENTATION ROADMAP

**LOCKED: April 28, 2026**

**STATUS: Ready for Phase 1 build**

**PRIORITY ORDER: Finish the chain that makes the platform durable**

## UPDATED LOCK - APRIL 28, 2026

This updated retention ordering supersedes the older creator-room-first ordering below.

```
P1  — Universal Stats Engine
P2  — Participation Ledger
P3  — Julius Challenge Engine
P4  — Reward Engine
P5  — Travel Engine
P6  — Discovery Engine
P7  — Prediction Engine
P8  — Loyalty Engine
P9  — Mission Engine
P10 — Store / Vault Chain
P11 — History Engine
P12 — Seasonal Engine
```

Cross-cutting locks for the same spine:
```
Support Chain Rewards
Quiz League
Venue Loyalty
Sponsor Missions
Learning XP
Mentor XP
Social Chain XP
Creator Protection Layer
```

Required new ledgers for this order:
```
TravelLedger
DiscoveryLedger
SupportLedger
LoyaltyLedger
PredictionLedger
QuizLedger
HistoryIndex
```

---

## PRIORITY PHASE ORDER

### P1: Universal Stats Engine (IMMEDIATE - Week 1-2)
**Rationale:** Without real-time stats, users don't see their progress. All other systems depend on this visibility.

**Deliverables:**
- [x] Fan Stats Calculation (engagement, discovery, support, loyalty)
- [x] Artist Stats Calculation (conversion, performance, booking, efficiency)
- [x] Producer Stats Calculation (beat conversion, success, licensing)
- [x] Real-time leaderboards (global, weekly, monthly, genre, venue)
- [x] Stats routes: `/api/profile/:userId/stats`, `/api/leaderboards/:category`
- [x] Admin analytics: `/api/admin/stats/overview`

**Required DB Models:**
```
UserStats (fan_stats, artist_stats, producer_stats)
Leaderboard (rank, score, trend_indicator, weekly_rank, monthly_rank)
StatHistory (for trending)
```

**Routes:**
```
GET /api/profile/:userId/stats               → User personal stats
GET /api/profile/:userId/stats/breakdown      → Detailed stat sources
GET /api/leaderboards/fan                    → Global fan leaderboard
GET /api/leaderboards/artist                 → Global artist leaderboard
GET /api/leaderboards/producer               → Global producer leaderboard
GET /api/leaderboards/battles/:period        → Battle-specific rankings
GET /api/leaderboards/:category/trending     → Weekly trending
GET /api/admin/stats/overview                → Admin dashboard
```

**Proof Checklist:**
- [ ] Stats calculate in real-time (< 1s latency)
- [ ] Leaderboards rank accurately
- [ ] Trending indicators work
- [ ] Role-specific stats correct
- [ ] No calculation errors in audit logs

---

### P2: Participation Ledger (Week 1-2 parallel with P1)
**Rationale:** Every action must be recorded. This is the foundation for stats, rewards, and anti-cheat.

**Deliverables:**
- [x] Record all participation: votes, tips, attendance, reactions, comments, predictions, challenges
- [x] Link each record to eventId, userId, timestamp
- [x] Audit trail (immutable append-only)
- [x] User history endpoint

**Required DB Models:**
```
ParticipationLedger (userId, eventId, participationType, points, timestamp, audited)
ParticipationSession (userId, eventId, joinedAt, leftAt, reason)
Attendance (userId, eventId, duration, active_time)
Heartbeat (userId, eventId, timestamp, state=ACTIVE|AFK|WATCHING)
```

**Routes:**
```
POST /api/participation/record                → Record participation (internal)
GET /api/profile/:userId/participation-history → User participation history
GET /api/profile/:userId/sessions              → User session history
GET /api/admin/participation/audit             → Audit trail
POST /api/admin/participation/reconcile        → Force reconciliation
```

**Proof Checklist:**
- [ ] Participation recorded for every action
- [ ] No gaps in ledger
- [ ] Timestamps accurate
- [ ] Immutable records (no edits)
- [ ] History queryable

---

### P3: Julius Challenge Engine (Week 2-3)
**Rationale:** This is the engagement loop. Keeps rooms alive, rewards participation, drives retention.

**Deliverables:**
- [x] Trivia system (5k+ questions library by category)
- [x] Polls system (audience voting, results)
- [x] Speed questions (fastest correct wins)
- [x] Room challenges (drop your best bar, name this instrument, etc)
- [x] Predictions (who will win, who gets eliminated)
- [x] Fraud detection (bot abuse, impossible accuracy, collusion)
- [x] Leaderboards (challenge leaderboards, speed leaderboards, prediction leaderboards)
- [x] Admin controls (pause, mute, frequency, difficulty)

**Required DB Models:**
```
JuliusChallenge (id, roomId, type, question, options, correctAnswer, createdAt, expiresAt)
TriviaQuestion (id, category, question, options, correctAnswer, difficulty, approved, views, score)
PollQuestion (id, roomId, question, options, voteCounts, startedAt, endedAt)
PredictionEntry (id, userId, eventId, prediction, predictedAt, revealedAt, correct, pointsEarned)
ChallengeAnswer (id, userId, challengeId, answer, answeredAt, correct, pointsEarned)
ChallengeResult (id, challengeId, winners[], topAnswers[], participantCount, correctCount)
```

**Routes:**
```
GET /api/julius/challenges              → Active challenges
GET /api/julius/trivia                  → Trivia questions
POST /api/julius/trivia                 → Submit trivia answer
GET /api/julius/predictions             → Active predictions
POST /api/julius/predictions            → Make prediction
GET /api/julius/polls                   → Active polls
POST /api/julius/polls/:id/vote        → Vote in poll
GET /api/julius/leaderboards/challenges → Challenge leaderboard
GET /api/julius/leaderboards/speed      → Speed question leaderboard
GET /api/julius/leaderboards/predictions → Prediction leaderboard
GET /api/julius/history/:userId         → User challenge history
GET /api/admin/julius                   → Admin dashboard
POST /api/admin/julius/settings         → Configure Julius
GET /api/admin/julius/fraud             → Fraud detection data
GET /api/admin/julius/analytics         → Engagement analytics
```

**Proof Checklist:**
- [ ] Trivia system live with 1k+ questions
- [ ] Polls working with live voting
- [ ] Speed questions working (fastest wins)
- [ ] Room challenges tested
- [ ] Predictions working (locked at reveal time)
- [ ] Fraud detection active
- [ ] Leaderboards accurate
- [ ] Julius appears in rooms (non-intrusive)
- [ ] Points awarded correctly
- [ ] No false positives in fraud detection

---

### P4: Reward Grant Engine (Week 3-4)
**Rationale:** Without rewards, participation means nothing. This ties participation to tangible value.

**Deliverables:**
- [x] Achievement detection (when user hits milestone)
- [x] Achievement unlock animation/notification
- [x] Cosmetic drops (skins, emotes, profiles, titles)
- [x] Badge granting
- [x] Point allocation (spendable reward points)
- [x] Real-time inventory update
- [x] Fraud detection (prevent double-unlock, prevent farming)

**Required DB Models:**
```
Achievement (id, name, icon, rarity, requirement, rewardType, rewardValue)
AchievementUnlock (id, userId, achievementId, unlockedAt, notifiedAt)
Cosmetic (id, name, type, price, rarity, seasonal, active)
CosmeticOwned (id, userId, cosmeticId, acquiredAt, acquiredVia)
RewardGrant (id, userId, type, value, achievementId, pointsEarned, timestamp)
```

**Routes:**
```
GET /api/achievements                   → All achievements
GET /api/profile/:userId/achievements   → User achievements
POST /api/admin/rewards/unlock          → Manual unlock (admin)
GET /api/profile/:userId/inventory      → User cosmetics inventory
GET /api/store/cosmetics                → Available cosmetics
GET /api/admin/rewards/analytics        → Reward grant analytics
```

**Proof Checklist:**
- [ ] Achievements unlock at correct thresholds
- [ ] Cosmetics distributed properly
- [ ] Points allocated to spendable bucket
- [ ] No false unlocks
- [ ] Inventory correct
- [ ] Fraud prevention working

---

### P5: Collaboration Rooms (Week 4-5)
**Rationale:** Artists need to work together. This creates content and keeps them engaged.

**Deliverables:**
- [x] Writing rooms (songwriting collaboration)
- [x] Beat building rooms (producer + artist)
- [x] Rehearsal rooms (band practice)
- [x] Vocalist rooms (vocalist + producer)
- [x] Dance rehearsal
- [x] Comedy writing rooms
- [x] Revenue split system

**Required DB Models:**
```
CollaborationRoom (id, title, type, ownerId, participantIds, startedAt, endedAt, recordedAt, revenue)
CollaborationAgreement (id, roomId, participantIds, splitPercentages, audited)
```

**Routes:**
```
POST /api/collab                        → Create collab room
GET /api/collab                         → List collab rooms
POST /api/collab/:id/join              → Join collaboration
GET /api/collab/:id/agreement          → Revenue agreement
POST /api/collab/:id/finalize          → Finalize collab
```

**Proof Checklist:**
- [ ] Rooms create with correct participants
- [ ] Revenue splits calculated
- [ ] Recordings stored
- [ ] All participants earn participation points

---

### P6: Mentor Rooms (Week 5)
**Rationale:** Teaching creates new creators. Revenue split incentivizes teaching.

**Deliverables:**
- [x] Music teacher rooms
- [x] Dance teacher rooms
- [x] Comedy coach rooms
- [x] Instrument coach rooms
- [x] Booking system (student can book mentor)
- [x] Revenue split
- [x] Class scheduling

**Routes:**
```
GET /api/mentor                         → List mentors
POST /api/mentor/:id/book              → Book mentor session
GET /api/mentor/:id/schedule           → Mentor schedule
GET /api/mentor/:id/students           → Mentor student list
POST /api/mentor/:id/lesson            → Create lesson
```

**Proof Checklist:**
- [ ] Booking system working
- [ ] Revenue splits correct
- [ ] Attendance tracked
- [ ] Points awarded to both mentor and student

---

### P7: Matchmaking Engine (Week 5-6)
**Rationale:** Quality matchups make better events. This increases engagement.

**Deliverables:**
- [x] Genre matching
- [x] Skill tier matching
- [x] Language matching
- [x] Region matching
- [x] Battle pairing algorithm
- [x] Cipher queue optimization

**Routes:**
```
POST /api/matchmaking/queue            → Join matchmaking queue
GET /api/matchmaking/status            → Queue status
POST /api/matchmaking/accept           → Accept match
POST /api/matchmaking/decline          → Decline match
GET /api/admin/matchmaking/analytics   → Matchmaking data
```

**Proof Checklist:**
- [ ] Matches happen within 2 minutes
- [ ] Quality of matches > 80%
- [ ] No unmatched edge cases
- [ ] Region matching accurate

---

## SECONDARY PHASES

### P8: Missions System (Week 6-7)
**Status:** Architected (UNIVERSAL_MISSIONS_SYSTEM.md)

**Deliverables:**
- [x] Daily missions (3-5 per user)
- [x] Weekly missions (5-7 per user)
- [x] Monthly missions (10-15 per user)
- [x] Seasonal missions
- [x] Mission progression difficulty scaling
- [x] Reward distribution

---

### P9: Reward Vault (Week 7)
**Status:** Architected (UNIVERSAL_ECONOMY_SPINE.md)

**Deliverables:**
- [x] Central vault UI
- [x] Cosmetics inventory
- [x] NFT storage
- [x] Beat licenses
- [x] Merch coupons
- [x] Ticket management

---

### P10: Artist Store (Week 8)
**Status:** Architected

**Deliverables:**
- [x] Per-artist storefronts
- [x] Cosmetics sales
- [x] Beat sales
- [x] Merch sales
- [x] NFT minting

---

### P11: Ticket Printing (Week 8)
**Status:** Architected

**Deliverables:**
- [x] PDF generation
- [x] QR code generation
- [x] Template builder
- [x] Venue customization

---

### P12: Replay Engine (Week 9)
**Status:** Architected

**Deliverables:**
- [x] Event storage
- [x] Replay streaming
- [x] Chat replay
- [x] Vote overlay

---

### P13: Highlight Engine (Week 9)
**Status:** Architected

**Deliverables:**
- [x] Auto-clip generation
- [x] Moment detection
- [x] Feed population

---

### P14: Reputation System (Week 10)
**Status:** Architected

**Deliverables:**
- [x] Reliability score
- [x] Performance score
- [x] Sportsmanship score
- [x] Support score
- [x] Commerce score

---

### P15: Skill Tree System (Week 11)
**Status:** Architected

**Deliverables:**
- [x] Fan skill trees
- [x] Artist skill trees
- [x] Producer skill trees
- [x] Unlock mechanics

---

## IMPLEMENTATION STRATEGY

The execution plan below is now retention-spine-first. Older collaboration-first detail should be treated as backlog after P12 unless it directly feeds the chain.

### Week 1-2: Foundation (P1 + P2)
```
Parallel work:
- Copilot: Universal Stats Engine (DB models, calculation logic, leaderboards)
- Gemini: Participation Ledger (recording system, audit trail, UI)

Output:
- Stats visible on profiles
- Leaderboards live
- Participation history queryable
- Ready for P3
```

### Week 2-3: Engagement Loop (P3)
```
Julius Challenge Engine:
- 1000+ trivia questions loaded
- Polls system live
- Speed questions working
- Room challenges deployable
- Predictions working
- Fraud detection active

Output:
- Julius actively interrupting rooms
- Points flowing to users
- Engagement metrics collected
- Foundation for reward systems
```

### Week 3-4: Rewards (P4)
```
Reward Grant Engine:
- Achievements triggering correctly
- Cosmetics dropping
- Points allocated to right buckets
- Inventory accurate

Output:
- Users seeing rewards
- Cosmetics wearable
- Travel, discovery, and support actions ready to feed rewards
- Retention loop started
```

### Week 4-5: Movement + Discovery (P5 + P6)
```
Parallel:
- Copilot: Travel Engine (TravelLedger, travel XP, explorer badges)
- Gemini: Discovery Engine (DiscoveryLedger, discovery points, first-seen logic)

Output:
- Movement across venues and genres is rewarded
- First-time discovery becomes visible and auditable
- Explorer and world-traveler progression is unlocked
```

### Week 5-6: Prediction + Loyalty (P7 + P8)
```
Prediction + Loyalty:
- Prediction league scoring live
- Venue loyalty tiers live
- Support chain and loyalty streaks visible

Output:
- Stronger return incentives
- Better recurring-user identity
- Cleaner history into loyalty conversion
```

### Week 6+: Completion (P9-P12)
```
Sprint through the rest of the machine:
- Missions (engagement loops)
- Store / Vault chain (monetization + secure delivery)
- Universal history (all roles)
- Seasonal championships
- Quiz league, mentor XP, academy XP, sponsor missions, creator protection
```

---

## SUCCESS METRICS

**By End of P4 (Week 4):**
```
✓ 30% of users in stats/leaderboard top 50%
✓ Julius running in 80% of active rooms
✓ 20% of users earned at least one achievement
✓ Engagement time +40%
```

**By End of P7 (Week 6):**
```
✓ 60% of users engaged with all core systems
✓ Travel and discovery ledgers generating clean first-time rewards
✓ Prediction league and loyalty tiers visible to active users
✓ Retention: 7-day +50%
```

**By End of P15 (Week 11):**
```
✓ Complete economy spine operational
✓ Platform engagement 3x baseline
✓ ARPU $25-40/month
✓ 30-day retention: 35%+
✓ Creator adoption: 70%+
```

---

## CRITICAL DEPENDENCIES

### P1 (Stats) enables:
- P3 (Julius needs stats calculation)
- P4 (Rewards need stat-based unlocks)
- All leaderboard features

### P2 (Participation Ledger) enables:
- Everything (all systems depend on participation records)

### P3 (Julius) enables:
- Engagement metrics
- Fraud detection patterns

### P4 (Rewards) enables:
- Store purchases
- Cosmetic drops
- Retention loops

### P5-P8 (Travel / Discovery / Prediction / Loyalty) enable:
- Durable return behavior
- Venue regular and explorer progression
- Better recommendation and mission tuning

---

## BLOCKERS RESOLVED

- ✅ Event Closure Layer complete
- ✅ Unified Event Architecture ready
- ✅ Conductor bot registry updated
- ✅ Universal laws locked in (participation, audience-first, engagement)
- ✅ Database schema extensible (via JSON for new fields)
- ✅ Points economy separated into 5 buckets
- ✅ Anti-farm protections designed

---

## REQUIRED FILES TO CREATE

**Backend Services:**
```
apps/api/src/modules/stats/universal-stats.engine.ts
apps/api/src/modules/participation/participation-ledger.service.ts
apps/api/src/modules/julius/julius-challenge.engine.ts
apps/api/src/modules/rewards/reward-grant.engine.ts
apps/api/src/modules/collaboration/collaboration.service.ts
apps/api/src/modules/mentor/mentor.service.ts
apps/api/src/modules/matchmaking/matchmaking.engine.ts
```

**Frontend Components:**
```
components/Stats/UserStats.tsx
components/Stats/Leaderboard.tsx
components/Julius/ChallengeWidget.tsx
components/Julius/LeaderboardCards.tsx
components/Rewards/AchievementPopup.tsx
components/Rewards/CosmeticPreview.tsx
components/Vault/VaultDashboard.tsx
```

**Controllers (Routes):**
```
stats.controller.ts (/api/stats/*, /api/leaderboards/*)
participation.controller.ts (/api/participation/*)
julius.controller.ts (/api/julius/*)
rewards.controller.ts (/api/rewards/*, /api/achievements/*)
```

---

**LOCKED IN: Universal Economy Spine Implementation Roadmap**

**READY FOR: Phase 1 execution**

**NEXT STEP: Begin P1 (Universal Stats Engine) immediately**

**TARGET COMPLETION: 11 weeks to fully operational economy loop**
