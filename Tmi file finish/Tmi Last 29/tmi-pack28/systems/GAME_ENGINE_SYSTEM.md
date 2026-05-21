# GAME_ENGINE_SYSTEM.md
## TMI Game Platform — All Games, Rules, and Integration
### BerntoutGlobal XXL / The Musician's Index

---

## GAME PHILOSOPHY

Games are NOT added as afterthoughts. They are full monetization surfaces
and discovery engines that keep fans engaged between artist sessions.

---

## GAME TYPES

### 1. NAME THAT TUNE
```
Players: 2-8 (+ unlimited audience)
Format: Audio clip plays (1-5 seconds), first to buzz in wins
Rounds: 10 per game
Questions: Auto-generated from TMI music catalog + trending songs
Scoring: First correct answer wins points. Speed bonus.
Host mic: Game host (optional) or auto-MC by game-host-bot
Ad slots: GAME_LOBBY, GAME_ROUND_SPONSOR, GAME_INTERMISSION, GAME_END_SCREEN
Branded version: "Name That Tune — Presented by [Sponsor]"
```

### 2. DEAL OR FEUD  
```
Players: 2 teams of 1-4
Format: Survey-style questions about music ("Top 5 rappers?")
Rounds: 5 per game
Answers: Top answers from TMI community surveys
Scoring: Match community answers for points
Host mic: Required (host reads questions, manages rounds)
Ad slots: Full game slot registry
Season integration: Top Deal or Feud scores tracked per season
```

### 3. MUSIC TRIVIA (General)
```
Players: 2-20 (competitive free-for-all)
Format: Multiple choice questions, 15 seconds each
Categories: Hip Hop, Pop, R&B, Rock, Jazz, Electronic, TMI Platform
Rounds: 15 questions per game
Scoring: Points for correct + speed multiplier
Branded: Question cards can be sponsored (GAME_BRANDED_QUESTION)
Seasonal skins: GAME_SEASONAL_SKIN for special events
```

### 4. BEAT CHALLENGE
```
Players: 2-4 producers
Format: Each producer freestyles a beat live in 60 seconds
Judging: Audience votes (or panel judges)
Scoring: Vote percentage = placement
Connected: Beat Marketplace (winning beats can be listed immediately)
Ad slots: GAME_LOBBY, GAME_END_SCREEN
```

### 5. LYRIC CIPHER (Group Game)
```
Players: 4-8 performers
Format: One line each around the group, freestyling to a beat
Host: Room-assigned host starts and guides
Scoring: Audience tips = score (tips go to performer)
Connected: Live cypher room (same mechanics, game mode = tracked scores)
```

---

## GAME SESSION MODEL

```prisma
model GameSession {
  id            String   @id @default(cuid())
  gameType      String   // 'name_that_tune' | 'deal_or_feud' | 'trivia' | 'beat_challenge'
  roomId        String?
  status        String   // 'lobby' | 'active' | 'intermission' | 'ended'
  hostId        String
  players       GamePlayer[]
  scores        GameScore[]
  sponsorId     String?  // linked sponsor campaign
  seasonId      String?  // if counting for season points
  startedAt     DateTime?
  endedAt       DateTime?
  createdAt     DateTime @default(now())
}

model GamePlayer {
  id            String      @id @default(cuid())
  sessionId     String
  session       GameSession @relation(fields: [sessionId], references: [id])
  userId        String
  score         Int         @default(0)
  placement     Int?
  joinedAt      DateTime    @default(now())
}
```

---

## GAME AD DISPLAY SYSTEM

```typescript
// AdRenderer renders ads in game at these moments:
interface GameAdTiming {
  'game_start':     'GAME_LOBBY',       // shown in lobby before game starts
  'round_start':    'GAME_ROUND_SPONSOR', // 1-second overlay between rounds
  'intermission':   'GAME_INTERMISSION',  // shown in halftime-style break
  'game_end':       'GAME_END_SCREEN',    // shown on results screen
  'reward_unlock':  'GAME_REWARD_SPONSOR', // shown when user earns reward
}

// All game ads: 
// - max 3 seconds for round transitions
// - max 5 seconds for intermission
// - max 10 seconds for game end
// - always skippable after 3 seconds for non-title sponsors
// - title sponsors can claim "no skip" for one ad per session
```

---

## GAME ECONOMY

```
Game performance → Season points
Season rank → Crown contention
Crown winner → Featured on TMI cover (Homepage Image 1)
Winner Hall entry → Permanent achievement
Prizes: Set by contest rules (optional cash, merch, bookings, credits)
Game tips: Real-time tips to performers during beat challenge / lyric cipher
```

---

## STREAM & WIN INTEGRATION

```
"Stream & Win" score visible on homepage (BELT_TRENDS)
Users earn points by: listening, streaming, attending shows, playing games
Score displayed: real-time counter
Rewards: credits, merch discounts, priority booking, feature placement
Weekly leaderboard: top Stream & Win scores
```
