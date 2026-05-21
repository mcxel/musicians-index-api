# SLO_AND_ALERTING_SYSTEM.md
## Service Level Objectives — What "Healthy" Looks Like

---

## SLOS (Service Level Objectives)

| Service | Target Availability | Max Response Time | Alert Threshold |
|---|---|---|---|
| Homepage (/ /live /editorial) | 99.9% | < 2.5s | > 3s for 5min |
| API (core routes) | 99.5% | < 200ms | > 500ms for 2min |
| Live room join | 99% | < 1s | > 2s for 1min |
| Stream & Win audio | 99% | < 500ms | Failure for 30s |
| Crown API | 99.9% | < 200ms | Any failure |
| Points service | 99% | < 300ms | > 500ms for 5min |
| Auth (login/session) | 99.9% | < 1s | Any failure |
| Database queries | 99.5% | < 100ms | > 300ms for 2min |
| Bot runs | 99% | Per schedule | Missed by > 5min |

---

## ALERT ESCALATION CHAIN

| Severity | Who Gets Paged | Response Time |
|---|---|---|
| P0 - Platform Down | Big Ace immediately | < 5 min |
| P1 - Critical Feature Down | Big Ace + Framework | < 15 min |
| P2 - Degraded Performance | Framework Bot | < 30 min |
| P3 - Warning Threshold | Self-healing attempt first | < 1 hour |
| P4 - Info | Log only | Next review cycle |

---

---

# FEATURE_FLAG_SYSTEM.md
## Kill Switches, Safe Rollout, Instant Disable — No Redeploy Needed

---

## WHY THIS MATTERS

You can launch the platform without every feature being 100% ready.
Feature flags let you:
- Disable rooms if they have issues
- Disable preview window while fixing
- Disable bots if they misbehave
- Disable sponsor overlays temporarily
- Downgrade to watch-only mode
- Roll out features to 10% of users first

---

## FLAG REGISTRY

```typescript
// All flags with defaults
export const FEATURE_FLAGS = {
  // Phase 1 — LIVE at launch
  ENABLE_HOMEPAGE_SYSTEM: true,
  ENABLE_CROWN_SYSTEM: true,
  ENABLE_DISCOVERY_SORT: true,
  ENABLE_STREAM_AND_WIN: true,
  ENABLE_DAILY_SPIN: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_FOLLOW_SYSTEM: true,
  ENABLE_AUTH: true,
  ENABLE_ONBOARDING: true,

  // Phase 2 — After initial launch
  ENABLE_LIVE_ROOMS: false,
  ENABLE_SUBSCRIPTION_BILLING: false,
  ENABLE_PAYOUTS: false,
  ENABLE_FAN_CLUBS: false,
  ENABLE_WATCH_PARTIES: false,

  // Phase 3 — Rooms/live
  ENABLE_ARENA_ROOMS: false,
  ENABLE_BATTLE_ROOMS: false,
  ENABLE_CYPHER_ROOMS: false,
  ENABLE_PRODUCER_ROOMS: false,
  ENABLE_AUDIENCE_3D: false,
  ENABLE_FACE_SCAN: false,
  ENABLE_TIER_TRANSFORMATION: false,

  // Phase 4 — Shows/games
  ENABLE_DEAL_OR_FEUD: false,
  ENABLE_MONTHLY_IDOL: false,
  ENABLE_BROADCASTER: false,
  ENABLE_JULIUS_ACTIVE: false,
  ENABLE_PREVIEW_WINDOW: false,
  ENABLE_DUAL_AUDIO_MIX: false,

  // Safety
  ENABLE_MODERATION_BOT: true,
  ENABLE_SPAM_FILTER: true,
  ENABLE_BRAND_AUDIT_BOT: true,

  // Kill switches
  KILL_SPONSOR_OVERLAYS: false,
  KILL_BOTS: false,
  KILL_ROOMS: false,
  KILL_ECONOMY: false,
  EMERGENCY_READ_ONLY_MODE: false,
} as const;
```

---

## ADMIN CONTROL

Big Ace can toggle any flag from:
- `/admin/feature-flags`
- Command Center flag panel
- Emergency: direct API call `POST /api/admin/flags`

Changes take effect within 60 seconds (cached).

---

---

# ANALYTICS_EVENT_TAXONOMY.md
## Every Event the Platform Tracks — Shared Naming, Shared Truth

---

