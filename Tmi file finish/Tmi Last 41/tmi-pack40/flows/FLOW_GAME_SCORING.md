# EVENT FLOW: GAME SCORING (Dirty Dozens / Deal or Feud 1000)
## From Session Create to Winner Crown

```
TRIGGER: Host clicks "Start Game" on /dirty-dozens or /deal-or-feud

STEP 1 — CREATE GAME SESSION
  → POST /api/games
    body: { gameType: "DIRTY_DOZENS", roomId, hostUserId, sponsorId? }
  → Creates GameSession: { status: LOBBY, scoringMode: AUDIENCE_VOTE }
  → Creates Room (if not exists): { roomType: DIRTY_DOZENS, scene: "underground-cypher" }
  → WebSocket: /games namespace → session_created event
  → Broadcast engine: activates "game-show-host" personality

STEP 2 — PLAYERS JOIN
  → POST /api/games/:id/join (for each contestant)
  → Creates GamePlayer: { score: 0, participationPoints: 0 }
  → PointsLedger: enter_game +20 for each player
  → Audience joins room normally (viewers, not players)
  → WebSocket: player_joined event

STEP 3 — ROUND STARTS
  → POST /api/games/:id/round/next (host triggers)
  → Creates GameRound: { roundNumber: 1, startedAt: now() }
  → roundDurationSeconds: 120 (Dirty Dozens) / 60 (Deal or Feud)
  → WebSocket: round_started event → frontend starts countdown timer
  → Broadcast engine: lower-third "ROUND 1 — BEGIN"
  → Lighting: battle_red preset activates (venue engine)
  → Audio: round-start.mp3 plays

STEP 4 — AUDIENCE VOTES (Dirty Dozens)
  → During round: audience votes for which contestant is winning
  → POST /api/games/:id/vote { targetId: contestantUserId }
  → @@unique([sessionId, userId, round]) enforces 1 vote per user per round
  → PointsLedger: vote +5 for voter
  → WebSocket: vote_cast event → live vote bar updates on frontend
  → Fraud check: if velocity > 10 actions/min → auto-flag

STEP 5 — ROUND ENDS
  → Timer expires OR host manually ends round
  → POST /api/games/:id/round/next (advances to intermission)
  → scoring.service.calculateRoundWinner():
      Sort players by score DESC, then buzzInTimeMs ASC (tiebreak)
  → Creates GameRound.winnerId
  → WebSocket: round_winner event
  → If adSlotOnIntermission: broadcast engine triggers ad break
  → Broadcast engine: sponsor mention template fires

STEP 6 — FINAL ROUND COMPLETE
  → After roundCount reached (3 rounds for Dirty Dozens)
  → POST /api/games/:id/complete
  → scoring.service calculates overall winner
  → Tiebreak order: speed → higher_round → judge_override → audience_revote → sudden_death → coin_flip
  → Creates WinnerRecord in GameRound.winnerId
  → WebSocket: session_complete + winner_reveal events

STEP 7 — REWARDS GRANTED
  → Winner:
    PointsLedger: win_full_game +150
    ItemDefinition triggered: battle_winner → legendary avatar_effect (1 qty)
    If weekly crown game: CrownRecord created
  → All participants:
    PointsLedger: finish_game_round +30 per round
    PointsLedger: participationPoints accumulated
  → WebSocket: points_awarded event → points flash on screen
  → Audio: winner-fanfare.mp3

STEP 8 — CROWN CHECK (if weekly cypher)
  → crown.bot evaluates if winner earns this week's crown
  → If yes: CrownRecord.created, User.tier tracking
  → WebSocket: /crown namespace → crown_awarded { animationDurationMs: 3000 }
  → Frontend: crown pops onto artist's head for 3 seconds then removes
  → hallOfFame.bot: snapshot saved
  → editorial-assembly.bot: "New Crown Champion: [Artist]" article drafted

STEP 9 — LEADERBOARD UPDATE
  → leaderboard.bot: refreshes weekly_crown board
  → leaderboard.bot: refreshes game_wins board
  → GET /api/scoring/leaderboard/weekly_crown → new ranks
  → Flame levels recalculated: rank 1 = strong, 2-3 = medium, 4-10 = light

STEP 10 — END SCREEN ADS
  → adSlotOnEndScreen: true (Dirty Dozens)
  → POST /api/ads/slot/GAME_END_SCREEN → always 200 (Platform Law #7)
  → house-ad-fallback.bot fills if no campaign
  → analytics.bot: records impression + CTR
```

**Scoring modes:** AUDIENCE_VOTE (Dirty Dozens), OBJECTIVE_GAME_SCORE (Deal or Feud), HYBRID (Cypher Battle)
**Engines:** realtime, broadcast, scoring, economy, venue, audio, ui-hud
**Platform Laws enforced:** #1 (discovery sort), #3 (kids/chat), #4 (max votes), #7 (ads always 200)
