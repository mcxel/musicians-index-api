# JULIUS MEERKAT CHALLENGE ENGINE

**LOCKED: April 28, 2026**

**MISSION: Make every room feel alive with real-time engagement interruptions that reward participation.**

---

## I. JULIUS CONCEPT

Julius is the **live engagement bot** that interrupts rooms with challenges, trivia, predictions, and polls.

He doesn't replace the event. He enhances it.

### Where Julius Operates
```
✓ Battles
✓ Ciphers
✓ Dirty Dozens
✓ Joke-offs
✓ Dance-offs
✓ Concerts
✓ Rehearsals
✓ Waiting rooms
✓ Ticket lobbies
✓ Auctions
✓ Shopping rooms
✓ Classrooms
✓ Mentor rooms
✓ Producer rooms
✓ Practice rooms
✓ Collaboration rooms
```

**Rule: Julius only interrupts if engagement is low or room is waiting.**

He never blocks the main event.

---

## II. JULIUS CHALLENGE TYPES

### 1. TRIVIA CHALLENGES

**Frequency:** Every 2-3 minutes (if waiting) or on demand

**Examples by Genre:**

Music History:
```
"What year was hip-hop born?"
"Who invented the beatbox?"
"Name 3 legendary producers."
"What's a 16-bar?"
"Define a cypher."
```

Artist Facts:
```
"What artist has the most Grammy wins?"
"Which producer created the boom-bap sound?"
"Name the founder of hip-hop."
"What's this artist's real name?"
"How many #1 albums?"
```

Lyrics:
```
"Complete this bar: 'To the best...'"
"Who said this line?"
"Name the song."
"Which album?"
```

Genres & Instruments:
```
"What's the difference between trap and drill?"
"Name 5 instruments in this beat."
"What's a 808?"
"Define trap music."
```

Producer Knowledge:
```
"What's sampling?"
"Name a classic producer."
"What's a sidechain?"
"Define compression."
```

Dance & Movement:
```
"Name this dance move."
"What style is this?"
"How many dancers?"
"What's the music?"
```

Comedy:
```
"Name this comedian."
"What's a punchline?"
"Define a setup."
"Name a classic joke."
```

**Reward:**
- Correct: +5 trivia points
- Speed bonus (under 5 sec): +10 points
- Streak (3 correct): +50 points

**Format:**
```
Multiple choice (4 options) or fill-in
Time limit: 10 seconds
Answer via chat command: /answer [number] or /answer [text]
Leaderboard shows top 3 correct answers
```

---

### 2. POLL CHALLENGES

**Frequency:** Every 3-5 minutes during events

**Examples:**

Audience Polls:
```
"Who had the best bars?"
  A) Contestant 1
  B) Contestant 2
  C) Tie

"Best joke so far?"
  A) Opening
  B) Middle
  C) Closing

"Who will win?"
  A) Artist A
  B) Artist B
  C) Don't know

"Best dance move?"
  A) The opening
  B) The spin
  C) The finale

"Best beat drop?"
  A) 0:45
  B) 2:15
  C) 3:30

"Rate this performance:"
  A) Incredible
  B) Good
  C) Okay
  D) Needs work
```

**Reward:**
- Participation: +2 poll points
- Your vote matches majority: +3 bonus points
- Predicted correctly: +5 prediction points

**Format:**
```
Simple multiple choice (2-4 options)
Time limit: 30 seconds
Vote via /vote [letter] or click
Results shown immediately
```

---

### 3. SPEED QUESTIONS

**Frequency:** Random, during lulls

**Concept:** Fastest correct answer wins big.

**Examples:**
```
"Name the producer of this beat."
"What's the sample in this track?"
"How many bars?"
"What year was this released?"
"Name this artist."
"What style is this?"
```

**Rules:**
- Time limit: 5-10 seconds
- First correct answer wins
- Must have engaged in room (not just lurking)

**Reward:**
- Speed bonus: +20 points
- Leaderboard featured
- Daily speed champion: +100 points

**Format:**
```
Chat input: /answer [response]
Timestamp tracked
First correct shown
Instant announcement
```

---

### 4. ROOM CHALLENGES

**Frequency:** Every 5-10 minutes