## NAMING CONVENTION

```
[object].[action]
```

Examples:
- `room.join`
- `preview.open`
- `crown.transfer`
- `user.subscribe`

---

## COMPLETE EVENT TAXONOMY

### Homepage Events
```
homepage.view           { page: 1|2|3, user_tier, timestamp }
homepage.belt.interact  { belt_id, action, position }
card.click              { card_id, card_type, destination }
card.drag               { card_id, from_pos, to_pos }
page.flip               { from_page, to_page, method }
```

### Crown / Rankings
```
crown.view              { artist_id, week_number }
crown.transfer          { from_artist, to_artist, week }
ranking.update          { artist_id, old_rank, new_rank }
```

### Live Rooms
```
room.join               { room_id, room_type, venue_id, user_tier }
room.leave              { room_id, watch_duration_seconds }
room.create             { room_id, room_type, host_id }
room.close              { room_id, duration, peak_viewers }
```

### Preview Window
```
preview.open            { room_id, owner_id, source_type, media_id }
preview.close           { room_id, duration_seconds }
preview.turn.claim      { room_id, user_id }
preview.turn.release    { room_id, user_id }
preview.source.fail     { room_id, source_url, error }
```

### Economy
```
tip.sent                { amount, artist_id, event_id, user_id }
points.earned           { amount, action, user_id }
points.spent            { amount, action, user_id }
subscription.start      { tier, billing_period, user_id }
subscription.upgrade    { from_tier, to_tier, user_id }
subscription.cancel     { tier, reason, user_id }
spin.result             { reward_type, reward_value, user_id }
stream.points.accrued   { minutes, points, playlist_id, user_id }
```

### Social
```
user.follow             { target_id, target_type }
user.unfollow           { target_id }
user.join_fan_club      { artist_id }
invite.sent             { invite_type, recipient_id }
invite.accepted         { invite_type, inviter_id }
collab.request.sent     { target_id, collab_type }
```

### Search / Discovery
```
search.query            { query, filter, results_count }
discovery.room.view     { room_id, position, viewers }
discovery.artist.view   { artist_id, position }
random.room.join        { room_id, matching_criteria }
```

### Bot Events
```
bot.run                 { bot_id, trigger, duration_ms, result }
bot.fail                { bot_id, error, fallback_used }
bot.escalation          { bot_id, issue, escalated_to }
```

### Errors
```
route.404               { path, referrer, user_id }
api.error               { endpoint, status_code, user_id }
room.watchdog.alert     { room_id, health_state, reason }
preview.stuck           { room_id, duration_stuck_ms }
```

---

---

# LOAD_AND_STRESS_TEST_SYSTEM.md
## How to Prove the Platform Works Under Real Load

---

## LOAD TEST SCENARIOS

### Scenario 1: Homepage Peak
- 1,000 concurrent users on homepage
- All three pages being navigated simultaneously
- Crown API being called every 5 seconds
- Expected: < 2.5s load, no errors

### Scenario 2: Room Rush
- 50 concurrent live rooms open
- Each room with 25-50 viewers
- Preview windows opening/closing in 10 rooms simultaneously
- Expected: rooms stable, no stuck queue states

### Scenario 3: Event Launch
- 500 users try to join same event in 60 seconds
- Turn queue fills and advances correctly
- Countdown fires at T=0
- Expected: queue handles correctly, late joiners fall back to audience

### Scenario 4: Crown Rotation
- Crown Bot runs on Sunday midnight
- 300 users are on Homepage 1 at time of rotation
- Crown card should update without page reload for all 300
- Expected: < 3s propagation via WebSocket/SSE

### Scenario 5: Stream & Win Peak
- 200 users streaming simultaneously
- Points posting every 60 seconds per user
- Expected: no points lost, no duplicate awards

---

## PROOF COMMANDS

```bash
# Smoke test all routes
pnpm test:smoke

# Load test homepage
k6 run scripts/load/homepage.js --vus 100 --duration 60s

# Room stress test  
k6 run scripts/load/room-rush.js --vus 50 --duration 120s

# Event launch test
k6 run scripts/load/event-launch.js --vus 500 --duration 60s

# API response time check
pnpm test:api-perf

# Database query time check
pnpm test:db-perf
```

---

*SLO + Alerting + Feature Flags + Analytics + Load Testing v1.0*
*BerntoutGlobal XXL / The Musician's Index*
