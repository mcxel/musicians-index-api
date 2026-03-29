# POINTS_REWARDS_ECONOMY.md
# Points and Rewards Economy — Architecture Reference
# Repo paths: packages/db/prisma/schema.prisma (LedgerEntry exists)
#             apps/api/src/modules/points/ (to create)

## Economy Overview

The TMI points economy is a virtual currency system where users earn points through platform engagement
and redeem them for rewards, prizes, and status upgrades.

The central ledger model (`LedgerEntry`) already exists in the DB.
This document defines the full economy layer on top of it.

---

## Points Sources

| Event | Points | Validator |
|-------|--------|-----------|
| Complete 30s of a track | +5 | StreamWinEngine |
| Complete full track | +15 | StreamWinEngine |
| Save track to profile | +2 | StreamWinEngine |
| First stream of the day | +10 (bonus) | StreamWinEngine |
| Stream during live event | +25 (bonus) | StreamWinEngine |
| Complete game round correctly | +10–50 | GameEngine |
| Win a game session | +100 | GameEngine |
| Win a cypher round | +200 | CypherEngine |
| Win a cypher session | +500 | CypherEngine |
| Win Weekly Crown | +1,000 | WeeklyResetBot |
| Submit original content | +50 | Staff review |
| Refer a new user | +100 | OnboardingBot |
| Daily login streak (7 days) | +25 | DailyStreakBot |
| Profile complete (100%) | +200 | One-time |

---

## Points Validation Rules

1. All point awards go through server-side validation — no client-side point injection
2. Every award creates a `LedgerEntry` with type `CREDIT` and a description
3. Duplicate prevention: stream events are deduplicated by trackId + userId + date
4. Maximum daily cap: 500 pts from streaming (prevents farming)
5. Game/Cypher points have no daily cap (rare event, high value)

---

## Rewards / Redemption

| Reward | Cost | Type |
|--------|------|------|
| Custom profile badge | 500 pts | Cosmetic |
| Featured slot on billboard | 2,000 pts | Visibility |
| Exclusive avatar frame | 1,500 pts | Cosmetic |
| Early access to new music | 1,000 pts | Content |
| Entry into prize draw | 250 pts/entry | Chance |
| Store discount code | 5,000 pts | Commerce |

---

## Engine Architecture

```
PointsRewardsEngine
├── PointsService         — award/deduct points, validate, write LedgerEntry
├── BalanceQuery          — read current balance (sum of LedgerEntry per user)
├── LeaderboardService    — top earners weekly/all-time
├── AchievementService    — check achievement gates, award badges
├── RewardCatalog         — list of available redemptions
├── RedemptionService     — process reward redemption, deduct points
└── WeeklyResetService    — snapshot + reset weekly counters (called by WeeklyResetBot)
```

---

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/points/balance` | Auth user's current balance |
| GET | `/api/points/history` | Auth user's ledger history |
| GET | `/api/points/leaderboard` | Top earners (weekly + all-time) |
| GET | `/api/points/achievements` | Auth user's achievements |
| GET | `/api/points/rewards` | Available rewards catalog |
| POST | `/api/points/redeem` | Redeem a reward |
| POST | `/api/points/admin/award` | Manual award (Admin/Staff) |

---

## DB Models Needed (additions)

```prisma
model Achievement {
  id          String   @id @default(cuid())
  key         String   @unique   // e.g., "first_stream", "game_winner"
  title       String
  description String
  iconUrl     String?
  pointValue  Int      @default(0)
  userAchievements UserAchievement[]
}

model UserAchievement {
  id            String      @id @default(cuid())
  userId        String
  achievementId String
  achievement   Achievement @relation(fields: [achievementId], references: [id])
  earnedAt      DateTime    @default(now())

  @@unique([userId, achievementId])
}

model RewardItem {
  id          String   @id @default(cuid())
  title       String
  description String
  costPoints  Int
  type        String   // COSMETIC | VISIBILITY | CONTENT | COMMERCE | CHANCE
  imageUrl    String?
  isActive    Boolean  @default(true)
  stockLimit  Int?
  redemptions RewardRedemption[]
}

model RewardRedemption {
  id           String     @id @default(cuid())
  userId       String
  rewardId     String
  reward       RewardItem @relation(fields: [rewardId], references: [id])
  pointsSpent  Int
  status       String     @default("PENDING")  // PENDING|DELIVERED|CANCELLED
  redeemedAt   DateTime   @default(now())
}
```

---

## Files To Create

| File | Action |
|------|--------|
| `apps/api/src/modules/points/points.module.ts` | CREATE |
| `apps/api/src/modules/points/points.controller.ts` | CREATE |
| `apps/api/src/modules/points/points.service.ts` | CREATE |
| `apps/api/src/modules/points/achievements.service.ts` | CREATE |
| `apps/api/src/modules/points/rewards.service.ts` | CREATE |
| `apps/web/src/components/points/PointsBalance.tsx` | CREATE |
| `apps/web/src/components/points/AchievementBadge.tsx` | CREATE |
| `apps/web/src/components/points/RewardCard.tsx` | CREATE |
| `packages/db/prisma/schema.prisma` | EDIT — add Achievement, Reward, Redemption |

---

## Artist Tier Thresholds (Points-Based)

| Tier | Cumulative Points | Effect |
|------|------------------|--------|
| Bronze | 0 | Default profile style |
| Silver | 5,000 | Silver badge, minor profile glow |
| Gold | 25,000 | Gold badge, article gold header |
| Platinum | 100,000 | Platinum badge, full platinum article skin |
| Diamond | 500,000 | Diamond badge, animated profile + article |
| Permanent Diamond | Admin-granted | Same as Diamond, never reverts |