**Interactive Challenges:**

```
"Drop your best bar (5 word limit):"
  - Voting on best response
  - Top 3 featured on screen
  - Reward: +15 points for featured

"Tell us your best joke:"
  - Crowd voting
  - Top voted featured
  - Reward: +15 points for featured

"Name this instrument:"
  - Audio clip plays
  - First correct: +10 points
  - Time limit: 15 seconds

"Guess the sample:"
  - Beat snippet plays
  - First correct: +15 points
  - Time limit: 20 seconds

"Guess the artist:"
  - Song snippet plays
  - First correct: +10 points
  - Time limit: 15 seconds

"Complete this lyric:"
  - First bar shown
  - First correct: +10 points
  - Time limit: 20 seconds

"Dance move challenge:"
  - Description given
  - Video submission
  - Community votes
  - Top 3 featured: +20 points each
```

**Reward:**
- Correct answer: +10 points
- Featured on screen: +20 points
- Most voted: +50 points

**Format:**
```
Julius announces challenge
Response time: 20-30 seconds
Responses collected
Top responses featured
Community voting (30 sec)
Winners announced
```

---

### 5. PREDICTION CHALLENGES

**Frequency:** Throughout event

**Examples:**

```
"Who will win this battle?"
  Predict: Artist A or B
  Reveal: When battle ends
  Correct: +15 points

"Who gets eliminated?"
  Predict: Contestant 1, 2, or 3
  Reveal: When announced
  Correct: +15 points

"Who's next in queue?"
  Predict: Artist name
  Reveal: When announced
  Correct: +10 points

"Will they finish?"
  Predict: Yes or No
  Reveal: When performance ends
  Correct: +10 points

"Will there be a tie?"
  Predict: Yes or No
  Reveal: When judging ends
  Correct: +15 points

"Total votes prediction:"
  Predict: range (0-50, 50-100, 100+)
  Reveal: Final count
  Correct: +15 points

"Will crowd react?"
  Predict: Yes or No
  Reveal: Crowd meter check
  Correct: +10 points
```

**Rules:**
- Predictions locked before reveal moment
- Can't change prediction after locked
- Correct predictions award bonus

**Reward:**
- Correct: +15 points
- Earliest predictor (before 20% showed): +30 points
- Multiple correct in row: +50 streak bonus

**Format:**
```
Julius announces prediction
Options clear
Chat input: /predict [choice]
Predictions locked at reveal moment
Results shown
Correct users announced
```

---

## III. JULIUS MECHANICS

### Appearance & Interruption

**Julius appears as:**
- Floating chat bot (top-right of room)
- Voiced announcements (optional, toggleable)
- On-screen banner for challenges
- Sound effect (non-intrusive)

**Interruption Rules:**
```
✓ Never blocks active performance
✓ Appears during lulls only
✓ Dismissible if needed
✓ Mutable (optional sound)
✓ Can be disabled by room host
✓ Off during critical moments (voting)
```

### Frequency Tuning

**Based on room state:**

Waiting room:
- Challenge every 1-2 minutes
- Keep energy up

Active performance:
- Polls during non-critical moments
- Predictions enabled
- Challenges paused

Post-performance:
- Trivia every 2 minutes
- Predictions on next event
- Challenges enabled

Dead room (attendance dropping):
- Challenge every minute
- Extra point multiplier (+1.5x)
- Emergency fill mechanic

---

## IV. JULIUS ADMIN CONTROLS

Room hosts can:

```
✓ Pause Julius
✓ Mute Julius
✓ Disable specific challenge types
✓ Set frequency
✓ Set point multiplier
✓ Set difficulty
✓ Brand with venue name
✓ Use custom trivia
```

Admin can:

```
✓ View all Julius activity
✓ Audit challenge results
✓ Detect anomalies
✓ Add/remove trivia questions
✓ Adjust difficulty globally
✓ Set point values
✓ Emergency disable
```

---

## V. JULIUS ANTI-CHEAT

### Fraud Prevention

```
✗ Rapid-fire answers
  - Flag if >100 answers/minute from same user
  
✗ Impossible accuracy
  - Flag if 100% correct on randomized questions
  
✗ Bot patterns
  - Exact same answer as other users within 1 second
  
✗ Account farming
  - New accounts (< 1 day) capped at 50 points/challenge
  
✗ Collusion
  - Identical answers from same IP at same time
  
✗ Brute force
  - Lockout after 3 wrong guesses (5 min cooldown)
```

### Points Protection

```
✓ Points awarded after 5 min delay (prevents immediate reversal gaming)
✓ Audit logged: who, when, what challenge, answer, points
✓ Reversions tracked
✓ Patterns analyzed for mass fraud
✓ Threshold breaches alert admin
```

---

## VI. REQUIRED ROUTES

```
/api/julius/challenges
  GET - list active challenges

/api/julius/challenges/:id
  GET - challenge details
  POST - submit answer

/api/julius/predictions
  GET - active predictions
  POST - make prediction

/api/julius/trivia
  GET - trivia questions library
  POST - add question (admin)

/api/julius/polls
  GET - poll results
  POST - vote

/api/julius/leaderboards/challenges
  GET - challenge leaderboards

/api/julius/leaderboards/predictions
  GET - prediction leaderboards

/api/julius/leaderboards/speed
  GET - speed question leaderboards

/api/julius/history/:userId
  GET - user challenge history

/api/admin/julius
  GET - admin dashboard
  POST - settings
  
/api/admin/julius/fraud
  GET - fraud detection data

/api/admin/julius/analytics
  GET - engagement analytics
```

---

## VII. REQUIRED DB MODELS

```
JuliusChallenge
  id
  roomId
  type (TRIVIA | POLL | SPEED | ROOM | PREDICTION)
  question
  options
  correctAnswer
  createdAt
  expiresAt
  active

TriviaQuestion
  id
  category (MUSIC_HISTORY | ARTIST_FACTS | LYRICS | GENRES | PRODUCER | DANCE | COMEDY)
  question
  options
  correctAnswer
  difficulty (EASY | MEDIUM | HARD)
  approved
  createdBy

PollQuestion
  id
  roomId
  question
  options
  voteCounts
  startedAt
  endedAt
  
PredictionEntry
  id
  userId
  eventId
  prediction
  predictedAt
  revealedAt
  correct
  pointsEarned

ChallengeAnswer
  id
  userId
  challengeId
  answer
  answeredAt
  correct
  pointsEarned
  
ChallengeResult
  id
  challengeId
  winners []
  topAnswers []
  engagement (# participants)
  
JuliusActivity
  id
  roomId
  timestamp
  challengeType
  participantCount
  correctCount
  pointsAwardedTotal
```

---

## VIII. JULIUS IMPACT

**On Retention:**
```
✓ Room engagement +40% (constant micro-rewards)
✓ Average session time +30 min (challenges keep people engaged)
✓ Return frequency +50% (want to climb leaderboards)
✓ Dead rooms recovered (+1.5x fill incentive)
```

**On Economy:**
```
✓ Points distributed evenly (not just winners)
✓ Participation rewarded tangibly
✓ Progression feels achievable
✓ Energy maintained during lulls
```

**On Experience:**
```
✓ Rooms feel alive
✓ Constant micro-interactions
✓ Social leaderboards
✓ Accessibility (everyone can participate)
```

---

## IX. JULIUS OPERATIONS BOT

Register in conductor:

```
Name: Julius Challenge Engine
Category: JULIUS_CHALLENGES
Mission: Real-time engagement interruption. Keep rooms alive with trivia, polls, predictions, and challenges.
Permissions: [read:events, write:points, read:chat, manage:challenges]
Daily Goals:
  - Deploy challenges to all active rooms
  - Detect and prevent fraud
  - Maintain engagement metrics
  
Weekly Goals:
  - Review leaderboard accuracy
  - Audit challenge distribution
  - Generate engagement reports
  
Yearly Goals:
  - 40% engagement boost
  - Zero successful fraud exploits
  - 1000+ custom questions in library
  
Failure Fallback:
  Disable Julius challenges. Alert MC. Escalate.
```

---

**LOCKED IN: Julius Meerkat Challenge Engine**

**EFFECTIVE: April 28, 2026**

**APPLIES TO: All rooms, all events**

**PURPOSE: Keep rooms alive. Reward participation. Build retention.**
